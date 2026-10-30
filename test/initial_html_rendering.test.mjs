import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
let server;
let baseUrl;

// Plain HTTP static file server simulating production CDN/hosting (Vercel)
before(async () => {
  assert.ok(fs.existsSync(DIST_DIR), 'dist directory must exist from production build');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'index.html')), 'dist/index.html must exist');

  server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    let targetFile = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

    // Mimic static web server resolution: directory index.html, clean .html URL, or fallback
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
      targetFile = path.join(targetFile, 'index.html');
    } else if (!fs.existsSync(targetFile) && fs.existsSync(`${targetFile}.html`)) {
      targetFile = `${targetFile}.html`;
    }

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
      const ext = path.extname(targetFile);
      const contentType = ext === '.html' ? 'text/html; charset=utf-8'
        : ext === '.css' ? 'text/css'
        : ext === '.js' ? 'application/javascript'
        : ext === '.svg' ? 'image/svg+xml'
        : 'application/octet-stream';

      const content = fs.readFileSync(targetFile);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length,
      });
      res.end(content);
    } else {
      // SPA Fallback for client routes
      const fallback = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fallback);
    }
  });

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('No-JS Initial HTML: Homepage (/) returns meaningful content and metadata via plain HTTP', async () => {
  const res = await fetch(`${baseUrl}/`, {
    headers: { 'Accept': 'text/html' },
  });

  // 1. HTTP success response
  assert.equal(res.status, 200, 'Homepage must return HTTP 200 OK');
  const contentType = res.headers.get('content-type') || '';
  assert.ok(contentType.includes('text/html'), 'Response must be text/html');

  // 2. Non-empty HTML document
  const html = await res.text();
  assert.ok(html.length > 20000, `Homepage HTML must be substantive (got ${html.length} bytes)`);

  // 3. MyLedgerLens company / brand name
  assert.ok(
    html.includes('MyLedgerLens'),
    'Homepage HTML must contain MyLedgerLens brand identity'
  );

  // 4. Main homepage heading
  assert.ok(
    html.includes('Source document to verified ledger. Connected at every decimal.'),
    'Homepage HTML must contain main hero heading'
  );

  // 5. Meaningful product description
  assert.ok(
    html.includes('MyLedgerLens extracts B2B invoice lines, reconciles multi-item arithmetic'),
    'Homepage HTML must contain the core product mission and description'
  );

  // 6. Visible or discoverable path to the privacy policy
  assert.ok(
    html.includes('href="/privacy"'),
    'Homepage HTML must contain link to /privacy'
  );

  // 7. Visible or discoverable path to the terms of service
  assert.ok(
    html.includes('href="/terms"'),
    'Homepage HTML must contain link to /terms'
  );

  // 8. Appropriate page metadata in <head>
  assert.ok(
    html.includes('<title>MyLedgerLens — AI-Powered Financial Document Intelligence</title>'),
    'Homepage HTML must contain descriptive title'
  );
  assert.ok(
    html.includes('<meta name="description" content="MyLedgerLens helps businesses extract, validate, and review financial document data'),
    'Homepage HTML must contain descriptive meta description'
  );
  assert.ok(
    html.includes('<link rel="canonical" href="https://myledgerlens.com/"'),
    'Homepage HTML must declare canonical URL'
  );
  assert.ok(
    html.includes('<meta property="og:title"'),
    'Homepage HTML must include Open Graph title'
  );
  assert.ok(
    html.includes('<meta property="og:description"'),
    'Homepage HTML must include Open Graph description'
  );

  // 9. Root element is NOT an empty shell
  const rootIndex = html.indexOf('<div id="root">');
  assert.ok(rootIndex !== -1, 'HTML must contain <div id="root">');
  const rootSlice = html.slice(rootIndex, rootIndex + 500);
  assert.ok(!rootSlice.startsWith('<div id="root"></div>'), 'Root div must NOT be empty shell');
});

test('No-JS Initial HTML: Shared footer displays company identity, legal links, and compliance details', async () => {
  const res = await fetch(`${baseUrl}/`);
  const html = await res.text();

  // Footer company name
  assert.ok(html.includes('MyLedgerLens'), 'Footer must display MyLedgerLens company name');

  // Legal links
  assert.ok(html.includes('href="/privacy"'), 'Footer must link to Privacy Policy');
  assert.ok(html.includes('href="/terms"'), 'Footer must link to Terms of Service');

  // Contact support email
  assert.ok(html.includes('support@myledgerlens.com'), 'Footer must display verified support email');

  // Copyright notice with year
  assert.ok(
    html.includes('MyLedgerLens. All rights reserved.'),
    'Footer must contain copyright notice'
  );
});

