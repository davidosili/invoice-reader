import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Cpu, CheckSquare, UserCheck, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  subtext: string;
  icon: React.ReactNode;
}

const steps: WorkflowStep[] = [
  {
    number: "01",
    title: "Upload",
    description: "Upload a supported invoice document through the existing workspace.",
    subtext: "PDF, PNG, and JPEG formats accepted. Documents are stored in encrypted workspace storage.",
    icon: <UploadCloud className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "02",
    title: "Extract",
    description: "AI identifies invoice details such as supplier, invoice number, dates, line items, taxes, and totals.",
    subtext: "Powered by Google Gemini 2.5 Flash multimodal vision extraction.",
    icon: <Cpu className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "03",
    title: "Validate",
    description: "Deterministic checks identify arithmetic inconsistencies, date issues, and other supported validation concerns.",
    subtext: "Arithmetic cross-sum verification, date sanity checks, and workspace-scoped duplicate detection.",
    icon: <CheckSquare className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "04",
    title: "Review and decide",
    description: "Review extracted fields and flagged issues, correct information where supported, and approve or reject the invoice.",
    subtext: "Approved records can be exported to CSV. Human decision required before any record is finalized.",
    icon: <UserCheck className="w-4 h-4 text-[#176B50]" />
  }
];

export const WorkflowSection: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-[#F7F8F6] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            How It Works
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            From invoice upload to review-ready data
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            LedgerLens AI's working MVP establishes a clean, repeatable path from raw invoice documents
            to structured, validated, and human-reviewed financial records.
          </p>
        </div>

        {/* 4-Step Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-[#E2E6E1] bg-[#FFFFFF] divide-y md:divide-y-0 md:divide-x divide-[#E2E6E1]">
          {steps.map((step) => (
            <div key={step.number} className="p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[22px] font-bold text-[#176B50]">
                    {step.number}
                  </span>
                  <div className="w-7 h-7 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-[18px] font-semibold text-[#202722] mb-2">
                  {step.title}
                </h3>

                <p className="text-[14px] text-[#202722] font-medium leading-relaxed mb-3">
                  {step.description}
                </p>

                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  {step.subtext}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E2E6E1]/60 text-[11px] font-mono text-[#176B50]">
                Step {step.number} • Live in MVP
              </div>
            </div>
          ))}
        </div>

        {/* CSV Export callout + CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px]">
          <div className="flex items-start gap-3 text-[13px] text-[#626B64]">
            <FileSpreadsheet className="w-4 h-4 text-[#176B50] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#202722]">CSV Export:</strong> Approved invoice records can be exported
              to structured CSV files with active protection against formula injection.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#176B50] hover:text-[#12563F] flex-shrink-0"
          >
            Try the workflow
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
