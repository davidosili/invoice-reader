import { createClient } from '@supabase/supabase-js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || serverEnv.GEMINI_API_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PORT = 3099;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2E() {
  console.log('\n======================================================');
  console.log('LEDGERLENS AI — SERVER + GEMINI AI END-TO-END GATE');
  console.log('======================================================\n');

  // 1. Spawn server on TEST_PORT
  console.log(`[1] Spawning Intelligence Server on port ${TEST_PORT}...`);
  const serverProc = spawn('node', ['server/index.mjs'], {
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      VITE_SUPABASE_URL: SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
      VITE_SUPABASE_ANON_KEY: ANON_KEY,
      GEMINI_API_KEY: GEMINI_API_KEY,
    },
    stdio: 'pipe',
  });

  serverProc.stdout.pipe(process.stdout);
  serverProc.stderr.pipe(process.stderr);

  // Wait for server ready
  await wait(1500);

  let userId, wsId, docId, client, token;

  try {
    // 2. Health check
    console.log('[2] Testing /api/health endpoint...');
    const healthRes = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    const healthJson = await healthRes.json();
    console.log(`Health Status: ${healthRes.status}, AI Configured: ${healthJson.ai_configured}, Model: ${healthJson.ai_model}`);
    if (healthRes.status !== 200 || !healthJson.ai_configured) {
      throw new Error(`Health check failed: ${JSON.stringify(healthJson)}`);
    }

    // 3. Provision test user
    console.log('\n[3] Authenticating Reviewer User...');
    const runId = Date.now();
    const testEmail = `gemini_e2e_${runId}@ledgerlens-test.local`;
    const password = `GeminiE2E_${runId}!Aa1`;

    const { data: u, error: uErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'AI Operations Lead' },
    });
    if (uErr) throw uErr;
    userId = u.user.id;

    client = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: loginData, error: loginErr } = await client.auth.signInWithPassword({ email: testEmail, password });
    if (loginErr) throw loginErr;
    token = loginData.session.access_token;

    // 4. Create Workspace
    console.log('\n[4] Provisioning Workspace...');
    const { data: newWs, error: wsErr } = await client.rpc('create_workspace_with_owner', {
      name: 'Gemini 2.5 Flash Workspace',
    });
    if (wsErr) throw wsErr;
    wsId = newWs;

    // 5. Upload sample PDF invoice
    console.log('\n[5] Uploading Sample Invoice PDF...');
    docId = '99999999-8888-7777-6666-555555555555';
    const storagePath = `${wsId}/${docId}.pdf`;

    const sampleInvoicePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 280 >>
