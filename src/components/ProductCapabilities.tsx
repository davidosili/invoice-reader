import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export const ProductCapabilities: React.FC = () => {
  const [activeCapability, setActiveCapability] = useState<number>(0);

  const capabilities = [
    {
      id: "extraction",
      num: "01",
      title: "Intelligent Data Extraction",
      description:
        "Extract supplier details, invoice numbers, dates, quantities, line items, tax amounts, and totals from supported business documents with sub-field bounding coordinates.",
      plannedStatus: "Planned core engine",
      details: [
        "Supplier metadata & vendor registration matching",
        "Multi-line table parsing with currency normalization",
        "Deterministic tax identification and breakdown"
      ],
      sampleOutput: {
        vendor: "Northstar Office Supplies Ltd.",
        invNumber: "INV-2048",
        itemsExtracted: "3 line items",
        subtotal: "₦185,000.00"
      }
    },
    {
      id: "classification",
      num: "02",
      title: "Document Classification",
      description:
        "Organize invoices, receipts, purchase orders, and supplier statements into structured categories automatically upon receipt, eliminating manual routing.",
      plannedStatus: "Planned capability",
      details: [
        "Automatic layout typography & intent classification",
        "Distinguishes credit notes, pro-forma, and commercial invoices",
        "Tagging by business unit, entity, and supplier tier"
      ],
      sampleOutput: {
        docType: "Commercial Tax Invoice",
        confidence: "99.2%",
        route: "Accounts Payable / Branch West",
        tag: "High Priority"
      }
    },
    {
      id: "validation",
      num: "03",
      title: "Automated Validation",
      description:
        "Check required fields, arithmetic consistency, and relationships between extracted values to identify information that needs attention before ledger entry.",
      plannedStatus: "Planned validation suite",
      details: [
        "Cross-sum audit: Line item sum vs. document subtotal",
        "Jurisdiction-specific statutory VAT / Sales Tax checking",
        "Required field completeness (PO ref, payment terms, IBAN)"
      ],
      sampleOutput: {
        rule: "Arithmetic Cross-Sum Check",
        status: "Passed",
        discrepancy: "₦0.00 delta detected",
        vatCheck: "7.5% standard rate valid"
      }
    },
    {
      id: "duplicate",
      num: "04",
      title: "Duplicate Detection",
      description:
        "Flag potentially duplicated invoices using document identifiers, supplier information, dates, amounts, and other available signals across historical data.",
      plannedStatus: "Planned risk mitigation",
      details: [
        "Multi-signal heuristic comparison (Vendor + Amount + Date)",
        "Near-duplicate detection for re-issued or altered reference numbers",
        "Real-time collision alerts before double disbursement occurs"
      ],
      sampleOutput: {
        check: "Historical Ledger Collision",
        result: "Unique Submission Verified",
        vendorHistory: "14 invoices processed in past 6 months",
        collisionScore: "0.00%"
      }
    },
    {
      id: "matching",
      num: "05",
      title: "Cross-Document Matching",
      description:
        "Compare invoices against purchase orders and goods-received records to highlight possible differences in quantities, prices, and totals.",
      plannedStatus: "Planned 2-way & 3-way matching",
      details: [
        "Purchase Order (PO) to Invoice unit price reconciliation",
        "Goods Received Note (GRN) quantity matching",
        "Automated tolerance threshold enforcement"
      ],
      sampleOutput: {
        matchType: "PO-892 Reconciliation",
        variance: "Price matches PO (₦2,850/unit)",
        quantityDelivered: "40 units confirmed by warehouse",
        varianceStatus: "Zero variance"
      }
    },
    {
      id: "review",
      num: "06",
      title: "Human Review and Export",
      description:
        "Give users a clear way to inspect uncertain fields, correct errors, approve records, and prepare structured data for export to spreadsheets and ERP systems.",
      plannedStatus: "Planned operator console",
      details: [
        "Side-by-side field inspection with clickable document anchors",
        "Role-based sign-off and audit log generation",
        "Structured exports: Clean CSV, JSON, and standard accounting formats"
      ],
      sampleOutput: {
        exportStatus: "Ready for Export",
        formats: "CSV, JSON, XML (UBL 2.1)",
        auditLog: "Immutable signature #8F29A generated",
        userApproval: "Pending Finance Lead sign-off"
      }
    }
  ];

  const current = capabilities[activeCapability];

  return (
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            Intended System Capabilities
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            From document extraction to confident review.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            LedgerLens AI is being architected as a modular intelligence pipeline. Each stage is designed to provide
            transparent, traceable data extraction backed by automated verification and human governance.
          </p>
        </div>

        {/* Varied Editorial Composition: Interactive Capability Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Capability Navigation List */}
          <div className="lg:col-span-5 space-y-2">
            {capabilities.map((cap, idx) => {
              const isActive = activeCapability === idx;
              return (
                <div
                  key={cap.id}
                  onClick={() => setActiveCapability(idx)}
                  className={`p-4 rounded-[4px] cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#F7F8F6] border-[#176B50] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E2E6E1] hover:border-[#626B64]/40 hover:bg-[#F7F8F6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[12px] font-medium text-[#176B50]">
                      {cap.num}
                    </span>
                    <span className="text-[11px] font-mono text-[#626B64] bg-[#FFFFFF] px-2 py-0.5 rounded-[3px] border border-[#E2E6E1]">
                      {cap.plannedStatus}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#202722] mb-1">
                    {cap.title}
                  </h3>
                  <p className="text-[13px] text-[#626B64] line-clamp-2 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Rich Deep-Dive Visual Inspector for Selected Capability */}
          <div className="lg:col-span-7 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E6E1]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-semibold text-[#176B50] bg-[#EDF4EF] px-2 py-1 rounded-[3px]">
                  Capability {current.num}
                </span>
                <h3 className="text-[20px] font-bold text-[#202722]">
                  {current.title}
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#626B64]">
                Architecture Preview
              </span>
            </div>

            <p className="mt-4 text-[15px] text-[#202722] leading-relaxed">
              {current.description}
            </p>

            {/* Technical Verification Breakdown */}
            <div className="mt-6 pt-5 border-t border-[#E2E6E1]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#626B64] mb-3">
                Key Processing Behaviors
              </h4>
              <ul className="space-y-2.5">
                {current.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5 text-[14px] text-[#202722]">
                    <CheckCircle className="w-4 h-4 text-[#176B50] flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulated Data Output / Verification Console */}
            <div className="mt-6 pt-5 border-t border-[#E2E6E1]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-[#626B64]">
                  Simulated Pipeline Output • Structured Record
                </span>
                <span className="text-[10px] text-[#626B64]">Sample Schema</span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] p-3.5 font-mono text-[12px] space-y-1.5">
                {Object.entries(current.sampleOutput).map(([key, val]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-[#626B64] text-[11px]">{key}:</span>
                    <span className="text-[#202722] font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-[11px] text-[#626B64] flex items-center justify-between">
              <span>Status: Technical specification completed</span>
              <span className="italic">Development Roadmap 2026/2027</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
