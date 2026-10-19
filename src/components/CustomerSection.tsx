import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Segment {
  title: string;
  badge: string;
  isInitialTarget: boolean;
  summary: string;
  workflowContext: string;
}

const segments: Segment[] = [
  {
    title: "Distributors and Wholesalers",
    badge: "Initial Target Market",
    isInitialTarget: true,
    summary: "Organize supplier invoices, compare purchase records, and reduce repetitive financial data entry.",
    workflowContext:
      "High volume of frequent multi-item supplier deliveries, complex vendor terms, and daily receiving logs require rapid reconciliation before payment approval."
  },
  {
    title: "Accounting Firms",
    badge: "Expansion Segment",
    isInitialTarget: false,
    summary: "Prepare structured document records for review and downstream accounting workflows.",
    workflowContext:
      "Client bookkeeping requires sorting hundreds of heterogeneous client receipts, bills, and tax invoices into standard accounting chart-of-accounts."
  },
  {
    title: "Importers and Procurement Teams",
    badge: "Expansion Segment",
    isInitialTarget: false,
    summary: "Organize supplier paperwork and identify potential inconsistencies across related documents.",
    workflowContext:
      "Cross-border shipments involving packing lists, bills of lading, and multi-currency commercial invoices benefit from cross-document comparison."
  },
  {
    title: "Growing Businesses",
    badge: "Expansion Segment",
    isInitialTarget: false,
    summary: "Bring more structure to invoices, receipts, and other routine business documents.",
    workflowContext:
      "Scaling finance operations without ballooning manual back-office overhead or losing audit discipline as document counts double."
  }
];

export const CustomerSection: React.FC = () => {
  return (
    <section className="bg-[#F7F8F6] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            Intended Market Focus
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            Built for businesses that process paperwork at scale.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            We are designing LedgerLens AI specifically for operations where invoice volume and document complexity
            create substantial manual burden. Our initial focus is centered on wholesale distribution networks,
            with broader accounting and procurement workflows planned for future expansion.
          </p>
        </div>

        {/* Structured Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((seg) => (
            <div
              key={seg.title}
              className={`p-6 sm:p-7 rounded-[4px] border transition-all ${
                seg.isInitialTarget
                  ? 'bg-[#FFFFFF] border-[#176B50] shadow-sm'
                  : 'bg-[#FFFFFF] border-[#E2E6E1]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-[3px] font-medium ${
                    seg.isInitialTarget
                      ? 'bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/30'
                      : 'bg-[#F7F8F6] text-[#626B64] border border-[#E2E6E1]'
                  }`}
                >
                  {seg.badge}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#626B64]" />
              </div>

              <h3 className="text-[20px] font-bold text-[#202722] mb-2">
                {seg.title}
              </h3>

              <p className="text-[15px] font-medium text-[#202722] leading-relaxed mb-3">
                {seg.summary}
              </p>

              <p className="text-[13px] text-[#626B64] leading-relaxed pt-3 border-t border-[#E2E6E1]">
                {seg.workflowContext}
              </p>
            </div>
          ))}
        </div>

        {/* Market Note */}
        <div className="mt-8 pt-4 border-t border-[#E2E6E1] text-[12px] text-[#626B64] flex items-center justify-between flex-wrap gap-2">
          <span>Targeting early pilots with forward-thinking commercial distributors.</span>
          <span className="italic">LedgerLens AI does not claim existing enterprise customer relationships.</span>
        </div>
      </div>
    </section>
  );
};
