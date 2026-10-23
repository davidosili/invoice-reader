import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllowedOrigins,
  isOriginAllowed,
  handleCors,
  DEFAULT_DEV_ORIGINS,
  DEFAULT_PROD_ORIGINS,
} from '../server/cors.mjs';
import healthHandler from '../api/health.js';

// Mock HTTP Request helper
function createMockRequest({ method = 'GET', headers = {}, query = {}, url = '/api/health' } = {}) {
  return {
    method,
    headers,
    query,
    url,
  };
}

// Mock HTTP Response helper
function createMockResponse() {
  const headers = {};
  let statusCode = 200;
  let responseBody = null;
  let isEnded = false;

  const res = {
    statusCode,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    getHeaders() {
      return { ...headers };
    },
    status(code) {
      res.statusCode = code;
      return res;
    },
    writeHead(code, headHeaders = {}) {
      res.statusCode = code;
      for (const [k, v] of Object.entries(headHeaders)) {
        headers[k.toLowerCase()] = v;
      }
      return res;
    },
    json(data) {
      responseBody = data;
      isEnded = true;
      return res;
    },
    send(data) {
      responseBody = data;
      isEnded = true;
      return res;
    },
    end(data) {
      if (data) responseBody = data;
      isEnded = true;
      return res;
    },
    _getHeaders: () => headers,
    _getBody: () => responseBody,
    _isEnded: () => isEnded,
  };

  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Origin Resolution & Environment Parsing
// ─────────────────────────────────────────────────────────────────────────────

test('CORS Policy - Includes default development origins in dev mode', () => {
  const origins = getAllowedOrigins({ NODE_ENV: 'development' });
  for (const devOrigin of DEFAULT_DEV_ORIGINS) {
    assert.equal(origins.has(devOrigin), true, `Missing dev origin: ${devOrigin}`);
  }
});

test('CORS Policy - Parses comma-separated ALLOWED_ORIGINS env variable', () => {
  const origins = getAllowedOrigins({
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://custom.company.com, https://invoices.internal.corp ',
  });

  assert.equal(origins.has('https://custom.company.com'), true);
  assert.equal(origins.has('https://invoices.internal.corp'), true);
});

test('CORS Policy - Excludes localhost dev origins in production mode', () => {
  const origins = getAllowedOrigins({
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://app.ledgerlens.ai',
  });

  assert.equal(origins.has('http://localhost:5173'), false);
  assert.equal(origins.has('http://127.0.0.1:5173'), false);
  assert.equal(origins.has('https://app.ledgerlens.ai'), true);
});

test('CORS Policy - Supports VERCEL_URL and production project URLs', () => {
  const origins = getAllowedOrigins({
    NODE_ENV: 'production',
    VERCEL_URL: 'ledgerlens-git-preview.vercel.app',
    VERCEL_PROJECT_PRODUCTION_URL: 'ledgerlens.vercel.app',
  });

  assert.equal(origins.has('https://ledgerlens-git-preview.vercel.app'), true);
  assert.equal(origins.has('https://ledgerlens.vercel.app'), true);
});

test('CORS Policy - Fails safely to default production domains without wildcard', () => {
  const origins = getAllowedOrigins({ NODE_ENV: 'production' });
  assert.equal(origins.has('*'), false, 'Wildcard must NEVER be present');
  assert.equal(origins.has('https://app.ledgerlens.ai'), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Exact Origin Matching
// ─────────────────────────────────────────────────────────────────────────────

test('CORS Matching - Requires exact scheme, host, and port', () => {
  const allowed = new Set(['https://app.ledgerlens.ai', 'http://localhost:5173']);

  // Exact matches
  assert.equal(isOriginAllowed('https://app.ledgerlens.ai', allowed), true);
  assert.equal(isOriginAllowed('http://localhost:5173', allowed), true);

  // Scheme mismatch
  assert.equal(isOriginAllowed('http://app.ledgerlens.ai', allowed), false);

  // Port mismatch
  assert.equal(isOriginAllowed('http://localhost:8080', allowed), false);

  // Path or prefix injection attempt
  assert.equal(isOriginAllowed('https://app.ledgerlens.ai.evil.com', allowed), false);
  assert.equal(isOriginAllowed('https://app.ledgerlens.ai/evil', allowed), false);

  // Empty or invalid inputs
  assert.equal(isOriginAllowed('', allowed), false);
  assert.equal(isOriginAllowed(null, allowed), false);
  assert.equal(isOriginAllowed(undefined, allowed), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Header Application & Preflight Handling
// ─────────────────────────────────────────────────────────────────────────────

test('CORS Headers - Sets Vary: Origin and permitted origin on approved requests', () => {
  const req = createMockRequest({
    method: 'GET',
    headers: { origin: 'https://app.ledgerlens.ai' },
  });
  const res = createMockResponse();

  const isHandled = handleCors(req, res, {
    allowedMethods: 'GET, OPTIONS',
    allowedOrigins: new Set(['https://app.ledgerlens.ai']),
  });

  assert.equal(isHandled, false);
  assert.equal(res.getHeader('vary'), 'Origin');
  assert.equal(res.getHeader('access-control-allow-origin'), 'https://app.ledgerlens.ai');
  assert.equal(res.getHeader('access-control-allow-methods'), 'GET, OPTIONS');
  // Confirm credentials header is NOT set (token-based auth)
  assert.equal(res.getHeader('access-control-allow-credentials'), undefined);
});

test('CORS Headers - Omits Access-Control-Allow-Origin on unapproved requests', () => {
  const req = createMockRequest({
    method: 'GET',
    headers: { origin: 'https://unauthorized-site.com' },
  });
  const res = createMockResponse();

  const isHandled = handleCors(req, res, {
    allowedOrigins: new Set(['https://app.ledgerlens.ai']),
  });

  assert.equal(isHandled, false);
  assert.equal(res.getHeader('vary'), 'Origin');
  assert.equal(res.getHeader('access-control-allow-origin'), undefined);
});

test('CORS Preflight - Responds HTTP 204 with CORS headers for approved origin', () => {
  const req = createMockRequest({
    method: 'OPTIONS',
    headers: { origin: 'https://app.ledgerlens.ai' },
  });
  const res = createMockResponse();

  const isHandled = handleCors(req, res, {
    allowedMethods: 'POST, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    allowedOrigins: new Set(['https://app.ledgerlens.ai']),
  });

  assert.equal(isHandled, true);
  assert.equal(res.statusCode, 204);
  assert.equal(res.getHeader('access-control-allow-origin'), 'https://app.ledgerlens.ai');
  assert.equal(res.getHeader('access-control-allow-methods'), 'POST, OPTIONS');
  assert.equal(res.getHeader('access-control-allow-headers'), 'Content-Type, Authorization');
  assert.equal(res.getHeader('access-control-max-age'), '86400');
});

test('CORS Preflight - Rejects unapproved origin with HTTP 403 Forbidden', () => {
  const req = createMockRequest({
    method: 'OPTIONS',
    headers: { origin: 'https://hostile-tracker.io' },
  });
  const res = createMockResponse();

  const isHandled = handleCors(req, res, {
    allowedOrigins: new Set(['https://app.ledgerlens.ai']),
  });

  assert.equal(isHandled, true);
  assert.equal(res.statusCode, 403);
  assert.equal(res.getHeader('access-control-allow-origin'), undefined);
  assert.deepEqual(res._getBody(), { error: 'CORS origin not allowed.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Endpoint Level Verification (api/health.js)
// ─────────────────────────────────────────────────────────────────────────────

test('Endpoint Health Check - Responds with CORS header when requested by approved origin', () => {
  const req = createMockRequest({
    method: 'GET',
    headers: { origin: 'http://localhost:5173' },
  });
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.getHeader('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(res._getBody().status, 'ok');
});

test('Endpoint Health Check - Omits CORS header when requested by unapproved origin', () => {
  const req = createMockRequest({
    method: 'GET',
    headers: { origin: 'https://random-external-domain.com' },
  });
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.getHeader('access-control-allow-origin'), undefined);
});

test('Endpoint Health Check - Preflight OPTIONS returns 204 for approved origin', () => {
  const req = createMockRequest({
    method: 'OPTIONS',
    headers: { origin: 'http://localhost:5173' },
  });
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.getHeader('access-control-allow-origin'), 'http://localhost:5173');
});

test('Endpoint Health Check - Preflight OPTIONS returns 403 for unapproved origin', () => {
  const req = createMockRequest({
    method: 'OPTIONS',
    headers: { origin: 'https://evil-spoof.com' },
  });
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.getHeader('access-control-allow-origin'), undefined);
});
