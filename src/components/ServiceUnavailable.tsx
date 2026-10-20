import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Mail, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { OperatorDiagnostics } from './OperatorDiagnostics';

export const ServiceUnavailable: React.FC = () => {
  const isDev = import.meta.env.DEV;
  const hasDiagnosticsParam = typeof window !== 'undefined' && window.location.search.includes('diagnostics=1');
  const allowDiagnostics = isDev || hasDiagnosticsParam;

  const [showDiagnostics, setShowDiagnostics] = useState(hasDiagnosticsParam || isDev);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-[680px] mx-auto my-8 sm:my-14 p-6 sm:p-9 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] shadow-sm text-center">
      {/* Brand Icon Header */}
      <div className="w-12 h-12 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mx-auto mb-4 border border-[#176B50]/20">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h1 className="text-[22px] sm:text-[24px] font-bold text-[#202722] tracking-tight">
        Service Temporarily Unavailable
      </h1>

      <p className="mt-3 text-[14px] text-[#626B64] leading-relaxed max-w-lg mx-auto">
        The LedgerLens AI application console is undergoing scheduled infrastructure maintenance.
        Existing workspace documents and metadata remain securely archived and unaffected.
      </p>

      {/* Customer Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Again</span>
        </button>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-medium text-[#202722] hover:bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>

        <a
          href="mailto:support@ledgerlens.ai"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-medium text-[#626B64] hover:text-[#202722] hover:bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Support</span>
        </a>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E2E6E1] text-[12px] text-[#626B64] flex items-center justify-between">
        <span>LedgerLens AI Operations Status</span>
        <span className="font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px]">
          Maintenance Gateway
        </span>
      </div>

      {/* Operator Diagnostics (Separated from customer experience) */}
      {allowDiagnostics && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-[11px] font-mono text-[#626B64] hover:text-[#202722] underline flex items-center gap-1 mx-auto"
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
