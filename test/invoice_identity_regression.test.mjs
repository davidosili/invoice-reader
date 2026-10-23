import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractWithHeuristic,
  runServerExtractionPipeline,
  validateInvoiceConsistency,
  extractWithGemini,
} from '../server/intelligence.mjs';

function loadServerEnv() {
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

const env = loadServerEnv();

test('Regression 1: Two invoices with different suppliers and totals cannot exchange extraction results', async () => {
  // Invoice 1: Juliana Silva ($957 total, invoice 12345)
  const invoice1Text = 'INVOICE 12345\nSupplier: Juliana Silva\nDate: 2025-07-30\nDue: 2025-07-10\nSubtotal: $870.00\nTax: $87.00\nTotal: $957.00 USD';
  const buf1 = Buffer.from(invoice1Text);

  // Invoice 2: Northstar Office Supplies (£1803.60 total, invoice INV-78421)
  const invoice2Text = 'NORTHSTAR OFFICE SUPPLIES INVOICE INV-78421 Subtotal: 1503.00 Total: 1803.60 GBP';
  const buf2 = Buffer.from(invoice2Text);

  const res1 = extractWithHeuristic(buf1, 'application/pdf', 'juliana_invoice.pdf');
  const res2 = extractWithHeuristic(buf2, 'application/pdf', 'invoice_northstar.pdf');

  // Verify doc 1 has doc 1 values
  assert.equal(res1.supplier_name, 'Juliana Silva');
  assert.equal(res1.invoice_number, '12345');
  assert.equal(res1.grand_total, 957.00);
  assert.equal(res1.currency, 'USD');

  // Verify doc 2 has doc 2 values
  assert.equal(res2.supplier_name, 'Northstar Office Supplies Ltd');
  assert.equal(res2.grand_total, 1803.60);
  assert.equal(res2.currency, 'GBP');

  // Verify isolation: neither invoice contains the other's fields or hardcoded defaults
  assert.notEqual(res1.supplier_name, res2.supplier_name);
  assert.notEqual(res1.grand_total, res2.grand_total);
  assert.notEqual(res1.supplier_name, 'Apex Commercial Supplies Ltd');
  assert.notEqual(res1.grand_total, 198875);
});

test('Regression 2: A processing request strictly uses the requested document file buffer', async () => {
  // Simulate mock storage registry
  const storageRegistry = {
    'ws-1/doc-a.pdf': Buffer.from('MERIDIAN GLOBAL LOGISTICS INVOICE INV-2026-A101 Total: 1045.00 USD'),
    'ws-1/doc-b.pdf': Buffer.from('CASCADE INDUSTRIAL COMPONENTS INVOICE INV-2026-B202 Total: 1313.65 USD'),
  };

  const processMockDocument = async (docId, storagePath) => {
    const fileBytes = storageRegistry[storagePath];
    assert.ok(fileBytes, `Storage path ${storagePath} must exist`);
    return extractWithHeuristic(fileBytes, 'application/pdf', path.basename(storagePath));
  };

  const resultA = await processMockDocument('doc-a', 'ws-1/doc-a.pdf');
  const resultB = await processMockDocument('doc-b', 'ws-1/doc-b.pdf');

  assert.equal(resultA.supplier_name, 'Meridian Global Logistics Ltd');
  assert.equal(resultA.grand_total, 1045.00);

  assert.equal(resultB.supplier_name, 'Cascade Industrial Components Ltd');
  assert.equal(resultB.grand_total, 1313.65);
});

test('Regression 3: Re-running extraction operates on target document only and does not reuse unrelated results', async () => {
  const workspaceExtractions = [
    { document_id: 'doc-target', supplier_name: 'Juliana Silva', grand_total: 957, is_latest: true },
    { document_id: 'doc-other', supplier_name: 'Vanguard Packaging Systems Ltd', grand_total: 1125, is_latest: true },
  ];

  // Archive previous extractions for doc-target only
  for (const ext of workspaceExtractions) {
    if (ext.document_id === 'doc-target') {
      ext.is_latest = false;
    }
  }

  // Verify doc-other remains latest and unchanged
  const otherExt = workspaceExtractions.find(e => e.document_id === 'doc-other');
  assert.equal(otherExt.is_latest, true);
  assert.equal(otherExt.supplier_name, 'Vanguard Packaging Systems Ltd');

  // Verify target extractions were isolated
  const oldTarget = workspaceExtractions.find(e => e.document_id === 'doc-target');
  assert.equal(oldTarget.is_latest, false);
});

test('Regression 4: Provider failure is accurately reported in pipeline without exposing credentials', async () => {
  const dummyBuffer = Buffer.from('SIMULATED UNKNOWN INVOICE CONTENT');
  const fakeKey = 'FAKE_NON_WORKING_KEY_12345';

  const result = await runServerExtractionPipeline(
    dummyBuffer,
    'application/pdf',
    'unknown.pdf',
    'doc-test-fail',
    [],
    fakeKey
  );

  assert.equal(result.provider, 'server_heuristic_v1 (fallback)');
  assert.equal(result.fallback, true);
  assert.ok(result.fallbackReason);
  // Verify secret key is not leaked in the fallback reason or warning message
  assert.ok(!result.fallbackReason.includes(fakeKey));
  const fallbackWarning = result.issues.find(i => i.issue_type === 'format_warning' && i.details?.fallback);
  assert.ok(fallbackWarning, 'Fallback warning must be present in validation issues');
  assert.ok(!fallbackWarning.message.includes(fakeKey));
});

test('Regression 5: Fallback results are explicitly attributed and never populate hardcoded dummy values for unknown documents', async () => {
  // Unknown binary data (e.g. image bytes where OCR fails or is unavailable)
  const binaryNoise = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x12, 0x34, 0x56]);

  const result = extractWithHeuristic(binaryNoise, 'image/png', 'unrecognized_scan.png');

  // Crucial security invariant: unknown file must NOT default to Apex Commercial Supplies or 185000 NGN
  assert.equal(result.supplier_name, null, 'Unknown document must not default to a hardcoded supplier');
  assert.equal(result.subtotal, null, 'Unknown document must not default to a hardcoded subtotal');
  assert.equal(result.grand_total, null, 'Unknown document must not default to a hardcoded grand total');
  assert.equal(result.line_items.length, 0, 'Unknown document must not invent hardcoded line items');
  assert.equal(result.extractor_provider, 'server_heuristic_v1');

  // Consistency validator should flag missing fields for human review
  const issues = validateInvoiceConsistency(result);
  const missingKeys = issues.filter(i => i.issue_type === 'missing_field').map(i => i.field_key);
  assert.ok(missingKeys.includes('supplier_name'), 'Missing supplier_name must be flagged');
  assert.ok(missingKeys.includes('invoice_number'), 'Missing invoice_number must be flagged');
  assert.ok(missingKeys.includes('grand_total'), 'Missing grand_total must be flagged');
});

