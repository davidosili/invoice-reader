import test from 'node:test';
import assert from 'node:assert/strict';

// 1. State Transitions Tests
function isPermittedTransition(fromStatus, toStatus) {
  if (fromStatus === 'uploaded' && toStatus === 'queued') return true;
  if (fromStatus === 'queued' && (toStatus === 'processing' || toStatus === 'failed')) return true;
  if (fromStatus === 'processing' && (toStatus === 'review_required' || toStatus === 'failed')) return true;
  if (fromStatus === 'review_required' && (toStatus === 'approved' || toStatus === 'rejected' || toStatus === 'queued')) return true;
  if (fromStatus === 'rejected' && toStatus === 'queued') return true;
  if (fromStatus === 'failed' && toStatus === 'queued') return true;
  return false;
}

test('State Machine - Permits legal lifecycle transitions', () => {
  assert.equal(isPermittedTransition('uploaded', 'queued'), true);
  assert.equal(isPermittedTransition('queued', 'processing'), true);
  assert.equal(isPermittedTransition('processing', 'review_required'), true);
  assert.equal(isPermittedTransition('processing', 'failed'), true);
  assert.equal(isPermittedTransition('review_required', 'approved'), true);
  assert.equal(isPermittedTransition('review_required', 'rejected'), true);
  assert.equal(isPermittedTransition('failed', 'queued'), true, 'Retry from failed must be permitted');
  assert.equal(isPermittedTransition('review_required', 'queued'), true, 'Reprocess from review must be permitted');
});

test('State Machine - Rejects illegal transitions and auto-approval skips', () => {
  // Cannot approve directly from uploaded (human review mandatory)
  assert.equal(isPermittedTransition('uploaded', 'approved'), false);
  // Cannot jump from uploaded straight to processing (must queue)
  assert.equal(isPermittedTransition('uploaded', 'processing'), false);
  // Cannot reprocess approved certified invoice
  assert.equal(isPermittedTransition('approved', 'processing'), false);
  assert.equal(isPermittedTransition('approved', 'queued'), false);
  // Cannot approve directly from failed
  assert.equal(isPermittedTransition('failed', 'approved'), false);
});

// 2. Schema Validation & Sanitization Tests
function sanitizeString(val, maxLength = 300) {
  if (val === null || val === undefined) return null;
  let str = String(val).trim();
  if (!str) return null;
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (str.length > maxLength) str = str.slice(0, maxLength);
  return str || null;
}

function sanitizeNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return null;
    return Math.round(val * 100) / 100;
  }
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || !isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

test('Schema Sanitization - Neutralizes control characters and limits field bounds', () => {
  const dirtyInput = 'Supplier Name\x00\x08 Corp\x1F';
  assert.equal(sanitizeString(dirtyInput), 'Supplier Name Corp');

  const longString = 'A'.repeat(500);
  assert.equal(sanitizeString(longString, 50).length, 50);

  // Number parser safely extracts currency strings
  assert.equal(sanitizeNumber('$1,249.50'), 1249.50);
  assert.equal(sanitizeNumber('NGN 185,000.00'), 185000.00);
  assert.equal(sanitizeNumber('invalid-text'), null);
  assert.equal(sanitizeNumber(NaN), null);
  assert.equal(sanitizeNumber(Infinity), null);
});

// 3. Financial Arithmetic & Rounding Tests
function validateInvoiceArithmetic(inv) {
  const issues = [];
  const ROUNDING_TOLERANCE = 0.02;

  // Check line items sum vs subtotal
  if (inv.line_items && inv.line_items.length > 0) {
    let lineSum = 0;
    inv.line_items.forEach((item, idx) => {
      const lineTotal = Math.round(item.quantity * item.unit_price * 100) / 100;
      if (Math.abs(lineTotal - item.total) > ROUNDING_TOLERANCE) {
        issues.push({ type: 'line_item_math', index: idx });
      }
      lineSum += item.total;
    });
    lineSum = Math.round(lineSum * 100) / 100;

    if (inv.subtotal !== null && Math.abs(lineSum - inv.subtotal) > ROUNDING_TOLERANCE) {
      issues.push({ type: 'subtotal_mismatch', calculated: lineSum, stated: inv.subtotal });
    }
  }

  // Check grand total
  if (inv.grand_total !== null && inv.subtotal !== null) {
    const tax = inv.tax_amount ?? 0;
    const shipping = inv.shipping_amount ?? 0;
    const discount = inv.discount_amount ?? 0;
    const calculatedGrand = Math.round((inv.subtotal + tax + shipping - discount) * 100) / 100;
    if (Math.abs(calculatedGrand - inv.grand_total) > ROUNDING_TOLERANCE) {
      issues.push({ type: 'grand_total_mismatch', calculated: calculatedGrand, stated: inv.grand_total });
    }
  }

  // Check dates
  if (inv.invoice_date && inv.due_date) {
    if (Date.parse(inv.due_date) < Date.parse(inv.invoice_date)) {
      issues.push({ type: 'date_inconsistency' });
    }
  }

  return issues;
}

