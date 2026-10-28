import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';

type CalloutId = 'source' | 'vectors' | 'discrepancy' | 'ledger';

interface CalloutItem {
  id: CalloutId;
  num: string;
  mobileLabel: string;
  desktopLabel: string;
  badgeClass: string;
  tag: string;
  desc: string;
}

const CALLOUTS: CalloutItem[] = [
  {
    id: 'source',
    num: '01',
    mobileLabel: '01. Invoice',
    desktopLabel: '01. Source Document',
    badgeClass: 'bg-[#111318] text-white border-[#111318]',
    tag: '[01 / PHYSICAL SCAN]',
    desc: 'Realistic ivory invoice sheet showing supplier data, line amounts, and tax breakdowns.',
  },
  {
    id: 'vectors',
    num: '02',
    mobileLabel: '02. Vectors',
    desktopLabel: '02. Alignment Vectors',
    badgeClass: 'bg-[#1D4ED8] text-white border-[#1D4ED8]',
    tag: '[02 / REGISTRATION TRACE]',
    desc: 'Fine cobalt alignment lines trace source coordinates directly to destination ledger fields.',
  },
  {
    id: 'discrepancy',
    num: '03',
    mobileLabel: '03. Mismatch',
    desktopLabel: '03. Variance Flagged',
    badgeClass: 'bg-[#C2410C] text-white border-[#C2410C]',
    tag: '[03 / ANOMALY ISOLATION]',
    desc: 'Restrained vermilion indicator isolating an arithmetic mismatch or contractual variance.',
  },
  {
    id: 'ledger',
    num: '04',
    mobileLabel: '04. Ledger',
    desktopLabel: '04. Structured Ledger',
    badgeClass: 'bg-[#111318] text-white border-[#111318]',
    tag: '[04 / MODULAR LEDGER]',
    desc: 'Engineered charcoal and white modular columns ready for approved CSV export and ERP entry.',
  },
];

