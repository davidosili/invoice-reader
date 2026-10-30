import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { OperatorDiagnostics } from './OperatorDiagnostics';
import { BrandMark } from './BrandLogo';

export const ServiceUnavailable: React.FC = () => {
  const isDev = import.meta.env.DEV;
  const hasDiagnosticsParam = typeof window !== 'undefined' && window.location.search.includes('diagnostics=1');
  const allowDiagnostics = isDev || hasDiagnosticsParam;

  const [showDiagnostics, setShowDiagnostics] = useState(hasDiagnosticsParam || isDev);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-[680px] mx-auto my-8 sm:my-14 p-6 sm:p-9 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[4px] shadow-datum text-center">
      {/* Brand Icon Header */}
      <div className="w-12 h-12 rounded-[3px] bg-[#F6F5F1] flex items-center justify-center text-[#111318] mx-auto mb-4 border border-[#E2DFD7]">
        <BrandMark size="lg" />
      </div>

      <h1 className="text-[20px] sm:text-[22px] font-bold text-[#111318] tracking-tight">
        Service Temporarily Unavailable
      </h1>

      <p className="mt-3 text-[13px] text-[#525866] leading-relaxed max-w-lg mx-auto">
        The MyLedgerLens application console is undergoing scheduled infrastructure maintenance.
        Existing workspace documents and metadata remain securely archived and unaffected.
      </p>

      {/* Customer Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#20242C] rounded-[3px] transition-colors focus-ring shadow-datum"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Again</span>
        </button>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#111318] hover:bg-[#F6F5F1] border border-[#E2DFD7] rounded-[3px] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        <a
          href="mailto:support@myledgerlens.com"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#525866] hover:text-[#111318] hover:bg-[#F6F5F1] border border-[#E2DFD7] rounded-[3px] transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Support</span>
        </a>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E2DFD7] text-[11px] font-mono text-[#525866] flex items-center justify-between">
        <span>MyLedgerLens Operations Status</span>
        <span className="text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-[2px] border border-[#1D4ED8]/20">
          Maintenance Gateway
        </span>
      </div>

      {/* Operator Diagnostics (Separated from customer experience) */}
      {allowDiagnostics && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-[11px] font-mono text-[#525866] hover:text-[#111318] underline flex items-center gap-1 mx-auto"
          >
            {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDiagnostics ? 'Hide Operator Diagnostics' : 'Operator Diagnostics (Developer / Owner Mode)'}
          </button>

          {showDiagnostics && <OperatorDiagnostics />}
        </div>
      )}
    </div>
  );
};
