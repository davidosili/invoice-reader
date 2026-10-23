import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GeminiApiError,
  getModelConfig,
  extractWithGeminiModel,
  extractWithModelCascade,
  runServerExtractionPipeline,
  validateInvoiceConsistency,
} from '../server/intelligence.mjs';

function createMockInvoiceJson(supplier = 'Acme Industrial Ltd', total = 500, invNum = 'INV-9001') {
  return JSON.stringify({
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify({
                supplier_name: supplier,
                supplier_address: '100 Industrial Road',
                supplier_tax_id: 'VAT-9921',
                customer_name: 'Apex Distribution',
                customer_address: '42 Marina Blvd',
                invoice_number: invNum,
                invoice_date: '2026-10-15',
                due_date: '2026-10-29',
                currency: 'USD',
                purchase_order_number: null,
                subtotal: total * 0.9,
                tax_rate: 0.1,
                tax_amount: total * 0.1,
                discount_amount: 0,
                shipping_amount: 0,
                grand_total: total,
                payment_terms: 'Net 14',
                line_items: [
                  {
                    id: 'item-1',
                    description: 'Industrial Sensor Module',
                    quantity: 1,
                    unit_price: total * 0.9,
                    total: total * 0.9,
                    verified: true,
                    boundingBox: { x: 10, y: 50, width: 80, height: 5 },
                  },
                ],
                field_metadata: {
                  supplier_name: { confidence: 'high', rawText: supplier, boundingBox: { x: 10, y: 10, width: 40, height: 4 } },
                  invoice_number: { confidence: 'high', rawText: invNum, boundingBox: { x: 60, y: 10, width: 20, height: 4 } },
                  grand_total: { confidence: 'high', rawText: String(total), boundingBox: { x: 70, y: 80, width: 20, height: 4 } },
                },
              }),
            },
          ],
        },
      },
    ],
  });
}

test('Multi-Model: getModelConfig parses primary and fallback models with defaults', () => {
  const config = getModelConfig();
  assert.ok(config.primaryModel);
  assert.equal(config.primaryModel, process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash');
  assert.ok(Array.isArray(config.fallbackModels));
  assert.ok(config.fallbackModels.length >= 2);
  assert.ok(config.fallbackModels.includes('gemini-flash-lite-latest'));
  assert.ok(config.fallbackModels.includes('gemini-3-flash-preview'));
});

test('Multi-Model: Primary model succeeds and attributes accurately without fallback', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'test_key_valid_12345';
  let calledUrl = null;

  const mockFetch = async (url) => {
    calledUrl = url;
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(createMockInvoiceJson('Juliana Silva', 957, '12345')),
    };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-primary-1',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0 }
  );

  assert.equal(result.fallback, false);
  assert.equal(result.fallbackType, null);
  assert.equal(result.provider, 'gemini-2.5-flash');
  assert.equal(result.extraction.supplier_name, 'Juliana Silva');
  assert.equal(result.extraction.grand_total, 957);
  assert.ok(calledUrl.includes('gemini-2.5-flash'));
});

test('Multi-Model: HTTP 429 quota failure on primary triggers cascade to fallback model', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'test_key_valid_12345';
  const calledModels = [];

  const mockFetch = async (url) => {
    if (url.includes('gemini-2.5-flash')) {
      calledModels.push('gemini-2.5-flash');
      return {
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { code: 429, message: 'Resource has been exhausted (e.g. check quota).' } }),
      };
    }
    if (url.includes('gemini-flash-lite-latest')) {
      calledModels.push('gemini-flash-lite-latest');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(createMockInvoiceJson('Juliana Silva', 957, '12345')),
      };
    }
    return { ok: false, status: 500, text: async () => 'Unexpected url' };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-quota-1',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0, backoffBaseMs: 1 }
  );

  assert.deepEqual(calledModels, ['gemini-2.5-flash', 'gemini-flash-lite-latest']);
  assert.equal(result.fallback, true);
  assert.equal(result.fallbackType, 'ai');
  assert.equal(result.provider, 'gemini-flash-lite-latest (fallback)');
  assert.equal(result.modelUsed, 'gemini-flash-lite-latest');
  assert.equal(result.extraction.supplier_name, 'Juliana Silva');
  assert.equal(result.extraction.grand_total, 957);

  // Verifies format_warning is present explaining quota cascade
  const quotaWarning = result.issues.find((i) => i.issue_type === 'format_warning');
  assert.ok(quotaWarning);
  assert.ok(quotaWarning.message.includes('AI Fallback active'));
  assert.ok(quotaWarning.message.includes('gemini-flash-lite-latest'));
});

test('Multi-Model: Multiple quota failures cascade through primary and fallback 1 to fallback 2', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'test_key_valid_12345';
  const calledModels = [];

  const mockFetch = async (url) => {
    if (url.includes('gemini-2.5-flash')) {
      calledModels.push('gemini-2.5-flash');
      return {
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { code: 429, message: 'Quota exceeded' } }),
      };
    }
    if (url.includes('gemini-flash-lite-latest')) {
      calledModels.push('gemini-flash-lite-latest');
      return {
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { code: 429, message: 'Quota exceeded' } }),
      };
    }
    if (url.includes('gemini-3-flash-preview')) {
      calledModels.push('gemini-3-flash-preview');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(createMockInvoiceJson('Juliana Silva', 957, '12345')),
      };
    }
    return { ok: false, status: 500, text: async () => 'Unexpected url' };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-quota-multi',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0, backoffBaseMs: 1 }
  );

  assert.deepEqual(calledModels, [
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
  ]);
  assert.equal(result.fallback, true);
  assert.equal(result.fallbackType, 'ai');
  assert.equal(result.provider, 'gemini-3-flash-preview (fallback)');
  assert.equal(result.modelUsed, 'gemini-3-flash-preview');
  assert.equal(result.extraction.grand_total, 957);
});

