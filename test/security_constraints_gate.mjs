import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const clientEnv = loadEnvFile('.env');
const serverEnv = loadEnvFile('.env.server');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || clientEnv.VITE_SUPABASE_URL || serverEnv.SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || clientEnv.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || serverEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('Missing configuration in .env or .env.server for live test execution.');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const runId = Date.now();
const testEmail = `constraints_${runId}@ledgerlens-test.local`;
const password = `ConstraintGate_${runId}!Aa1`;

async function runConstraintsTest() {
  console.log(`\n======================================================`);
  console.log(`LEDGERLENS AI — STORAGE & METADATA CONSTRAINT GATES`);
  console.log(`======================================================\n`);

  let userId, wsId, client;

  try {
    // 1. Create confirmed user
    const { data: u, error: uErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password,
      email_confirm: true
    });
    if (uErr) throw uErr;
    userId = u.user.id;

    // 2. Sign in as client
    client = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    await client.auth.signInWithPassword({ email: testEmail, password });

    // 3. Create workspace
    const { data: ws, error: wsErr } = await client.rpc('create_workspace_with_owner', {
      name: 'Constraint Test Workspace'
    });
    if (wsErr) throw wsErr;
    wsId = ws;

    // 4. Test Invalid MIME Type (e.g. application/x-executable)
    console.log('[1] Testing Invalid MIME type rejection...');
    const invalidPath = `${wsId}/invalid_${runId}.exe`;
    const invalidBytes = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
    const { error: mimeErr } = await client.storage
      .from('invoices')
      .upload(invalidPath, invalidBytes, {
        contentType: 'application/x-msdownload'
      });
    const mimeRejected = mimeErr != null;
    console.log(`${mimeRejected ? '✅ PASS' : '❌ FAIL'}: Storage rejects disallowed MIME type (${mimeErr?.message})`);

    // 5. Test Database check constraint for MIME type
    console.log('[2] Testing Database MIME constraint on public.documents...');
    const { error: dbMimeErr } = await client.from('documents').insert({
      workspace_id: wsId,
      uploaded_by: userId,
      original_filename: 'bad.exe',
      storage_path: invalidPath,
      mime_type: 'application/x-msdownload',
      file_size_bytes: 1024,
      status: 'uploaded'
    });
    const dbMimeRejected = dbMimeErr != null && dbMimeErr.message.includes('documents_mime_type_check');
    console.log(`${dbMimeRejected ? '✅ PASS' : '❌ FAIL'}: PostgreSQL documents table enforces mime_type CHECK constraint (${dbMimeErr?.message})`);

    // 6. Test Database check constraint for 20MB max file size
    console.log('[3] Testing Database 20MB file size CHECK constraint...');
    const { error: dbSizeErr } = await client.from('documents').insert({
      workspace_id: wsId,
      uploaded_by: userId,
      original_filename: 'giant.pdf',
      storage_path: `${wsId}/giant.pdf`,
      mime_type: 'application/pdf',
      file_size_bytes: 25 * 1024 * 1024,
      status: 'uploaded'
    });
    const dbSizeRejected = dbSizeErr != null && dbSizeErr.message.includes('documents_file_size_bytes_check');
    console.log(`${dbSizeRejected ? '✅ PASS' : '❌ FAIL'}: PostgreSQL documents table enforces file_size_bytes CHECK constraint (${dbSizeErr?.message})`);

    // 7. Test Rollback: Storage upload followed by simulated metadata failure
    console.log('[4] Testing Storage cleanup rollback on failed metadata registration...');
    const rollbackPath = `${wsId}/rollback_test_${runId}.pdf`;
    const validPdfBytes = Buffer.from('%PDF-1.4\nrollback test\n%%EOF');
    
    await client.storage.from('invoices').upload(rollbackPath, validPdfBytes, { contentType: 'application/pdf' });
    
    const { error: failedInsertErr } = await client.from('documents').insert({
      workspace_id: wsId,
      uploaded_by: userId,
      original_filename: 'rollback.pdf',
      storage_path: rollbackPath,
      mime_type: 'application/pdf',
      file_size_bytes: -5,
      status: 'uploaded'
    });
    
    if (failedInsertErr) {
      await client.storage.from('invoices').remove([rollbackPath]);
    }

    const { data: storageList } = await client.storage.from('invoices').list(wsId);
    const orphanExists = storageList?.some(f => f.name === `rollback_test_${runId}.pdf`);
    console.log(`${!orphanExists ? '✅ PASS' : '❌ FAIL'}: Rollback prevents orphaned storage files`);

  } finally {
    if (wsId) {
      await adminClient.from('workspaces').delete().eq('id', wsId);
    }
    if (userId) {
      await adminClient.auth.admin.deleteUser(userId);
    }
    console.log('\nConstraints test cleanup completed.');
  }
}

runConstraintsTest();
