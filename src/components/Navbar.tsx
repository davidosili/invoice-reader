import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAboutPage = location.pathname === '/about';
  const isPricingPage = location.pathname === '/pricing';
  const isSubPage = location.pathname !== '/';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E2DFD7]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <BrandLogo to="/" onClick={closeMenu} size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] font-medium text-[#525866]">
          <a
            href={isSubPage ? "/#product" : "#product"}
            className="hover:text-[#111318] transition-colors"
          >
            Product
          </a>
          <a
            href={isSubPage ? "/#how-it-works" : "#how-it-works"}
            className="hover:text-[#111318] transition-colors"
          >
            Verification Pipeline
          </a>
          <Link
            to="/pricing"
            className={`transition-colors ${
              isPricingPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${
              isAboutPage ? "text-[#111318] font-semibold" : "hover:text-[#111318]"
            }`}
          >
            About
          </Link>
          <a
            href={isSubPage ? "/#contact" : "#contact"}
            className="hover:text-[#111318] transition-colors"
          >
            Contact
          </a>
          <div className="h-4 w-px bg-[#E2DFD7]" aria-hidden="true" />
          <Link
            to="/app/auth"
            className="hover:text-[#111318] transition-colors font-medium text-[13px]"
          >
            Sign In
          </Link>

          <Link
            to="/app"
            className="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#20242C] rounded-[3px] transition-colors duration-150 focus-ring shadow-datum"
          >
            Open Console
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-2 text-[#111318] border border-[#E2DFD7] rounded-[3px] hover:bg-[#F6F5F1] focus-ring"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E2DFD7] bg-[#FFFFFF] px-4 pt-3 pb-5 space-y-3">
          <a
            href={isSubPage ? "/#product" : "#product"}
            onClick={closeMenu}
            className="block py-2 text-[14px] font-medium text-[#111318] hover:text-[#1D4ED8]"
          >
            Product
          </a>
          <a
            href={isSubPage ? "/#how-it-works" : "#how-it-works"}
            onClick={closeMenu}
            className="block py-2 text-[14px] font-medium text-[#111318] hover:text-[#1D4ED8]"
          >
            Verification Pipeline
          </a>
          <Link
            to="/pricing"
            onClick={closeMenu}
            className={`block py-2 text-[14px] font-medium ${
              isPricingPage ? "text-[#111318] font-bold" : "text-[#525866] hover:text-[#111318]"
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            onClick={closeMenu}
            className={`block py-2 text-[14px] font-medium ${
              isAboutPage ? "text-[#111318] font-bold" : "text-[#525866] hover:text-[#111318]"
            }`}
          >
            About
          </Link>
          <a
            href={isSubPage ? "/#contact" : "#contact"}
            onClick={closeMenu}
            className="block py-2 text-[14px] font-medium text-[#111318] hover:text-[#1D4ED8]"
          >
            Contact
          </a>
          <Link
            to="/app/auth"
            onClick={closeMenu}
            className="block py-2 text-[14px] font-medium text-[#111318] hover:text-[#1D4ED8]"
          >
            Sign In
          </Link>
          <div className="pt-2">
            <Link
              to="/app"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-2.5 text-[14px] font-medium text-white bg-[#111318] hover:bg-[#20242C] rounded-[3px] transition-colors focus-ring"
            >
              Open Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
