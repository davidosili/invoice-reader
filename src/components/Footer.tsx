import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isSubPage = location.pathname !== '/';
  const isAboutPage = location.pathname === '/about';
  const isPricingPage = location.pathname === '/pricing';
  const isPrivacyPage = location.pathname === '/privacy';
  const isTermsPage = location.pathname === '/terms';

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2DFD7] py-12 text-[#525866]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-10 border-b border-[#E2DFD7]">
          {/* Brand & Mission Column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3.5">
            <BrandLogo to="/" size="sm" />

            <p className="text-[13px] text-[#525866] leading-relaxed max-w-sm">
              AI-native document intelligence and invoice reconciliation platform. Traceable source-to-ledger proof for distributors, wholesalers, and accounting operations.
            </p>

            <div className="pt-1">
              <span className="font-mono text-[10px] tracking-wider uppercase bg-[#F6F5F1] text-[#111318] px-2 py-1 rounded-[2px] border border-[#E2DFD7] font-semibold">
                [PLATFORM STATUS: FUNCTIONAL MVP]
              </span>
            </div>

            <div className="text-[13px] pt-1">
              <span className="text-[#111318] font-medium">Support:</span>{' '}
              <a href="mailto:support@myledgerlens.com" className="text-[#1D4ED8] hover:underline font-mono text-[12px]">
                support@myledgerlens.com
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="sm:col-span-1 md:col-span-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111318] mb-3">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <a
                  href={isSubPage ? "/#product" : "#product"}
                  className="hover:text-[#111318] transition-colors"
                >
                  Product Capabilities
                </a>
              </li>
              <li>
                <a
                  href={isSubPage ? "/#how-it-works" : "#how-it-works"}
                  className="hover:text-[#111318] transition-colors"
                >
                  Verification Pipeline
                </a>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className={`transition-colors ${
                    isPricingPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
                  }`}
                >
                  Proposed Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`transition-colors ${
                    isAboutPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
                  }`}
                >
                  About MyLedgerLens
                </Link>
              </li>
              <li>
                <a
                  href={isSubPage ? "/#contact" : "#contact"}
                  className="hover:text-[#111318] transition-colors"
                >
                  Contact &amp; Pilots
                </a>
              </li>
              <li>
                <Link
                  to="/app/auth"
                  className="hover:text-[#111318] transition-colors"
                >
                  Sign In to Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="sm:col-span-1 md:col-span-2">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111318] mb-3">
              Legal &amp; Policy
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link
                  to="/privacy"
                  className={`transition-colors ${
                    isPrivacyPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
                  }`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`transition-colors ${
                    isTermsPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
                  }`}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className={`transition-colors ${
                    isPricingPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
                  }`}
                >
                  Commercial Model
                </Link>
              </li>
              <li>
                <Link
                  to="/about#security"
                  className="hover:text-[#111318] transition-colors"
                >
                  Security Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Principles Column */}
          <div className="sm:col-span-2 md:col-span-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111318] mb-3">
              Verification Standards
            </h4>
            <p className="text-[12px] text-[#525866] leading-relaxed mb-3">
              Multimodal extraction with Gemini vision models, deterministic arithmetic verification within 2-cent rounding tolerance, and immutable PostgreSQL audit logs.
            </p>
            <div className="p-3 bg-[#F6F5F1] rounded-[3px] border border-[#E2DFD7] text-[11px] font-mono text-[#525866] space-y-1">
              <div>
                <strong className="text-[#111318]">Tenant Isolation:</strong> PostgreSQL RLS policies
              </div>
              <div>
                <strong className="text-[#111318]">Audit Trail:</strong> Append-only event history
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[12px] text-[#525866] gap-4">
          <p>{`© ${new Date().getFullYear()} MyLedgerLens. All rights reserved.`}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a
              href="https://linkedin.com/in/davidosili"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#525866] font-medium hover:text-[#111318] underline transition-colors"
            >
              Built by David Osili
            </a>
            <Link to="/privacy" className="hover:text-[#111318] underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#111318] underline">
              Terms of Service
            </Link>
            <Link to="/pricing" className="hover:text-[#111318] underline">
              Proposed Pricing
            </Link>
            <Link to="/about" className="hover:text-[#111318] underline">
              About &amp; Roadmap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
