import { supabase, isSupabaseConfigured } from './supabase';
import { DocumentRecord, Workspace } from '../types';

/**
 * Validates file magic bytes (signatures) in the browser
 */
export async function validateFileSignature(file: File): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF signature: %PDF (0x25 0x50 0x44 0x46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { valid: true, detectedType: 'application/pdf' };
    }

    // PNG signature: \x89PNG (0x89 0x50 0x4E 0x47)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { valid: true, detectedType: 'image/png' };
    }

    // JPEG signature: \xFF\xD8\xFF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { valid: true, detectedType: 'image/jpeg' };
    }

    return {
      valid: false,
      error: 'File contents do not match a valid PDF, JPEG, or PNG signature.'
    };
  } catch {
    return { valid: false, error: 'Could not read file header for verification.' };
  }
}

/**
 * Fetch all workspaces the current authenticated user belongs to
 */
export async function fetchUserWorkspaces(): Promise<Workspace[]> {
  if (!isSupabaseConfigured) return [];

  const { data: memberRows, error: memberError } = await supabase
    .from('workspace_members')
    .select(`
      role,
      workspaces (
        id,
        name,
        created_by,
        created_at
      )
    `);

  if (memberError) {
    throw new Error(`Failed to load workspaces: ${memberError.message}`);
  }

  if (!memberRows) return [];

  const list: Workspace[] = [];
  for (const row of memberRows as any[]) {
    if (row.workspaces) {
      list.push({
        id: row.workspaces.id,
        name: row.workspaces.name,
        created_by: row.workspaces.created_by,
        created_at: row.workspaces.created_at,
        role: row.role as 'owner' | 'member',
      });
    }
  }

  return list;
}

/**
 * Create a new workspace atomically with the caller as owner
 */
export async function createWorkspace(name: string): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error('Workspace name cannot be empty.');
  }

  // Call security-definer RPC function to guarantee atomic creation
  const { data: newId, error } = await supabase.rpc('create_workspace_with_owner', {
    name: cleanName,
  });

  if (error) {
    throw new Error(`Failed to create workspace: ${error.message}`);
  }

  return newId as string;
}

/**
 * Fetch document records for a given workspace with optional search & filter
 */
export async function fetchWorkspaceDocuments(
  workspaceId: string,
  searchQuery?: string,
  statusFilter?: string
): Promise<DocumentRecord[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    query = query.ilike('original_filename', `%${searchQuery.trim()}%`);
  }

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load documents: ${error.message}`);
  }

  return (data || []) as DocumentRecord[];
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocumentById(documentId: string): Promise<DocumentRecord | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch document: ${error.message}`);
  }

  return data as DocumentRecord;
}

/**
 * Upload an invoice document privately and persist its metadata.
 * Performs rollback of the storage object if database metadata creation fails.
 */
export async function uploadInvoiceDocument(
  file: File,
  workspaceId: string,
  userId: string
): Promise<DocumentRecord> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase connection is not configured.');
  }

  // 1. File size check (20MB max)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File exceeds maximum permitted size of 20MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  // 2. Allowed MIME check
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedMimes.includes(file.type)) {
    throw new Error('Unsupported file type. Only PDF, JPG, and PNG documents are supported.');
  }

  // 3. Inspect magic bytes signature
  const signatureCheck = await validateFileSignature(file);
  if (!signatureCheck.valid) {
    throw new Error(signatureCheck.error || 'Invalid file binary structure.');
  }

  // 4. Generate random document UUID and safe storage path
  const documentId = crypto.randomUUID();
  let ext = 'pdf';
  if (file.type === 'image/jpeg') ext = 'jpg';
  else if (file.type === 'image/png') ext = 'png';

  const storagePath = `${workspaceId}/${documentId}.${ext}`;

  // 5. Upload to private Supabase Storage bucket 'invoices'
  const { error: storageError } = await supabase.storage
    .from('invoices')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    throw new Error(`Storage upload failed: ${storageError.message}`);
  }

  // 6. Insert metadata row into 'documents' table
  const { data: documentRow, error: dbError } = await supabase
    .from('documents')
    .insert({
      id: documentId,
      workspace_id: workspaceId,
      uploaded_by: userId,
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: file.type as 'application/pdf' | 'image/jpeg' | 'image/png',
      file_size_bytes: file.size,
      status: 'uploaded',
    })
    .select()
    .single();

  // 7. Safety Rollback: If metadata persistence fails, remove uploaded storage object to prevent orphans
  if (dbError) {
    await supabase.storage.from('invoices').remove([storagePath]);
    throw new Error(`Document metadata registration failed: ${dbError.message}`);
  }

  return documentRow as DocumentRecord;
}

/**
 * Generate a short-lived signed URL to securely download/view the private invoice
 */
export async function createDocumentSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.storage
    .from('invoices')
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed download link: ${error?.message || 'Unknown error'}`);
  }

  return data.signedUrl;
}