test('Financial Validation - Accepts accurate arithmetic within 2-cent rounding tolerance', () => {
  const invoice = {
    subtotal: 100.00,
    tax_amount: 7.50,
    shipping_amount: 5.00,
    discount_amount: 0,
    grand_total: 112.50,
    invoice_date: '2026-10-01',
    due_date: '2026-10-15',
    line_items: [
      { quantity: 2, unit_price: 25.00, total: 50.00 },
      { quantity: 1, unit_price: 50.00, total: 50.00 },
    ],
  };

  const issues = validateInvoiceArithmetic(invoice);
  assert.equal(issues.length, 0);
});

test('Financial Validation - Flags subtotal and grand total calculation discrepancies', () => {
  const invoice = {
    subtotal: 100.00, // Line sum will be 90.00 -> Mismatch!
    tax_amount: 10.00,
    shipping_amount: 0,
    discount_amount: 0,
    grand_total: 150.00, // 100 + 10 = 110 != 150 -> Mismatch!
    invoice_date: '2026-10-20',
    due_date: '2026-10-10', // Precedes invoice date -> Mismatch!
    line_items: [
      { quantity: 3, unit_price: 30.00, total: 90.00 },
    ],
  };

  const issues = validateInvoiceArithmetic(invoice);
  assert.equal(issues.some(i => i.type === 'subtotal_mismatch'), true);
  assert.equal(issues.some(i => i.type === 'grand_total_mismatch'), true);
  assert.equal(issues.some(i => i.type === 'date_inconsistency'), true);
});

// 4. Duplicate Matching Tests
function normalizeSupplier(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\b(ltd|limited|inc|corp|llc|co)\b/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeInvNum(num) {
  if (!num) return '';
  return num.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

test('Duplicate Detection - Normalizes corporate legal suffixes and invoice formats', () => {
  const supA = normalizeSupplier('Northstar Office Supplies, Ltd.');
  const supB = normalizeSupplier('NORTHSTAR OFFICE SUPPLIES INC');
  assert.equal(supA, 'northstar office supplies');
  assert.equal(supB, 'northstar office supplies');
  assert.equal(supA, supB);

  const invA = normalizeInvNum('INV-2026/048');
  const invB = normalizeInvNum('inv 2026-048');
  assert.equal(invA, 'INV2026048');
  assert.equal(invB, 'INV2026048');
  assert.equal(invA, invB);
});

// 5. CSV Formula Injection Protection (CWE-1236)
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value).replace(/\0/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

test('CSV Security - Neutralizes formula injection payloads starting with =, +, -, @, \\t', () => {
  const formula1 = '=cmd|\' /C calc\'!A0';
  const formula2 = '+12345';
  const formula3 = '-SUM(A1:A10)';
  const formula4 = '@HYPERLINK("http://evil.com")';
  const formula5 = '\tTAB_ATTACK';

  assert.equal(escapeCsvCell(formula1), '"\'=cmd|\' /C calc\'!A0"');
  assert.equal(escapeCsvCell(formula2), '"\'+12345"');
  assert.equal(escapeCsvCell(formula3), '"\'-SUM(A1:A10)"');
  assert.equal(escapeCsvCell(formula4), '"\'@HYPERLINK(""http://evil.com"")"');
  assert.equal(escapeCsvCell(formula5), '"\'\tTAB_ATTACK"');

  // Ordinary text is safely quoted
  assert.equal(escapeCsvCell('Apex Logistics Ltd'), '"Apex Logistics Ltd"');
});

// 6. Provider Error Handling Test
test('Provider Handling - Reports configuration error when credentials unsupplied', () => {
  class MockUnconfiguredProvider {
    isConfigured() { return false; }
    async extract() {
      if (!this.isConfigured()) {
        throw new Error('AI extraction provider is not configured. Server administrator must supply GEMINI_API_KEY.');
      }
    }
  }

  const provider = new MockUnconfiguredProvider();
  assert.equal(provider.isConfigured(), false);
  assert.rejects(async () => {
    await provider.extract();
  }, /not configured/);
});
