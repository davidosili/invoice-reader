import { ExtractionFieldMeta, ExtractionLineItem } from '../../types';

export interface RawExtractedData {
  supplier_name?: unknown;
  supplier_address?: unknown;
  supplier_tax_id?: unknown;
  customer_name?: unknown;
  customer_address?: unknown;
  invoice_number?: unknown;
  invoice_date?: unknown;
  due_date?: unknown;
  currency?: unknown;
  purchase_order_number?: unknown;
  subtotal?: unknown;
  tax_rate?: unknown;
  tax_amount?: unknown;
  discount_amount?: unknown;
  shipping_amount?: unknown;
  grand_total?: unknown;
  payment_terms?: unknown;
  line_items?: unknown;
  field_metadata?: unknown;
  extractor_provider?: unknown;
  raw_extraction?: unknown;
}

export interface SanitizedExtractedInvoice {
  supplier_name: string | null;
  supplier_address: string | null;
  supplier_tax_id: string | null;
  customer_name: string | null;
  customer_address: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  currency: string;
  purchase_order_number: string | null;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number;
  shipping_amount: number;
  grand_total: number | null;
  payment_terms: string | null;
  line_items: ExtractionLineItem[];
  field_metadata: Record<string, ExtractionFieldMeta>;
  extractor_provider: string;
  raw_extraction?: any;
}

/**
 * Sanitizes untrusted text strings extracted from business paperwork.
 * Strips ASCII control characters, limits excessive string length, and prevents instruction leakage.
 */
export function sanitizeString(val: unknown, maxLength = 300): string | null {
  if (val === null || val === undefined) return null;
  let str = String(val).trim();
  if (!str) return null;

  // Strip null bytes and non-printable control characters (except common whitespace)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }
  return str || null;
}

/**
 * Parses and bounds numeric financial amounts.
 */
export function sanitizeNumber(val: unknown): number | null {
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

/**
 * Normalizes ISO date string (YYYY-MM-DD)
 */
export function sanitizeDate(val: unknown): string | null {
  if (!val) return null;
  const str = String(val).trim();
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const dateObj = new Date(timestamp);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
}

/**
 * Validates and normalizes raw extractor output against strict schema.
 */
export function validateAndSanitizeExtraction(raw: RawExtractedData, defaultProvider = 'heuristic_engine_v1'): SanitizedExtractedInvoice {
  const lineItems: ExtractionLineItem[] = [];
  if (Array.isArray(raw.line_items)) {
    raw.line_items.forEach((item: any, idx: number) => {
      const desc = sanitizeString(item.description, 200) || `Line Item #${idx + 1}`;
      const qty = Math.max(0.01, sanitizeNumber(item.quantity) ?? 1);
      const unitPrice = Math.max(0, sanitizeNumber(item.unit_price ?? item.unitPrice) ?? 0);
      const total = sanitizeNumber(item.total) ?? Math.round(qty * unitPrice * 100) / 100;

      lineItems.push({
        id: item.id || `item-${idx + 1}`,
        description: desc,
        quantity: qty,
        unit_price: unitPrice,
        total,
        verified: Boolean(item.verified),
        boundingBox: item.boundingBox || undefined,
      });
    });
  }

  const fieldMeta: Record<string, ExtractionFieldMeta> = {};
  if (raw.field_metadata && typeof raw.field_metadata === 'object') {
    for (const [key, meta] of Object.entries(raw.field_metadata as Record<string, any>)) {
      if (meta && typeof meta === 'object') {
        fieldMeta[key] = {
          confidence: meta.confidence === 'high' || meta.confidence === 'medium' ? meta.confidence : 'review',
          rawText: sanitizeString(meta.rawText, 200) || '',
          boundingBox: meta.boundingBox || undefined,
        };
      }
    }
  }

  const currencyStr = (sanitizeString(raw.currency, 5) || 'USD').toUpperCase();

  return {
    supplier_name: sanitizeString(raw.supplier_name, 150),
    supplier_address: sanitizeString(raw.supplier_address, 300),
    supplier_tax_id: sanitizeString(raw.supplier_tax_id, 50),
    customer_name: sanitizeString(raw.customer_name, 150),
    customer_address: sanitizeString(raw.customer_address, 300),
    invoice_number: sanitizeString(raw.invoice_number, 50),
    invoice_date: sanitizeDate(raw.invoice_date),
    due_date: sanitizeDate(raw.due_date),
    currency: currencyStr,
    purchase_order_number: sanitizeString(raw.purchase_order_number, 50),
    subtotal: sanitizeNumber(raw.subtotal),
    tax_rate: sanitizeNumber(raw.tax_rate),
    tax_amount: sanitizeNumber(raw.tax_amount),
    discount_amount: sanitizeNumber(raw.discount_amount) ?? 0,
    shipping_amount: sanitizeNumber(raw.shipping_amount) ?? 0,
    grand_total: sanitizeNumber(raw.grand_total),
    payment_terms: sanitizeString(raw.payment_terms, 100),
    line_items: lineItems,
    field_metadata: fieldMeta,
    extractor_provider: sanitizeString(raw.extractor_provider, 50) || defaultProvider,
    raw_extraction: raw.raw_extraction || undefined,
  };
}