test('No-JS Initial HTML: Privacy policy (/privacy) returns full accessible legal text independently', async () => {
  const res = await fetch(`${baseUrl}/privacy`);

  assert.equal(res.status, 200, 'Privacy policy route must return HTTP 200');
  const html = await res.text();

  assert.ok(html.length > 15000, `Privacy page HTML must be substantive (got ${html.length} bytes)`);

  // Main heading
  assert.ok(html.includes('Privacy Policy'), 'Must render Privacy Policy heading');

  // Disclosures and real technical architecture
  assert.ok(html.includes('Google Gemini') || html.includes('gemini-2.5-flash'), 'Must disclose Gemini AI extraction');
  assert.ok(html.includes('Supabase'), 'Must disclose Supabase storage/database');
  assert.ok(html.includes('Row Level Security') || html.includes('RLS'), 'Must disclose multi-tenant isolation');
  assert.ok(html.includes('invoice_audit_events') || html.includes('Audit Trail'), 'Must disclose audit logging');

  // Footer on privacy page
  assert.ok(html.includes('href="/terms"'), 'Privacy page footer must link to Terms of Service');
  assert.ok(html.includes('support@myledgerlens.com'), 'Must list support contact');

  // Page title
  assert.ok(html.includes('<title>Privacy Policy | MyLedgerLens</title>'), 'Must have privacy title');
});

test('No-JS Initial HTML: Terms of Service (/terms) returns full accessible terms independently', async () => {
  const res = await fetch(`${baseUrl}/terms`);

  assert.equal(res.status, 200, 'Terms route must return HTTP 200');
  const html = await res.text();

  assert.ok(html.length > 15000, `Terms page HTML must be substantive (got ${html.length} bytes)`);

  // Main heading
  assert.ok(html.includes('Terms of Service'), 'Must render Terms of Service heading');

  // Commercial disclaimers and human verification requirements
  assert.ok(
    html.includes('Human Verification') || html.includes('human verification'),
    'Must require human review before business reliance'
  );
  assert.ok(
    html.includes('Deterministic Calculations') || html.includes('arithmetic'),
    'Must state calculation nature'
  );
  assert.ok(
    html.includes('AS-IS') || html.includes('AS-AVAILABLE'),
    'Must include standard disclaimer'
  );

  // Footer on terms page
  assert.ok(html.includes('href="/privacy"'), 'Terms page footer must link to Privacy Policy');

  // Page title
  assert.ok(html.includes('<title>Terms of Service | MyLedgerLens</title>'), 'Must have terms title');
});

test('No-JS Initial HTML: Complete content availability when JavaScript execution is fully disabled', async () => {
  const res = await fetch(`${baseUrl}/`);
  let html = await res.text();

  // Strip all <script> tags to simulate an agent / tool that does not run JS
  const noScriptHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  assert.ok(!noScriptHtml.includes('<script'), 'Simulated HTML must have no script tags');

  // Key content must still be 100% available in the document tree
  assert.ok(noScriptHtml.includes('Source document to verified ledger'), 'Hero heading present without JS');
  assert.ok(noScriptHtml.includes('MyLedgerLens'), 'Brand name present without JS');
  assert.ok(noScriptHtml.includes('href="/privacy"'), 'Privacy link present without JS');
  assert.ok(noScriptHtml.includes('href="/terms"'), 'Terms link present without JS');
  assert.ok(noScriptHtml.includes('support@myledgerlens.com'), 'Support email present without JS');
  assert.ok(noScriptHtml.includes('Verification Standards'), 'Verification standards present without JS');
});

test('No-JS Initial HTML: Direct navigation and browser refresh on all marketing routes', async () => {
  const routes = ['/', '/privacy', '/terms', '/about', '/pricing'];

  for (const route of routes) {
    const res = await fetch(`${baseUrl}${route}`);
    assert.equal(res.status, 200, `Direct request to ${route} must succeed with HTTP 200`);
    const body = await res.text();
    assert.ok(body.length > 5000, `Direct request to ${route} must return full content`);
    assert.ok(body.includes('MyLedgerLens'), `${route} must include brand name`);
    assert.ok(body.includes('href="/privacy"'), `${route} must include privacy link`);
    assert.ok(body.includes('href="/terms"'), `${route} must include terms link`);
  }
});

test('Security Check: Pre-rendered HTML does not leak actual server secrets or private credentials', () => {
  const htmlFiles = [
    path.join(DIST_DIR, 'index.html'),
    path.join(DIST_DIR, 'privacy', 'index.html'),
    path.join(DIST_DIR, 'terms', 'index.html'),
    path.join(DIST_DIR, 'about', 'index.html'),
    path.join(DIST_DIR, 'pricing', 'index.html'),
  ];

  // Load actual server secrets to ensure their values are never leaked in HTML
  const secretEnvPath = path.resolve(process.cwd(), '.env.server');
  const serverSecrets = [];
  if (fs.existsSync(secretEnvPath)) {
    const lines = fs.readFileSync(secretEnvPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
          if (val.length > 8) {
            serverSecrets.push({ key, val });
          }
        }
      }
    }
  }

  for (const file of htmlFiles) {
    assert.ok(fs.existsSync(file), `${file} must exist`);
    const content = fs.readFileSync(file, 'utf-8');

    // Verify raw secret values are never exposed
    for (const { key, val } of serverSecrets) {
      assert.ok(
        !content.includes(val),
        `Pre-rendered HTML file ${file} must NOT contain secret value for "${key}"`
      );
    }

    // Verify no internal connection strings
    assert.ok(!content.includes('postgresql://'), `${file} must not contain raw postgresql URI`);
    assert.ok(!content.includes('postgres://'), `${file} must not contain raw postgres URI`);
  }
});
