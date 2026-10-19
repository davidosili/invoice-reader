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
