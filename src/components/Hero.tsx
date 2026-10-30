import React, { useState } from 'react';
import { Play, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroIsometricVisual } from './HeroIsometricVisual';
import { DocumentPreview } from './DocumentPreview';
import { DemoVideoModal } from './DemoVideoModal';

export const Hero: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative bg-[#F6F5F1] pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Eyebrow & Headline Block */}
        <div className="max-w-3xl mb-7 sm:mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#1D4ED8] bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 px-2 py-0.5 rounded-[2px] mb-3 sm:mb-4">
            <span>[01 // AUDIT & RECONCILIATION BENCH]</span>
          </div>

          <h1 className="text-[30px] sm:text-[42px] md:text-[46px] lg:text-[52px] font-bold tracking-tight text-[#111318] leading-[1.12] mb-3.5 sm:mb-5">
            Source document to verified ledger. Connected at every decimal.
          </h1>

          <p className="text-[15px] sm:text-[16px] md:text-[17px] text-[#525866] leading-relaxed max-w-2xl mb-5 sm:mb-7">
            MyLedgerLens extracts B2B invoice lines, reconciles multi-item arithmetic, flags term discrepancies,
            and preserves an unbreakable chain of custody from original file bytes to approved CSV records.
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium text-white bg-[#111318] hover:bg-[#20242C] rounded-[3px] transition-colors focus-ring shadow-datum"
            >
              <span>Open Workspace Console</span>
              <ArrowRight className="w-4 h-4 text-[#C5C1B6]" />
            </Link>

            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium text-[#111318] hover:text-[#1D4ED8] bg-[#FFFFFF] border border-[#E2DFD7] hover:border-[#1D4ED8] rounded-[3px] transition-colors shadow-datum"
            >
              <div className="w-4 h-4 rounded-full bg-[#F6F5F1] flex items-center justify-center text-[#1D4ED8]">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>Watch 15-Sec Demo</span>
            </button>
          </div>

          {/* Technical Specifications Guarantee */}
          <div className="pt-4 mt-5 sm:pt-6 sm:mt-6 border-t border-[#E2DFD7] flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-[12px] font-mono text-[#525866]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#15803D]" />
              Sub-pixel coordinate bounding
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#15803D]" />
              Deterministic 2-cent validation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#15803D]" />
              Append-only audit events
            </span>
          </div>
        </div>

        {/* Signature 3D Visual Centerpiece */}
        <div className="mt-6 sm:mt-8 mb-12 sm:mb-16">
          <HeroIsometricVisual />
        </div>

        {/* The Interactive Alignment Surface (Hands-on Product Simulation) */}
        <div id="interactive-bench" className="pt-10 border-t border-[#E2DFD7]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] font-semibold text-[#1D4ED8] uppercase tracking-wider mb-1">
                [02 // REAL-TIME RECONCILIATION SURFACE]
              </div>
              <h2 className="text-[20px] sm:text-[24px] font-bold text-[#111318] tracking-tight">
                Inspect the Live Verification Bench
              </h2>
              <p className="text-[13px] text-[#525866] mt-0.5 max-w-xl">
                Test the interactive bounding-box alignment against our synthetic benchmark invoice. Click any field to inspect coordinate registration and deterministic arithmetic proofs.
              </p>
            </div>
            <div className="font-mono text-[11px] text-[#525866] bg-[#FAFAF8] border border-[#DDD7CD] px-2.5 py-1 rounded-[2px] self-start sm:self-auto">
              SIMULATION BENCH: ACTIVE
            </div>
          </div>
          <DocumentPreview />
        </div>
      </div>

      {/* Product Video Walkthrough Modal */}
      <DemoVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </section>
  );
};
