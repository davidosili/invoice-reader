/**
 * capture_warning_screenshots.mjs
 *
 * Uploads fresh Scenario C (arithmetic discrepancy) and Scenario F (duplicate warning)
 * documents to the existing benchmark workspace, processes them via the API,
 * then captures screenshots of the review console BEFORE any approval/rejection,
 * so the active warning banners are visible.
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:5174
 *   - API server running on http://localhost:3001
 *   - .env present with valid credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// --- Load env ---
function loadEnv() {
  const env = {};
  for (const file of ['.env', '.env.server']) {
    const envPath = path.join(ROOT, file);
    if (!fs.existsSync(envPath)) continue;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!env[k]) env[k] = v; // .env takes precedence over .env.server for shared keys
    }
  }
  return env;
}

const ENV = loadEnv();
const SUPABASE_URL = ENV.SUPABASE_URL || ENV.VITE_SUPABASE_URL;
const SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Known benchmark workspace and test user from previous run
const WORKSPACE_ID = '84ca3ac1-97c3-47a0-9762-d84ecba67717';
const DEMO_EMAIL = `benchmark_lead_1792766277263@ledgerlens-eval.local`;
const DEMO_PASSWORD = `BenchmarkTemp_${Date.now().toString(36)}`;

const SCREENSHOTS_DIR = path.join(ROOT, 'demo-assets', 'screenshots');
const INVOICES_DIR = path.join(ROOT, 'demo-assets', 'synthetic-invoices');

// --- Helper: sleep ---
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- Step 1: Reset benchmark user password so we can sign in ---
async function resetUserPassword() {
  console.log('\n🔑 Resetting benchmark user password...');
  
  // Find user by email
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);
  
  const user = listData.users.find(u => u.email === DEMO_EMAIL);
  if (!user) throw new Error(`Benchmark user not found: ${DEMO_EMAIL}`);
  
  const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: DEMO_PASSWORD
  });
  if (updateErr) throw new Error(`Password reset failed: ${updateErr.message}`);
  
  console.log(`  ✅ Password reset for ${DEMO_EMAIL}`);
  return user.id;
}

// --- Step 2: Sign in as benchmark user ---
async function signIn() {
  console.log('\n🔐 Signing in as benchmark user...');
  
  const anonKey = ENV.VITE_SUPABASE_ANON_KEY;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
    },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sign-in failed: ${response.status} ${text}`);
  }
  
  const data = await response.json();
  console.log(`  ✅ Signed in, token obtained`);
  return data.access_token;
}

// --- Step 3: Upload a document ---
async function uploadDocument(accessToken, filename) {
  console.log(`\n📤 Uploading ${filename}...`);
  const filePath = path.join(INVOICES_DIR, filename);
  const fileBuffer = fs.readFileSync(filePath);
  
  const anonKey = ENV.VITE_SUPABASE_ANON_KEY;
  
  // Use the API to upload (multipart form)
  const FormData = (await import('node:buffer')).Blob;
  
  // Build multipart manually
  const boundary = `----FormBoundary${Date.now()}`;
  const fileContent = fileBuffer;
  const filename_safe = filename;
  
  const bodyParts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename_safe}"\r\nContent-Type: application/pdf\r\n\r\n`,
    fileContent,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="workspaceId"\r\n\r\n${WORKSPACE_ID}\r\n--${boundary}--\r\n`
  ];
  
  const bodyBuffers = bodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p);
  const body = Buffer.concat(bodyBuffers);
  
  const response = await fetch('http://localhost:3001/api/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }
  
  const data = await response.json();
  console.log(`  ✅ Uploaded: doc ID = ${data.document?.id || data.id}`);
  return data.document?.id || data.id;
}

// --- Step 4: Process a document ---
async function processDocument(accessToken, docId) {
  console.log(`\n⚙️  Processing document ${docId}...`);
  
  const response = await fetch(`http://localhost:3001/api/documents/${docId}/process`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workspaceId: WORKSPACE_ID })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Process failed: ${response.status} ${text}`);
  }
  
  const data = await response.json();
  console.log(`  ✅ Processed - issues: ${data.validation_issues?.length ?? 0}`);
  return data;
}

// --- Step 5: Capture screenshot via CDP ---
async function captureScreenshot(url, filename, authState) {
  console.log(`\n📸 Capturing: ${filename} (from ${url})...`);
  
  // Launch Chrome with remote debugging
  const { spawn } = await import('child_process');
  const debugPort = 9230;
  
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1440,900',
    '--force-device-scale-factor=2',
    'about:blank'
  ], { detached: false });
  
  await sleep(2000);
  
  try {
    // Get websocket URL
    const wsResp = await fetch(`http://localhost:${debugPort}/json`);
    const tabs = await wsResp.json();
    const wsUrl = tabs[0].webSocketDebuggerUrl;
    
    // Connect via WebSocket
    const { default: WebSocket } = await import('ws');
    const ws = new WebSocket(wsUrl);
    
    let msgId = 1;
    const pendingRequests = new Map();
    
    await new Promise(resolve => ws.on('open', resolve));
    
    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pendingRequests.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };
    
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
    
    // Set viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, deviceScaleFactor: 2, mobile: false
    });
    
    // Inject localStorage auth state before navigation
    await send('Page.enable');
    
    // Navigate to app first to set storage
    await send('Page.navigate', { url: 'http://localhost:5174' });
    await sleep(1500);
    
    // Set Supabase auth in localStorage
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('sb-lxupcuczoebhmgfhzfox-auth-token', JSON.stringify(${JSON.stringify(authState)}));
        true;
      `
    });
    
    // Navigate to the target page
    const navResult = await send('Page.navigate', { url });
    await sleep(4000); // Wait for React to render
    
    // Take screenshot
    const result = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    
    ws.close();
    
    const outputPath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(outputPath, Buffer.from(result.data, 'base64'));
    
    const stats = fs.statSync(outputPath);
    console.log(`  ✅ Saved: ${filename} (${stats.size} bytes)`);
    
    return outputPath;
  } finally {
    chrome.kill();
    await sleep(500);
  }
}

// --- Main ---
async function main() {
  console.log('='.repeat(60));
  console.log('LedgerLens AI - Warning Banner Screenshot Capture');
  console.log('='.repeat(60));
  
  // Step 1: Reset password
  await resetUserPassword();
  
  // Step 2: Sign in
  const accessToken = await signIn();
  
  // Build Supabase auth state for localStorage injection
  // Need to get the session object
  const anonKey = ENV.VITE_SUPABASE_ANON_KEY;
  const sessionResp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  const sessionData = await sessionResp.json();
  
  const authState = {
    access_token: sessionData.access_token,
    token_type: 'bearer',
    expires_in: sessionData.expires_in,
    expires_at: sessionData.expires_at,
    refresh_token: sessionData.refresh_token,
    user: sessionData.user
  };

  // Step 3: Upload and process Scenario C (arithmetic discrepancy) — NEW fresh upload
  console.log('\n--- SCENARIO C: Arithmetic Discrepancy ---');
  const docC = await uploadDocument(accessToken, 'fixture_c_arithmetic_discrepancy.pdf');
  await processDocument(accessToken, docC);
  await sleep(1000);
  
  // Step 4: Capture screenshot BEFORE approving/rejecting — doc is in review_required state
  await captureScreenshot(
    `http://localhost:5174/app/documents/${docC}`,
    '08_scenario_c_arithmetic_discrepancy.png',
    authState
  );

  // Step 5: Upload and process Scenario F (duplicate) — NEW fresh upload
  console.log('\n--- SCENARIO F: Duplicate Warning ---');
  const docF = await uploadDocument(accessToken, 'fixture_f_duplicate_copy.pdf');
  await processDocument(accessToken, docF);
  await sleep(1000);

  // Step 6: Capture screenshot BEFORE approving/rejecting
  await captureScreenshot(
    `http://localhost:5174/app/documents/${docF}`,
    '10_scenario_f_duplicate_warning.png',
    authState
  );

  console.log('\n✅ Done! Screenshots updated:');
  console.log(`  📸 demo-assets/screenshots/08_scenario_c_arithmetic_discrepancy.png`);
  console.log(`  📸 demo-assets/screenshots/10_scenario_f_duplicate_warning.png`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
