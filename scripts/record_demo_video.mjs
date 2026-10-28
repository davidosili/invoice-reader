/**
 * scripts/record_demo_video.mjs
 *
 * Automatically records a high-definition 60-second video walkthrough
 * of LedgerLens AI's working MVP using Chrome CDP screencasting and ffmpeg.
 *
 * Implements a constant 24 FPS wall-clock pump so static reading intervals
 * and pauses are fully preserved, ensuring an exact ~60-second runtime.
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
const USER_EMAIL = 'davidosili93@gmail.com';
const USER_ID = '5b70f957-0473-4e62-9ea3-60f8d978e2a4';

const CDP_PORT = 9229;
const OUTPUT_DIR = path.resolve('public');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const OUTPUT_VIDEO = path.join(OUTPUT_DIR, 'demo-walkthrough.mp4');

const TARGET_FPS = 24;
const FRAME_DURATION_MS = 1000 / TARGET_FPS;

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

  // Step 2: Reset document to review_required state for a dynamic review demo
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
  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension'));
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
    '-r', String(TARGET_FPS),
    '-i', '-',
    '-vcodec', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '21',
    '-movflags', '+faststart',
    OUTPUT_VIDEO,
  ]);

  ffmpegProc.stderr.on('data', () => {});

  let latestFrameBuffer = null;
  let rawCdpFrames = 0;
  let pumpedFrames = 0;
  let pumpInterval = null;

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) {
      const { resolve, reject } = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    } else if (data.method === 'Page.screencastFrame') {
      const { data: b64, sessionId } = data.params;
      latestFrameBuffer = Buffer.from(b64, 'base64');
      rawCdpFrames++;
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

  // Pre-seed authenticated session in localStorage
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/auth' });
  await wait(1200);

  const sessionJson = JSON.stringify(session);
  await evalInBrowser(`localStorage.setItem('ledgerlens_auth_token', ${JSON.stringify(sessionJson)});`);

  // Navigate to documents list
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/documents' });
  await wait(2500);

  // Start Screencast
  console.log('\n[4] Starting video screencast capture...');
  await sendCmd('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1440,
    maxHeight: 900,
    everyNthFrame: 1,
  });

  // Await first real frame from Chrome before initiating wall-clock pump
  while (!latestFrameBuffer) {
    await wait(50);
  }
  console.log('  ✅ First screencast frame received. Starting 24 FPS drift-corrected pump...');

  const recordStartTime = Date.now();
  pumpInterval = setInterval(() => {
    if (!latestFrameBuffer || !ffmpegProc.stdin.writable) return;
    const elapsed = Date.now() - recordStartTime;
    const targetCount = Math.floor(elapsed / FRAME_DURATION_MS);
    const needed = targetCount - pumpedFrames;
    for (let i = 0; i < needed; i++) {
      ffmpegProc.stdin.write(latestFrameBuffer);
      pumpedFrames++;
    }
  }, 15);

  // Helper to inject mouse cursor and lower-third banner
  async function setupHud(stepText, detailText) {
    await evalInBrowser(`(() => {
      // 1. Mouse cursor
      let cursor = document.getElementById('demo-cursor');
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'demo-cursor';
        cursor.style.position = 'fixed';
        cursor.style.width = '18px';
        cursor.style.height = '18px';
        cursor.style.borderRadius = '50%';
        cursor.style.backgroundColor = 'rgba(23, 107, 80, 0.9)';
        cursor.style.border = '2px solid #FFFFFF';
        cursor.style.boxShadow = '0 3px 12px rgba(0,0,0,0.35)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '999999';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        cursor.style.left = '400px';
        cursor.style.top = '300px';
        document.body.appendChild(cursor);
      }

      window.moveCursorTo = (x, y) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      };

      window.clickCursor = () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        const rip = document.createElement('div');
        rip.style.position = 'fixed';
        rip.style.left = cursor.style.left;
        rip.style.top = cursor.style.top;
        rip.style.width = '36px';
        rip.style.height = '36px';
        rip.style.borderRadius = '50%';
        rip.style.border = '2px solid rgba(23, 107, 80, 0.8)';
        rip.style.transform = 'translate(-50%, -50%) scale(0.2)';
        rip.style.pointerEvents = 'none';
        rip.style.zIndex = '999998';
        rip.style.transition = 'all 0.4s ease-out';
        document.body.appendChild(rip);
        requestAnimationFrame(() => {
          rip.style.transform = 'translate(-50%, -50%) scale(1.6)';
          rip.style.opacity = '0';
        });
        setTimeout(() => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          rip.remove();
        }, 400);
      };

      // 2. Lower-third informative banner
      let banner = document.getElementById('demo-hud-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'demo-hud-banner';
        banner.style.position = 'fixed';
        banner.style.bottom = '24px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.backgroundColor = 'rgba(32, 39, 34, 0.94)';
        banner.style.backdropFilter = 'blur(10px)';
        banner.style.color = '#FFFFFF';
        banner.style.padding = '10px 22px';
        banner.style.borderRadius = '30px';
        banner.style.boxShadow = '0 12px 30px -4px rgba(0, 0, 0, 0.4)';
        banner.style.zIndex = '999997';
        banner.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        banner.style.fontSize = '13px';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.gap = '12px';
        banner.style.border = '1px solid rgba(255, 255, 255, 0.16)';
        banner.style.transition = 'all 0.3s ease';
        document.body.appendChild(banner);
      }

      window.setBanner = (step, detail) => {
        banner.innerHTML = \`
          <span style="background: #176B50; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase;">\${step}</span>
          <span style="font-weight: 500; color: #E2E6E1;">\${detail}</span>
        \`;
      };
    })()`);

    if (stepText && detailText) {
      await evalInBrowser(`window.setBanner(${JSON.stringify(stepText)}, ${JSON.stringify(detailText)});`);
    }
  }

  // =========================================================================
  // SCENE 1: Workspace Dashboard & Intake Pipeline (0s - 8s)
  // =========================================================================
  console.log('  🎥 [00:00 - 00:08] Scene 1: Document Workspace Intake & Pipeline...');
  await setupHud('1 / 6 • Intake', 'Live documents queue with automated extraction and confidence scoring');
  await wait(3000);

  // Move cursor toward invoice row in the table
  await evalInBrowser(`window.moveCursorTo(680, 310);`);
  await wait(2500);

  // Click on the invoice row to enter Review Console
  await evalInBrowser(`window.clickCursor();`);
  await wait(2500);

  // =========================================================================
  // SCENE 2: Split-Screen Review Console Overview (8s - 16s)
  // =========================================================================
  console.log('  🎥 [00:08 - 00:16] Scene 2: Split-Screen Review Console Overview...');
  await sendCmd('Page.navigate', { url: `http://localhost:5173/app/documents/${DOC_ID}` });
  await wait(3500);

  await setupHud('2 / 6 • Review Console', 'Interactive audit console: source document rendered alongside AI schema');
  await evalInBrowser(`window.moveCursorTo(380, 360);`);
  await wait(2500);

  await evalInBrowser(`window.moveCursorTo(450, 240);`);
  await wait(2000);

  // =========================================================================
  // SCENE 3: Automated Validation Rules & Anomaly Detection (16s - 26s)
  // =========================================================================
  console.log('  🎥 [00:16 - 00:26] Scene 3: Highlighting Audit Validation Discrepancy...');
  await setupHud('3 / 6 • Anomaly Detection', 'Validation engine flags due-date discrepancy before payment approval');
  await evalInBrowser(`window.moveCursorTo(520, 160);`);
  await wait(5000);

  // Focus on Due Date field
  await evalInBrowser(`window.moveCursorTo(1060, 440);`);
  await wait(5000);

  // =========================================================================
  // SCENE 4: Synchronized Bounding Box & Math Cross-Sums (26s - 36s)
  // =========================================================================
  console.log('  🎥 [00:26 - 00:36] Scene 4: Bounding Box Synchronization & Math Verification...');
  await setupHud('4 / 6 • Verification', 'Cross-sum verification ($870 subtotal + $87 tax = $957 grand total)');

  // Focus supplier name to highlight bounding box
  await evalInBrowser(`(() => {
    window.moveCursorTo(780, 320);
    const inputs = Array.from(document.querySelectorAll('input'));
    const supInput = inputs.find(i => i.value.includes('Juliana'));
    if (supInput) supInput.focus();
  })()`);
  await wait(3500);

  // Hover subtotal and tax
  await evalInBrowser(`window.moveCursorTo(1050, 580);`);
  await wait(3000);

  // Hover grand total
  await evalInBrowser(`window.moveCursorTo(1150, 680);`);
  await wait(3500);

  // =========================================================================
  // SCENE 5: Human-in-the-Loop Reviewer Inline Correction (36s - 46s)
  // =========================================================================
  console.log('  🎥 [00:36 - 00:46] Scene 5: Saving Reviewer Correction...');
  await setupHud('5 / 6 • Correction', 'Human-in-the-loop: Reviewer updates Tax ID with instant audit trail logging');

  await evalInBrowser(`(() => {
    window.moveCursorTo(820, 440);
    const inputs = Array.from(document.querySelectorAll('input'));
    const taxInput = inputs.find(i => i.closest('div').innerText.includes('Tax ID'));
    if (taxInput) {
      taxInput.focus();
      taxInput.value = 'US-TIN-9948102';
      taxInput.dispatchEvent(new Event('input', { bubbles: true }));
      taxInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await wait(3000);

  // Move to Save Corrections button and click
  await evalInBrowser(`window.moveCursorTo(1180, 240);`);
  await wait(1500);
  await evalInBrowser(`window.clickCursor();`);
  await evalInBrowser(`(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save Corrections'));
    if (saveBtn) saveBtn.click();
  })()`);
  await wait(5500);

  // =========================================================================
  // SCENE 6: Certification & One-Click Invoice Approval (46s - 54s)
  // =========================================================================
  console.log('  🎥 [00:46 - 00:54] Scene 6: Certifying Invoice Approval...');
  await setupHud('6 / 6 • Certification', 'One-click certification marks document approved and ready for ERP disbursement');

  await evalInBrowser(`window.confirm = () => true;`);
  await evalInBrowser(`window.moveCursorTo(1260, 85);`);
  await wait(2000);

  await evalInBrowser(`window.clickCursor();`);
  await evalInBrowser(`(() => {
    const approveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Approve Invoice'));
    if (approveBtn) approveBtn.click();
  })()`);
  await wait(6000);

  // =========================================================================
  // SCENE 7: Diagnostics Telemetry & Certified Accounting Export (54s - 63s)
  // =========================================================================
  console.log('  🎥 [00:54 - 00:63] Scene 7: Diagnostics Telemetry & Export...');
  await setupHud('Audit & Export', 'Provider inference telemetry (Gemini 2.5 Flash) and formula-safe CSV export');

  // Scroll down to technical audit
  await evalInBrowser(`window.scrollTo({ top: 400, behavior: 'smooth' });`);
  await wait(1500);

  await evalInBrowser(`window.moveCursorTo(1180, 800);`);
  await wait(1000);
  await evalInBrowser(`window.clickCursor();`);
  await evalInBrowser(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('View Technical Diagnostics'));
    if (btn) btn.click();
  })()`);
  await wait(4500);

  // Navigate back to documents list for export
  await sendCmd('Page.navigate', { url: 'http://localhost:5173/app/documents' });
  await wait(2000);

  await setupHud('Complete', 'Verified accounting pipeline: invoices certified, audited, and export-ready');
  await evalInBrowser(`window.moveCursorTo(1200, 120);`);
  await wait(1500);
  await evalInBrowser(`window.clickCursor();`);
  await wait(2000);

  // =========================================================================
  // Finalizing video capture
  // =========================================================================
  console.log('\n[5] Finalizing video recording...');
  clearInterval(pumpInterval);
  await sendCmd('Page.stopScreencast');
  await wait(500);

  ffmpegProc.stdin.end();

  await new Promise((resolve) => {
    ffmpegProc.on('close', resolve);
  });

  ws.close();
  chromeProc.kill();

  const stats = fs.statSync(OUTPUT_VIDEO);
  const totalRecordedSeconds = (pumpedFrames / TARGET_FPS).toFixed(1);
  console.log('\n================================================================');
  console.log(`🎉 VIDEO RECORDED SUCCESSFULLY!`);
  console.log(`📁 File:        ${OUTPUT_VIDEO}`);
  console.log(`📊 Size:        ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🎞️  Raw CDP:     ${rawCdpFrames} dirty-rect frames`);
  console.log(`⏱️  Pumped:      ${pumpedFrames} frames at 24 FPS (~${totalRecordedSeconds}s)`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Video recording failed:', err);
  process.exit(1);
});
