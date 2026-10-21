import { ValidationIssueType, ValidationSeverity } from '../../types';
import { SanitizedExtractedInvoice } from './schema';

export interface ValidationIssueDraft {
  issue_type: ValidationIssueType;
  severity: ValidationSeverity;
  field_key: string | null;
  message: string;
  details?: Record<string, any>;
}

/**
 * Validates financial arithmetic, required fields, date sanity, and currency.
 * Accounts for 2-cent rounding tolerance (0.02) to handle fractional tax/quantity calculations.
 */
export function validateInvoiceConsistency(invoice: SanitizedExtractedInvoice): ValidationIssueDraft[] {
  const issues: ValidationIssueDraft[] = [];
  const ROUNDING_TOLERANCE = 0.02;

  // 1. Required Fields Check
  if (!invoice.supplier_name) {
    issues.push({
      issue_type: 'missing_field',
      severity: 'warning',
      field_key: 'supplier_name',
      message: 'Supplier identity is unverified or missing from the extracted record.',
    });
  }

  if (!invoice.invoice_number) {
    issues.push({
      issue_type: 'missing_field',
      severity: 'error',
      field_key: 'invoice_number',
      message: 'Invoice identifier / number was not detected.',
    });
  }

  if (!invoice.invoice_date) {
    issues.push({
      issue_type: 'missing_field',
      severity: 'warning',
      field_key: 'invoice_date',
      message: 'Invoice billing date is missing.',
    });
  }

  if (invoice.grand_total === null) {
    issues.push({
      issue_type: 'missing_field',
      severity: 'error',
      field_key: 'grand_total',
      message: 'Grand total payable amount could not be determined.',
    });
  }

  // 2. Line Items vs Subtotal Check
  if (invoice.line_items && invoice.line_items.length > 0) {
    let calculatedLineSum = 0;

    invoice.line_items.forEach((item, idx) => {
      const lineMath = Math.round(item.quantity * item.unit_price * 100) / 100;
      if (Math.abs(lineMath - item.total) > ROUNDING_TOLERANCE) {
        issues.push({
          issue_type: 'arithmetic_discrepancy',
          severity: 'warning',
          field_key: `line_items[${idx}]`,
          message: `Line #${idx + 1} arithmetic discrepancy: ${item.quantity} × ${item.unit_price} = ${lineMath.toFixed(2)}, but line total states ${item.total.toFixed(2)}.`,
          details: { itemIndex: idx, quantity: item.quantity, unitPrice: item.unit_price, statedTotal: item.total, calculatedTotal: lineMath }
        });
      }
      calculatedLineSum += item.total;
    });

    calculatedLineSum = Math.round(calculatedLineSum * 100) / 100;

    if (invoice.subtotal !== null) {
      const subtotalDiff = Math.abs(calculatedLineSum - invoice.subtotal);
      if (subtotalDiff > ROUNDING_TOLERANCE) {
        issues.push({
          issue_type: 'arithmetic_discrepancy',
          severity: 'error',
          field_key: 'subtotal',
          message: `Subtotal discrepancy: Sum of individual line items (${calculatedLineSum.toFixed(2)}) does not match extracted subtotal (${invoice.subtotal.toFixed(2)}). Variance: ${(calculatedLineSum - invoice.subtotal).toFixed(2)}.`,
          details: { calculatedLineSum, extractedSubtotal: invoice.subtotal, variance: calculatedLineSum - invoice.subtotal }
        });
      }
    }
  }

  // 3. Grand Total Arithmetic Check (subtotal + tax + shipping - discount == grand_total)
  if (invoice.grand_total !== null && invoice.subtotal !== null) {
    const tax = invoice.tax_amount ?? 0;
    const shipping = invoice.shipping_amount ?? 0;
    const discount = invoice.discount_amount ?? 0;
    const calculatedGrand = Math.round((invoice.subtotal + tax + shipping - discount) * 100) / 100;
    const totalDiff = Math.abs(calculatedGrand - invoice.grand_total);

    if (totalDiff > ROUNDING_TOLERANCE) {
      issues.push({
        issue_type: 'arithmetic_discrepancy',
        severity: 'error',
        field_key: 'grand_total',
        message: `Cross-sum calculation error: Subtotal (${invoice.subtotal.toFixed(2)}) + Tax (${tax.toFixed(2)}) + Shipping (${shipping.toFixed(2)}) - Discount (${discount.toFixed(2)}) = ${calculatedGrand.toFixed(2)}, but stated Grand Total is ${invoice.grand_total.toFixed(2)}. Variance: ${(calculatedGrand - invoice.grand_total).toFixed(2)}.`,
        details: { subtotal: invoice.subtotal, tax, shipping, discount, calculatedGrand, statedGrandTotal: invoice.grand_total, variance: calculatedGrand - invoice.grand_total }
      });
    }
  }

  // 4. Date Consistency Check (dueDate >= invoiceDate)
  if (invoice.invoice_date && invoice.due_date) {
    const invTime = Date.parse(invoice.invoice_date);
    const dueTime = Date.parse(invoice.due_date);

    if (!isNaN(invTime) && !isNaN(dueTime)) {
      if (dueTime < invTime) {
        issues.push({
          issue_type: 'date_inconsistency',
          severity: 'warning',
          field_key: 'due_date',
          message: `Date inconsistency: Payment due date (${invoice.due_date}) precedes billing date (${invoice.invoice_date}).`,
          details: { invoice_date: invoice.invoice_date, due_date: invoice.due_date }
        });
      }
    }
  }

  // 5. Currency Check
  const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'ZAR', 'SGD'];
  if (invoice.currency && !VALID_CURRENCIES.includes(invoice.currency)) {
    issues.push({
      issue_type: 'format_warning',
      severity: 'info',
      field_key: 'currency',
      message: `Uncommon or non-standard ISO currency code detected: "${invoice.currency}".`,
      details: { currency: invoice.currency }
    });
  }

  return issues;
}
