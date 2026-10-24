import React, { useEffect } from 'react';
import { X, Play, ShieldCheck, Download, ExternalLink } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202722]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FFFFFF] rounded-[8px] shadow-2xl border border-[#E2E6E1] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E6E1] bg-[#F7F8F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[3px] bg-[#176B50] flex items-center justify-center text-white">
              <Play className="w-3 h-3 fill-current" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#202722] tracking-tight flex items-center gap-2">
                LedgerLens AI — Product Walkthrough
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20">
                  Live Working MVP
                </span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#626B64] hover:text-[#202722] hover:bg-[#E2E6E1]/60 transition-colors"
            title="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-[#000000] relative aspect-video flex items-center justify-center overflow-hidden">
          <video
            src="/demo-walkthrough.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Description & Reviewer Highlights */}
        <div className="p-5 bg-[#FFFFFF] border-t border-[#E2E6E1] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E6E1]">
            <div className="flex items-center gap-2 text-[12px] text-[#176B50] font-medium font-mono">
              <ShieldCheck className="w-4 h-4 text-[#176B50]" />
              <span>Verified End-to-End Invoice Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-[12px]">
              <a
                href="/demo-walkthrough.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#176B50] hover:underline font-medium"
              >
                <span>Direct Video Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[#E2E6E1]">|</span>
              <a
                href="/demo-walkthrough.mp4"
                download="ledgerlens-ai-demo.mp4"
                className="inline-flex items-center gap-1 text-[#626B64] hover:text-[#202722] font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-[12px] text-[#626B64]">
            <div className="p-2.5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1]">
              <span className="font-bold text-[#202722] block mb-0.5">1. Multimodal AI Extraction</span>
              Google Gemini vision maps complex tables, vendor headers, and totals into structured JSON.
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1]">
              <span className="font-bold text-[#202722] block mb-0.5">2. Discrepancy Detection</span>
              Flags date mismatches, rounding anomalies, and duplicate invoices before financial disbursement.
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1]">
              <span className="font-bold text-[#202722] block mb-0.5">3. Human Review &amp; CSV Export</span>
              Side-by-side verification console with immutable PostgreSQL audit log and formula-safe CSV export.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
