import { DocumentRecord } from '../../types';
import { HeuristicOcrProvider } from './providers/heuristicOcrProvider';
import { InvoiceExtractionProvider } from './providers/types';
import { SanitizedExtractedInvoice } from './schema';
import { validateInvoiceConsistency, ValidationIssueDraft } from './validator';
import { detectDuplicateInvoices, ExistingInvoiceRecord } from './duplicates';

export interface PipelineExecutionResult {
  extraction: SanitizedExtractedInvoice;
  issues: ValidationIssueDraft[];
  status: 'review_required' | 'failed';
  error?: string;
}

/**
 * Validates document state transition legality.
 */
export function isPermittedTransition(fromStatus: DocumentRecord['status'], toStatus: DocumentRecord['status']): boolean {
  if (fromStatus === 'uploaded' && toStatus === 'queued') return true;
  if (fromStatus === 'queued' && (toStatus === 'processing' || toStatus === 'failed')) return true;
  if (fromStatus === 'processing' && (toStatus === 'review_required' || toStatus === 'failed')) return true;
  if (fromStatus === 'review_required' && (toStatus === 'approved' || toStatus === 'rejected' || toStatus === 'queued')) return true;
  if (fromStatus === 'rejected' && toStatus === 'queued') return true;
  if (fromStatus === 'failed' && toStatus === 'queued') return true;
  return false;
}

/**
 * Executes the invoice intelligence pipeline:
 * 1. Extraction via chosen provider
 * 2. Strict schema normalization
 * 3. Deterministic financial arithmetic validation
 * 4. Workspace-scoped duplicate detection
 */
export async function runInvoiceIntelligencePipeline(
  fileBuffer: Uint8Array,
  document: DocumentRecord,
  existingWorkspaceRecords: ExistingInvoiceRecord[] = [],
  provider: InvoiceExtractionProvider = new HeuristicOcrProvider()
): Promise<PipelineExecutionResult> {
  try {
    // 1. Run extraction provider
    const extraction = await provider.extract(fileBuffer, document.mime_type, document.original_filename);

    // 2. Run deterministic financial and consistency validation
    const consistencyIssues = validateInvoiceConsistency(extraction);

    // 3. Run workspace-scoped duplicate detection
    const duplicateIssues = detectDuplicateInvoices(extraction, document.id, existingWorkspaceRecords);

    // Combined validation issues
    const allIssues = [...consistencyIssues, ...duplicateIssues];

    return {
      extraction,
      issues: allIssues,
      status: 'review_required',
    };
  } catch (err: any) {
    return {
      extraction: {
        supplier_name: null,
        supplier_address: null,
        supplier_tax_id: null,
        customer_name: null,
        customer_address: null,
        invoice_number: null,
        invoice_date: null,
        due_date: null,
        currency: 'USD',
        purchase_order_number: null,
        subtotal: null,
        tax_rate: null,
        tax_amount: null,
        discount_amount: 0,
        shipping_amount: 0,
        grand_total: null,
        payment_terms: null,
        line_items: [],
        field_metadata: {},
        extractor_provider: provider.providerId,
      },
      issues: [
        {
          issue_type: 'format_warning',
          severity: 'error',
          field_key: null,
          message: `Pipeline processing failure: ${err.message || 'Unknown extraction error'}`,
        },
      ],
      status: 'failed',
      error: err.message || 'Processing failed',
    };
  }
}
