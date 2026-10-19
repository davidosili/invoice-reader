import React from 'react';
import { Layers, ShieldAlert, Cpu } from 'lucide-react';

export const ProductIntro: React.FC = () => {
  return (
    <section id="product" className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Editorial Text Column */}
          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
              The Product Concept
            </p>
            <h2 className="text-[30px] sm:text-[38px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-6">
              Meet LedgerLens AI.
            </h2>
            <div className="space-y-4 text-[16px] text-[#626B64] leading-relaxed">
              <p className="text-[18px] text-[#202722] font-medium leading-relaxed">
                LedgerLens AI is an AI-native document intelligence platform designed to help businesses
                turn unstructured financial paperwork into structured, reviewable information.
              </p>
              <p>
                Modern business operations generate a steady stream of paper, scanned PDFs, and emailed receipts.
                Rather than treating document extraction as a simple text conversion exercise, LedgerLens AI is
                conceived as an end-to-end audit and verification workflow.
              </p>
              <p>
                The platform architecture unites deep document comprehension with deterministic business logic:
                automatically extracting multi-page line items, verifying arithmetic balances, flagging duplicate
                submissions across historical archives, and surfacing variances before transactions reach your general ledger.
              </p>
            </div>

            {/* Workflow Complement Boundary Box */}
            <div className="mt-8 p-4 bg-[#F7F8F6] border-l-2 border-[#176B50] rounded-r-[4px] border-t border-b border-r border-[#E2E6E1]">
              <p className="text-[14px] text-[#202722] font-semibold mb-1">
                Built to support professionals, not replace them.
              </p>
              <p className="text-[13px] text-[#626B64]">
                LedgerLens AI is intentionally designed to augment existing finance, operations, and bookkeeping
                teams. It automates tedious mechanical transcription while keeping authorized human decision-makers
                in complete control of financial approvals and downstream ERP postings.
              </p>
            </div>
          </div>

          {/* Core System Architecture Callout Panel */}
          <div className="lg:col-span-5 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-6 lg:p-7">
            <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#202722] pb-3 border-b border-[#E2E6E1]">
              Proposed Integrated Pipeline
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#202722]">AI-Assisted Extraction & Classification</h4>
                  <p className="text-[13px] text-[#626B64] mt-0.5">
                    Layout-aware neural parsing that separates invoices, receipts, POs, and supplier statements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#202722]">Deterministic Rules & Duplicate Flagging</h4>
                  <p className="text-[13px] text-[#626B64] mt-0.5">
                    Rigorous arithmetic checks, tax calculation validation, and multi-signal duplicate prevention.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#202722]">Cross-Document Comparison & Review</h4>
                  <p className="text-[13px] text-[#626B64] mt-0.5">
                    Side-by-side reconciliation against purchase orders and clean structured export formats (CSV, JSON).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E6E1] text-[12px] text-[#626B64] flex items-center justify-between">
              <span>Platform Stage:</span>
              <span className="font-mono font-medium text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px]">
                Concept Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
