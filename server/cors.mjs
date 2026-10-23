/**
 * LedgerLens AI — Hardened CORS Middleware & Policy Engine
 *
 * Implements strict, environment-controlled CORS matching:
 * - Exact origin matching against configured allowlists
 * - Never returns wildcard (*) in any environment
 * - Rejects unapproved origins by omitting CORS headers and returning 403 on preflight
 * - Configures Vary: Origin for CDN/cache safety
 * - Restricts allowed methods and headers to only what is required
 * - Disables credentialed CORS (app uses Bearer tokens, not ambient cookies)
 */

// Default approved origins for local development
export const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

// Default approved origins for production
export const DEFAULT_PROD_ORIGINS = [
  'https://app.ledgerlens.ai',
  'https://ledgerlens.ai',
];

/**
 * Parses and returns the active set of allowed origins based on environment.
 * @param {object} [env=process.env] - Environment variables object
 * @returns {Set<string>} Set of normalized allowed origin strings
 */
export function getAllowedOrigins(env = process.env) {
  const allowed = new Set();

  // 1. Explicitly configured origins from ALLOWED_ORIGINS env var
  if (env.ALLOWED_ORIGINS) {
    const list = env.ALLOWED_ORIGINS.split(',')
      .map(o => o.trim())
      .filter(Boolean);
    for (const origin of list) {
      allowed.add(origin);
    }
  }

  // 2. Vercel deployment URLs (if available in environment)
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowed.add(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (env.VERCEL_URL) {
    allowed.add(`https://${env.VERCEL_URL}`);
  }

  // 3. Known production origins
  for (const origin of DEFAULT_PROD_ORIGINS) {
    allowed.add(origin);
  }

  // 4. In development or test environments, also allow local development origins
  const isProduction = env.NODE_ENV === 'production' && !env.ALLOW_DEV_ORIGINS;
  if (!isProduction) {
    for (const origin of DEFAULT_DEV_ORIGINS) {
      allowed.add(origin);
    }
  } else if (!env.ALLOWED_ORIGINS && !env.VERCEL_PROJECT_PRODUCTION_URL) {
    console.warn('[LedgerLens Security Warning] No explicit ALLOWED_ORIGINS configured in production environment. Falling back to default production domains.');
  }

  return allowed;
}

/**
 * Checks if an incoming origin is authorized via exact matching.
 * @param {string|undefined|null} origin - Origin header value from request
 * @param {Set<string>} allowedSet - Allowed origins set
 * @returns {boolean}
 */
export function isOriginAllowed(origin, allowedSet) {
  if (!origin || typeof origin !== 'string') return false;
  return allowedSet.has(origin.trim());
}

/**
 * Applies hardened CORS headers to an HTTP response and handles preflight requests.
 *
 * @param {object} req - HTTP request (IncomingMessage)
 * @param {object} res - HTTP response (ServerResponse)
 * @param {object} [options]
 * @param {string} [options.allowedMethods='GET, POST, OPTIONS'] - Allowed methods
 * @param {string} [options.allowedHeaders='Content-Type, Authorization'] - Allowed headers
 * @param {Set<string>} [options.allowedOrigins] - Override set of allowed origins
 * @returns {boolean} Whether the preflight OPTIONS request was handled (caller should return if true)
 */
export function handleCors(req, res, options = {}) {
  const allowedMethods = options.allowedMethods || 'GET, POST, OPTIONS';
  const allowedHeaders = options.allowedHeaders || 'Content-Type, Authorization';
  const allowedOrigins = options.allowedOrigins || getAllowedOrigins();

  const origin = req.headers ? (req.headers['origin'] || req.headers['Origin']) : undefined;

  // Always set Vary: Origin so CDNs and browsers don't serve cached responses to wrong origins
  if (typeof res.setHeader === 'function') {
    res.setHeader('Vary', 'Origin');
  }

  const isAllowed = isOriginAllowed(origin, allowedOrigins);

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', allowedMethods);
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Preflight OPTIONS handler
  if (req.method === 'OPTIONS') {
    if (!origin || isAllowed) {
      if (typeof res.status === 'function') {
        res.status(204).end();
      } else if (typeof res.writeHead === 'function') {
        res.writeHead(204);
        res.end();
      }
    } else {
      // Unapproved origin preflight request rejected
      const errorPayload = { error: 'CORS origin not allowed.' };
      if (typeof res.status === 'function') {
        res.status(403).json(errorPayload);
      } else if (typeof res.writeHead === 'function') {
        const body = JSON.stringify(errorPayload);
        res.writeHead(403, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        });
        res.end(body);
      }
    }
    return true; // Preflight was handled
  }

  return false; // Not a preflight request; continue processing
}
