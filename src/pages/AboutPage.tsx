import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Cpu,
  Sparkles,
  Calculator,
  UserCheck,
  FileSpreadsheet,
  UploadCloud,
  AlertCircle,
  Database,
  Server,
  Layers,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = "About LedgerLens AI | AI-Powered Invoice Intelligence";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        "Meet the founder of LedgerLens AI and learn how AI-powered invoice extraction, deterministic validation, and human review help structure business document data."
      );
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'About LedgerLens AI | AI-Powered Invoice Intelligence');
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Meet the founder of LedgerLens AI and learn how AI-powered invoice extraction, deterministic validation, and human review help structure business document data.'
      );
    }

    window.scrollTo(0, 0);
  }, []);

  const mvpWorkflowSteps = [
    {
      step: '01',
      title: 'Upload an invoice',
      description: 'Upload supported invoice documents (PDF, PNG, JPEG) directly into encrypted workspace storage.',
      icon: UploadCloud,
      status: 'Live in MVP',
    },
    {
      step: '02',
      title: 'Extract structured data with AI',
      description: 'Google Gemini 2.5 Flash interprets document layout and extracts supplier details, dates, line items, and totals.',
      icon: Sparkles,
      status: 'Live in MVP',
    },
    {
      step: '03',
      title: 'Validate fields and calculations',
      description: 'Deterministic arithmetic checks verify subtotal, taxes, and grand totals with a strict 2-cent rounding tolerance.',
      icon: Calculator,
      status: 'Live in MVP',
    },
    {
      step: '04',
      title: 'Review flagged issues',
      description: 'Calculated discrepancies, missing mandatory fields, and historical workspace duplicates are surfaced for review.',
      icon: AlertCircle,
      status: 'Live in MVP',
    },
    {
      step: '05',
      title: 'Approve or reject the invoice',
      description: 'Human operators inspect side-by-side document views, correct fields if needed, and confirm approvals.',
      icon: UserCheck,
      status: 'Live in MVP',
    },
    {
      step: '06',
      title: 'Export supported structured data',
      description: 'Approved records export into standardized CSV files with active protection against spreadsheet formula injection.',
      icon: FileSpreadsheet,
      status: 'Live in MVP',
    },
  ];

  const technologyFeatures = [
    {
      title: 'AI-powered extraction',
      description:
        'LedgerLens AI uses Google Gemini 2.5 Flash to interpret supported invoice documents and extract structured information, including supplier details, invoice numbers, dates, line items, taxes, and totals.',
      icon: Sparkles,
      technicalTag: 'Multimodal Gemini 2.5 Flash',
    },
    {
      title: 'Deterministic validation',
      description:
        'The platform checks extracted data against defined rules, including arithmetic consistency and date-related issues. The system flags discrepancies for review rather than silently changing source information.',
      icon: Calculator,
      technicalTag: 'Deterministic Rules Engine',
    },
    {
      title: 'Human review',
      description:
        'Invoices requiring attention can be reviewed, corrected, approved, or rejected through the existing review workflow, ensuring human oversight and accountability over financial records.',
      icon: UserCheck,
      technicalTag: 'Human-in-the-Loop Workflow',
    },
    {
      title: 'Structured data and exports',
      description:
        'Approved invoice data can be organized for downstream business use, with CSV export available where supported by the existing implementation.',
      icon: FileSpreadsheet,
      technicalTag: 'Injection-Protected CSV Export',
    },
    {
      title: 'Secure document handling',
      description:
        'Document storage and relational records are managed through Supabase with workspace-scoped Row-Level Security (RLS) and encrypted object storage, restricting access strictly to authenticated workspace members.',
      icon: Shield,
      technicalTag: 'Multi-Tenant Row-Level Security',
    },
  ];

  return (
    <main className="w-full bg-[#FFFFFF]">
      {/* 1. Company Introduction (Hero) */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#E2E6E1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono">
                About LedgerLens AI
              </span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-bold tracking-tight text-[#202722] leading-[1.1] mb-6">
              Making business documents more useful.
            </h1>

            <p className="text-[17px] sm:text-[19px] text-[#626B64] leading-relaxed">
              LedgerLens AI helps businesses transform unstructured financial paperwork
              into organized, verifiable information. By combining AI-assisted extraction with structured validation
              and human review, our vision is to make document-heavy workflows simpler and more reliable.
            </p>
          </div>
        </div>
      </section>

      {/* 2. The Problem LedgerLens AI Addresses */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
                The Practical Context
              </p>
              <h2 className="text-[26px] sm:text-[32px] font-bold text-[#202722] tracking-tight leading-[1.2]">
                Important business information should not be trapped in paperwork.
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-4 text-[15px] sm:text-[16px] text-[#626B64] leading-relaxed">
              <p className="text-[#202722] font-medium text-[17px]">
                In almost every industry, essential operating details are distributed across PDFs, scanned receipts,
                printed delivery manifests, and complex supplier paperwork.
              </p>
              <p>
                Before a finance team can balance a ledger, check a price variance, or confirm an inventory receipt,
                someone must manually read each document, find the key figures, and re-type them into software.
              </p>
              <p>
                This manual transcription is not only tedious; it is inherently fragile. Typography shifts, columns
                run together, vendor formats differ from one supplier to the next, and simple typing errors introduce
                subtle accounting discrepancies that take days to reconcile at the end of the month.
              </p>
              <p>
                We believe that modern artificial intelligence, applied with precision and rigorous validation,
                can fundamentally resolve this friction by turning visual document structures into clean, queryable data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product and Technical Overview */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
              Product & Technical Overview
            </p>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              The technology behind LedgerLens AI
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#626B64] leading-relaxed">
              LedgerLens AI processes documents through a multi-stage architecture that combines semantic visual
              extraction, deterministic arithmetic verification, and transparent human oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologyFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 flex flex-col justify-between hover:border-[#176B50]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] bg-[#F7F8F6] text-[#626B64] border border-[#E2E6E1]">
                        {feature.technicalTag}
                      </span>
                    </div>

                    <h3 className="text-[17px] font-bold text-[#202722] mb-2">
                      {feature.title}
                    </h3>

                    <p className="text-[14px] text-[#626B64] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Architecture Summary Card */}
            <div className="bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20">
                    Auditability Standard
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-[#202722] mb-2">
                  No silent modifications
                </h3>
                <p className="text-[14px] text-[#626B64] leading-relaxed">
                  Extracted values are never silently guessed or modified. Every document retains an immutable original copy,
                  a structured JSON extraction payload, and an explicit log of all arithmetic and consistency checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Current MVP Capabilities */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#176B50]" />
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono">
                Current Status: Working MVP
              </p>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              From document upload to review-ready data
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#626B64] leading-relaxed">
              LedgerLens AI is at the working MVP stage, with an invoice-processing workflow designed to extract
              document data, identify potential inconsistencies, and support human review before approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mvpWorkflowSteps.map((item, idx) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[12px] font-bold text-[#176B50]">
                        STEP {item.step}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20 font-medium">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-[3px] bg-[#F7F8F6] border border-[#E2E6E1] flex items-center justify-center text-[#202722]">
                        <StepIcon className="w-4 h-4 text-[#176B50]" />
                      </div>
                      <h3 className="text-[15px] font-bold text-[#202722]">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[13px] text-[#626B64] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-[4px] bg-[#FFFFFF] border border-[#E2E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#626B64]">
            <p>
              <strong className="text-[#202722]">Implemented Scope:</strong> Live workflow covers single-invoice upload, Gemini multimodal extraction, arithmetic verification, duplicate detection, human review screens, and CSV export.
            </p>
            <span className="font-mono text-[11px] text-[#176B50] bg-[#EDF4EF] px-2.5 py-1 rounded-[3px] self-start sm:self-auto flex-shrink-0 font-medium">
              Verified Implementation
            </span>
          </div>
        </div>
      </section>

      {/* 5. Founder Section */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
                FOUNDER
              </p>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-[#202722] tracking-tight leading-[1.2]">
                Built by David Osili
              </h2>
              <div className="mt-4 pt-4 border-t border-[#E2E6E1]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#176B50] flex items-center justify-center text-white font-bold text-[14px]">
                    DO
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#202722]">David Osili</h4>
                    <p className="text-[12px] text-[#626B64]">Solo Founder & Builder</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-[6px] bg-[#F7F8F6] border border-[#E2E6E1]">
                <p className="text-[16px] sm:text-[18px] text-[#202722] leading-relaxed font-medium">
                  "LedgerLens AI is being built by David Osili, a solo founder focused on making business document
                  processing more reliable, structured, and accessible. The product combines AI-powered information
                  extraction with deterministic validation and human review, helping businesses turn unstructured
                  invoices into usable financial data."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px] text-[#626B64] leading-relaxed">
                <div className="border-l-2 border-[#176B50] pl-4">
                  <h4 className="text-[15px] font-bold text-[#202722] mb-1">
                    Hands-On Engineering
                  </h4>
                  <p>
                    David designs and engineers the end-to-end technical stack of LedgerLens AI—from the React/TypeScript
                    front-end application and Supabase multi-tenant backend to the Gemini serverless integration and
                    deterministic arithmetic validation rules.
                  </p>
                </div>

                <div className="border-l-2 border-[#176B50] pl-4">
                  <h4 className="text-[15px] font-bold text-[#202722] mb-1">
                    Pragmatic Product Focus
                  </h4>
                  <p>
                    Rather than building broad autonomous claims, the focus is squarely on solving real operational
                    headaches: eliminating manual data entry errors, spotting vendor discrepancies, and preserving full
                    auditability for business finance operators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Cloud Infrastructure & Development Section */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
              Infrastructure & Cloud
            </p>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              Cloud infrastructure and development
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#626B64] leading-relaxed">
              LedgerLens AI is built on practical cloud infrastructure and AI-powered document processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Multimodal AI */}
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6">
              <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-[16px] font-bold text-[#202722] mb-2">
                Multimodal AI Processing
              </h3>
              <p className="text-[13px] text-[#626B64] leading-relaxed mb-4">
                Powered by Google Gemini 2.5 Flash for high-speed document understanding, vision processing, and structured schema extraction.
              </p>
              <div className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px] inline-block font-medium">
                Google Gemini API
              </div>
            </div>

            {/* Relational Backend & Storage */}
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6">
              <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-[16px] font-bold text-[#202722] mb-2">
                PostgreSQL & Object Storage
              </h3>
              <p className="text-[13px] text-[#626B64] leading-relaxed mb-4">
                Built on Supabase managed infrastructure with multi-tenant Row-Level Security (RLS) policies and encrypted document bucket isolation.
              </p>
              <div className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px] inline-block font-medium">
                Supabase Managed Platform
              </div>
            </div>

            {/* Hosting & Serverless Functions */}
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6">
              <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] mb-4">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-[16px] font-bold text-[#202722] mb-2">
                Serverless Edge Deployment
              </h3>
              <p className="text-[13px] text-[#626B64] leading-relaxed mb-4">
                Deployed via Vercel edge infrastructure with serverless execution boundaries, automated branch builds, and strict security headers.
              </p>
              <div className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px] inline-block font-medium">
                Vercel Serverless Architecture
              </div>
            </div>
          </div>

          {/* Cloud Development Commitment & Portability */}
          <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 text-[14px] text-[#626B64] leading-relaxed">
            <h4 className="text-[15px] font-bold text-[#202722] mb-2">
              Architecture Portability & Future Ecosystem Support
            </h4>
            <p>
              As LedgerLens AI scales from its working MVP toward wider commercial deployment, the core extraction
              and validation pipeline is intentionally designed for high portability. Technical capabilities and storage
              layers are structured to leverage mainstream enterprise cloud ecosystems, including Google Cloud and
              Amazon Web Services (AWS), as workload volume and compute requirements grow.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Existing Call to Action (CTA) */}
      <section className="py-16 md:py-20 bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
                Experience the Product
              </p>
              <h2 className="text-[24px] sm:text-[32px] font-bold text-[#202722] tracking-tight leading-snug mb-3">
                See how LedgerLens AI works
              </h2>
              <p className="text-[15px] text-[#626B64] leading-relaxed">
                Explore the working MVP to see how intelligent extraction, deterministic checks, and human review
                come together in an active document workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <Link
                to="/app"
                className="inline-flex items-center justify-center px-6 py-3.5 text-[15px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
              >
                <span>Open LedgerLens AI</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center px-5 py-3.5 text-[15px] font-medium text-[#202722] bg-[#FFFFFF] hover:bg-[#EDF4EF] border border-[#E2E6E1] rounded-[4px] transition-colors focus-ring"
              >
                Contact the Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};