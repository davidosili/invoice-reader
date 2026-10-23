/**
 * LedgerLens AI — Vercel Serverless Function
 * GET /api/health
 *
 * Lightweight liveness and configuration check.
 * Returns service status and which components are reachable.
 * Never exposes secret values.
 */

import { handleCors } from '../server/cors.mjs';

export default function handler(req, res) {
  if (handleCors(req, res, { allowedMethods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const supabaseConfigured = Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const aiConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10
  );

  return res.status(200).json({
    status: 'ok',
    service: 'LedgerLens AI Intelligence Server',
    timestamp: new Date().toISOString(),
    configured: supabaseConfigured,
    ai_configured: aiConfigured,
    ai_model: 'gemini-2.5-flash',
  });
}
