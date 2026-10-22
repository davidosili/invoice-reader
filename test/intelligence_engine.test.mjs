import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeString,
  sanitizeNumber,
  sanitizeDate,
  validateAndSanitizeExtraction,
  validateInvoiceConsistency,
  normalizeSupplierName,
  normalizeInvoiceNumber,
  detectDuplicateInvoices,
  extractWithHeuristic,
  runServerExtractionPipeline,
} from '../server/intelligence.mjs';

test('Server Intelligence - Sanitizes malicious text and control characters', () => {
  const dirty = 'Acme \x00Corp\x1F\x7F Global \t Limited';
  const clean = sanitizeString(dirty);
  assert.equal(clean, 'Acme Corp Global \t Limited');
  assert.equal(sanitizeString(null), null);
  assert.equal(sanitizeString('   '), null);
});

test('Server Intelligence - Numerical parser handles currencies and rounding', () => {
  assert.equal(sanitizeNumber('$1,234.56'), 1234.56);
  assert.equal(sanitizeNumber('1234.567'), 1234.57);
  assert.equal(sanitizeNumber(-45.20), -45.20);
  assert.equal(sanitizeNumber(''), null);
  assert.equal(sanitizeNumber(undefined), null);
});

test('Server Intelligence - Date normalization converts arbitrary dates to ISO YYYY-MM-DD', () => {
  assert.equal(sanitizeDate('2026-10-22'), '2026-10-22');
  assert.equal(sanitizeDate('2026/10/22'), '2026-10-22');
  assert.equal(sanitizeDate('October 22, 2026'), '2026-10-22');
  assert.equal(sanitizeDate('invalid date string'), null);
});

test('Server Intelligence - Financial validation enforces line item and grand total math', () => {
  const validInvoice = {
    supplier_name: 'Apex Commercial Supplies',
    invoice_number: 'INV-1001',
    invoice_date: '2026-10-01',
    due_date: '2026-10-15',
    subtotal: 100.00,
    tax_amount: 10.00,
    shipping_amount: 5.00,
    discount_amount: 0.00,
    grand_total: 115.00,
    currency: 'USD',
    line_items: [
      { id: 'item-1', description: 'Item A', quantity: 2, unit_price: 50.00, total: 100.00 },
    ],
  };

  const issues = validateInvoiceConsistency(validInvoice);
  assert.equal(issues.length, 0, 'Accurate invoice must yield zero validation issues');

  // Mismatched grand total
  const invalidGrandTotal = { ...validInvoice, grand_total: 200.00 };
  const grandIssues = validateInvoiceConsistency(invalidGrandTotal);
  assert.ok(grandIssues.some(i => i.field_key === 'grand_total'));

  // Due date before invoice date
  const invertedDates = { ...validInvoice, due_date: '2026-09-01' };
  const dateIssues = validateInvoiceConsistency(invertedDates);
  assert.ok(dateIssues.some(i => i.issue_type === 'date_inconsistency'));
});

test('Server Intelligence - Supplier and invoice normalization handles corporate suffixes', () => {
  assert.equal(normalizeSupplierName('Acme Logistics, Ltd.'), 'acme logistics');
  assert.equal(normalizeSupplierName('Global Retail Corp'), 'global retail');
  assert.equal(normalizeSupplierName('Office Supplies GMBH'), 'office supplies');
  assert.equal(normalizeInvoiceNumber(' INV - 2026 / 0891 # '), 'INV20260891');
});

test('Server Intelligence - Duplicate detection identifies exact matches within workspace', () => {
  const currentInvoice = {
    supplier_name: 'Acme Commercial Ltd.',
    invoice_number: 'INV-4001',
    grand_total: 500.00,
    currency: 'USD',
    invoice_date: '2026-10-10',
  };

  const existing = [
    {
      document_id: 'doc-old-123',
      workspace_id: 'ws-1',
      supplier_name: 'Acme Commercial Inc',
      invoice_number: 'INV4001',
      grand_total: 500.00,
      currency: 'USD',
      invoice_date: '2026-10-10',
    },
  ];

  const issues = detectDuplicateInvoices(currentInvoice, 'doc-new-456', existing);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].issue_type, 'duplicate_warning');
  assert.equal(issues[0].severity, 'error');
});

test('Server Intelligence - Heuristic OCR produces complete structured schema', () => {
  const mockFile = Buffer.from('NORTHSTAR OFFICE SUPPLIES INVOICE INV-9901 Subtotal 1503.00');
  const result = extractWithHeuristic(mockFile, 'application/pdf', 'invoice_northstar.pdf');

  assert.equal(result.supplier_name, 'Northstar Office Supplies Ltd');
  assert.equal(result.currency, 'GBP');
  assert.ok(result.line_items.length > 0);
  assert.ok(result.grand_total > 0);
  assert.ok(result.field_metadata.supplier_name.boundingBox);
});

test('Server Intelligence - Pipeline coordinator falls back gracefully if AI key invalid', async () => {
  const mockFile = Buffer.from('APEX SUPPLIES INVOICE');
  const result = await runServerExtractionPipeline(
    mockFile,
    'application/pdf',
    'apex.pdf',
    'doc-test-1',
    [],
    'INVALID_KEY_MOCK'
  );

  assert.ok(result.extraction);
  assert.ok(result.extraction.supplier_name);
  assert.equal(result.extraction.is_latest, undefined); // payload ready
});
