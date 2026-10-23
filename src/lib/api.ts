import { supabase, isSupabaseConfigured } from './supabase';
import {
  DocumentRecord,
  Workspace,
  InvoiceExtractionRecord,
  InvoiceValidationIssue,
  InvoiceAuditEvent,
  ProcessInvoiceResponse,
} from '../types';
import { runInvoiceIntelligencePipeline, isPermittedTransition } from './intelligence/pipeline';
import { HeuristicOcrProvider } from './intelligence/providers/heuristicOcrProvider';
import { ExistingInvoiceRecord } from './intelligence/duplicates';
import { ExportableInvoiceRow } from './exportCsv';

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
 * Fetch a single document by ID within an authorized workspace
 */
export async function fetchDocumentById(documentId: string, workspaceId?: string): Promise<DocumentRecord | null> {
  if (!isSupabaseConfigured) return null;

  let query = supabase
    .from('documents')
    .select('*')
    .eq('id', documentId);

  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found or blocked by RLS
    throw new Error('Failed to retrieve document record.');
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
    if (storageError.message?.includes('row-level security') || (storageError as any)?.statusCode === '403') {
      throw new Error('Upload permission denied: You are not authorized to upload documents to this workspace folder.');
    }
    throw new Error('Document storage upload failed. Please check your connection and try again.');
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
    if (dbError.code === '42501' || dbError.message?.includes('row-level security')) {
      throw new Error('Permission denied: You are not authorized to register documents in this workspace.');
    }
    throw new Error('Document registration could not be completed. The upload has been safely cancelled.');
  }

  return documentRow as DocumentRecord;
}

/**
 * Generate a short-lived signed URL to securely download/view the private invoice.
 * Validates that the requested storage path belongs to the authorized workspace.
 */
export async function createDocumentSignedUrl(
  storagePath: string,
  workspaceId?: string,
  expiresIn = 3600
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Service is not configured.');
  }

  // Defense-in-depth: Storage path must strictly adhere to {workspaceId}/{documentId}.{ext}
  if (workspaceId) {
    const segments = storagePath.split('/');
    if (segments.length < 2 || segments[0] !== workspaceId) {
      throw new Error('Access denied: You are not authorized to access documents outside your active workspace.');
    }
  }

  const { data, error } = await supabase.storage
    .from('invoices')
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error('Failed to generate secure download link. Please verify that you have permission to view this file.');
  }

  return data.signedUrl;
}

// ============================================================================
// Phase 2: Invoice Intelligence & Processing Operations
// ============================================================================

/**
 * Fetch the latest extraction record for a document.
 */
export async function fetchInvoiceExtraction(
  documentId: string,
  workspaceId: string
): Promise<InvoiceExtractionRecord | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('invoice_extractions')
      .select('*')
      .eq('document_id', documentId)
      .eq('workspace_id', workspaceId)
      .eq('is_latest', true)
      .maybeSingle();

    if (error) {
      // PGRST116: 0 rows, PGRST205: table not created yet / missing in schema cache
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || (error as any).status === 404) {
        return null;
      }
      throw new Error(`Failed to load extraction: ${error.message}`);
    }

    return (data || null) as InvoiceExtractionRecord | null;
  } catch (err: any) {
    if (err.message?.includes('PGRST205') || err.message?.includes('schema cache')) {
      return null;
    }
    throw err;
  }
}

/**
 * Fetch validation issues for a document.
 */
export async function fetchInvoiceValidationIssues(
  documentId: string,
  workspaceId: string
): Promise<InvoiceValidationIssue[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('invoice_validation_issues')
      .select('*')
      .eq('document_id', documentId)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205' || (error as any).status === 404) {
        return [];
      }
      throw new Error(`Failed to load validation issues: ${error.message}`);
    }

    return (data || []) as InvoiceValidationIssue[];
  } catch (err: any) {
    if (err.message?.includes('PGRST205') || err.message?.includes('schema cache')) {
      return [];
    }
    throw err;
  }
}

