/**
 * LedgerLens AI — Automated Screenshot Capture Tool
 * Spawns the local frontend & backend, logs in to the benchmark workspace,
 * and uses headless Chrome via DevTools Protocol (CDP) to capture genuine, high-resolution screenshots.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const VITE_PORT = 5174;
const BACKEND_PORT = 3096;
const CDP_PORT = 9226;
const SCREENSHOT_DIR = path.resolve('demo-assets/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('\n=============================================================');
  console.log('LEDGERLENS AI — AUTOMATED HIGH-RES SCREENSHOT CAPTURE');
  console.log('=============================================================\n');

  // Load benchmark verification results to get document IDs
  const benchPath = path.resolve('demo-assets/synthetic_verification_results.json');
  if (!fs.existsSync(benchPath)) {
    throw new Error('Benchmark results not found! Run scripts/verify_synthetic_workflow.mjs first.');
  }
  const bench = JSON.parse(fs.readFileSync(benchPath, 'utf-8'));
  const wsId = bench.workspace_id;
  const docA = bench.results.find(r => r.scenario_id === 'SCENARIO-A')?.document_id;
  const docC = bench.results.find(r => r.scenario_id === 'SCENARIO-C')?.document_id;
  const docE = bench.results.find(r => r.scenario_id === 'SCENARIO-E')?.document_id;
  const docF = bench.results.find(r => r.scenario_id === 'SCENARIO-F')?.document_id;

  // 1. Authenticate with Supabase to get a valid session for the benchmark user
  console.log('[1] Retrieving authenticated session for benchmark user...');
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const publicClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get members of the benchmark workspace
  const { data: members, error: mErr } = await adminClient
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', wsId);
  if (mErr || !members?.length) throw new Error('Could not find benchmark workspace members');
  const userId = members[0].user_id;

  const { data: userData, error: uErr } = await adminClient.auth.admin.getUserById(userId);
  if (uErr || !userData.user?.email) throw new Error('Could not find benchmark user');
  const email = userData.user.email;

  // Set a deterministic password to log in and get full session
  const tempPassword = `ScreenPass_${Date.now()}!Aa1`;
  await adminClient.auth.admin.updateUserById(userId, { password: tempPassword });

  const { data: loginData, error: loginErr } = await publicClient.auth.signInWithPassword({
    email,
    password: tempPassword,
  });
  if (loginErr) throw loginErr;
  const session = loginData.session;
  console.log(`  Authenticated as: ${email}`);
  console.log(`  Active Workspace: ${bench.workspace_name} (${wsId})`);

  // 2. Start Vite server on port 5174
  console.log(`\n[2] Starting Vite preview/dev server on port ${VITE_PORT}...`);
  const viteProc = spawn('npx', ['vite', '--port', String(VITE_PORT)], {
    env: { ...process.env, VITE_SUPABASE_URL: SUPABASE_URL, VITE_SUPABASE_ANON_KEY: ANON_KEY },
    stdio: 'pipe',
  });

  // 3. Start local backend server on port 3096
  console.log(`[3] Starting local backend server on port ${BACKEND_PORT}...`);
  const serverProc = spawn('node', ['server/index.mjs'], {
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      VITE_SUPABASE_URL: SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
      VITE_SUPABASE_ANON_KEY: ANON_KEY,
    },
    stdio: 'pipe',
  });

  await wait(2500);

  // 4. Launch Headless Chrome with DevTools Protocol
  console.log(`[4] Launching Headless Chrome on CDP port ${CDP_PORT}...`);
  const chromeProc = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank',
  ]);

  await wait(2000);

  // Connect to Chrome via CDP
  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found in Chrome DevTools');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 0;
  const callbacks = new Map();
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      id++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sendCmd('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2, // High DPI capture
    mobile: false,
  });

  async function takeScreenshot(url, filename, evaluateBefore = null, delayMs = 1500) {
    console.log(`  Capturing: ${filename} (from ${url})...`);
    await sendCmd('Page.navigate', { url });
    await wait(delayMs);

    if (evaluateBefore) {
      await sendCmd('Runtime.evaluate', { expression: evaluateBefore });
      await wait(500);
    }

    const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`  ✅ Saved: ${filename} (${buffer.length} bytes)`);
  }

  console.log('\n[5] Capturing Public Pages...');
  // 1. Homepage
  await takeScreenshot(`http://localhost:${VITE_PORT}/`, '01_homepage.png', null, 1500);

  // 2. Pricing Page
  await takeScreenshot(`http://localhost:${VITE_PORT}/pricing`, '02_pricing_page.png', null, 1500);

  // 3. Privacy Policy
  await takeScreenshot(`http://localhost:${VITE_PORT}/privacy`, '03_privacy_policy.png', null, 1200);

  // 4. Terms of Service
  await takeScreenshot(`http://localhost:${VITE_PORT}/terms`, '04_terms_of_service.png', null, 1200);

  // 5. Auth / Sign In Screen
  await takeScreenshot(`http://localhost:${VITE_PORT}/app/auth`, '05_auth_screen.png', null, 1200);

  console.log('\n[6] Injecting Authentication Session...');
  // Navigate to app first, inject auth token into localStorage
  await sendCmd('Page.navigate', { url: `http://localhost:${VITE_PORT}/app/auth` });
  await wait(800);

  const serializedSession = JSON.stringify(session);
  await sendCmd('Runtime.evaluate', {
    expression: `localStorage.setItem('ledgerlens_auth_token', ${JSON.stringify(serializedSession)});`,
  });
  console.log('  Injected ledgerlens_auth_token into browser localStorage.');

  console.log('\n[7] Capturing Authenticated Workspace Screens...');
  // 6. Authenticated Workspace Document List showing synthetic invoices with status badges
  await takeScreenshot(
    `http://localhost:${VITE_PORT}/app/documents`,
    '06_authenticated_workspace_documents.png',
    null,
    2500
  );

  // 7. Scenario A (Clean approved invoice with side-by-side inspection & bounding boxes)
  if (docA) {
    await takeScreenshot(
      `http://localhost:${VITE_PORT}/app/documents/${docA}`,
      '07_scenario_a_clean_review_console.png',
      null,
      3000
    );
  }

  // 8. Scenario C (Arithmetic discrepancy flagged + human field correction)
  if (docC) {
    await takeScreenshot(
      `http://localhost:${VITE_PORT}/app/documents/${docC}`,
      '08_scenario_c_arithmetic_discrepancy.png',
      null,
      3000
    );
  }

  // 9. Scenario E (Date inconsistency issue flagged)
  if (docE) {
    await takeScreenshot(
      `http://localhost:${VITE_PORT}/app/documents/${docE}`,
      '09_scenario_e_date_inconsistency.png',
      null,
      3000
    );
  }

  // 10. Scenario F (Duplicate invoice warning detected)
  if (docF) {
    await takeScreenshot(
      `http://localhost:${VITE_PORT}/app/documents/${docF}`,
      '10_scenario_f_duplicate_warning.png',
      null,
      3000
    );
  }

  // Clean shutdown
  ws.close();
  chromeProc.kill();
  viteProc.kill();
  serverProc.kill();

  console.log('\n🎉 Screenshot capture completed! All assets stored in: ' + SCREENSHOT_DIR);
}

capture().catch((err) => {
  console.error('\n❌ Screenshot Capture Error:', err);
  process.exit(1);
});
