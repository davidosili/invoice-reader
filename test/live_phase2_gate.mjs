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
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const clientEnv = loadEnvFile('.env');
const serverEnv = loadEnvFile('.env.server');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || clientEnv.VITE_SUPABASE_URL || serverEnv.SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || clientEnv.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || serverEnv.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = [];
function record(testName, passed, details = '') {
  results.push({ testName, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}${details ? ` (${details})` : ''}`);
}

// Formula-injection mitigation
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value).replace(/\0/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

async function runPhase2LiveGate() {
  console.log(`\n======================================================`);
  console.log(`LEDGERLENS AI — PHASE 2 LIVE SUPABASE WORKFLOW GATE`);
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`======================================================\n`);

  const runId = Date.now();
  const testEmail = `reviewer_${runId}@ledgerlens-test.local`;
  const password = `Phase2Gate_${runId}!Aa1`;

  let userId, wsId, client, docId;

  try {
    // 1. Provision Confirmed Reviewer Account
    console.log('[1] Provisioning Reviewer Account...');
    const { data: u, error: uErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Lead Reviewer' },
    });
    if (uErr) throw uErr;
    userId = u.user.id;

    client = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: loginErr } = await client.auth.signInWithPassword({ email: testEmail, password });
    record('Reviewer Authenticates with Public Client', !loginErr);

    // 2. Create Workspace
    console.log('\n[2] Provisioning Workspace...');
    const { data: newWs, error: wsErr } = await client.rpc('create_workspace_with_owner', {
      name: 'Phase 2 Audit Operations',
    });
    if (wsErr) throw wsErr;
    wsId = newWs;
    record('Workspace Created Atomically', wsId != null, `ID: ${wsId}`);

    // 3. Register Document in 'uploaded' status
    console.log('\n[3] Uploading & Registering Invoice Document...');
    docId = '22222222-3333-4444-5555-666666666666';
    const storagePath = `${wsId}/${docId}.pdf`;
    const fakeBytes = Buffer.from('%PDF-1.4\nNorthstar Supplies\nINV-9021\nTotal: 198875.00\n%%EOF');

    await client.storage.from('invoices').upload(storagePath, fakeBytes, { contentType: 'application/pdf' });

    const { data: doc, error: docErr } = await client
      .from('documents')
      .insert({
        id: docId,
        workspace_id: wsId,
        uploaded_by: userId,
        original_filename: 'supplier_invoice_inv9021.pdf',
        storage_path: storagePath,
        mime_type: 'application/pdf',
        file_size_bytes: fakeBytes.length,
        status: 'uploaded',
      })
      .select()
      .single();
    if (docErr) throw docErr;
    record('Document Initialized in "uploaded" Status', doc?.status === 'uploaded');

    // 4. Lifecycle Transitions: uploaded -> queued -> processing -> review_required
    console.log('\n[4] Executing Lifecycle Transitions...');
    // uploaded -> queued
    await client.from('documents').update({ status: 'queued' }).eq('id', docId);
    let { data: docQ } = await client.from('documents').select('status').eq('id', docId).single();
    record('Transition: uploaded -> queued', docQ?.status === 'queued');

    // queued -> processing
    await client.from('documents').update({ status: 'processing' }).eq('id', docId);
    let { data: docP } = await client.from('documents').select('status').eq('id', docId).single();
    record('Transition: queued -> processing', docP?.status === 'processing');

    // processing -> review_required
    await client.from('documents').update({ status: 'review_required' }).eq('id', docId);
    let { data: docR } = await client.from('documents').select('status').eq('id', docId).single();
    record('Transition: processing -> review_required', docR?.status === 'review_required');

    // 5. Human Review Actions: review_required -> approved
    console.log('\n[5] Human Review Approval Gate...');
    await client.from('documents').update({ status: 'approved' }).eq('id', docId);
    let { data: docA } = await client.from('documents').select('status').eq('id', docId).single();
    record('Human Review Action: Approved', docA?.status === 'approved');

    // 6. CSV Formula Injection Escaping Test
    console.log('\n[6] Testing CSV Formula Injection Escaping...');
    const testRow = [
      escapeCsvCell(docId),
      escapeCsvCell('invoice.pdf'),
      escapeCsvCell('approved'),
      escapeCsvCell('=cmd|\' /C calc\'!A0'), // Malicious formula
      escapeCsvCell('+18005550199'),
      escapeCsvCell('@SUM(A1:A10)'),
      escapeCsvCell('198875.00'),
    ];
    const csvLine = testRow.join(',');
    record('CSV Neutralizes Formula Starting with =', csvLine.includes('"\'=cmd|\' /C calc\'!A0"'));
    record('CSV Neutralizes Formula Starting with +', csvLine.includes('"\'+18005550199"'));
    record('CSV Neutralizes Formula Starting with @', csvLine.includes('"\'@SUM(A1:A10)"'));

  } catch (err) {
    console.error('Phase 2 live test failure:', err);
  } finally {
    // Teardown
    console.log('\n[7] Cleaning Up Test Artifacts...');
    try {
      if (wsId) {
        await adminClient.storage.from('invoices').remove([`${wsId}/22222222-3333-4444-5555-666666666666.pdf`]);
        await adminClient.from('workspaces').delete().eq('id', wsId);
      }
      if (userId) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      console.log('Cleanup completed successfully.');
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr);
    }
  }

  console.log(`\n======================================================`);
  console.log(`PHASE 2 LIVE TEST RESULTS`);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`======================================================\n`);
}

runPhase2LiveGate();
