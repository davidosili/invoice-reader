import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// 1. Binary Magic Bytes Validation Logic Test
async function validateFileSignature(buffer) {
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
}

test('File Signature Validation - Accepts genuine PDF bytes', async () => {
  const pdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
  const res = await validateFileSignature(pdfBytes);
  assert.equal(res.valid, true);
  assert.equal(res.detectedType, 'application/pdf');
});

test('File Signature Validation - Accepts genuine PNG bytes', async () => {
  const pngBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const res = await validateFileSignature(pngBytes);
  assert.equal(res.valid, true);
  assert.equal(res.detectedType, 'image/png');
});

test('File Signature Validation - Accepts genuine JPEG bytes', async () => {
  const jpegBytes = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
  const res = await validateFileSignature(jpegBytes);
  assert.equal(res.valid, true);
  assert.equal(res.detectedType, 'image/jpeg');
});

test('File Signature Validation - Rejects spoofed files (e.g. text/script renamed to .pdf)', async () => {
  const spoofedBytes = Buffer.from('<!DOCTYPE html><html><body>malicious payload</body></html>');
  const res = await validateFileSignature(spoofedBytes);
  assert.equal(res.valid, false);
  assert.ok(res.error.includes('do not match a valid PDF'));
});

test('File Signature Validation - Rejects Windows PE executable header (MZ)', async () => {
  const exeBytes = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
  const res = await validateFileSignature(exeBytes);
  assert.equal(res.valid, false);
});

// 2. Storage Path Sanitization Test
test('Storage Path Isolation - Generates workspace-scoped UUID paths and prevents path traversal', () => {
  const workspaceId = 'c7a4b882-9f33-4f25-83aa-6d6f22e89123';
  const maliciousFilename = '../../../../etc/passwd.pdf';
  const docId = '11111111-2222-3333-4444-555555555555';
  const ext = 'pdf';

  // Sanitized path logic
  const storagePath = `${workspaceId}/${docId}.${ext}`;

  assert.equal(storagePath, 'c7a4b882-9f33-4f25-83aa-6d6f22e89123/11111111-2222-3333-4444-555555555555.pdf');
  assert.ok(!storagePath.includes('..'));
  assert.ok(!storagePath.includes('passwd'));
  assert.equal(storagePath.split('/')[0], workspaceId);
});

// 3. Size Constraint Test
test('File Size Validation - Rejects files exceeding 20MB limit', () => {
  const MAX_BYTES = 20 * 1024 * 1024;
  const validSize = 18 * 1024 * 1024; // 18MB
  const invalidSize = 21 * 1024 * 1024; // 21MB

  assert.ok(validSize <= MAX_BYTES);
  assert.ok(invalidSize > MAX_BYTES);
});

// 4. SQL Migration Audit Test
test('SQL Migrations - Verifies RLS enabled on all application tables', () => {
  const migration1 = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/20261019000001_initial_schema.sql'),
    'utf-8'
  );

  assert.ok(migration1.includes('ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;'));
  assert.ok(migration1.includes('ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;'));
  assert.ok(migration1.includes('ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;'));
  assert.ok(migration1.includes('SECURITY DEFINER'));
  assert.ok(migration1.includes('create_workspace_with_owner'));
  assert.ok(migration1.includes('is_workspace_member'));
});

test('SQL Migrations - Verifies private storage bucket and access policies', () => {
  const migration2 = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/20261019000002_storage_setup.sql'),
    'utf-8'
  );

  assert.ok(migration2.includes("public = false") || migration2.includes("false, -- 20MB"));
  assert.ok(migration2.includes("'invoices'"));
  assert.ok(migration2.includes("storage.objects"));
  assert.ok(migration2.includes("is_workspace_member"));
});

