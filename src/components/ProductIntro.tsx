import React from 'react';
import { Layers, ShieldAlert, Cpu } from 'lucide-react';

export const ProductIntro: React.FC = () => {
  return (
    <section id="product" className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Editorial Text Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#F6F5F1] border border-[#DDD7CD] text-[#5A5852]">
                REGISTER // 03
              </span>
              <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
                System Architecture
              </p>
            </div>
            <h2 className="text-[30px] sm:text-[38px] font-bold text-[#111318] tracking-tight leading-[1.15] mb-6">
              LedgerLens AI
            </h2>
            <div className="space-y-4 text-[15px] text-[#5A5852] leading-relaxed">
              <p className="text-[17px] text-[#111318] font-medium leading-relaxed">
                LedgerLens AI is an AI-native document intelligence platform that helps businesses
                turn unstructured financial paperwork into structured, reviewable information.
              </p>
              <p>
                LedgerLens AI has a working invoice-processing workflow that uses AI to extract structured information, applies validation checks, and supports human review of potential discrepancies.
              </p>
              <p>
                The platform unites AI-powered document comprehension with deterministic business logic:
                automatically extracting line items, verifying arithmetic balances, flagging duplicate
                submissions, and surfacing discrepancies before records reach downstream review.
              </p>
            </div>

            {/* Workflow Complement Boundary Box */}
            <div className="mt-8 p-4 bg-[#FAFAF8] border-l-2 border-[#111318] rounded-r-[2px] border-t border-b border-r border-[#E2DFD7]">
              <p className="text-[13px] text-[#111318] font-bold mb-1">
                Built to support professionals, not replace them.
              </p>
              <p className="text-[13px] text-[#5A5852]">
                LedgerLens AI is intentionally designed to augment existing finance, operations, and bookkeeping
                teams. It automates tedious mechanical transcription while keeping authorized human decision-makers
                in complete control of financial approvals.
              </p>
            </div>
          </div>

          {/* Core System Architecture Callout Panel */}
          <div className="lg:col-span-5 bg-[#FAFAF8] border border-[#E2DFD7] rounded-[2px] p-6 lg:p-7 relative">
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

            <h3 className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#111318] pb-3 border-b border-[#E2DFD7]">
              WORKING MVP PIPELINE
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[2px] bg-[#111318] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111318]">AI-Assisted Extraction</h4>
                  <p className="text-[13px] text-[#5A5852] mt-0.5">
                    Google Gemini 2.5 Flash extracts supplier details, invoice numbers, line items, taxes, and totals from uploaded documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[2px] bg-[#111318] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111318]">Deterministic Rules & Duplicate Flagging</h4>
                  <p className="text-[13px] text-[#5A5852] mt-0.5">
                    Arithmetic checks, required field validation, and workspace-scoped duplicate detection run on every document.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-[2px] bg-[#111318] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111318]">Human Review & CSV Export</h4>
                  <p className="text-[13px] text-[#5A5852] mt-0.5">
                    Flagged invoices go into a review queue. Operators inspect, correct, approve or reject, and export approved records to CSV.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2DFD7] text-[12px] text-[#5A5852] flex items-center justify-between font-mono">
              <span className="text-[11px] uppercase">PLATFORM STATUS:</span>
              <span className="text-[10px] font-bold text-[#1B4938] bg-[#EBF3EE] border border-[#1B4938]/30 px-2 py-0.5 rounded-[2px]">
                [WORKING MVP]
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
