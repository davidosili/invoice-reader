import React from 'react';
import { Check } from 'lucide-react';

interface ValueItem {
  headline: string;
  explanation: string;
}

const values: ValueItem[] = [
  {
    headline: "Reduce repetitive manual entry",
    explanation:
      "Automate the routine extraction of invoice headers, line-item tables, and tax summaries so operational staff can focus on higher-value vendor relations and reconciliation."
  },
  {
    headline: "Improve the consistency of financial records",
    explanation:
      "Eliminate typographical mistakes, reversed digits, and inconsistent vendor naming conventions through automated reference matching and validation rules."
  },
  {
    headline: "Make document review more organized",
    explanation:
      "Replace ad-hoc email threads and desk piles with an auditable queue that clearly prioritizes pending verifications and tracks approval histories."
  },
  {
    headline: "Identify possible discrepancies earlier",
    explanation:
      "Catch price mismatches, tax miscalculations, and unexpected payment term alterations before invoices are signed off and disbursed."
  },
  {
    headline: "Prepare structured data for downstream workflows",
    explanation:
      "Generate clean, normalized CSV exports formatted for bookkeeping, spreadsheet analysis, and financial reporting workflows."
  },
  {
    headline: "Improve visibility into document-processing tasks",
    explanation:
      "Gain real-time clarity into pending liabilities, document cycle times, and unresolved supplier inquiries without waiting for end-of-month closings."
  }
];

export const BusinessValueSection: React.FC = () => {
  return (
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#F6F5F1] border border-[#DDD7CD] text-[#5A5852]">
              REGISTER // 09
            </span>
            <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
              Business Value
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#111318] tracking-tight leading-[1.15]">
            Spend less time entering data. More time understanding it.
          </h2>
          <p className="mt-4 text-[15px] text-[#5A5852] leading-relaxed">
            Financial paperwork should inform decision-making, not stall it. By modernizing document capture and
            verification, businesses establish a cleaner operational foundation.
          </p>
        </div>

        {/* Editorial Value Layout: Clean 2-Column Grid with Horizontal Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-[#E2DFD7] pt-10">
          {values.map((v, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#1B4938] flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#111318] mb-1 font-sans">
                  {v.headline}
                </h3>
                <p className="text-[13px] text-[#5A5852] leading-relaxed">
                  {v.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