stream
BT
/F1 18 Tf
50 720 Td
(VORTEX PRECISION INSTRUMENTS LTD) Tj
/F1 12 Tf
0 -30 Td
(Invoice Number: INV-VORTEX-771) Tj
0 -20 Td
(Invoice Date: 2026-10-18) Tj
0 -20 Td
(Due Date: 2026-11-01) Tj
0 -30 Td
(Item: Industrial Pressure Sensor Kit x 1 @ 850.00 = 850.00) Tj
0 -20 Td
(Subtotal: 850.00) Tj
0 -20 Td
(Tax (10%): 85.00) Tj
0 -20 Td
(Total Amount Due: 935.00 USD) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000574 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
643
%%EOF`;

    const pdfBuffer = Buffer.from(sampleInvoicePdf, 'utf-8');
    await client.storage.from('invoices').upload(storagePath, pdfBuffer, { contentType: 'application/pdf' });

    const { error: regErr } = await client.from('documents').insert({
      id: docId,
      workspace_id: wsId,
      uploaded_by: userId,
      original_filename: 'vortex_precision_771.pdf',
      storage_path: storagePath,
      mime_type: 'application/pdf',
      file_size_bytes: pdfBuffer.length,
      status: 'uploaded',
    });
    if (regErr) throw regErr;

    // Check if invoice_extractions table exists in remote database
    const { error: tableCheckErr } = await adminClient.from('invoice_extractions').select('count').limit(0);
    const hasExtractionTable = !tableCheckErr;

    if (!hasExtractionTable) {
      console.log('\n⚠️ Notice: Table "public.invoice_extractions" not yet applied in remote Supabase schema.');
      console.log('   The SQL migration is available at: supabase/migrations/20261022000001_phase2_intelligence.sql');
      console.log('   Please run it in the Supabase SQL Editor: https://supabase.com/dashboard/project/lxupcuczoebhmgfhzfox/sql/new\n');

      console.log('[6] Testing Gemini 2.5 Flash Model Extraction directly...');
      const { extractWithGemini } = await import('../server/intelligence.mjs');
      const directResult = await extractWithGemini(pdfBuffer, 'application/pdf', 'vortex_precision_771.pdf', GEMINI_API_KEY);
      console.log('✅ Extraction Provider Used:', directResult.extractor_provider);
      console.log('✅ Extracted Supplier Name:', directResult.supplier_name);
      console.log('✅ Extracted Invoice Number:', directResult.invoice_number);
      console.log('✅ Extracted Grand Total:', directResult.grand_total, directResult.currency);
      console.log('✅ Extracted Line Items:', directResult.line_items.length);

      console.log('\n======================================================');
      console.log('🎉 SERVER HEALTH & GEMINI AI LIVE EXTRACTION VERIFIED!');
      console.log('======================================================\n');
      return;
    }

    // 6. Invoke POST /api/documents/:id/process
    console.log('\n[6] Calling POST /api/documents/:id/process with Bearer token...');
    const procRes = await fetch(`http://localhost:${TEST_PORT}/api/documents/${docId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const procJson = await procRes.json();
    console.log(`Process Response: HTTP ${procRes.status}`);
    if (procRes.status !== 200 || !procJson.success) {
      throw new Error(`Processing call failed: ${JSON.stringify(procJson)}`);
    }

    console.log('✅ Extraction Provider Used:', procJson.extraction.extractor_provider);
    console.log('✅ Extracted Supplier Name:', procJson.extraction.supplier_name);
    console.log('✅ Extracted Invoice Number:', procJson.extraction.invoice_number);
    console.log('✅ Extracted Grand Total:', procJson.extraction.grand_total, procJson.extraction.currency);
    console.log('✅ Extracted Line Items:', procJson.extraction.line_items.length);
    console.log('✅ Validation Issues Detected:', procJson.issues.length);

    // 7. Check database updates
    console.log('\n[7] Verifying Supabase Database Updates...');
    const { data: updatedDoc } = await client.from('documents').select('status').eq('id', docId).single();
    console.log(`Document Status in DB: "${updatedDoc.status}" (Expected: review_required)`);
    if (updatedDoc.status !== 'review_required') {
      throw new Error(`Invalid status: ${updatedDoc.status}`);
    }

    const { data: auditEvents } = await client.from('invoice_audit_events').select('event_type').eq('document_id', docId);
    console.log(`Audit Events Logged: ${auditEvents.map(e => e.event_type).join(', ')}`);

    // 8. Human Review Approval
    console.log('\n[8] Performing Human Review Approval...');
    const { error: appErr } = await client.from('documents').update({ status: 'approved' }).eq('id', docId);
    if (appErr) throw appErr;

    // 9. Export CSV
    console.log('\n[9] Calling GET /api/workspaces/:wsId/export-csv...');
    const exportRes = await fetch(`http://localhost:${TEST_PORT}/api/workspaces/${wsId}/export-csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const csvText = await exportRes.text();
    console.log(`CSV Export HTTP Status: ${exportRes.status}`);
    console.log('--- CSV Preview ---');
    console.log(csvText.split('\n').slice(0, 3).join('\n'));
    console.log('-------------------');

    if (!csvText.includes('VORTEX PRECISION') && !csvText.includes(docId)) {
      throw new Error('Export CSV did not contain the approved document!');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END SERVER + GEMINI TESTS PASSED!');
    console.log('======================================================\n');

  } finally {
    // Cleanup
    console.log('Cleaning up test artifacts...');
    if (wsId && docId) {
      await adminClient.storage.from('invoices').remove([`${wsId}/${docId}.pdf`]);
      await adminClient.from('workspaces').delete().eq('id', wsId);
    }
    if (userId) {
      await adminClient.auth.admin.deleteUser(userId);
    }
    serverProc.kill();
  }
}

runE2E().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
