import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getExtractionState,
  filterCustomerIssues,
  formatAuditEvent,
} from '../src/lib/extractionUi.ts';

test('UI Extraction State - Successful extraction produces exact customer label', () => {
  const result = getExtractionState({
    documentStatus: 'review_required',
    extraction: {
      id: 'ext-1',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      extractor_provider: 'gemini-2.5-flash',
      version: 1,
      supplier_name: 'Acme Corp',
      grand_total: 1000,
      currency: 'USD',
      invoice_number: 'INV-100',
      invoice_date: '2026-10-01',
      due_date: '2026-10-15',
      line_items: [],
      raw_text: null,
      field_metadata: {},
      created_at: new Date().toISOString(),
    },
    issues: [],
  });

  assert.ok(result);
  // When no issues exist and documentStatus is review_required, it maps to review_required or completed
  // But if document status is processed and no issues:
  const successResult = getExtractionState({
    documentStatus: 'processed',
    extraction: {
      id: 'ext-1',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      extractor_provider: 'gemini-2.5-flash',
      version: 1,
      supplier_name: 'Acme Corp',
      grand_total: 1000,
      currency: 'USD',
      invoice_number: 'INV-100',
      invoice_date: '2026-10-01',
      due_date: '2026-10-15',
      line_items: [],
      raw_text: null,
      field_metadata: {},
      created_at: new Date().toISOString(),
    },
    issues: [],
  });

  assert.equal(successResult?.status, 'success');
  assert.equal(successResult?.label, 'Extraction completed.');
  assert.ok(!successResult?.label.includes('gemini'));
  assert.ok(!successResult?.label.includes('flash'));
  // Supports both redesigned verified green (#1B4938) and legacy token (#176B50)
  assert.ok(
    successResult?.badgeClass.includes('text-[#1B4938]') ||
    successResult?.badgeClass.includes('text-[#176B50]'),
    'Badge class must include the verified green color token'
  );
});

test('UI Extraction State - Extraction with validation issues flags review required', () => {
  const result = getExtractionState({
    documentStatus: 'review_required',
    extraction: {
      id: 'ext-2',
      document_id: 'doc-2',
      workspace_id: 'ws-1',
      extractor_provider: 'gemini-2.5-flash',
      version: 1,
      supplier_name: 'Juliana Silva',
      grand_total: 957,
      currency: 'USD',
      invoice_number: '12345',
      invoice_date: '2025-07-30',
      due_date: '2025-07-10',
      line_items: [],
      raw_text: null,
      field_metadata: {},
      created_at: new Date().toISOString(),
    },
    issues: [
      {
        id: 'iss-1',
        document_id: 'doc-2',
        workspace_id: 'ws-1',
        issue_type: 'date_inconsistency',
        severity: 'warning',
        field_key: 'due_date',
        message: 'Due date (2025-07-10) is prior to the invoice billing date (2025-07-30).',
        details: null,
        resolved: false,
        created_at: new Date().toISOString(),
      },
    ],
  });

  assert.equal(result?.status, 'review_required');
  assert.equal(result?.label, 'Extraction completed — review required.');
  assert.ok(!result?.label.includes('gemini'));
  assert.ok(!result?.label.includes('flash'));
  assert.ok(result?.badgeClass.includes('text-[#B45309]'));
});

test('UI Extraction State - Heuristic fallback produces partial extraction warning', () => {
  const result = getExtractionState({
    documentStatus: 'review_required',
    extraction: {
      id: 'ext-3',
      document_id: 'doc-3',
      workspace_id: 'ws-1',
      extractor_provider: 'heuristic_ocr_v1',
      version: 1,
      supplier_name: null,
      grand_total: null,
      currency: null,
      invoice_number: null,
      invoice_date: null,
      due_date: null,
      line_items: [],
      raw_text: null,
      field_metadata: {},
      created_at: new Date().toISOString(),
    },
    issues: [
      {
        id: 'iss-2',
        document_id: 'doc-3',
        workspace_id: 'ws-1',
        issue_type: 'missing_field',
        severity: 'error',
        field_key: 'supplier_name',
        message: 'Supplier identity is missing or unverified.',
        details: null,
        resolved: false,
        created_at: new Date().toISOString(),
      },
    ],
  });

  assert.equal(result?.status, 'partial');
  assert.equal(result?.label, 'Partial extraction — verify fields against the original document.');
  assert.ok(!result?.label.includes('heuristic'));
  assert.ok(!result?.label.includes('gemini'));
  assert.ok(result?.badgeClass.includes('text-[#B45309]'));
});

test('UI Extraction State - Failed status displays extraction failed warning', () => {
  const result = getExtractionState({
    documentStatus: 'failed',
    extraction: null,
    issues: [],
  });

  assert.equal(result?.status, 'failed');
  assert.equal(result?.label, 'Extraction failed — try again.');
  assert.ok(result?.badgeClass.includes('text-[#991B1B]'));
});

