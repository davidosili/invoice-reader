import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isSubPage = location.pathname !== '/';
  const isAboutPage = location.pathname === '/about';
  const isPricingPage = location.pathname === '/pricing';
  const isPrivacyPage = location.pathname === '/privacy';
  const isTermsPage = location.pathname === '/terms';

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E6E1] py-12 text-[#626B64]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-10 border-b border-[#E2E6E1]">
          {/* Brand & Mission Column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-[3px] bg-[#176B50] flex items-center justify-center text-white">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>
              <span className="text-[16px] font-semibold tracking-tight text-[#202722]">
                LedgerLens<span className="text-[#176B50] font-normal ml-0.5">AI</span>
              </span>
            </Link>

            <p className="text-[14px] text-[#626B64] leading-relaxed max-w-sm">
              AI-native invoice intelligence platform for extracting, validating, and organizing business paperwork.
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase bg-[#EDF4EF] text-[#176B50] px-2 py-1 rounded-[3px] border border-[#176B50]/20 font-semibold">
                Technical status: Working MVP
              </span>
            </div>

            <div className="text-[13px] pt-1">
              <span className="text-[#202722] font-medium">Support:</span>{' '}
              <a href="mailto:support@ledgerlens.ai" className="text-[#176B50] hover:underline">
                support@ledgerlens.ai
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="sm:col-span-1 md:col-span-3">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#202722] mb-3">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a
                  href={isSubPage ? "/#product" : "#product"}
                  className="hover:text-[#202722] transition-colors"
                >
                  Product Capabilities
                </a>
              </li>
              <li>
                <a
                  href={isSubPage ? "/#how-it-works" : "#how-it-works"}
                  className="hover:text-[#202722] transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className={`transition-colors ${
                    isPricingPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
                  }`}
                >
                  Proposed Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`transition-colors ${
                    isAboutPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
                  }`}
                >
                  About LedgerLens AI
                </Link>
              </li>
              <li>
                <a
                  href={isSubPage ? "/#contact" : "#contact"}
                  className="hover:text-[#202722] transition-colors"
                >
                  Contact &amp; Pilots
                </a>
              </li>
              <li>
                <Link
                  to="/app/auth"
                  className="hover:text-[#202722] transition-colors"
                >
                  Sign In to Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="sm:col-span-1 md:col-span-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#202722] mb-3">
              Legal &amp; Policy
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link
                  to="/privacy"
                  className={`transition-colors ${
                    isPrivacyPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
                  }`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`transition-colors ${
                    isTermsPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
                  }`}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className={`transition-colors ${
                    isPricingPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
                  }`}
                >
                  Commercial Model
                </Link>
              </li>
              <li>
                <Link
                  to="/about#security"
                  className="hover:text-[#202722] transition-colors"
                >
                  Security Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Principles Column */}
          <div className="sm:col-span-2 md:col-span-3">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#202722] mb-3">
              Core Principles
            </h4>
            <p className="text-[13px] text-[#626B64] leading-relaxed mb-3">
              Evidence-backed extraction via Google Gemini 2.5 Flash, deterministic arithmetic verification within 2 cents, and transparent human oversight.
            </p>
            <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] text-[12px] text-[#626B64] space-y-1">
              <div>
                <strong className="text-[#202722]">Multi-Tenancy:</strong> PostgreSQL RLS isolation
              </div>
              <div>
                <strong className="text-[#202722]">Audit Trail:</strong> Append-only event logging
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[12px] text-[#626B64] gap-4">
          <p>© {new Date().getFullYear()} LedgerLens AI. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="text-[#626B64]/90 font-medium">
              Built by David Osili
            </span>
            <Link to="/privacy" className="hover:text-[#202722] underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#202722] underline">
              Terms of Service
            </Link>
            <Link to="/pricing" className="hover:text-[#202722] underline">
              Proposed Pricing
            </Link>
            <Link to="/about" className="hover:text-[#202722] underline">
              About &amp; Roadmap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