test('Multi-Model: HTTP 405 Method Not Allowed DOES NOT trigger cascade or model switching', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'test_key_secret_99999';
  const calledModels = [];

  const mockFetch = async (url) => {
    const model = url.split('/models/')[1]?.split(':')[0];
    calledModels.push(model);
    return {
      ok: false,
      status: 405,
      text: async () => 'Method Not Allowed (Google Server HTTP 405)',
    };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-405-test',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0 }
  );

  // Crucial invariant: only the primary model was called once! No model cascade occurred!
  assert.deepEqual(calledModels, ['gemini-2.5-flash']);
  assert.equal(result.fallback, true);
  assert.equal(result.fallbackType, 'heuristic');
  assert.equal(result.provider, 'server_heuristic_v1 (fallback)');
  assert.ok(result.fallbackReason.includes('HTTP 405 Method Not Allowed'));
  assert.ok(result.fallbackReason.includes('Model switching was not attempted'));

  // Ensure secrets are never leaked
  assert.ok(!result.fallbackReason.includes(apiKey));
  const warning = result.issues.find((i) => i.issue_type === 'format_warning');
  assert.ok(warning);
  assert.ok(!warning.message.includes(apiKey));
});

test('Multi-Model: HTTP 401/400 client error DOES NOT trigger model cascade', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'invalid_key_88888';
  const calledModels = [];

  const mockFetch = async (url) => {
    const model = url.split('/models/')[1]?.split(':')[0];
    calledModels.push(model);
    return {
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { code: 400, message: 'API key not valid.' } }),
    };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-400-test',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0 }
  );

  // Crucial invariant: no cascade on 400
  assert.deepEqual(calledModels, ['gemini-2.5-flash']);
  assert.equal(result.fallback, true);
  assert.equal(result.fallbackType, 'heuristic');
  assert.ok(!result.fallbackReason.includes(apiKey));
});

test('Multi-Model: Exhausted AI quota falls back to heuristic with missing field warnings', async () => {
  const fileBuf = Buffer.from('MOCK_UNKNOWN_SCAN');
  const apiKey = 'valid_key_12345';
  const calledModels = [];

  const mockFetch = async (url) => {
    const model = url.split('/models/')[1]?.split(':')[0];
    calledModels.push(model);
    return {
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { code: 429, message: 'Quota exceeded' } }),
    };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'unknown_scan.pdf',
    'doc-exhausted-test',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0, backoffBaseMs: 1 }
  );

  assert.equal(calledModels.length, 3);
  assert.equal(result.provider, 'server_heuristic_v1 (fallback)');
  assert.equal(result.fallbackType, 'heuristic');
  assert.ok(result.fallbackReason.includes('exceeded API quota limits'));

  // Unknown scan must NOT fabricate fake data
  assert.equal(result.extraction.supplier_name, null);
  assert.equal(result.extraction.grand_total, null);

  // Missing fields must be flagged for human review
  const missingKeys = result.issues.filter((i) => i.issue_type === 'missing_field').map((i) => i.field_key);
  assert.ok(missingKeys.includes('supplier_name'));
  assert.ok(missingKeys.includes('grand_total'));
});

test('Multi-Model: Fallback model output undergoes deterministic arithmetic validation', async () => {
  const fileBuf = Buffer.from('MOCK_INVOICE_DATA');
  const apiKey = 'test_key_valid_12345';

  // Fallback model returns an invoice with arithmetic discrepancy ($800 subtotal + $50 tax != $950 grand_total)
  const badMathJson = JSON.stringify({
    candidates: [
      {
        content: {
          parts: [
            {
              text: JSON.stringify({
                supplier_name: 'Juliana Silva',
                invoice_number: '12345',
                subtotal: 800,
                tax_amount: 50,
                grand_total: 950, // Intentional $100 discrepancy
                line_items: [
                  { id: '1', description: 'Item A', quantity: 1, unit_price: 800, total: 800, verified: true },
                ],
              }),
            },
          ],
        },
      },
    ],
  });

  const mockFetch = async (url) => {
    if (url.includes('gemini-2.5-flash')) {
      return { ok: false, status: 429, text: async () => 'Quota exceeded' };
    }
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(badMathJson),
    };
  };

  const result = await runServerExtractionPipeline(
    fileBuf,
    'application/pdf',
    'invoice.pdf',
    'doc-math-test',
    [],
    apiKey,
    { fetchFn: mockFetch, maxRetries: 0, backoffBaseMs: 1 }
  );

  assert.equal(result.fallbackType, 'ai');
  assert.equal(result.modelUsed, 'gemini-flash-lite-latest');

  // Math issue must be flagged by deterministic validator!
  const mathIssue = result.issues.find((i) => i.issue_type === 'arithmetic_discrepancy');
  assert.ok(mathIssue, 'Arithmetic discrepancy must be detected on fallback model output');
  assert.ok(mathIssue.message.includes('Grand total'));
});
