import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { runServerExtractionPipeline } from './intelligence.mjs';
import { handleCors } from './cors.mjs';

// Load environment variables from .env and .env.server safely
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
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          env[k] = v;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn('⚠️ Server warning: Supabase credentials not fully configured in environment.');
}

const supabaseAdmin = SUPABASE_URL && SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Formula-injection mitigation
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/\0/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// Authentication helper
async function authenticateRequest(req) {
  if (!supabaseAdmin) throw new Error('Database server not configured.');
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or malformed Bearer token.');
  }
  const token = authHeader.slice(7).trim();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized: Invalid or expired session token.');
  }
  return user;
}

// Check workspace membership
async function verifyWorkspaceMembership(userId, workspaceId) {
  const { data, error } = await supabaseAdmin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Access denied: You are not an authorized member of this workspace.');
  }
  return data.role;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  // Hardened CORS preflight and headers
  if (handleCors(req, res, { allowedMethods: 'GET, POST, OPTIONS', allowedHeaders: 'Content-Type, Authorization' })) {
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'LedgerLens AI Intelligence Server',
      timestamp: new Date().toISOString(),
      configured: Boolean(supabaseAdmin),
      ai_configured: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10),
      ai_model: 'gemini-2.5-flash',
    });
    return;
  }

  // POST /api/documents/:id/process
  const processMatch = url.pathname.match(/^\/api\/documents\/([a-f0-9-]+)\/process$/i);
  if (req.method === 'POST' && processMatch) {
    const documentId = processMatch[1];
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
        sendJson(res, 404, { error: 'Document not found.' });
        return;
      }
      doc = fetchedDoc;

      // 2. Verify caller belongs to the document workspace
      await verifyWorkspaceMembership(user.id, doc.workspace_id);

      // 3. State transition check
      const validStarting = ['uploaded', 'failed', 'review_required'];
      if (!validStarting.includes(doc.status)) {
        sendJson(res, 400, { error: `Cannot process document in status "${doc.status}".` });
        return;
      }

      // 4. Update status to queued -> processing
      await supabaseAdmin.from('documents').update({ status: 'queued', updated_at: new Date().toISOString() }).eq('id', documentId);
      await supabaseAdmin.from('invoice_audit_events').insert({
        document_id: documentId,
        workspace_id: doc.workspace_id,
        actor_id: user.id,
        event_type: doc.status === 'review_required' || doc.status === 'failed' ? 'reprocessed' : 'processing_queued',
        details: { previous_status: doc.status },
      });

      await supabaseAdmin.from('documents').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', documentId);
      await supabaseAdmin.from('invoice_audit_events').insert({
        document_id: documentId,
        workspace_id: doc.workspace_id,
        actor_id: user.id,
        event_type: 'processing_started',
        details: { engine: GEMINI_API_KEY ? 'gemini-2.5-flash' : 'server_heuristic_v1' },
      });

      // 5. Download file
      const { data: fileData, error: dlErr } = await supabaseAdmin.storage
        .from('invoices')
        .download(doc.storage_path);

      if (dlErr || !fileData) {
        throw new Error(`Storage read failure: ${dlErr?.message || 'File not found'}`);
      }

      const fileBuffer = Buffer.from(await fileData.arrayBuffer());

      // 6. Query existing workspace extractions for duplicate matching
      const { data: existingRows } = await supabaseAdmin
        .from('invoice_extractions')
        .select('id, document_id, workspace_id, supplier_name, invoice_number, grand_total, currency, invoice_date')
        .eq('workspace_id', doc.workspace_id)
        .eq('is_latest', true);

      // 7. Run intelligence extraction pipeline (Gemini 2.5 Flash with Heuristic fallback)
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

      // Invalidate previous extractions
      await supabaseAdmin.from('invoice_extractions').update({ is_latest: false }).eq('document_id', documentId);

      // Save new extraction
      const { data: newExt, error: extErr } = await supabaseAdmin
        .from('invoice_extractions')
        .insert(extractionPayload)
        .select()
        .single();

      if (extErr) throw extErr;

      // Replace validation issues
      await supabaseAdmin.from('invoice_validation_issues').delete().eq('document_id', documentId);
      if (pipelineResult.issues && pipelineResult.issues.length > 0) {
        const issuesToInsert = pipelineResult.issues.map(iss => ({
          document_id: documentId,
          workspace_id: doc.workspace_id,
          issue_type: iss.issue_type,
          severity: iss.severity,
          field_key: iss.field_key,
          message: iss.message,
          details: iss.details || null,
          resolved: false,
        }));
        await supabaseAdmin.from('invoice_validation_issues').insert(issuesToInsert);
      }

      // Transition to review_required
      await supabaseAdmin.from('documents').update({ status: 'review_required', updated_at: new Date().toISOString() }).eq('id', documentId);

      // Audit event
      await supabaseAdmin.from('invoice_audit_events').insert({
        document_id: documentId,
        workspace_id: doc.workspace_id,
        actor_id: user.id,
        event_type: 'extraction_completed',
        details: {
          provider: pipelineResult.provider,
          issues_count: pipelineResult.issues.length,
          fields_extracted: Object.keys(pipelineResult.extraction.field_metadata || {}).length,
        },
      });

      sendJson(res, 200, {
        success: true,
        documentId,
        status: 'review_required',
        extraction: newExt,
        issues: pipelineResult.issues,
      });

    } catch (err) {
      const errMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('Processing error:', errMsg);
      if (documentId && supabaseAdmin) {
        try {
          await supabaseAdmin.from('documents').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', documentId);
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
          console.warn('Could not record failed status/audit event:', cleanupErr.message);
        }
      }
      sendJson(res, 500, { error: errMsg || 'Invoice processing failed.' });
    }
    return;
  }

  // GET /api/workspaces/:workspaceId/export-csv
  const exportMatch = url.pathname.match(/^\/api\/workspaces\/([a-f0-9-]+)\/export-csv$/i);
  if (req.method === 'GET' && exportMatch) {
    const workspaceId = exportMatch[1];
    try {
      const user = await authenticateRequest(req);
      await verifyWorkspaceMembership(user.id, workspaceId);

      // Fetch approved documents
      const { data: docs } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!docs || docs.length === 0) {
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ledgerlens_approved_invoices_empty.csv"',
        });
        res.end('Document ID,Original Filename,Status,Supplier Name,Invoice Number,Grand Total,Currency\r\n');
        return;
      }

      const docIds = docs.map(d => d.id);
      const { data: extractions } = await supabaseAdmin
        .from('invoice_extractions')
        .select('*')
        .in('document_id', docIds)
        .eq('is_latest', true);

      const extMap = new Map();
      if (extractions) {
        extractions.forEach(e => extMap.set(e.document_id, e));
      }

      const headers = [
        'Document ID',
        'Original Filename',
        'Status',
        'Supplier Name',
        'Supplier Tax ID',
        'Invoice Number',
        'Invoice Date',
        'Due Date',
        'Currency',
        'Subtotal',
        'Tax Amount',
        'Grand Total',
        'Payment Terms',
        'Created At',
      ];

      const lines = [headers.map(escapeCsv).join(',')];
      for (const d of docs) {
        const ext = extMap.get(d.id);
        const row = [
          d.id,
          d.original_filename,
          d.status,
          ext?.supplier_name || '',
          ext?.supplier_tax_id || '',
          ext?.invoice_number || '',
          ext?.invoice_date || '',
          ext?.due_date || '',
          ext?.currency || 'USD',
          ext?.subtotal !== null && ext?.subtotal !== undefined ? ext.subtotal.toFixed(2) : '',
          ext?.tax_amount !== null && ext?.tax_amount !== undefined ? ext.tax_amount.toFixed(2) : '',
          ext?.grand_total !== null && ext?.grand_total !== undefined ? ext.grand_total.toFixed(2) : '',
          ext?.payment_terms || '',
          d.created_at,
        ];
        lines.push(row.map(escapeCsv).join(','));
      }

      const csvData = lines.join('\r\n');
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ledgerlens_approved_invoices_${workspaceId.slice(0, 8)}.csv"`,
      });
      res.end(csvData);

    } catch (err) {
      sendJson(res, 403, { error: err.message || 'Failed to export invoices.' });
    }
    return;
  }

  // Fallthrough 404
  sendJson(res, 404, { error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[LedgerLens AI Server] Running on http://localhost:${PORT}`);
});
