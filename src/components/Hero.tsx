import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DocumentPreview } from './DocumentPreview';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#FFFFFF] pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Editorial Messaging */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50]">
                AI-Native Document Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[36px] sm:text-[46px] lg:text-[54px] font-bold tracking-tight text-[#202722] leading-[1.08] mb-6">
              Your business documents hold the answers. Let AI find them.
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-[16px] sm:text-[17px] text-[#626B64] leading-relaxed mb-8 max-w-xl">
              LedgerLens AI helps businesses turn invoices into structured, reviewable financial data.
              Extract key details with AI, identify inconsistencies through validation rules, and review
              results before approving records.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <Link
                to="/app"
                className="inline-flex items-center justify-center px-5 py-3 text-[15px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
              >
                Open LedgerLens AI
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-4 py-3 text-[15px] font-medium text-[#202722] hover:text-[#176B50] border border-[#E2E6E1] hover:border-[#176B50] rounded-[4px] transition-colors group bg-[#FFFFFF]"
              >
                <span>Explore How It Works</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Supporting Trust Statement */}
            <div className="pt-6 border-t border-[#E2E6E1] space-y-2">
              <p className="text-[13px] text-[#626B64] font-medium">
                Built for businesses that need better visibility into their financial documents.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#626B64]">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#176B50]" />
                  AI-assisted document extraction
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#176B50]" />
                  Traceable review workflow
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#176B50]" />
                  Human approval for flagged records
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Preview */}
          <div className="lg:col-span-7 lg:pl-4">
            <DocumentPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
