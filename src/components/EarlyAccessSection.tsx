import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';

export const GetStartedSection: React.FC = () => {
  return (
    <section id="contact" className="bg-[#F7F8F6] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context */}
          <div className="lg:col-span-6">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-3">
              Get Started
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-4">
              Ready to work with your invoices?
            </h2>
            <p className="text-[16px] text-[#626B64] leading-relaxed mb-6">
              Explore LedgerLens AI's invoice-processing workflow. Upload a supported document, inspect
              extracted information, review validation issues, and manage invoice decisions through the workspace.
            </p>
            <div className="p-4 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] mb-6">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#176B50] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  <strong className="text-[#202722]">Account required:</strong> Accessing the application workspace
                  requires authentication. You can sign in with an existing account or register a new account
                  before processing documents.
                </p>
              </div>
            </div>

            <div className="border-t border-[#E2E6E1] pt-6 space-y-3 text-[13px] text-[#626B64]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#176B50] flex-shrink-0" />
                <span>Single invoice upload, AI extraction, validation, and review are live in the current MVP</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#176B50] flex-shrink-0" />
                <span>
                  Direct team email:{' '}
                  <a
                    href="mailto:support@ledgerlens.ai"
                    className="text-[#176B50] font-medium hover:underline"
                  >
                    support@ledgerlens.ai
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Action Panel */}
          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 sm:p-8">
            <h3 className="text-[18px] font-bold text-[#202722] pb-4 border-b border-[#E2E6E1] mb-6">
              Workspace Access & Inquiries
            </h3>

            <div className="space-y-3.5 mb-6">
              {/* Primary CTA */}
              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
              >
                Open LedgerLens AI
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary CTA */}
              <a
                href="mailto:support@ledgerlens.ai"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium text-[#202722] bg-[#FFFFFF] hover:bg-[#F7F8F6] border border-[#E2E6E1] hover:border-[#176B50] rounded-[4px] transition-colors focus-ring"
              >
                <Mail className="w-4 h-4 text-[#176B50]" />
                Contact the Team
              </a>
            </div>

            <div className="border-t border-[#E2E6E1] pt-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#626B64]">Already have an account?</span>
                <Link
                  to="/app/auth"
                  className="font-medium text-[#176B50] hover:text-[#12563F] underline"
                >
                  Sign In to Workspace
                </Link>
              </div>
              <p className="mt-4 text-[12px] text-[#626B64] leading-relaxed">
                Contact us at{' '}
                <a
                  href="mailto:support@ledgerlens.ai"
                  className="text-[#176B50] underline font-medium"
                >
                  support@ledgerlens.ai
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
