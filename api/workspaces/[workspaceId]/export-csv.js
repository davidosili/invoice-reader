/**
 * LedgerLens AI — Vercel Serverless Function
 * GET /api/workspaces/:workspaceId/export-csv
 *
 * Authenticates the caller, verifies workspace membership, fetches all approved
 * documents with their latest extraction records, and streams a properly escaped
 * CSV file. Applies formula-injection mitigation on every cell.
 *
 * Secrets required (set in Vercel dashboard — never in source code):
 *   SUPABASE_URL          or  VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { handleCors } from '../../../server/cors.mjs';

// ── Environment ──────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Supabase admin client ─────────────────────────────────────────────────────
const supabaseAdmin =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formula-injection mitigation for CSV cells */
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/\0/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
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

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (handleCors(req, res, { allowedMethods: 'GET, OPTIONS', allowedHeaders: 'Content-Type, Authorization' })) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const workspaceId = req.query.workspaceId;
  if (!workspaceId || !/^[a-f0-9-]+$/i.test(workspaceId)) {
    return res.status(400).json({ error: 'Invalid workspace identifier.' });
  }

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

    const CSV_HEADERS = [
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

    // Empty export
    if (!docs || docs.length === 0) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="ledgerlens_approved_invoices_empty.csv"'
      );
      return res.status(200).send(CSV_HEADERS.map(escapeCsv).join(',') + '\r\n');
    }

    const docIds = docs.map((d) => d.id);
    const { data: extractions } = await supabaseAdmin
      .from('invoice_extractions')
      .select('*')
      .in('document_id', docIds)
      .eq('is_latest', true);

    const extMap = new Map();
    if (extractions) {
      extractions.forEach((e) => extMap.set(e.document_id, e));
    }

    const lines = [CSV_HEADERS.map(escapeCsv).join(',')];

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
        ext?.subtotal != null ? ext.subtotal.toFixed(2) : '',
        ext?.tax_amount != null ? ext.tax_amount.toFixed(2) : '',
        ext?.grand_total != null ? ext.grand_total.toFixed(2) : '',
        ext?.payment_terms || '',
        d.created_at,
      ];
      lines.push(row.map(escapeCsv).join(','));
    }

    const csvData = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ledgerlens_approved_invoices_${workspaceId.slice(0, 8)}.csv"`
    );
    return res.status(200).send(csvData);
  } catch (err) {
    const errMsg = err?.message || 'Failed to export invoices.';
    console.error('[LedgerLens] CSV export error:', errMsg);
    return res.status(403).json({ error: errMsg });
  }
}
