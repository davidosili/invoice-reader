import React from 'react';
import { ArrowDownRight } from 'lucide-react';

interface ProblemItem {
  number: string;
  title: string;
  description: string;
  implication: string;
}

const problems: ProblemItem[] = [
  {
    number: "01",
    title: "Repetitive data entry",
    description: "Employees repeatedly transfer supplier names, dates, amounts, and line items into spreadsheets or accounting systems.",
    implication: "Hours drained on mechanical transcription instead of financial analysis."
  },
  {
    number: "02",
    title: "Inconsistent document formats",
    description: "Documents from different suppliers vary drastically in layout, terminology, scan resolution, and structural density.",
    implication: "Rule-based legacy OCR scripts break when layouts shift by even a few pixels."
  },
  {
    number: "03",
    title: "Errors and missing information",
    description: "Incorrect totals, missing purchase order numbers, and inconsistent line items can create compounded reconciliation work.",
    implication: "Downstream ledger pollution requiring expensive manual reversals."
  },
  {
    number: "04",
    title: "Duplicate invoice risk",
    description: "Businesses struggle to identify invoices that appear to have been submitted more than once across dispersed email threads or branches.",
    implication: "Direct financial leakage from duplicate vendor disbursements."
  },
  {
    number: "05",
    title: "Time-consuming verification",
    description: "Comparing invoices against purchase orders, delivery notes, and tax records requires tedious side-by-side manual cross-checking.",
    implication: "Delayed vendor payments, strained supplier credit terms, and missed early-pay discounts."
  },
  {
    number: "06",
    title: "Limited operational visibility",
    description: "Without structured records, it becomes harder to identify unresolved discrepancies, unapproved commitments, and incomplete documentation.",
    implication: "Finance teams operate with retrospective blind spots rather than real-time clarity."
  }
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="bg-[#F6F5F1] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#FFFFFF] border border-[#DDD7CD] text-[#5A5852]">
              REGISTER // 02
            </span>
            <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
              The Operational Bottleneck
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#111318] tracking-tight leading-[1.15]">
            Manual document processing slows business down.
          </h2>
          <p className="mt-4 text-[15px] text-[#5A5852] leading-relaxed">
            Every business document arrives as an isolated fragment of data. When teams rely on manual transcription
            and fragmented email reviews, operational friction compounds rapidly across the entire organization.
          </p>
        </div>

        {/* Editorial Structured Breakdown (avoiding identical cards) */}
        <div className="border-t border-[#E2DFD7]">
          {problems.map((item, index) => (
            <div
              key={item.number}
              className={`py-6 sm:py-8 border-b border-[#E2DFD7] grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start transition-colors duration-150 ${
                index % 2 === 0 ? 'bg-transparent' : 'bg-[#FFFFFF]/70'
              } px-3 sm:px-4`}
            >
              <div className="md:col-span-1">
                <span className="font-mono text-[13px] font-bold text-[#111318]">
                  {item.number}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-[17px] sm:text-[19px] font-bold text-[#111318] tracking-tight">
                  {item.title}
                </h3>
              </div>
              <div className="md:col-span-4">
                <p className="text-[14px] text-[#5A5852] leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="md:col-span-3">
                <div className="flex items-start gap-1.5 text-[12px] text-[#111318] bg-[#FFFFFF] p-2.5 rounded-[2px] border border-[#DDD7CD]">
                  <ArrowDownRight className="w-4 h-4 text-[#C2410C] flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-[#111318] leading-tight">
                    {item.implication}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
