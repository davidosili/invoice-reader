import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAboutPage = location.pathname === '/about';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark & Minimal Document Symbol */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[4px] bg-[#176B50] flex items-center justify-center text-white transition-colors group-hover:bg-[#12563F]">
            <svg
              className="w-4 h-4"
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
          <span className="text-[17px] font-semibold tracking-tight text-[#202722]">
            LedgerLens<span className="text-[#176B50] font-normal ml-1">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-[#626B64]">
          <a
            href={isAboutPage ? "/#product" : "#product"}
            className="hover:text-[#202722] transition-colors font-medium"
          >
            Product
          </a>
          <a
            href={isAboutPage ? "/#how-it-works" : "#how-it-works"}
            className="hover:text-[#202722] transition-colors font-medium"
          >
            How It Works
          </a>
          <Link
            to="/about"
            className={`transition-colors font-medium ${
              isAboutPage ? "text-[#176B50] font-semibold" : "hover:text-[#202722]"
            }`}
          >
            About
          </Link>
          <a
            href={isAboutPage ? "/#early-access" : "#early-access"}
            className="hover:text-[#202722] transition-colors font-medium"
          >
            Contact
          </a>

          <a
            href={isAboutPage ? "/#early-access" : "#early-access"}
            className="inline-flex items-center justify-center px-4 py-2 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors duration-150 focus-ring shadow-none"
          >
            Get Early Access
          </a>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2 text-[#202722] border border-[#E2E6E1] rounded-[4px] hover:bg-[#F7F8F6] focus-ring"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E6E1] bg-[#FFFFFF] px-4 pt-3 pb-5 space-y-3">
          <a
            href={isAboutPage ? "/#product" : "#product"}
            onClick={closeMenu}
            className="block py-2 text-[15px] font-medium text-[#202722] hover:text-[#176B50]"
          >
            Product
          </a>
          <a
            href={isAboutPage ? "/#how-it-works" : "#how-it-works"}
            onClick={closeMenu}
            className="block py-2 text-[15px] font-medium text-[#202722] hover:text-[#176B50]"
          >
            How It Works
          </a>
          <Link
            to="/about"
            onClick={closeMenu}
            className={`block py-2 text-[15px] font-medium ${
              isAboutPage ? "text-[#176B50] font-semibold" : "text-[#202722] hover:text-[#176B50]"
            }`}
          >
            About
          </Link>
          <a
            href={isAboutPage ? "/#early-access" : "#early-access"}
            onClick={closeMenu}
            className="block py-2 text-[15px] font-medium text-[#202722] hover:text-[#176B50]"
          >
            Contact
          </a>
          <div className="pt-2">
            <a
              href={isAboutPage ? "/#early-access" : "#early-access"}
              onClick={closeMenu}
              className="block w-full text-center px-4 py-2.5 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
            >
              Get Early Access
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
