import React, { useState } from 'react';
import {
  UploadCloud,
  Cpu,
  Calculator,
  Search,
  UserCheck,
  CheckCircle,
  FileSpreadsheet,
  History,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LiveCapability {
  id: string;
  num: string;
  title: string;
  shortDesc: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  sampleOutput: Record<string, string>;
}

export const ProductCapabilities: React.FC = () => {
  const [activeCapability, setActiveCapability] = useState<number>(0);

  const currentCapabilities: LiveCapability[] = [
    {
      id: "upload",
      num: "01",
      title: "Invoice Upload",
      shortDesc: "Encrypted single-document upload for PDF, PNG, and JPEG files.",
      description:
        "Upload single invoice documents directly into secure, workspace-scoped encrypted storage. Supported formats include PDF, PNG, and JPEG.",
      icon: UploadCloud,
      details: [
        "PDF, PNG, and JPEG formats supported with client-side file type and size verification",
        "Encrypted multi-tenant object storage scoped by workspace Row-Level Security (RLS)",
        "Document records initialized with strict status state machine ('uploaded' -> 'review_required')"
      ],
      sampleOutput: {
        file: "supplier_invoice_scan.pdf",
        format: "application/pdf (Single Document)",
        storage: "Encrypted Workspace Storage",
        initialStatus: "Ready for Extraction"
      }
    },
    {
      id: "extraction",
      num: "02",
      title: "AI-Assisted Invoice Data Extraction",
      shortDesc: "Google Gemini 2.5 Flash multimodal vision extraction.",
      description:
        "Extract key invoice details using Google Gemini 2.5 Flash multimodal vision. The system identifies supplier details, invoice reference numbers, dates, line items, taxes, and totals.",
      icon: Cpu,
      details: [
        "Supplier legal/trading name, address, tax identifier (TIN/VAT), and customer details",
        "Invoice issue date, payment due date, and payment terms",
        "Multi-row itemized line items with descriptions, quantities, unit prices, and line totals",
        "Calculated subtotal, tax breakdown, and final grand total with currency normalization"
      ],
      sampleOutput: {
        supplier_name: "Northstar Office Supplies Ltd.",
        invoice_number: "INV-2048",
        line_items: "3 itemized rows extracted",
        subtotal: "₦185,000.00",
        tax_amount: "₦13,875.00 (VAT 7.5%)",
        grand_total: "₦198,875.00"
      }
    },
    {
      id: "validation",
      num: "03",
      title: "Arithmetic and Date Validation",
      shortDesc: "Deterministic checks verify calculations, dates, and required fields.",
      description:
        "Apply deterministic validation rules to verify arithmetic consistency, confirm required fields are present, and validate date relationships before records reach human review.",
      icon: Calculator,
      details: [
        "Cross-sum arithmetic audit: line item sum vs. document subtotal (with ±0.02 rounding allowance)",
        "Tax verification: checks subtotal plus tax equals grand total",
        "Date relationship validation: flags invoice dates in the future or inverted due dates",
        "Mandatory field completeness: checks supplier name, invoice identifier, and total amount"
      ],
      sampleOutput: {
        cross_sum_rule: "Line items sum equals subtotal (Delta: ₦0.00)",
        tax_calculation: "Subtotal + Tax matches Grand Total",
        date_validation: "Valid sequence (Issue: 12 Oct / Due: 26 Oct)",
        validation_status: "Deterministic Rules Passed"
      }
    },
    {
      id: "duplicate",
      num: "04",
      title: "Duplicate Detection",
      shortDesc: "Identify potential duplicates against existing workspace documents.",
      description:
        "Flag potentially duplicated invoices using document identifiers, supplier information, and financial amounts compared against existing workspace records.",
      icon: Search,
      details: [
        "Workspace-scoped heuristic comparison on supplier name, invoice number, and grand total",
        "Collision scan against previously processed records in the active workspace",
        "Flagged duplicate warnings surface directly in the review queue for human decision"
      ],
      sampleOutput: {
        duplicate_check: "Workspace Collision Scan",
        scope: "Current Workspace History",
        collision_detected: "None (Unique document sequence)",
        action: "Proceeds to review queue"
      }
    },
    {
      id: "review",
      num: "05",
      title: "Human Review and Correction",
      shortDesc: "Inspect extracted data alongside original documents and resolve issues.",
      description:
        "Inspect extracted fields alongside the original invoice, correct values where supported, and review validation issues with clear severity indicators.",
      icon: UserCheck,
      details: [
        "Side-by-side view comparing source document and extracted structured values",
        "Inline editing allowing operators to correct extracted fields before approval",
        "Validation issue panel displaying warnings, arithmetic deltas, and required action"
      ],
      sampleOutput: {
        review_state: "Active Review Console",
        flagged_issues: "1 warning (Terms variance flagged for verification)",
        field_corrections: "Editable by authorized operator",
        review_gate: "Human confirmation required"
      }
    },
    {
      id: "decision",
      num: "06",
      title: "Invoice Approval or Rejection",
      shortDesc: "Explicit operator decisions before finalizing document records.",
      description:
        "Operators retain complete control to approve or reject invoices. Status transitions are enforced through a strict state machine to prevent unreviewed records from being finalized.",
      icon: CheckCircle,
      details: [
        "Dedicated 'Approve Invoice' and 'Reject Invoice' workflow actions",
        "State machine transitions enforce 'review_required' -> 'approved' or 'rejected'",
        "Decision metadata and timestamp recorded against the document record"
      ],
      sampleOutput: {
        decision: "Approved by Operator",
        document_status: "approved",
        transition_permitted: "Valid state transition",
        finalization: "Ready for downstream CSV export"
      }
    },
    {
      id: "export",
      num: "07",
      title: "CSV Export",
      shortDesc: "Export approved workspace records with formula injection protection.",
      description:
        "Export approved invoice records into structured, standardized CSV files formatted for downstream bookkeeping, spreadsheet analysis, and financial reporting.",
      icon: FileSpreadsheet,
      details: [
        "Workspace-scoped CSV download of approved invoice records and line summaries",
        "RFC 4180 compliance with active protection against spreadsheet formula injection",
        "Structured columns including supplier, invoice ID, dates, subtotals, tax, and grand totals"
      ],
      sampleOutput: {
        export_format: "RFC 4180 Comma-Separated Values (.csv)",
        formula_injection_guard: "Active (Single-quote prefixing on =, +, -, @)",
        scope: "Approved Workspace Records",
        compatibility: "Excel, Google Sheets, Accounting imports"
      }
    },
    {
      id: "audit",
      num: "08",
      title: "Audit Events Tracking",
      shortDesc: "Verifiable logging of document creation, processing, and decisions.",
      description:
        "Structured audit logging captures document creation, processing triggers, status transitions, and operator decisions for supported workflow actions.",
      icon: History,
      details: [
        "Relational audit event logging for all key lifecycle actions in the workspace",
        "Captures actor ID, event action type, timestamp, and document context",
        "Provides clear provenance showing when records were created, processed, and approved"
      ],
      sampleOutput: {
        event_type: "document.status_changed",
        actor_id: "usr_ops_01",
        previous_status: "review_required",
        new_status: "approved"
      }
    }
  ];

  const plannedCapabilities = [
    {
      title: "Batch invoice processing & aggregate analytics",
      description:
        "Upload and process multiple invoices simultaneously with batch-level reconciliation metrics and aggregate workspace spend analytics."
    },
    {
      title: "Broader document classification",
      description:
        "Automatically distinguish and route receipts, credit notes, pro-forma invoices, and purchase orders upon arrival."
    },
    {
      title: "Cross-document purchase-order matching",
      description:
        "2-way and 3-way matching reconciling supplier invoices against purchase orders and goods-received records with automated tolerance thresholds."
    },
    {
      title: "Accounting & ERP integrations",
      description:
        "Direct bidirectional connectors for accounting ledgers and ERP systems, including QuickBooks, Xero, and NetSuite."
    },
    {
      title: "Extensive operational reporting",
      description:
        "Comprehensive accounts payable reporting, supplier turnaround benchmarks, processing cycle times, and compliance exports."
    }
  ];

  const current = currentCapabilities[activeCapability];
  const CurrentIcon = current.icon;

  return (
    <section id="capabilities" className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#176B50]" />
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono">
              Product status: Working MVP
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            Current capabilities
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            LedgerLens AI has a working invoice-processing workflow that uses AI to extract structured
            information, applies validation checks, and supports human review of potential discrepancies.
            The 8 capabilities below are implemented and working today.
          </p>
        </div>

        {/* Interactive Capability Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left: Capability Navigation List */}
          <div className="lg:col-span-5 space-y-2">
            {currentCapabilities.map((cap, idx) => {
              const isActive = activeCapability === idx;
              return (
                <div
                  key={cap.id}
                  onClick={() => setActiveCapability(idx)}
                  className={`p-3.5 sm:p-4 rounded-[4px] cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#F7F8F6] border-[#176B50] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E2E6E1] hover:border-[#626B64]/40 hover:bg-[#F7F8F6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[12px] font-medium text-[#176B50]">
                      {cap.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] border font-medium text-[#176B50] bg-[#EDF4EF] border-[#176B50]/20">
                      Live in MVP
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#202722] mb-0.5">
                    {cap.title}
                  </h3>
                  <p className="text-[12px] text-[#626B64] line-clamp-1 leading-relaxed">
                    {cap.shortDesc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Deep-Dive Inspector for Selected Capability */}
          <div className="lg:col-span-7 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                  <CurrentIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[11px] font-medium text-[#176B50] block">
                    Capability {current.num}
                  </span>
                  <h3 className="text-[19px] sm:text-[21px] font-bold text-[#202722]">
                    {current.title}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[3px] border text-[#176B50] bg-[#EDF4EF] border-[#176B50]/20 flex-shrink-0">
                Live in MVP
              </span>
            </div>

            <p className="mt-4 text-[15px] text-[#202722] leading-relaxed">
              {current.description}
            </p>

            {/* Implemented Processing Behaviors */}
            <div className="mt-6 pt-5 border-t border-[#E2E6E1]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#626B64] mb-3 font-mono">
                Implemented Processing Behaviors
              </h4>
              <ul className="space-y-2.5">
                {current.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-[#202722]">
                    <CheckCircle className="w-4 h-4 text-[#176B50] flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Output */}
            <div className="mt-6 pt-5 border-t border-[#E2E6E1]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-[#626B64]">
                  Sample Pipeline Output • Structured Record
                </span>
                <span className="text-[10px] text-[#176B50] font-mono font-medium bg-[#EDF4EF] px-1.5 py-0.5 rounded-[2px]">
                  Verified in MVP
                </span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] p-3.5 font-mono text-[12px] space-y-1.5 overflow-x-auto">
                {Object.entries(current.sampleOutput).map(([key, val]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-[#626B64] text-[11px]">{key}:</span>
                    <span className="text-[#202722] font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E2E6E1] text-[11px] text-[#626B64] flex items-center justify-between">
              <span>Implemented and working in current MVP</span>
              <Link
                to="/app"
                className="inline-flex items-center gap-1 text-[#176B50] font-medium hover:underline"
              >
                Open LedgerLens AI
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Planned Capabilities Roadmap Header */}
        <div className="pt-10 border-t border-[#E2E6E1]">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#626B64]" />
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#626B64] font-mono">
                Product Roadmap
              </p>
            </div>
            <h3 className="text-[24px] sm:text-[30px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              What's next
            </h3>
            <p className="mt-2 text-[15px] text-[#626B64] leading-relaxed">
              These capabilities are genuinely planned for future releases and are not currently available in the live MVP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plannedCapabilities.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[3px] bg-[#FFFFFF] text-[#626B64] border border-[#E2E6E1] font-medium">
                      Roadmap Item
                    </span>
                    <span className="text-[11px] font-mono text-[#626B64]">
                      Planned
                    </span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#202722] mb-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[13px] text-[#626B64] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Architecture Integrity Card */}
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[3px] bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20 font-medium">
                    Development Principle
                  </span>
                  <span className="text-[11px] font-mono text-[#176B50]">
                    Verified
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-[#202722] mb-2 leading-snug">
                  Transparent feature claims
                </h4>
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  LedgerLens AI clearly separates live working features from future roadmap items. We do not claim integrations, cross-document matching, or batch pipelines until they are fully implemented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
