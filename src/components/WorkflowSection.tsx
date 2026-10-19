import React from 'react';
import { UploadCloud, Cpu, CheckSquare, FileSpreadsheet } from 'lucide-react';

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
    description: "Provide supported invoices, receipts, purchase orders, and other business documents.",
    subtext: "Batch PDF imports, scanned document captures, or forwarded email attachments.",
    icon: <UploadCloud className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "02",
    title: "Extract",
    description: "AI-assisted processing identifies key fields and organizes information into structured records.",
    subtext: "Vendors, invoice IDs, itemized line tables, tax rates, payment terms, and totals.",
    icon: <Cpu className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "03",
    title: "Validate",
    description: "Validation rules help identify missing fields, inconsistent totals, and possible duplicates.",
    subtext: "Deterministic arithmetic checks, duplicate collision scoring, and PO variance alerts.",
    icon: <CheckSquare className="w-4 h-4 text-[#176B50]" />
  },
  {
    number: "04",
    title: "Review and Export",
    description: "Users inspect flagged information, correct errors, and prepare approved records for export.",
    subtext: "Human-in-the-loop review console leading to clean CSV, JSON, and ERP-ready payloads.",
    icon: <FileSpreadsheet className="w-4 h-4 text-[#176B50]" />
  }
];

export const WorkflowSection: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-[#F7F8F6] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
            Workflow Architecture
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            From scattered paperwork to structured information.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            The proposed LedgerLens AI workflow establishes a clean, repeatable path from raw business documents
            to auditable, verified financial records.
          </p>
        </div>

        {/* 4-Step Sequence (Horizontal on Desktop, Vertical on Mobile) */}
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

              <div className="mt-6 pt-3 border-t border-[#E2E6E1]/60 text-[11px] font-mono text-[#626B64]">
                Step {step.number} • Stage Gateway
              </div>
            </div>
          ))}
        </div>

        {/* Context Disclaimer */}
        <div className="mt-4 text-center">
          <p className="text-[12px] text-[#626B64]">
            Note: This sequence illustrates the proposed product workflow. LedgerLens AI is currently under active design.
          </p>
        </div>
      </div>
    </section>
  );
};