/**
 * Fetch append-only audit event trail for a document.
 */
export async function fetchInvoiceAuditEvents(
  documentId: string,
  workspaceId: string
): Promise<InvoiceAuditEvent[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('invoice_audit_events')
      .select('*')
      .eq('document_id', documentId)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205' || (error as any).status === 404) {
        return [];
      }
      throw new Error(`Failed to load audit history: ${error.message}`);
    }

    return (data || []) as InvoiceAuditEvent[];
  } catch (err: any) {
    if (err.message?.includes('PGRST205') || err.message?.includes('schema cache')) {
      return [];
    }
    throw err;
  }
}

/**
 * Initiates the invoice intelligence processing lifecycle:
 * 1. Checks permitted state transition (uploaded/failed/review_required -> queued -> processing)
 * 2. Fetches the binary invoice from storage
 * 3. Runs extraction, validation, and duplicate detection
 * 4. Persists extraction, issues, and audit events atomically
 * 5. Updates status to 'review_required' (or 'failed')
 */
export async function queueAndProcessInvoice(
  documentId: string,
  workspaceId: string
): Promise<ProcessInvoiceResponse> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  // 0. Attempt secure backend server processing (which holds server-side GEMINI_API_KEY)
  let backendErrorDetail: string | null = null;
  try {
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.access_token) {
      const serverRes = await fetch(`/api/documents/${documentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        return data as ProcessInvoiceResponse;
      } else {
        const errJson = await serverRes.json().catch(() => ({}));
        backendErrorDetail = errJson.error || `Server responded with HTTP ${serverRes.status}`;
        console.warn(`[LedgerLens] Backend API processing error (${serverRes.status}):`, backendErrorDetail);
        if (serverRes.status === 401 || serverRes.status === 403 || serverRes.status === 404) {
          throw new Error(backendErrorDetail || 'Access denied or document not found.');
        }
      }
    }
  } catch (err: any) {
    if (err.message?.includes('Access denied') || err.message?.includes('not found')) {
      throw err;
    }
    backendErrorDetail = err?.message || 'Backend API server unreachable';
    console.warn('[LedgerLens] Backend server unreachable, falling back to client heuristic extraction:', backendErrorDetail);
  }

  // 1. Fetch document and verify permission & status
  const document = await fetchDocumentById(documentId, workspaceId);
  if (!document) {
    throw new Error('Document not found or access denied.');
  }

  if (!isPermittedTransition(document.status, 'queued')) {
    throw new Error(`Cannot process document in status "${document.status}".`);
  }

  // 2. Set status to 'queued' via RPC or direct update
  await supabase
    .from('documents')
    .update({ status: 'queued', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  // Log queued audit event
  await supabase
    .from('invoice_audit_events')
    .insert({
      document_id: documentId,
      workspace_id: workspaceId,
      actor_id: (await supabase.auth.getUser()).data.user?.id || null,
      event_type: document.status === 'review_required' || document.status === 'failed' ? 'reprocessed' : 'processing_queued',
      details: { previous_status: document.status },
    });

  // 3. Transition to 'processing'
  await supabase
    .from('documents')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  const fallbackProviderId = 'heuristic_ocr_v1 (fallback)';
  await supabase
    .from('invoice_audit_events')
    .insert({
      document_id: documentId,
      workspace_id: workspaceId,
      actor_id: (await supabase.auth.getUser()).data.user?.id || null,
      event_type: 'processing_started',
      details: {
        engine: fallbackProviderId,
        fallback: true,
        reason: backendErrorDetail || 'Backend AI unavailable',
      },
    });

  try {
    // 4. Download file from private storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('invoices')
      .download(document.storage_path);

    if (downloadError || !fileBlob) {
      throw new Error(`Could not access file in storage: ${downloadError?.message || 'Storage error'}`);
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // 5. Query existing workspace extractions for duplicate matching
    const { data: existingRows } = await supabase
      .from('invoice_extractions')
      .select('id, document_id, workspace_id, supplier_name, invoice_number, grand_total, currency, invoice_date')
      .eq('workspace_id', workspaceId)
      .eq('is_latest', true);

    const existingRecords: ExistingInvoiceRecord[] = (existingRows || []).map((r: any) => ({
      id: r.id,
      document_id: r.document_id,
      workspace_id: r.workspace_id,
      supplier_name: r.supplier_name,
      invoice_number: r.invoice_number,
      grand_total: r.grand_total,
      currency: r.currency || 'USD',
      invoice_date: r.invoice_date,
    }));

    // 6. Run the intelligence pipeline with fallback attribution
    const fallbackProvider = new HeuristicOcrProvider(fallbackProviderId);
    const pipelineResult = await runInvoiceIntelligencePipeline(
      fileBytes,
      document,
      existingRecords,
      fallbackProvider
    );

    // Explicitly flag that fallback provider was used
    pipelineResult.issues.unshift({
      issue_type: 'format_warning',
      severity: 'warning',
      field_key: null,
      message: `Fallback extraction provider active (${fallbackProviderId}): AI vision was unavailable (${backendErrorDetail || 'offline'}). Review and verify all fields against the source document.`,
      details: { fallback: true, provider: fallbackProviderId, reason: backendErrorDetail },
    });

    // 7. Archive any previous extraction versions
    await supabase
      .from('invoice_extractions')
      .update({ is_latest: false })
      .eq('document_id', documentId);

    // 8. Persist new extraction row
    const user = (await supabase.auth.getUser()).data.user;
    const { data: newExtraction, error: extInsertError } = await supabase
      .from('invoice_extractions')
      .insert({
        document_id: documentId,
        workspace_id: workspaceId,
        version: 1,
        ...pipelineResult.extraction,
        is_latest: true,
      })
      .select()
      .single();

    if (extInsertError) {
      throw new Error(`Failed to save extraction results: ${extInsertError.message}`);
    }

    // 9. Replace validation issues
    await supabase
      .from('invoice_validation_issues')
      .delete()
      .eq('document_id', documentId);

    if (pipelineResult.issues.length > 0) {
      const issuesToInsert = pipelineResult.issues.map((issue) => ({
        document_id: documentId,
        workspace_id: workspaceId,
        issue_type: issue.issue_type,
        severity: issue.severity,
        field_key: issue.field_key,
        message: issue.message,
        details: issue.details || null,
        resolved: false,
      }));

      await supabase.from('invoice_validation_issues').insert(issuesToInsert);
    }

    // 10. Update document status to 'review_required'
    await supabase
      .from('documents')
      .update({ status: 'review_required', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    // 11. Log completion audit event
    await supabase
      .from('invoice_audit_events')
      .insert({
        document_id: documentId,
        workspace_id: workspaceId,
        actor_id: user?.id || null,
        event_type: 'extraction_completed',
        details: {
          provider: fallbackProviderId,
          fallback: true,
          fallback_reason: backendErrorDetail || null,
          issues_count: pipelineResult.issues.length,
          fields_extracted: Object.keys(pipelineResult.extraction.field_metadata || {}).length,
        },
      });

    return {
      success: true,
      documentId,
      status: 'review_required',
      extraction: newExtraction as InvoiceExtractionRecord,
      issues: pipelineResult.issues as any[],
    };
  } catch (err: any) {
    // On failure, transition to 'failed' and log audit event
    await supabase
      .from('documents')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    await supabase
      .from('invoice_audit_events')
      .insert({
        document_id: documentId,
        workspace_id: workspaceId,
        actor_id: (await supabase.auth.getUser()).data.user?.id || null,
        event_type: 'processing_failed',
        details: { error: err.message },
      });

    return {
      success: false,
      documentId,
      status: 'failed',
      error: err.message || 'Processing failed',
    };
  }
}

/**
 * Save manual human reviewer corrections to extracted invoice fields.
 */
export async function saveInvoiceCorrections(
  documentId: string,
  workspaceId: string,
  updatedFields: Partial<InvoiceExtractionRecord>
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const user = (await supabase.auth.getUser()).data.user;

  // Clean payload before updating
  const { id, document_id, workspace_id, created_at, updated_at, ...cleanFields } = updatedFields;

  const { error } = await supabase
    .from('invoice_extractions')
    .update({
      ...cleanFields,
      updated_at: new Date().toISOString(),
    })
    .eq('document_id', documentId)
    .eq('workspace_id', workspaceId)
    .eq('is_latest', true);

  if (error) {
    throw new Error(`Failed to save invoice corrections: ${error.message}`);
  }

  // Log reviewer correction audit event
  await supabase
    .from('invoice_audit_events')
    .insert({
      document_id: documentId,
      workspace_id: workspaceId,
      actor_id: user?.id || null,
      event_type: 'field_corrected',
      details: { modified_fields: Object.keys(cleanFields) },
    });
}

/**
 * Approve an invoice after human review.
 */
export async function approveInvoiceDocument(
  documentId: string,
  workspaceId: string,
  notes?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const document = await fetchDocumentById(documentId, workspaceId);
  if (!document) throw new Error('Document not found.');

  if (document.status !== 'review_required') {
    throw new Error(`Cannot approve invoice: Current status is "${document.status}". Review is required.`);
  }

  const user = (await supabase.auth.getUser()).data.user;

  const { error } = await supabase
    .from('documents')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  if (error) {
    throw new Error(`Failed to approve invoice: ${error.message}`);
  }

  await supabase
    .from('invoice_audit_events')
    .insert({
      document_id: documentId,
      workspace_id: workspaceId,
      actor_id: user?.id || null,
      event_type: 'approved',
      details: { notes: notes || null },
    });
}

/**
 * Reject an invoice record.
 */
export async function rejectInvoiceDocument(
  documentId: string,
  workspaceId: string,
  reason?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const document = await fetchDocumentById(documentId, workspaceId);
  if (!document) throw new Error('Document not found.');

  if (document.status !== 'review_required' && document.status !== 'uploaded' && document.status !== 'failed') {
    throw new Error(`Cannot reject document with status "${document.status}".`);
  }

  const user = (await supabase.auth.getUser()).data.user;

  const { error } = await supabase
    .from('documents')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('workspace_id', workspaceId);

  if (error) {
    throw new Error(`Failed to reject invoice: ${error.message}`);
  }

  await supabase
    .from('invoice_audit_events')
    .insert({
      document_id: documentId,
      workspace_id: workspaceId,
      actor_id: user?.id || null,
      event_type: 'rejected',
      details: { reason: reason || 'Rejected by reviewer' },
    });
}

/**
 * Fetch all approved invoices in the workspace paired with their latest extractions for CSV export.
 */
export async function fetchApprovedInvoicesForExport(
  workspaceId: string
): Promise<ExportableInvoiceRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data: docs, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (docError) {
    throw new Error(`Failed to fetch approved invoices: ${docError.message}`);
  }

  if (!docs || docs.length === 0) return [];

  const docIds = docs.map((d: any) => d.id);
  const { data: extractions } = await supabase
    .from('invoice_extractions')
    .select('*')
    .in('document_id', docIds)
    .eq('is_latest', true);

  const extractionMap = new Map<string, InvoiceExtractionRecord>();
  if (extractions) {
    for (const ext of extractions) {
      extractionMap.set(ext.document_id, ext as InvoiceExtractionRecord);
    }
  }

  // Log export audit event
  const user = (await supabase.auth.getUser()).data.user;
  if (user && docs.length > 0) {
    await supabase.from('invoice_audit_events').insert({
      document_id: docs[0].id,
      workspace_id: workspaceId,
      actor_id: user.id,
      event_type: 'exported',
      details: { total_exported: docs.length },
    });
  }

  return docs.map((doc: any) => ({
    document: doc as DocumentRecord,
    extraction: extractionMap.get(doc.id) || null,
  }));
}

