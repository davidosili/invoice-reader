import { DocumentRecord, InvoiceExtractionRecord } from '../types';

/**
 * Escapes a CSV cell to prevent CSV / Formula Injection vulnerabilities (CWE-1236).
 * Any cell value starting with '=', '+', '-', '@', '\t', or '\r' is prepended with a single quote.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Strip null bytes
  str = str.replace(/\0/g, '');

  // Formula injection mitigation: prepend single quote if starts with dangerous character
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export interface ExportableInvoiceRow {
  document: DocumentRecord;
  extraction?: InvoiceExtractionRecord | null;
}

/**
 * Generates formatted CSV string for approved invoices.
 */
export function generateApprovedInvoicesCsv(rows: ExportableInvoiceRow[]): string {
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
    'Purchase Order',
    'Subtotal',
    'Tax Rate (%)',
    'Tax Amount',
    'Discount Amount',
    'Shipping Amount',
    'Grand Total',
    'Payment Terms',
    'Line Items Count',
    'Uploaded At',
    'Last Updated At',
  ];

  const csvLines: string[] = [headers.map(escapeCsvCell).join(',')];

  for (const { document, extraction } of rows) {
    const lineItemCount = extraction?.line_items?.length ?? 0;
    const taxRatePercent = extraction?.tax_rate ? (extraction.tax_rate * 100).toFixed(2) : '';

    const row = [
      document.id,
      document.original_filename,
      document.status,
      extraction?.supplier_name || '',
      extraction?.supplier_tax_id || '',
      extraction?.invoice_number || '',
      extraction?.invoice_date || '',
      extraction?.due_date || '',
      extraction?.currency || 'USD',
      extraction?.purchase_order_number || '',
      extraction?.subtotal !== null && extraction?.subtotal !== undefined ? extraction.subtotal.toFixed(2) : '',
      taxRatePercent,
      extraction?.tax_amount !== null && extraction?.tax_amount !== undefined ? extraction.tax_amount.toFixed(2) : '',
      extraction?.discount_amount ? extraction.discount_amount.toFixed(2) : '0.00',
      extraction?.shipping_amount ? extraction.shipping_amount.toFixed(2) : '0.00',
      extraction?.grand_total !== null && extraction?.grand_total !== undefined ? extraction.grand_total.toFixed(2) : '',
      extraction?.payment_terms || '',
      lineItemCount.toString(),
      document.created_at,
      document.updated_at,
    ];

    csvLines.push(row.map(escapeCsvCell).join(','));
  }

  return csvLines.join('\r\n');
}

/**
 * Initiates browser download of the generated CSV file.
 */
export function downloadCsvFile(csvContent: string, filename = 'ledgerlens_approved_invoices.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
