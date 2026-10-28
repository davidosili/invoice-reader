import type { InvoiceExtractionRecord, InvoiceValidationIssue, InvoiceAuditEvent } from '../types.ts';

export interface ExtractionStateDescriptor {
  status: 'success' | 'review_required' | 'partial' | 'failed';
  label: string;
  badgeClass: string;
  iconType: 'success' | 'review' | 'partial' | 'failed';
}

export interface FormattedAuditEvent {
  title: string;
  description: string;
  iconType:
    | 'upload'
    | 'start'
    | 'check'
    | 'review'
    | 'edit'
    | 'approved'
    | 'rejected'
    | 'export'
    | 'reprocess'
    | 'warning'
    | 'error'
    | 'default';
}

/**
 * Maps document and extraction status to customer-focused extraction state labels.
 * 
 * Target States:
 * 1. Successful extraction: "Extraction completed."
 * 2. Successful extraction with validation issues: "Extraction completed — review required."
 * 3. Partial or heuristic extraction: "Partial extraction — verify fields against the original document."
 * 4. Failed extraction: "Extraction failed — try again."
 */
export function getExtractionState(params: {
  documentStatus?: string;
  extraction?: InvoiceExtractionRecord | null;
  issues?: InvoiceValidationIssue[];
}): ExtractionStateDescriptor | null {
  const { documentStatus, extraction, issues = [] } = params;

  if (documentStatus === 'failed') {
    return {
      status: 'failed',
      label: 'Extraction failed — try again.',
      badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]',
      iconType: 'failed',
    };
  }

  if (!extraction) {
    return null;
  }

  const isHeuristic =
    Boolean(extraction.extractor_provider?.includes('heuristic')) ||
    Boolean(extraction.extractor_provider?.includes('fallback') && !extraction.extractor_provider?.includes('gemini'));
  const isCriticalFieldMissing = !extraction.supplier_name && !extraction.grand_total;

  if (isHeuristic || isCriticalFieldMissing) {
    return {
      status: 'partial',
      label: 'Partial extraction — verify fields against the original document.',
      badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      iconType: 'partial',
    };
  }

  const customerIssues = filterCustomerIssues(issues);
  if (customerIssues.length > 0 || documentStatus === 'review_required') {
    return {
      status: 'review_required',
      label: 'Extraction completed — review required.',
      badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      iconType: 'review',
    };
  }

  return {
    status: 'success',
    label: 'Extraction completed.',
    badgeClass: 'bg-[#EBF3EE] text-[#1B4938] border-[#1B4938]/30',
    iconType: 'success',
  };
}

/**
 * Filters out internal infrastructure cascade notices from the customer discrepancies list,
 * while preserving all genuine validation discrepancies and sanitizing heuristic fallback messages.
 */
export function filterCustomerIssues(issues: InvoiceValidationIssue[]): InvoiceValidationIssue[] {
  return issues
    .filter((issue) => {
      // Technical AI quota cascade is internal infrastructure status, not a document flaw
      if (issue.issue_type === 'format_warning' && issue.message.includes('AI Fallback active (gemini')) {
        return false;
      }
      return true;
    })
    .map((issue) => {
      // Present heuristic fallback without internal provider IDs
      if (issue.issue_type === 'format_warning' && issue.message.includes('Fallback extraction provider active')) {
        return {
          ...issue,
          message: 'Partial extraction active: Automated visual extraction was unavailable. Review and verify all fields against the original document.',
        };
      }
      return issue;
    });
}

/**
 * Formats raw audit events into clear, professional, customer-relevant entries.
 * Avoids exposing raw JSON strings, implementation details, or provider names in the customer interface.
 */
export function formatAuditEvent(evt: InvoiceAuditEvent): FormattedAuditEvent {
  switch (evt.event_type) {
    case 'processing_queued':
      return {
        title: 'Document Uploaded & Queued',
        description: 'Uploaded to workspace and queued for verification.',
        iconType: 'upload',
      };
    case 'processing_started':
      return {
        title: 'Extraction Started',
        description: 'Automated field extraction and validation checks initiated.',
        iconType: 'start',
      };
    case 'validation_failed':
      return {
        title: 'Validation Issues Detected',
        description: 'One or more discrepancies require manual inspection.',
        iconType: 'warning',
      };
    case 'extraction_completed': {
      const isFallback = evt.details?.fallback;
      const issuesCount = evt.details?.issues_count ?? 0;
      if (isFallback && evt.details?.fallback_type === 'heuristic') {
        return {
          title: 'Partial Extraction Completed',
          description:
            issuesCount > 0
              ? `Extracted with heuristic fallback — ${issuesCount} item(s) require review.`
              : 'Extracted with heuristic fallback — manual review recommended.',
          iconType: 'warning',
        };
      }
      return {
        title: issuesCount > 0 ? 'Extraction Completed — Review Required' : 'Extraction Completed',
        description:
          issuesCount > 0
            ? `Fields extracted — ${issuesCount} discrepancy item(s) flagged for human review.`
            : 'All fields extracted and validated successfully.',
        iconType: issuesCount > 0 ? 'review' : 'check',
      };
    }
    case 'field_corrected': {
      const fields = evt.details?.modified_fields;
      let desc = 'Reviewer modified invoice fields.';
      if (Array.isArray(fields) && fields.length > 0) {
        const fieldLabels = fields.map((f: string) => f.replace(/_/g, ' ')).join(', ');
        desc = `Reviewer corrected: ${fieldLabels}.`;
      }
      return {
        title: 'Corrections Saved',
        description: desc,
        iconType: 'edit',
      };
    }
    case 'approved':
      return {
        title: 'Invoice Certified & Approved',
        description: evt.details?.notes
          ? `Approved for accounting export. Notes: "${evt.details.notes}"`
          : 'Invoice approved and marked ready for accounting export.',
        iconType: 'approved',
      };
    case 'rejected':
      return {
        title: 'Invoice Rejected',
        description: evt.details?.reason
          ? `Reason: ${evt.details.reason}`
          : 'Rejected by reviewer during inspection.',
        iconType: 'rejected',
      };
    case 'reprocessed':
      return {
        title: 'Re-extraction Queued',
        description: 'Reviewer re-queued document for automated extraction.',
        iconType: 'reprocess',
      };
    case 'exported':
      return {
        title: 'Exported to CSV',
        description: `Included in accounting batch export (${evt.details?.total_exported || 1} invoice(s)).`,
        iconType: 'export',
      };
    case 'processing_failed':
      return {
        title: 'Processing Failed',
        description: 'Extraction encountered an error. Please try again.',
        iconType: 'error',
      };
    default: {
      const typeStr: string = (evt as any).event_type || 'Event';
      return {
        title: typeStr.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: 'Recorded workspace audit action.',
        iconType: 'default',
      };
    }
  }
}
