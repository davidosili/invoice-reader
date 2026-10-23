import React from 'react';
import { Check, AlertTriangle, ArrowRight, ShieldCheck, Crosshair, UserCheck } from 'lucide-react';

export const DifferentiationSection: React.FC = () => {
  return (
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            Core Philosophy
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            More than text extraction. A smarter document workflow.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            Generic OCR tools dump unverified text strings into raw database tables. LedgerLens AI is founded on
            the principle that in finance, accuracy without verification is an operational liability.
          </p>
        </div>

        {/* 3 Principles Editorial Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="border-t-2 border-[#176B50] pt-5">
            <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
              <Crosshair className="w-4 h-4" />
            </div>
            <h3 className="text-[18px] font-bold text-[#202722] mb-2">
              Evidence-Backed Information
            </h3>
            <p className="text-[15px] text-[#626B64] leading-relaxed">
              Where supported, extracted fields should be traceable to their location in the original document,
              making review faster and preserving a verifiable audit trail for every single figure.
            </p>
          </div>

          <div className="border-t-2 border-[#176B50] pt-5">
            <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-[18px] font-bold text-[#202722] mb-2">
              Verification Over Blind Automation
            </h3>
            <p className="text-[15px] text-[#626B64] leading-relaxed">
              Uncertain values, arithmetic discrepancies, and term variances should be flagged explicitly for review
              rather than silently guessed or accepted without confirmation.
            </p>
          </div>

          <div className="border-t-2 border-[#176B50] pt-5">
            <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-[18px] font-bold text-[#202722] mb-2">
              Human-Controlled Decisions
            </h3>
            <p className="text-[15px] text-[#626B64] leading-relaxed">
              AI assists with information processing. Authorized people retain control over financial approvals,
              discrepancy resolutions, and consequential downstream postings.
            </p>
          </div>
        </div>

        {/* Visual Comparison: The Document-to-Verification Lifecycle */}
        <div className="bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#E2E6E1] gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-[#202722]">
                Architectural Trace: Original Invoice to Verified Export
              </h3>
              <p className="text-[13px] text-[#626B64]">
                Demonstrating how a single document flows through extraction, arithmetic audit, and human inspection.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-1 rounded-[3px] self-start sm:self-auto">
              Pipeline Stage: Trace Visualizer
            </span>
          </div>

          {/* 4 Pipeline Stages in Visual Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stage 1: Original Invoice Source */}
            <div className="bg-[#FFFFFF] p-4 border border-[#E2E6E1] rounded-[4px]">
              <div className="text-[11px] font-mono font-semibold text-[#626B64] uppercase mb-2">
                1. Original Source
              </div>
              <div className="border border-dashed border-[#E2E6E1] p-3 text-[11px] bg-[#F7F8F6] space-y-1">
                <p className="font-bold text-[#202722]">Northstar Supplies</p>
                <p className="text-[#626B64]">Invoice #INV-2048</p>
                <p className="text-[#626B64]">Due: 26 Oct 2026 (Net 14)</p>
                <p className="font-mono text-[#202722] font-semibold pt-1 border-t border-[#E2E6E1]">
                  Total: ₦198,875.00
                </p>
              </div>
              <div className="mt-3 text-[11px] text-[#626B64]">
                Raw un-parsed PDF/scan arriving from supplier.
              </div>
            </div>

            {/* Stage 2: Extracted Structured Fields */}
            <div className="bg-[#FFFFFF] p-4 border border-[#E2E6E1] rounded-[4px]">
              <div className="text-[11px] font-mono font-semibold text-[#626B64] uppercase mb-2">
                2. Extracted Fields
              </div>
              <div className="border border-[#E2E6E1] p-3 text-[11px] bg-[#FFFFFF] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#626B64]">Subtotal:</span>
                  <span className="text-[#202722]">₦185,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#626B64]">VAT 7.5%:</span>
                  <span className="text-[#202722]">₦13,875</span>
                </div>
                <div className="flex justify-between font-bold text-[#176B50]">
                  <span>Total:</span>
                  <span>₦198,875</span>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-[#626B64]">
                Structured fields extracted with confidence scoring and layout context.
              </div>
            </div>

            {/* Stage 3: Validation Rules */}
            <div className="bg-[#FFFFFF] p-4 border border-[#E2E6E1] rounded-[4px]">
              <div className="text-[11px] font-mono font-semibold text-[#626B64] uppercase mb-2">
                3. Validation Rules
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#176B50] bg-[#EDF4EF] p-1.5 rounded-[3px]">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium text-[10px]">Math verified: 185k + 13.8k</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#176B50] bg-[#EDF4EF] p-1.5 rounded-[3px]">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium text-[10px]">Required fields present & verified</span>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-[#626B64]">
                Automated deterministic checks passed without error.
              </div>
            </div>

            {/* Stage 4: Field Requiring Review */}
            <div className="bg-[#FFFFFF] p-4 border border-[#A33A32]/40 rounded-[4px]">
              <div className="text-[11px] font-mono font-semibold text-[#A33A32] uppercase mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                4. Field For Review
              </div>
              <div className="border border-[#A33A32]/30 bg-[#A33A32]/5 p-2.5 rounded-[3px] text-[11px] space-y-1">
                <p className="font-bold text-[#A33A32]">Terms & Due Date Flag</p>
                <p className="text-[#626B64] text-[10px] leading-tight">
                  Accelerated payment term (Net 14) flagged for operator verification.
                </p>
                <div className="pt-1 text-[10px] text-[#202722] font-semibold flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-[#A33A32]" />
                  Awaiting Operator Approval
                </div>
              </div>
              <div className="mt-3 text-[11px] text-[#626B64]">
                Uncertainty made transparent. Never silently resolved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
