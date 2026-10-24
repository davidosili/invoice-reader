/**
 * scripts/record_demo_video.mjs
 *
 * Automatically records a high-definition 60-second video walkthrough
 * of LedgerLens AI's working MVP using Chrome CDP screencasting and ffmpeg.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpegInstaller.path;

function loadEnv() {
  const env = {};
  for (const filename of ['.env', '.env.server']) {
    const p = path.resolve(process.cwd(), filename);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const publicClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DOC_ID = '8fe0ca79-bbeb-4719-9d5d-d572201e43d9';
const WORKSPACE_ID = '801ac8bb-a390-4d65-96b6-ed8c2457f91e';
const USER_EMAIL = 'davidosili93@gmail.com';
const USER_ID = '5b70f957-0473-4e62-9ea3-60f8d978e2a4';

const CDP_PORT = 9229;
const OUTPUT_DIR = path.resolve('public');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const OUTPUT_VIDEO = path.join(OUTPUT_DIR, 'demo-walkthrough.mp4');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('================================================================');
  console.log('RECORDING LEDGERLENS AI 60-SECOND PRODUCT DEMONSTRATION VIDEO');
  console.log('================================================================\n');

  // Step 1: Sign in as workspace owner
  console.log(`[1] Authenticating as workspace owner (${USER_EMAIL})...`);
  const tempPassword = `DemoPass_${Date.now()}!Aa1`;
  await adminClient.auth.admin.updateUserById(USER_ID, { password: tempPassword });

  const { data: authData, error: authErr } = await publicClient.auth.signInWithPassword({
    email: USER_EMAIL,
    password: tempPassword,
  });
  if (authErr || !authData.session) {
    throw new Error(`Authentication failed: ${authErr?.message}`);
  }
  const session = authData.session;
  console.log('  ✅ Authenticated successfully. Session established.');

  // Step 2: Ensure document is in review_required state for a dynamic review demo
  await adminClient
    .from('documents')
    .update({ status: 'review_required' })
    .eq('id', DOC_ID);

  // Step 3: Launch Chrome via CDP
  console.log(`\n[2] Launching Chrome on CDP port ${CDP_PORT}...`);
  const chromeProc = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1440,900',
    'about:blank',
  ]);

  await wait(2000);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 0;
  const callbacks = new Map();

  // Step 4: Setup ffmpeg stream input
  console.log(`\n[3] Spawning ffmpeg encoder at ${FFMPEG_PATH}...`);
  const ffmpegProc = spawn(FFMPEG_PATH, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '24',
    '-i', '-',
    '-vcodec', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    '-movflags', '+faststart',
    OUTPUT_VIDEO,
  ]);

  ffmpegProc.stderr.on('data', (d) => {
    // console.log('[ffmpeg]', d.toString().slice(0, 80));
  });

  let frameCount = 0;
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    } else if (data.method === 'Page.screencastFrame') {
      const { data: b64, sessionId } = data.params;
      const buf = Buffer.from(b64, 'base64');
      ffmpegProc.stdin.write(buf);
      frameCount++;
      ws.send(JSON.stringify({ id: ++msgId, method: 'Page.screencastFrameAck', params: { sessionId } }));
    }
  };

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      msgId++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
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
    deviceScaleFactor: 1.5,
    mobile: false,
  });

  async function evalInBrowser(expr) {
    const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  // Inject session into localStorage at origin
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/auth' });
  await wait(1000);

  const sessionJson = JSON.stringify(session);
  await evalInBrowser(`localStorage.setItem('ledgerlens_auth_token', ${JSON.stringify(sessionJson)});`);

  // Start Screencast
  console.log('\n[4] Starting video screencast capture (24 fps)...');
  await sendCmd('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1440,
    maxHeight: 900,
    everyNthFrame: 1,
  });

  // SCENE 1: Document Workspace Dashboard (0s - 10s)
  console.log('  🎥 Scene 1: Document Workspace Dashboard...');
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/documents' });
  await wait(3000);

  // Inject a visual cursor helper for realistic mouse movements
  await evalInBrowser(`(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(23, 107, 80, 0.85)';
    cursor.style.border = '2px solid white';
    cursor.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    cursor.style.left = '400px';
    cursor.style.top = '300px';
    document.body.appendChild(cursor);

    window.moveCursorTo = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };
  })()`);

  await wait(2000);

  // Move cursor toward the uploaded invoice in the table
  await evalInBrowser(`window.moveCursorTo(720, 320);`);
  await wait(1500);

  // SCENE 2: Open Document Review Console (10s - 35s)
  console.log('  🎥 Scene 2: Opening Document Review Console...');
  await sendCmd('Page.navigate', { url: `http://localhost:5173/app/documents/${DOC_ID}` });
  await wait(3500);

  // Re-inject cursor in review console
  await evalInBrowser(`(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(23, 107, 80, 0.85)';
    cursor.style.border = '2px solid white';
    cursor.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    cursor.style.left = '300px';
    cursor.style.top = '250px';
    document.body.appendChild(cursor);

    window.moveCursorTo = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };
  })()`);

  // Move cursor to validation discrepancies alert
  console.log('  🎥 Scene 3: Highlighting Audit Validation Discrepancy...');
  await evalInBrowser(`window.moveCursorTo(500, 160);`);
  await wait(2500);

  // Move cursor to Supplier Name input and focus it
  console.log('  🎥 Scene 4: Inspecting Extracted Supplier & Bounding Box...');
  await evalInBrowser(`(() => {
    window.moveCursorTo(780, 320);
    const inputs = Array.from(document.querySelectorAll('input'));
    const supInput = inputs.find(i => i.value.includes('Juliana'));
    if (supInput) supInput.focus();
  })()`);
  await wait(3000);

  // Move cursor to Grand Total
  console.log('  🎥 Scene 5: Verifying Mathematical Cross-Sums ($957)...');
  await evalInBrowser(`window.moveCursorTo(1150, 680);`);
  await wait(2500);

  // SCENE 6: Save Correction
  console.log('  🎥 Scene 6: Saving Reviewer Correction...');
  await evalInBrowser(`(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const taxInput = inputs.find(i => i.closest('div').innerText.includes('Tax ID'));
    if (taxInput) {
      taxInput.value = 'US-TIN-9948102';
      taxInput.dispatchEvent(new Event('input', { bubbles: true }));
      taxInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.moveCursorTo(1180, 240);
  })()`);
  await wait(1500);

  await evalInBrowser(`(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save Corrections'));
    if (saveBtn) saveBtn.click();
  })()`);
  await wait(3000);

  // SCENE 7: Approve Invoice
  console.log('  🎥 Scene 7: Certifying Invoice Approval...');
  await evalInBrowser(`window.confirm = () => true;`);
  await evalInBrowser(`window.moveCursorTo(1260, 85);`);
  await wait(1500);

  await evalInBrowser(`(() => {
    const approveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Approve Invoice'));
    if (approveBtn) approveBtn.click();
  })()`);
  await wait(3500);

  // SCENE 8: Inspect Immutable Audit Trail & Technical Diagnostics
  console.log('  🎥 Scene 8: Expanding Technical Diagnostics & Audit Trail...');
  await evalInBrowser(`window.moveCursorTo(1180, 800);`);
  await wait(1500);

  await evalInBrowser(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('View Technical Diagnostics'));
    if (btn) btn.click();
  })()`);
  await wait(4000);

  // SCENE 9: Exporting Verified CSV
  console.log('  🎥 Scene 9: Exporting Certified Accounting CSV...');
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/documents' });
  await wait(3000);

  await evalInBrowser(`(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(23, 107, 80, 0.85)';
    cursor.style.border = '2px solid white';
    cursor.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.left = '1200px';
    cursor.style.top = '120px';
    document.body.appendChild(cursor);
  })()`);
  await wait(2500);

  // Stop Screencast & finalize video
  console.log('\n[5] Finalizing video recording...');
  await sendCmd('Page.stopScreencast');
  await wait(1000);

  ffmpegProc.stdin.end();

  await new Promise((resolve) => {
    ffmpegProc.on('close', resolve);
  });

  ws.close();
  chromeProc.kill();

  const stats = fs.statSync(OUTPUT_VIDEO);
  console.log('\n================================================================');
  console.log(`🎉 VIDEO RECORDED SUCCESSFULLY!`);
  console.log(`📁 File:     ${OUTPUT_VIDEO}`);
  console.log(`📊 Size:     ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🎞️  Frames:   ${frameCount} captured`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Video recording failed:', err);
  process.exit(1);
});