export const HeroIsometricVisual: React.FC = () => {
  const [activeCallout, setActiveCallout] = useState<CalloutId | null>(null);

  const activeItem = CALLOUTS.find((c) => c.id === activeCallout);

  return (
    <div className="relative w-full rounded-[4px] border border-[#E2DFD7] bg-[#FFFFFF] shadow-sm overflow-hidden group">
      {/* Precision Datum Corner Ticks */}
      <span className="absolute top-2 left-2 font-mono text-[11px] text-[#A8A49C] pointer-events-none select-none z-20">+</span>
      <span className="absolute top-2 right-2 font-mono text-[11px] text-[#A8A49C] pointer-events-none select-none z-20">+</span>
      <span className="absolute bottom-2 left-2 font-mono text-[11px] text-[#A8A49C] pointer-events-none select-none z-20">+</span>
      <span className="absolute bottom-2 right-2 font-mono text-[11px] text-[#A8A49C] pointer-events-none select-none z-20">+</span>

      {/* Technical Header Strip */}
      <div className="bg-[#FAFAF8] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#E2DFD7] flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] flex-shrink-0" />
          <span className="font-semibold text-[#111318] tracking-wider uppercase whitespace-nowrap">
            <span className="sm:hidden">[01 // RECONCILIATION MATRIX]</span>
            <span className="hidden sm:inline lg:hidden">[01 // ISOMETRIC RECONCILIATION]</span>
            <span className="hidden lg:inline">[PROJECTION // 01: SOURCE-TO-LEDGER ISOMETRIC MATRIX]</span>
          </span>
          <span className="hidden xl:inline text-[#A8A49C]">|</span>
          <span className="hidden xl:inline text-[#5A5852]">
            DIMENSIONAL PROOF
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] flex-shrink-0">
          <span className="hidden xl:inline text-[#5A5852]">COORD: [ISO 30° / 60°]</span>
          <span className="inline-flex items-center gap-1 text-[#C2410C] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded-[2px] font-semibold">
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">MISMATCH ISOLATED</span>
            <span className="sm:hidden">DIFF</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#1B4938] bg-[#EBF3EE] border border-[#1B4938]/30 px-1.5 py-0.5 rounded-[2px] font-semibold">
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">VECTORS CERTIFIED</span>
            <span className="sm:hidden">CERTIFIED</span>
          </span>
        </div>
      </div>

      {/* Main 3D Composition Viewport */}
      <div className="relative bg-[#F6F5F1] p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden">
        {/* Subtle grid background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#111318 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* 
          Responsive Image Container:
          - Mobile (<md): fixed comfortable height (210px-240px) with responsive scale (1.20) and center crop
            to bring the invoice sheet, cobalt vectors, and ledger tray into prominent focus.
          - Desktop (md+): natural aspect ratio container with subtle hover depth.
        */}
        <div className="relative w-full max-w-[1080px] mx-auto h-[210px] sm:h-[250px] md:h-auto overflow-hidden rounded-[2px] border border-[#E2DFD7]/60 shadow-md bg-[#F6F5F1] flex items-center justify-center transition-transform duration-700 ease-out motion-reduce:transform-none transform md:hover:scale-[1.01]">
          <picture className="w-full h-full flex items-center justify-center">
            <source srcSet="/images/hero-reconciliation-3d.webp" type="image/webp" />
            <img
              src="/images/hero-reconciliation-3d.jpg"
              alt="Isometric technical 3D illustration showing a physical invoice document connecting through laser-fine cobalt registration lines to a precision structured ledger tray with a flagged discrepancy"
              width={1376}
              height={768}
              className="w-full h-full md:h-auto object-cover object-center scale-[1.22] sm:scale-[1.08] md:scale-100 transition-transform duration-300 select-none"
              loading="eager"
              decoding="async"
            />
          </picture>

          {/* Mobile Focus Reticle Overlay (Shown when user taps a specific component) */}
          <div className="md:hidden absolute inset-0 pointer-events-none">
            {activeCallout === 'source' && (
              <div className="absolute left-[8%] top-[18%] w-[46%] h-[68%] border-2 border-[#111318]/70 bg-[#111318]/5 rounded-[2px] transition-all" />
            )}
            {activeCallout === 'vectors' && (
              <div className="absolute left-[36%] top-[28%] w-[32%] h-[40%] border-2 border-[#1D4ED8] bg-[#1D4ED8]/10 rounded-[2px] transition-all" />
            )}
            {activeCallout === 'discrepancy' && (
              <div className="absolute left-[62%] top-[40%] w-[18%] h-[26%] border-2 border-[#C2410C] bg-[#C2410C]/15 rounded-[2px] transition-all" />
            )}
            {activeCallout === 'ledger' && (
              <div className="absolute left-[52%] top-[16%] w-[42%] h-[72%] border-2 border-[#111318]/70 bg-[#111318]/5 rounded-[2px] transition-all" />
            )}
          </div>

          {/* Desktop Annotation Hotspots (Hidden on mobile to keep the canvas clean and uncluttered) */}
          <div className="hidden md:block absolute inset-0 pointer-events-none">
            {/* Hotspot 1: Source Document */}
            <div
              className="absolute left-[16%] top-[34%] pointer-events-auto cursor-pointer"
              onMouseEnter={() => setActiveCallout('source')}
              onMouseLeave={() => setActiveCallout(null)}
              onClick={() => setActiveCallout(activeCallout === 'source' ? null : 'source')}
            >
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono shadow-sm transition-colors border border-white/20 ${
                activeCallout === 'source' ? 'bg-[#1D4ED8] text-white' : 'bg-[#111318]/90 text-white hover:bg-[#1D4ED8]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse motion-reduce:animate-none" />
                <span>01. Source Document</span>
              </div>
            </div>

            {/* Hotspot 2: Cobalt Registration Vectors */}
            <div
              className="absolute left-[45%] top-[40%] pointer-events-auto cursor-pointer"
              onMouseEnter={() => setActiveCallout('vectors')}
              onMouseLeave={() => setActiveCallout(null)}
              onClick={() => setActiveCallout(activeCallout === 'vectors' ? null : 'vectors')}
            >
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono shadow-sm transition-colors border border-white/20 ${
                activeCallout === 'vectors' ? 'bg-[#1E40AF] text-white' : 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping motion-reduce:animate-none" />
                <span>02. Alignment Vectors</span>
              </div>
            </div>

            {/* Hotspot 3: Vermilion Discrepancy Anomaly */}
            <div
              className="absolute left-[70%] top-[48%] pointer-events-auto cursor-pointer"
              onMouseEnter={() => setActiveCallout('discrepancy')}
              onMouseLeave={() => setActiveCallout(null)}
              onClick={() => setActiveCallout(activeCallout === 'discrepancy' ? null : 'discrepancy')}
            >
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#C2410C] text-[#FFFFFF] text-[10px] font-mono shadow-sm hover:bg-[#9A3412] transition-colors border border-white/20">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>03. Variance Flagged</span>
              </div>
            </div>

            {/* Hotspot 4: Structured Ledger Tray */}
            <div
              className="absolute left-[78%] top-[65%] pointer-events-auto cursor-pointer"
              onMouseEnter={() => setActiveCallout('ledger')}
              onMouseLeave={() => setActiveCallout(null)}
              onClick={() => setActiveCallout(activeCallout === 'ledger' ? null : 'ledger')}
            >
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono shadow-sm transition-colors border border-white/20 ${
                activeCallout === 'ledger' ? 'bg-[#1D4ED8] text-white' : 'bg-[#111318]/90 text-white hover:bg-[#1D4ED8]'
              }`}>
                <Layers className="w-2.5 h-2.5" />
                <span>04. Structured Ledger</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Mobile Interactive Tap Bar (< md):
        Dedicated 44px-compliant touch controls allowing users to comfortably tap 
        and inspect each stage of the reconciliation without covering the visual.
      */}
      <div className="md:hidden border-t border-[#E2DFD7] bg-[#FAFAF8] px-2.5 py-2">
        <div className="text-[10px] font-mono text-[#5A5852] uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
          <span>Tap to Inspect Component:</span>
          {activeCallout && (
            <button
              type="button"
              onClick={() => setActiveCallout(null)}
              className="text-[#1D4ED8] underline text-[9px]"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {CALLOUTS.map((item) => {
            const isSelected = activeCallout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCallout(isSelected ? null : item.id)}
                className={`min-h-[40px] px-1 py-1.5 rounded-[2px] font-mono text-[10px] leading-tight border transition-all flex flex-col items-center justify-center text-center ${
                  isSelected
                    ? item.badgeClass + ' font-bold shadow-sm'
                    : 'bg-[#FFFFFF] text-[#5A5852] border-[#DDD7CD] hover:border-[#111318] hover:text-[#111318]'
                }`}
                aria-pressed={isSelected}
              >
                <span className="font-bold">{item.num}</span>
                <span className="truncate w-full text-[9px] mt-0.5">
                  {item.id === 'source' ? 'Invoice' : item.id === 'vectors' ? 'Vectors' : item.id === 'discrepancy' ? 'Mismatch' : 'Ledger'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanatory Context Footer Bar */}
      <div className="bg-[#FFFFFF] px-3 sm:px-4 py-2.5 sm:py-3 border-t border-[#E2DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="text-[11px] sm:text-[12px] text-[#5A5852] leading-relaxed min-h-[34px] sm:min-h-0 flex items-center">
          {activeItem ? (
            <span className="font-mono">
              <strong className={activeItem.id === 'discrepancy' ? 'text-[#C2410C]' : activeItem.id === 'vectors' ? 'text-[#1D4ED8]' : 'text-[#111318]'}>
                {activeItem.tag}
              </strong>{' '}
              {activeItem.desc}
            </span>
          ) : (
            <span className="font-mono text-[#5A5852]">
              <strong className="text-[#111318]">CONCEPTUAL SCHEMATIC:</strong> Optical invoice capture decomposes raw paperwork into an immutable, arithmetic-checked accounting record.
            </span>
          )}
        </div>

        <a
          href="#interactive-bench"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[#1D4ED8] hover:text-[#111318] hover:underline whitespace-nowrap self-start sm:self-auto font-medium py-1"
        >
          <span>TEST INTERACTIVE SIMULATION</span>
          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </a>
      </div>
    </div>
  );
};
