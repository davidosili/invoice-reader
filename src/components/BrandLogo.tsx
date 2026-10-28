import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  to?: string;
  onClick?: () => void;
}

export const BrandMark: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const pixelSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      {/* Top-Left Alignment Bracket */}
      <path
        d="M4 14V6C4 4.89543 4.89543 4 6 4H14"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom-Right Alignment Bracket */}
      <path
        d="M28 18V26C28 27.1046 27.1046 28 26 28H18"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Optical Registration Ticks */}
      <line x1="16" y1="5" x2="16" y2="9.5" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="22.5" x2="16" y2="27" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="16" x2="9.5" y2="16" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
      <line x1="22.5" y1="16" x2="27" y2="16" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
      {/* Center Precision Datum Node */}
      <circle cx="16" cy="16" r="3.25" fill="currentColor" />
      <circle cx="16" cy="16" r="1.25" fill="#F6F5F1" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle,
  className = '',
  to,
  onClick,
}) => {
  const textSize =
    size === 'sm'
      ? 'text-[15px]'
      : size === 'lg'
      ? 'text-[20px]'
      : 'text-[17px]';

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none text-[#111318] ${className}`}>
      <BrandMark size={size} />

      {showWordmark && (
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`${textSize} font-semibold tracking-[-0.03em] text-[#111318]`}>
            Ledger<span className="font-normal text-[#525866]">Lens</span>
          </span>
          <span className="font-mono text-[10px] tracking-widest font-semibold uppercase text-[#1D4ED8] bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 px-1 py-0.5 rounded-[2px]">
            AI
          </span>
          {subtitle && (
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-wider uppercase text-[#525866] ml-1 pl-2 border-l border-[#E2DFD7]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
