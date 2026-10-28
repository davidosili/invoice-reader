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
    <section className="bg-[#F6F5F1] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#FFFFFF] border border-[#DDD7CD] text-[#5A5852]">
              REGISTER // 07
            </span>
            <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
              Market Focus
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#111318] tracking-tight leading-[1.15]">
            Built for businesses that process paperwork at scale.
          </h2>
          <p className="mt-4 text-[15px] text-[#5A5852] leading-relaxed">
            LedgerLens AI is built specifically for operations where invoice volume and document complexity
            create substantial manual burden. Our initial focus is centered on wholesale distribution networks,
            with broader accounting and procurement workflows planned for future expansion.
          </p>
        </div>

        {/* Structured Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((seg) => (
            <div
              key={seg.title}
              className={`p-6 sm:p-7 rounded-[2px] border transition-all ${
                seg.isInitialTarget
                  ? 'bg-[#FFFFFF] border-[#111318] shadow-sm relative'
                  : 'bg-[#FFFFFF] border-[#E2DFD7]'
              }`}
            >
              {seg.isInitialTarget && (
                <>
                  <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
                  <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
                </>
              )}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] font-medium uppercase tracking-wider ${
                    seg.isInitialTarget
                      ? 'bg-[#111318] text-white'
                      : 'bg-[#FAFAF8] text-[#5A5852] border border-[#DDD7CD]'
                  }`}
                >
                  {seg.badge}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#5A5852]" />
              </div>

              <h3 className="text-[19px] font-bold text-[#111318] mb-2 font-sans">
                {seg.title}
              </h3>

              <p className="text-[14px] font-medium text-[#111318] leading-relaxed mb-3">
                {seg.summary}
              </p>

              <p className="text-[13px] text-[#5A5852] leading-relaxed pt-3 border-t border-[#E2DFD7]">
                {seg.workflowContext}
              </p>
            </div>
          ))}
        </div>

        {/* Market Note */}
        <div className="mt-8 pt-4 border-t border-[#E2DFD7] text-[12px] text-[#5A5852] flex items-center justify-between flex-wrap gap-2">
          <span>Focused on commercial distributors, wholesale networks, and growing operations.</span>
          <span className="italic font-mono text-[11px]">LedgerLens AI does not claim unverified enterprise customer relationships.</span>
        </div>
      </div>
    </section>
  );
};
