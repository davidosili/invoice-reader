import { ValidationIssueDraft } from './validator';
import { SanitizedExtractedInvoice } from './schema';

export interface ExistingInvoiceRecord {
  id: string;
  document_id: string;
  workspace_id: string;
  supplier_name: string | null;
  invoice_number: string | null;
  grand_total: number | null;
  currency: string;
  invoice_date: string | null;
}

/**
 * Normalizes supplier name by lowercasing, stripping punctuation, and removing common corporate suffixes.
 */
export function normalizeSupplierName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\b(ltd|limited|inc|incorporated|corp|corporation|llc|gmbh|plc|co|company)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes invoice number by uppercasing and stripping whitespace and punctuation separators.
 */
export function normalizeInvoiceNumber(num?: string | null): string {
  if (!num) return '';
  return num
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Checks for duplicate records within the same authorized workspace.
 * Strict workspace scoping: only compares against records in the current workspace.
 */
export function detectDuplicateInvoices(
  current: SanitizedExtractedInvoice,
  currentDocumentId: string,
  existingWorkspaceRecords: ExistingInvoiceRecord[]
): ValidationIssueDraft[] {
  const issues: ValidationIssueDraft[] = [];

  const normCurrentSupplier = normalizeSupplierName(current.supplier_name);
  const normCurrentInvNum = normalizeInvoiceNumber(current.invoice_number);

  if (!normCurrentSupplier && !normCurrentInvNum) return issues;

  for (const prev of existingWorkspaceRecords) {
    // Never compare against the same document
    if (prev.document_id === currentDocumentId) continue;

    const normPrevSupplier = normalizeSupplierName(prev.supplier_name);
    const normPrevInvNum = normalizeInvoiceNumber(prev.invoice_number);

    // 1. Exact Duplicate Match: Normalized Supplier Name + Normalized Invoice Number
    if (
      normCurrentSupplier &&
      normPrevSupplier &&
      normCurrentSupplier === normPrevSupplier &&
      normCurrentInvNum &&
      normPrevInvNum &&
      normCurrentInvNum === normPrevInvNum
    ) {
      issues.push({
        issue_type: 'duplicate_warning',
        severity: 'error',
        field_key: 'invoice_number',
        message: `High confidence duplicate: Invoice #${current.invoice_number} from "${current.supplier_name}" matches previously processed document record (${prev.document_id.slice(0, 8)}).`,
        details: {
          duplicateDocumentId: prev.document_id,
          matchedSupplier: prev.supplier_name,
          matchedInvoiceNumber: prev.invoice_number,
          matchedGrandTotal: prev.grand_total,
          matchedDate: prev.invoice_date,
          type: 'exact',
        },
      });
      continue; // Skip fuzzy check if exact matched
    }

    // 2. Fuzzy / Suspected Duplicate: Same Supplier + Exact Grand Total + Similar Date
    if (
      normCurrentSupplier &&
      normPrevSupplier &&
      normCurrentSupplier === normPrevSupplier &&
      current.grand_total !== null &&
      prev.grand_total !== null &&
      Math.abs(current.grand_total - prev.grand_total) < 0.01 &&
      current.currency === prev.currency
    ) {
      let daysDiff = 999;
      if (current.invoice_date && prev.invoice_date) {
        const t1 = Date.parse(current.invoice_date);
        const t2 = Date.parse(prev.invoice_date);
        if (!isNaN(t1) && !isNaN(t2)) {
          daysDiff = Math.abs((t1 - t2) / (1000 * 60 * 60 * 24));
        }
      }

      if (daysDiff <= 7) {
        issues.push({
          issue_type: 'duplicate_warning',
          severity: 'warning',
          field_key: 'grand_total',
          message: `Suspected duplicate variance: An invoice for ${current.currency} ${current.grand_total?.toFixed(2)} from "${current.supplier_name}" dated ${prev.invoice_date || 'recently'} already exists in this workspace (Document ${prev.document_id.slice(0, 8)}).`,
          details: {
            duplicateDocumentId: prev.document_id,
            matchedSupplier: prev.supplier_name,
            matchedInvoiceNumber: prev.invoice_number,
            matchedGrandTotal: prev.grand_total,
            matchedDate: prev.invoice_date,
            daysDifference: Math.round(daysDiff),
            type: 'fuzzy',
          },
        });
      }
    }
  }

  return issues;
}
