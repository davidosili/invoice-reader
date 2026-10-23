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
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            Business Value
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            Spend less time entering data. More time understanding it.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            Financial paperwork should inform decision-making, not stall it. By modernizing document capture and
            verification, businesses establish a cleaner operational foundation.
          </p>
        </div>

        {/* Editorial Value Layout: Clean 2-Column Grid with Horizontal Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-[#E2E6E1] pt-10">
          {values.map((v, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0 mt-1">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#202722] mb-1.5">
                  {v.headline}
                </h3>
                <p className="text-[14px] text-[#626B64] leading-relaxed">
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