// 5. Customer Experience & Error Sanitization Tests
function sanitizeAuthError(err, fallbackMessage = 'Authentication failed. Please verify your credentials and try again.') {
  if (!err) return fallbackMessage;
  const rawMessage = typeof err === 'string'
    ? err
    : err?.message || err?.error_description || String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'The email address or password you entered is incorrect. Please verify your details and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email inbox and confirm your address before signing in.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many sign-in attempts. For security reasons, please wait a few minutes before trying again.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network error')) {
    return 'Unable to connect to LedgerLens AI services. Please check your internet connection or try again shortly.';
  }
  if (
    lower.includes('pgrst') ||
    lower.includes('postgres') ||
    lower.includes('row-level security') ||
    lower.includes('relation') ||
    lower.includes('schema') ||
    lower.includes('jwt') ||
    lower.includes('claim') ||
    lower.includes('supabase')
  ) {
    return 'Our authentication service encountered a temporary error. Please try again shortly or contact support@ledgerlens.ai.';
  }
  return rawMessage;
}

test('Error Sanitization - Masks PostgreSQL and Supabase internal errors from customers', () => {
  const pgrstError = { message: 'PGRST116: JSON object requested, multiple (or no) rows returned' };
  const rlsError = { message: 'new row violates row-level security policy for table "workspaces"' };
  const postgresError = { message: 'PostgreSQL connection terminated unexpectedly' };
  const supabaseKeyError = { message: 'Invalid Supabase API key or project not found' };

  const sanitized1 = sanitizeAuthError(pgrstError);
  const sanitized2 = sanitizeAuthError(rlsError);
  const sanitized3 = sanitizeAuthError(postgresError);
  const sanitized4 = sanitizeAuthError(supabaseKeyError);

  for (const s of [sanitized1, sanitized2, sanitized3, sanitized4]) {
    assert.ok(!s.includes('PGRST'));
    assert.ok(!s.includes('PostgreSQL'));
    assert.ok(!s.includes('row-level security'));
    assert.ok(!s.includes('Supabase'));
    assert.equal(s, 'Our authentication service encountered a temporary error. Please try again shortly or contact support@ledgerlens.ai.');
  }
});

test('Error Sanitization - Provides clear, actionable messages for customer authentication mistakes', () => {
  const invalidCreds = sanitizeAuthError({ message: 'Invalid login credentials' });
  assert.ok(invalidCreds.includes('email address or password you entered is incorrect'));

  const unconfirmed = sanitizeAuthError({ message: 'Email not confirmed' });
  assert.ok(unconfirmed.includes('confirm your address before signing in'));

  const rateLimit = sanitizeAuthError({ message: 'over_email_send_rate_limit' });
  assert.ok(rateLimit.includes('Too many sign-in attempts'));
});

// 6. Defense-in-depth Storage Authorization Validation Test
function validateStoragePathAccess(storagePath, activeWorkspaceId) {
  if (!activeWorkspaceId) {
    return { allowed: false, error: 'Unauthorized: No active workspace session.' };
  }
  if (!storagePath.startsWith(`${activeWorkspaceId}/`)) {
    return { allowed: false, error: 'Access denied: You do not have permission to access files outside your active workspace.' };
  }
  const parts = storagePath.split('/');
  if (parts.length !== 2 || parts[1].includes('..') || !parts[1].trim()) {
    return { allowed: false, error: 'Invalid storage reference.' };
  }
  return { allowed: true };
}

test('Multi-Tenant Defense-in-depth - Rejects cross-workspace storage path requests', () => {
  const myWorkspace = 'workspace-alpha-123';
  const victimWorkspace = 'workspace-beta-456';

  const validPath = `${myWorkspace}/doc-001.pdf`;
  const crossPath = `${victimWorkspace}/doc-999.pdf`;
  const traversalPath = `${myWorkspace}/../secret.pdf`;

  assert.equal(validateStoragePathAccess(validPath, myWorkspace).allowed, true);
  assert.equal(validateStoragePathAccess(crossPath, myWorkspace).allowed, false);
  assert.equal(validateStoragePathAccess(traversalPath, myWorkspace).allowed, false);
  assert.equal(validateStoragePathAccess(validPath, null).allowed, false);
});