test('UI Issue Filtering - Preserves genuine business issues while suppressing internal cascade notices', () => {
  const rawIssues = [
    {
      id: 'i-1',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      issue_type: 'date_inconsistency',
      severity: 'warning',
      field_key: 'due_date',
      message: 'Due date (2025-07-10) is prior to the invoice billing date (2025-07-30).',
      details: null,
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'i-2',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      issue_type: 'format_warning',
      severity: 'warning',
      field_key: 'extractor_provider',
      message: 'AI Fallback active (gemini-flash-lite-latest): Model cascaded from gemini-2.5-flash due to upstream quota/rate-limits.',
      details: null,
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'i-3',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      issue_type: 'format_warning',
      severity: 'warning',
      field_key: 'extractor_provider',
      message: 'Fallback extraction provider active (heuristic_ocr_v1). Gemini AI vision was unavailable.',
      details: null,
      resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'i-4',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      issue_type: 'arithmetic_mismatch',
      severity: 'error',
      field_key: 'grand_total',
      message: 'Calculated sum of lines (100.00) + tax (10.00) does not equal grand total (120.00).',
      details: null,
      resolved: false,
      created_at: new Date().toISOString(),
    },
  ];

  const filtered = filterCustomerIssues(rawIssues);

  // i-2 (internal AI fallback notice) should be filtered out
  assert.equal(filtered.length, 3);
  assert.ok(!filtered.some((i) => i.message.includes('gemini-flash-lite')));

  // i-1 (date inconsistency) must be preserved exactly
  const dateIssue = filtered.find((i) => i.issue_type === 'date_inconsistency');
  assert.ok(dateIssue);
  assert.equal(dateIssue?.message, 'Due date (2025-07-10) is prior to the invoice billing date (2025-07-30).');

  // i-4 (arithmetic mismatch) must be preserved
  const mathIssue = filtered.find((i) => i.issue_type === 'arithmetic_mismatch');
  assert.ok(mathIssue);

  // i-3 (heuristic fallback) must be sanitized without exposing heuristic_ocr_v1
  const heuristicIssue = filtered.find((i) => i.message.includes('Partial extraction active'));
  assert.ok(heuristicIssue);
  assert.ok(!heuristicIssue?.message.includes('heuristic_ocr_v1'));
});

test('UI Audit Events - Formats customer events cleanly without exposing raw JSON or internal model IDs', () => {
  const events = [
    {
      id: 'e-1',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      actor_id: null,
      event_type: 'processing_queued',
      details: { queue_priority: 'normal' },
      created_at: new Date().toISOString(),
    },
    {
      id: 'e-2',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      actor_id: null,
      event_type: 'extraction_completed',
      details: {
        fallback: true,
        provider: 'gemini-flash-lite-latest',
        issues_count: 2,
        primary_model: 'gemini-2.5-flash',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: 'e-3',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      actor_id: 'user-42',
      event_type: 'field_corrected',
      details: {
        modified_fields: ['due_date', 'grand_total'],
      },
      created_at: new Date().toISOString(),
    },
    {
      id: 'e-4',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      actor_id: 'user-42',
      event_type: 'approved',
      details: {
        notes: 'Verified against PO-8819',
      },
      created_at: new Date().toISOString(),
    },
    {
      id: 'e-5',
      document_id: 'doc-1',
      workspace_id: 'ws-1',
      actor_id: 'user-42',
      event_type: 'exported',
      details: { total_exported: 5 },
      created_at: new Date().toISOString(),
    },
  ];

  const f1 = formatAuditEvent(events[0]);
  assert.equal(f1.title, 'Document Uploaded & Queued');
  assert.ok(!f1.description.includes('{'));

  const f2 = formatAuditEvent(events[1]);
  assert.equal(f2.title, 'Extraction Completed — Review Required');
  assert.ok(!f2.description.includes('gemini'));
  assert.ok(!f2.description.includes('flash'));
  assert.ok(!f2.description.includes('{'));
  assert.ok(f2.description.includes('2 discrepancy item(s)'));

  const f3 = formatAuditEvent(events[2]);
  assert.equal(f3.title, 'Corrections Saved');
  assert.ok(f3.description.includes('due date, grand total'));

  const f4 = formatAuditEvent(events[3]);
  assert.equal(f4.title, 'Invoice Certified & Approved');
  assert.ok(f4.description.includes('Verified against PO-8819'));

  const f5 = formatAuditEvent(events[4]);
  assert.equal(f5.title, 'Exported to CSV');
  assert.ok(f5.description.includes('5 invoice(s)'));
});
