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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111318]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FFFFFF] rounded-[2px] shadow-2xl border border-[#DDD7CD] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2DFD7] bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[2px] bg-[#111318] flex items-center justify-center text-white">
              <Play className="w-3 h-3 fill-current" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#111318] tracking-tight flex items-center gap-2 font-sans">
                MyLedgerLens — Product Walkthrough
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[2px] bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30">
                  LIVE WORKING MVP
                </span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[2px] text-[#5A5852] hover:text-[#111318] hover:bg-[#E2DFD7]/60 transition-colors"
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
        <div className="p-5 bg-[#FFFFFF] border-t border-[#E2DFD7] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DFD7]">
            <div className="flex items-center gap-2 text-[11px] text-[#1B4938] font-medium font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#1B4938]" />
              <span>Verified End-to-End Invoice Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-mono">
              <a
                href="/demo-walkthrough.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1D4ED8] hover:underline font-medium"
              >
                <span>Direct Video Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[#DDD7CD]">|</span>
              <a
                href="/demo-walkthrough.mp4"
                download="ledgerlens-ai-demo.mp4"
                className="inline-flex items-center gap-1 text-[#5A5852] hover:text-[#111318] font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-[12px] text-[#5A5852]">
            <div className="p-2.5 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7]">
              <span className="font-bold text-[#111318] block mb-0.5 font-sans">1. Multimodal AI Extraction</span>
              Google Gemini vision maps complex tables, vendor headers, and totals into structured JSON.
            </div>
            <div className="p-2.5 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7]">
              <span className="font-bold text-[#111318] block mb-0.5 font-sans">2. Discrepancy Detection</span>
              Flags date mismatches, rounding anomalies, and duplicate invoices before financial disbursement.
            </div>
            <div className="p-2.5 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7]">
              <span className="font-bold text-[#111318] block mb-0.5 font-sans">3. Human Review &amp; CSV Export</span>
              Side-by-side verification console with immutable PostgreSQL audit log and formula-safe CSV export.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
