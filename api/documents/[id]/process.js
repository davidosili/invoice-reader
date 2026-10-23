/**
 * LedgerLens AI — Vercel Serverless Function
 * POST /api/documents/:id/process
 *
 * Authenticates the caller, verifies workspace membership, runs the full
 * Gemini 2.5 Flash extraction pipeline, persists results, and transitions
 * the document status to 'review_required'.
 *
 * Secrets required (set in Vercel dashboard — never in source code):
 *   SUPABASE_URL          or  VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { runServerExtractionPipeline } from '../../../server/intelligence.mjs';
import { handleCors } from '../../../server/cors.mjs';

// Safe environment loader fallback
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  for (const filename of ['.env', '.env.server']) {
    const p = path.resolve(process.cwd(), filename);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1 && trimmed.slice(0, idx).trim() === key) {
          return trimmed.slice(idx + 1).trim();
        }
      }
    }
  }
  return undefined;
}

// ── Environment ──────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || getEnv('GEMINI_API_KEY');

// ── Supabase admin client (service role — never exposed to the browser) ──────
const supabaseAdmin =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// ── Helpers ──────────────────────────────────────────────────────────────────
function json(res, status, body) {
  res.status(status).json(body);
}

async function authenticateRequest(req) {
  if (!supabaseAdmin) throw new Error('Database server not configured.');
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or malformed Bearer token.');
  }
  const token = authHeader.slice(7).trim();
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized: Invalid or expired session token.');
  }
  return user;
}

async function verifyWorkspaceMembership(userId, workspaceId) {
  const { data, error } = await supabaseAdmin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();
  if (error || !data) {
    throw new Error(
      'Access denied: You are not an authorized member of this workspace.'
    );
  }
  return data.role;
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS handling
  if (handleCors(req, res, { allowedMethods: 'POST, OPTIONS', allowedHeaders: 'Content-Type, Authorization' })) {
    return;
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed.' });
  }

  // documentId comes from the dynamic route segment [id]
  const documentId = req.query.id;
  if (!documentId || !/^[a-f0-9-]+$/i.test(documentId)) {
    return json(res, 400, { error: 'Invalid document identifier.' });
  }

  let user = null;
  let doc = null;

  try {
    user = await authenticateRequest(req);

    // 1. Fetch document
    const { data: fetchedDoc, error: docErr } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docErr || !fetchedDoc) {
      return json(res, 404, { error: 'Document not found.' });
    }
    doc = fetchedDoc;

    // 2. Verify caller belongs to the document's workspace
    await verifyWorkspaceMembership(user.id, doc.workspace_id);

    // 3. State transition check
    const validStarting = ['uploaded', 'failed', 'review_required'];
    if (!validStarting.includes(doc.status)) {
      return json(res, 400, {
        error: `Cannot process document in status "${doc.status}".`,
      });
    }

    // 4. Transition: queued
    await supabaseAdmin
      .from('documents')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    await supabaseAdmin.from('invoice_audit_events').insert({
      document_id: documentId,
      workspace_id: doc.workspace_id,
      actor_id: user.id,
      event_type:
        doc.status === 'review_required' || doc.status === 'failed'
          ? 'reprocessed'
          : 'processing_queued',
      details: { previous_status: doc.status },
    });

    // 5. Transition: processing
    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    await supabaseAdmin.from('invoice_audit_events').insert({
      document_id: documentId,
      workspace_id: doc.workspace_id,
      actor_id: user.id,
      event_type: 'processing_started',
      details: {
        engine: GEMINI_API_KEY ? 'gemini-2.5-flash' : 'server_heuristic_v1',
      },
    });

    // 6. Download file from private storage
    const { data: fileData, error: dlErr } = await supabaseAdmin.storage
      .from('invoices')
      .download(doc.storage_path);

    if (dlErr || !fileData) {
      throw new Error(
        `Storage read failure: ${dlErr?.message || 'File not found'}`
      );
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());

    // 7. Fetch existing extractions for duplicate matching
    const { data: existingRows } = await supabaseAdmin
      .from('invoice_extractions')
      .select(
        'id, document_id, workspace_id, supplier_name, invoice_number, grand_total, currency, invoice_date'
      )
      .eq('workspace_id', doc.workspace_id)
      .eq('is_latest', true);

    // 8. Run intelligence pipeline (Gemini 2.5 Flash → heuristic fallback)
    const pipelineResult = await runServerExtractionPipeline(
      fileBuffer,
      doc.mime_type,
      doc.original_filename,
      documentId,
      existingRows || [],
      GEMINI_API_KEY
    );

    const extractionPayload = {
      document_id: documentId,
      workspace_id: doc.workspace_id,
      version: 1,
      ...pipelineResult.extraction,
      is_latest: true,
    };

    // 9. Archive previous extractions, save new one
    await supabaseAdmin
      .from('invoice_extractions')
      .update({ is_latest: false })
      .eq('document_id', documentId);

    const { data: newExt, error: extErr } = await supabaseAdmin
      .from('invoice_extractions')
      .insert(extractionPayload)
      .select()
      .single();

    if (extErr) throw extErr;

    // 10. Replace validation issues
    await supabaseAdmin
      .from('invoice_validation_issues')
      .delete()
      .eq('document_id', documentId);

    if (pipelineResult.issues && pipelineResult.issues.length > 0) {
      await supabaseAdmin.from('invoice_validation_issues').insert(
        pipelineResult.issues.map((iss) => ({
          document_id: documentId,
          workspace_id: doc.workspace_id,
          issue_type: iss.issue_type,
          severity: iss.severity,
          field_key: iss.field_key,
          message: iss.message,
          details: iss.details || null,
          resolved: false,
        }))
      );
    }

    // 11. Transition to review_required
    await supabaseAdmin
      .from('documents')
      .update({
        status: 'review_required',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    // 12. Audit: extraction completed
    await supabaseAdmin.from('invoice_audit_events').insert({
      document_id: documentId,
      workspace_id: doc.workspace_id,
      actor_id: user.id,
      event_type: 'extraction_completed',
      details: {
        provider: pipelineResult.provider,
        fallback: Boolean(pipelineResult.fallback),
        fallback_reason: pipelineResult.fallbackReason || null,
        issues_count: pipelineResult.issues.length,
        fields_extracted: Object.keys(
          pipelineResult.extraction.field_metadata || {}
        ).length,
      },
    });

    return json(res, 200, {
      success: true,
      documentId,
      status: 'review_required',
      extraction: newExt,
      issues: pipelineResult.issues,
    });
  } catch (err) {
    const errMsg =
      err?.message ||
      (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('[LedgerLens] Processing error:', errMsg);

    // Best-effort failure cleanup
    if (documentId && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('documents')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', documentId);

        if (doc?.workspace_id) {
          await supabaseAdmin.from('invoice_audit_events').insert({
            document_id: documentId,
            workspace_id: doc.workspace_id,
            actor_id: user?.id || null,
            event_type: 'processing_failed',
            details: { error: errMsg },
          });
        }
      } catch (cleanupErr) {
        console.warn(
          '[LedgerLens] Could not record failure state:',
          cleanupErr.message
        );
      }
    }

    return json(res, 500, { error: errMsg || 'Invoice processing failed.' });
  }
}
