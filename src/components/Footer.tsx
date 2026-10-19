import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E6E1] py-12 text-[#626B64]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#E2E6E1]">
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 space-y-3">
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
              AI-native business document intelligence. Transforming unstructured invoices, receipts, and purchase
              orders into verified, audit-ready operational records.
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase bg-[#F7F8F6] text-[#626B64] px-2 py-1 rounded-[3px] border border-[#E2E6E1]">
                Technical Stage: Concept & Architecture
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#202722] mb-3">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a
                  href={isAboutPage ? "/#product" : "#product"}
                  className="hover:text-[#202722] transition-colors"
                >
                  Product Capabilities
                </a>
              </li>
              <li>
                <a
                  href={isAboutPage ? "/#how-it-works" : "#how-it-works"}
                  className="hover:text-[#202722] transition-colors"
                >
                  How It Works
                </a>
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
                  href={isAboutPage ? "/#early-access" : "#early-access"}
                  className="hover:text-[#202722] transition-colors"
                >
                  Contact & Early Access
                </a>
              </li>
            </ul>
          </div>

          {/* Architectural Principles Column */}
          <div className="md:col-span-4">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#202722] mb-3">
              Core Principles
            </h4>
            <p className="text-[13px] text-[#626B64] leading-relaxed mb-3">
              Designed around evidence-backed extraction, deterministic arithmetic verification, and transparent human sign-off.
            </p>
            <div className="text-[13px]">
              <span className="text-[#202722] font-medium">Direct Inquiries:</span>{' '}
              <a href="mailto:earlyaccess@ledgerlens.ai" className="text-[#176B50] hover:underline">
                earlyaccess@ledgerlens.ai
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#626B64] gap-4">
          <p>© {new Date().getFullYear()} LedgerLens AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[#626B64]/80">
              Marketing website demonstration • No backend storage active
            </span>
            <Link to="/about" className="hover:text-[#202722] underline">
              About & Roadmap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