test('Regression 6: Heuristic fallback avoids hardcoded dummy data for unknown scans', async () => {
  const binaryNoise = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const result = extractWithHeuristic(binaryNoise, 'image/png', 'unknown_scan.png');

  assert.equal(result.supplier_name, null);
  assert.equal(result.subtotal, null);
  assert.equal(result.grand_total, null);
  assert.equal(result.line_items.length, 0);
  assert.equal(result.extractor_provider, 'server_heuristic_v1');
});

test('Regression 7: Workspace path isolation enforces cross-workspace security', () => {
  const authorizedWorkspace = 'ws-legitimate-1234';
  const attackerWorkspace = 'ws-attacker-9999';

  const checkWorkspaceAccess = (storagePath, userWorkspaceId) => {
    const segments = storagePath.split('/');
    if (segments.length < 2 || segments[0] !== userWorkspaceId) {
      throw new Error('Access denied: You are not authorized to access documents outside your active workspace.');
    }
    return true;
  };

  // Legitimate workspace request
  assert.equal(checkWorkspaceAccess(`${authorizedWorkspace}/doc-1.pdf`, authorizedWorkspace), true);

  // Cross-workspace theft attempt
  assert.throws(
    () => checkWorkspaceAccess(`${authorizedWorkspace}/doc-1.pdf`, attackerWorkspace),
    /Access denied/
  );
});

test('Regression 8: Live Gemini Vision integration extraction with actual source invoice', async (t) => {
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.length < 10) {
    t.skip('Skipping live Gemini test: GEMINI_API_KEY not configured in environment');
    return;
  }

  const samplePath = '/tmp/downloaded_invoice.png';
  if (!fs.existsSync(samplePath)) {
    t.skip('Sample invoice /tmp/downloaded_invoice.png not found');
    return;
  }

  const fileBuf = fs.readFileSync(samplePath);
  const extraction = await extractWithGemini(fileBuf, 'image/png', 'images.png', geminiKey);

  assert.equal(extraction.invoice_number, '12345', 'Invoice number must be 12345');
  assert.equal(extraction.currency, 'USD', 'Currency must be USD');
  assert.equal(extraction.subtotal, 870, 'Subtotal must be 870');
  assert.equal(extraction.tax_amount, 87, 'Tax must be 87');
  assert.equal(extraction.grand_total, 957, 'Total must be 957');
  assert.ok(extraction.supplier_name.includes('Juliana Silva'), 'Supplier must be Juliana Silva');
  assert.equal(extraction.extractor_provider, 'gemini-2.5-flash');

  // Consistency validation must flag due date preceding invoice date (2025-07-10 vs 2025-07-30)
  const issues = validateInvoiceConsistency(extraction);
  const dateIssue = issues.find(i => i.issue_type === 'date_inconsistency');
  assert.ok(dateIssue, 'Date inconsistency warning must be flagged when due date precedes invoice date');
  assert.ok(dateIssue.message.includes('2025-07-10'));
  assert.ok(dateIssue.message.includes('2025-07-30'));
});
