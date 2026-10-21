import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load env variables from local ignored files without committing secrets
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

// Admin client for test setup/teardown
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Anonymous client
const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const runId = Date.now();
const userAEmail = `audit_alpha_${runId}@ledgerlens-test.local`;
const userBEmail = `audit_beta_${runId}@ledgerlens-test.local`;
const password = `SecurityGate_${runId}!Aa1`;

const results = [];
function record(testName, passed, details = '') {
  results.push({ testName, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}${details ? ` (${details})` : ''}`);
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`LEDGERLENS AI — LIVE SUPABASE VERIFICATION & GATEWAY`);
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  let userAId, userBId;
  let wsAId, wsBId;
  let clientA, clientB;
  let testDocId;

  try {
    // ----------------------------------------------------
    // 1. Provision Test Accounts via Admin API
    // ----------------------------------------------------
    console.log(`[1] Provisioning Confirmed Test Users...`);
    const { data: uA, error: errUA } = await adminClient.auth.admin.createUser({
      email: userAEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Audit User Alpha' }
    });
    if (errUA) throw new Error(`User A creation failed: ${errUA.message}`);
    userAId = uA.user.id;

    const { data: uB, error: errUB } = await adminClient.auth.admin.createUser({
      email: userBEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Audit User Beta' }
    });
    if (errUB) throw new Error(`User B creation failed: ${errUB.message}`);
    userBId = uB.user.id;

    record('Provision Test Users (User A & User B)', true, `User A: ${userAId.slice(0, 8)}, User B: ${userBId.slice(0, 8)}`);

    // ----------------------------------------------------
    // 2. Authenticate Users via Public Anon Client
    // ----------------------------------------------------
    console.log(`\n[2] Authenticating User A and User B via Public Client...`);
    clientA = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: authA, error: errAuthA } = await clientA.auth.signInWithPassword({
      email: userAEmail,
      password
    });
    record('User A Public Client Sign In', !errAuthA && authA?.session?.access_token != null, errAuthA?.message);

    clientB = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: authB, error: errAuthB } = await clientB.auth.signInWithPassword({
      email: userBEmail,
      password
    });
    record('User B Public Client Sign In', !errAuthB && authB?.session?.access_token != null, errAuthB?.message);

    // ----------------------------------------------------
    // 3. Atomic Workspace Creation via RPC
    // ----------------------------------------------------
    console.log(`\n[3] Testing Atomic Workspace Creation (create_workspace_with_owner)...`);
    const { data: newWsA, error: errWsA } = await clientA.rpc('create_workspace_with_owner', {
      name: 'Alpha Logistics Ltd'
    });
    wsAId = newWsA;
    record('User A Workspace Atomic Creation', !errWsA && wsAId != null, `Workspace ID: ${wsAId}`);

    const { data: newWsB, error: errWsB } = await clientB.rpc('create_workspace_with_owner', {
      name: 'Beta Global Trading'
    });
    wsBId = newWsB;
    record('User B Workspace Atomic Creation', !errWsB && wsBId != null, `Workspace ID: ${wsBId}`);

    // Verify User A has owner role in Alpha
    const { data: membersA } = await clientA
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', wsAId)
      .eq('user_id', userAId);
    record('User A Granted "owner" Role Atomically', membersA?.[0]?.role === 'owner', `Role: ${membersA?.[0]?.role}`);

    // ----------------------------------------------------
    // 4. Anonymous User Security Enforcement
    // ----------------------------------------------------
    console.log(`\n[4] Anonymous User Security Enforcement...`);
    const { data: anonWs } = await anonClient.from('workspaces').select('*');
    record('Anonymous Cannot View Workspaces', anonWs?.length === 0, `Returned ${anonWs?.length} rows`);

    const { data: anonDocs } = await anonClient.from('documents').select('*');
    record('Anonymous Cannot View Documents', anonDocs?.length === 0, `Returned ${anonDocs?.length} rows`);

    const { error: anonRpcErr } = await anonClient.rpc('create_workspace_with_owner', {
      name: 'Anonymous Intruder'
    });
    record('Anonymous Cannot Call create_workspace_with_owner', anonRpcErr != null, anonRpcErr?.message);

    // ----------------------------------------------------
    // 5. Tenant Isolation (User A vs User B)
    // ----------------------------------------------------
    console.log(`\n[5] Cross-Tenant Isolation Enforcement...`);
    const { data: crossWs } = await clientB.from('workspaces').select('*').eq('id', wsAId);
    record('User B Cannot View User A Workspace', crossWs?.length === 0, `Returned ${crossWs?.length} rows`);

    const { data: crossMembers } = await clientB.from('workspace_members').select('*').eq('workspace_id', wsAId);
    record('User B Cannot View User A Memberships', crossMembers?.length === 0, `Returned ${crossMembers?.length} rows`);

    const { error: injectErr } = await clientB.from('workspace_members').insert({
      workspace_id: wsAId,
      user_id: userBId,
      role: 'owner'
    });
    record('User B Cannot Inject Membership into User A Workspace', injectErr != null, `Rejection: ${injectErr?.message || 'Blocked by RLS'}`);

    // ----------------------------------------------------
    // 6. End-to-End Invoice Document Upload & Private Storage
    // ----------------------------------------------------
    console.log(`\n[6] End-to-End Synthetic Invoice Document Upload...`);
    const fakePdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Invoice #INV-2026-999) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const docUuid = '99999999-aaaa-bbbb-cccc-000000000001';
    const storagePath = `${wsAId}/${docUuid}.pdf`;

    // 6.1 Upload binary to storage bucket as User A
    const { data: storageData, error: storageErr } = await clientA.storage
      .from('invoices')
      .upload(storagePath, fakePdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });
    record('User A Uploads Synthetic PDF to Private Bucket', !storageErr && storageData?.path === storagePath, storageErr?.message);

    // 6.2 Insert metadata row into public.documents as User A
    const { data: docRow, error: docErr } = await clientA
      .from('documents')
      .insert({
        id: docUuid,
        workspace_id: wsAId,
        uploaded_by: userAId,
        original_filename: 'synthetic_supplier_invoice_INV-999.pdf',
        storage_path: storagePath,
        mime_type: 'application/pdf',
        file_size_bytes: fakePdfBytes.length,
        status: 'uploaded'
      })
      .select()
      .single();
    testDocId = docRow?.id;
    record('User A Registers Document Metadata in PostgreSQL', !docErr && testDocId === docUuid, docErr?.message);

    // 6.3 User A reads back their own document
    const { data: readDocA } = await clientA.from('documents').select('*').eq('id', docUuid).single();
    record('User A Can Query Their Own Document Record', readDocA?.id === docUuid && readDocA?.status === 'uploaded');

    // 6.4 User B attempts to read User A's document metadata
    const { data: readDocB } = await clientB.from('documents').select('*').eq('id', docUuid);
    record('User B Cannot Read User A Document Record', readDocB?.length === 0, `Returned ${readDocB?.length} rows`);

    // 6.5 User A generates short-lived signed URL
    const { data: signedUrlA, error: errSignedA } = await clientA.storage
      .from('invoices')
      .createSignedUrl(storagePath, 3600);
    record('User A Generates Signed Download URL', !errSignedA && signedUrlA?.signedUrl != null, `URL length: ${signedUrlA?.signedUrl?.length}`);

    // 6.6 Verify direct download without signature is rejected (bucket is private)
    const directUrl = `${SUPABASE_URL}/storage/v1/object/public/invoices/${storagePath}`;
    const directRes = await fetch(directUrl);
    record('Direct Public Download without Token Rejected (Private Bucket)', directRes.status === 400 || directRes.status === 404 || directRes.status === 403, `HTTP ${directRes.status}`);

    // 6.7 User B attempts to delete User A's document record
    const { data: delDocB } = await clientB.from('documents').delete().eq('id', docUuid).select();
    record('User B Cannot Delete User A Document Record', delDocB?.length === 0);

    // 6.8 User B attempts to delete User A's storage file
    const { data: delStorageB } = await clientB.storage.from('invoices').remove([storagePath]);
    record('User B Cannot Delete User A Storage File', delStorageB?.length === 0 || delStorageB?.[0]?.error != null);

  } catch (err) {
    console.error('Unexpected execution error in security test:', err);
  } finally {
    // ----------------------------------------------------
    // 7. Cleanup Test Records
    // ----------------------------------------------------
    console.log(`\n[7] Cleaning Up Test Artifacts...`);
    try {
      if (wsAId) {
        await adminClient.storage.from('invoices').remove([`${wsAId}/99999999-aaaa-bbbb-cccc-000000000001.pdf`]);
        await adminClient.from('workspaces').delete().eq('id', wsAId);
      }
      if (wsBId) {
        await adminClient.from('workspaces').delete().eq('id', wsBId);
      }
      if (userAId) {
        await adminClient.auth.admin.deleteUser(userAId);
      }
      if (userBId) {
        await adminClient.auth.admin.deleteUser(userBId);
      }
      console.log('Cleanup completed successfully.');
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr);
    }
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log(`\n======================================================`);
  console.log(`TEST RESULTS SUMMARY`);
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`======================================================\n`);
}

run();
