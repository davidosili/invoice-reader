import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';

export const GetStartedSection: React.FC = () => {
  return (
    <section id="contact" className="bg-[#F6F5F1] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#FFFFFF] border border-[#DDD7CD] text-[#5A5852]">
                REGISTER // 10
              </span>
              <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
                Get Started
              </p>
            </div>
            <h2 className="text-[28px] sm:text-[36px] font-bold text-[#111318] tracking-tight leading-[1.15] mb-4">
              Ready to work with your invoices?
            </h2>
            <p className="text-[15px] text-[#5A5852] leading-relaxed mb-6">
              Explore MyLedgerLens's invoice-processing workflow. Upload a supported document, inspect
              extracted information, review validation issues, and manage invoice decisions through the workspace.
            </p>
            <div className="p-4 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] mb-6">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#5A5852] leading-relaxed">
                  <strong className="text-[#111318]">Account required:</strong> Accessing the application workspace
                  requires authentication. You can sign in with an existing account or register a new account
                  before processing documents.
                </p>
              </div>
            </div>

            <div className="border-t border-[#E2DFD7] pt-6 space-y-3 text-[13px] text-[#5A5852]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4938] flex-shrink-0" />
                <span>Single invoice upload, AI extraction, validation, and review are live in the current MVP</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                <span>
                  Direct team email:{' '}
                  <a
                    href="mailto:support@myledgerlens.com"
                    className="text-[#111318] font-mono font-medium underline hover:text-[#1D4ED8]"
                  >
                    support@myledgerlens.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Action Panel */}
          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6 sm:p-8 shadow-sm relative">
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

            <h3 className="text-[16px] font-bold text-[#111318] pb-4 border-b border-[#E2DFD7] mb-6 uppercase tracking-wider font-mono">
              WORKSPACE ACCESS & INQUIRIES
            </h3>

            <div className="space-y-3 mb-6">
              {/* Primary CTA */}
              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-bold text-white bg-[#111318] hover:bg-[#1D4ED8] rounded-[2px] transition-colors focus-ring"
              >
                OPEN WORKSPACE
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary CTA */}
              <a
                href="mailto:support@myledgerlens.com"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-medium text-[#111318] bg-[#FAFAF8] hover:bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] transition-colors focus-ring"
              >
                <Mail className="w-4 h-4 text-[#5A5852]" />
                Contact the Engineering Team
              </a>
            </div>

            <div className="border-t border-[#E2DFD7] pt-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#5A5852]">Already have an account?</span>
                <Link
                  to="/app/auth"
                  className="font-medium text-[#1D4ED8] hover:text-[#111318] underline font-mono text-[12px]"
                >
                  Sign In to Workspace →
                </Link>
              </div>
              <p className="mt-4 text-[12px] text-[#5A5852] leading-relaxed">
                Contact us at{' '}
                <a
                  href="mailto:support@myledgerlens.com"
                  className="text-[#111318] underline font-medium font-mono"
                >
                  support@myledgerlens.com
                </a>{' '}
                for questions about invoice intelligence capabilities, feedback on the MVP, or technical questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const EarlyAccessSection = GetStartedSection;
