import React, { useEffect, useState } from 'react';
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
  Play,
} from 'lucide-react';
import { DemoVideoModal } from '../components/DemoVideoModal';

export const AboutPage: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    document.title = "About MyLedgerLens | AI-Powered Invoice Intelligence";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        "Meet the founder of MyLedgerLens and learn how AI-powered invoice extraction, deterministic validation, and human review help structure business document data."
      );
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'About MyLedgerLens | AI-Powered Invoice Intelligence');
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Meet the founder of MyLedgerLens and learn how AI-powered invoice extraction, deterministic validation, and human review help structure business document data.'
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
        'MyLedgerLens uses Google Gemini 2.5 Flash to interpret supported invoice documents and extract structured information, including supplier details, invoice numbers, dates, line items, taxes, and totals.',
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
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#E2DFD7]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#F6F5F1] border border-[#DDD7CD] text-[#5A5852]">
                REGISTER // ABOUT
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#1D4ED8]">
                About MyLedgerLens
              </span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-bold tracking-tight text-[#111318] leading-[1.1] mb-6 font-sans">
              Making business documents more useful.
            </h1>

            <p className="text-[17px] sm:text-[19px] text-[#5A5852] leading-relaxed">
              MyLedgerLens helps businesses transform unstructured financial paperwork
              into organized, verifiable information. By combining AI-assisted extraction with structured validation
              and human review, our vision is to make document-heavy workflows simpler and more reliable.
            </p>
          </div>
        </div>
      </section>

      {/* 2. The Problem MyLedgerLens Addresses */}
      <section className="py-16 md:py-20 border-b border-[#E2DFD7] bg-[#FAFAF8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#1D4ED8] font-mono mb-2">
                THE PRACTICAL CONTEXT
              </p>
              <h2 className="text-[26px] sm:text-[32px] font-bold text-[#111318] tracking-tight leading-[1.2]">
                Important business information should not be trapped in paperwork.
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-4 text-[15px] sm:text-[16px] text-[#5A5852] leading-relaxed">
              <p className="text-[#111318] font-medium text-[17px]">
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
      <section className="py-16 md:py-20 border-b border-[#E2DFD7] bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#1D4ED8] font-mono mb-2">
              PRODUCT &amp; TECHNICAL ARCHITECTURE
            </p>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#111318] tracking-tight leading-[1.2]">
              The technology behind MyLedgerLens
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#5A5852] leading-relaxed">
              MyLedgerLens processes documents through a multi-stage architecture that combines semantic visual
              extraction, deterministic arithmetic verification, and transparent human oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologyFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6 flex flex-col justify-between hover:border-[#111318] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#111318]">
                        <Icon className="w-4 h-4 text-[#1D4ED8]" />
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[2px] bg-[#FAFAF8] text-[#5A5852] border border-[#DDD7CD]">
                        {feature.technicalTag}
                      </span>
                    </div>

                    <h3 className="text-[17px] font-bold text-[#111318] mb-2 font-sans">
                      {feature.title}
                    </h3>

                    <p className="text-[13px] text-[#5A5852] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Architecture Summary Card */}
            <div className="bg-[#FAFAF8] border border-[#E2DFD7] rounded-[2px] p-6 flex flex-col justify-between relative">
              <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
              <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-[2px] bg-[#111318] flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[2px] bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30">
                    AUDIT STANDARD
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-[#111318] mb-2 font-sans">
                  No silent modifications
                </h3>
                <p className="text-[13px] text-[#5A5852] leading-relaxed">
                  Extracted values are never silently guessed or modified. Every document retains an immutable original copy,
                  a structured JSON extraction payload, and an explicit log of all arithmetic and consistency checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Current MVP Capabilities */}
      <section className="py-16 md:py-20 border-b border-[#E2DFD7] bg-[#FAFAF8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4938]" />
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#1B4938] font-mono">
                CURRENT STATUS: WORKING MVP
              </p>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#111318] tracking-tight leading-[1.2]">
              From document upload to review-ready data
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#5A5852] leading-relaxed">
              MyLedgerLens is at the working MVP stage, with an invoice-processing workflow designed to extract
              document data, identify potential inconsistencies, and support human review before approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mvpWorkflowSteps.map((item, idx) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[12px] font-bold text-[#111318]">
                        STEP {item.step}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30 font-medium">
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#111318]">
                        <StepIcon className="w-3.5 h-3.5 text-[#1D4ED8]" />
                      </div>
                      <h3 className="text-[15px] font-bold text-[#111318] font-sans">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[13px] text-[#5A5852] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-[2px] bg-[#FFFFFF] border border-[#E2DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#5A5852]">
            <p>
              <strong className="text-[#111318]">Implemented Scope:</strong> Live workflow covers single-invoice upload, Gemini multimodal extraction, arithmetic verification, duplicate detection, human review screens, and CSV export.
            </p>
            <span className="font-mono text-[10px] text-[#1B4938] bg-[#EBF3EE] border border-[#1B4938]/30 px-2.5 py-1 rounded-[2px] self-start sm:self-auto flex-shrink-0 font-medium uppercase">
              VERIFIED IMPLEMENTATION
            </span>
          </div>

          {/* Active Pilot Validation & Benchmarks */}
          <div className="mt-6 p-6 rounded-[2px] bg-[#FFFFFF] border border-[#E2DFD7] space-y-4 shadow-sm relative">
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2DFD7] gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B4938]" />
                <h3 className="text-[16px] font-bold text-[#111318]">
                  Empirical Benchmark &amp; Active Pilot Traction
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#1B4938] bg-[#EBF3EE] px-2.5 py-0.5 rounded-[2px] border border-[#1B4938]/30 font-semibold self-start sm:self-auto uppercase">
                CLOSED BETA PILOTS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] text-[#5A5852]">
              <div className="p-3.5 bg-[#FAFAF8] rounded-[2px] border border-[#E2DFD7]">
                <strong className="text-[#111318] block mb-1 font-sans">50+ Diverse Invoices Benchmarked</strong>
                Tested against logistics manifests, wholesale delivery notes, and multi-currency commercial bills (USD, NGN, EUR).
              </div>
              <div className="p-3.5 bg-[#FAFAF8] rounded-[2px] border border-[#E2DFD7]">
                <strong className="text-[#111318] block mb-1 font-sans">100% Math Verification Precision</strong>
                Zero-tolerance cross-sum verification checks subtotals, statutory tax amounts, and grand totals within 2 cents.
              </div>
              <div className="p-3.5 bg-[#FAFAF8] rounded-[2px] border border-[#E2DFD7]">
                <strong className="text-[#111318] block mb-1 font-sans">Active Design Partner Pilots</strong>
                Currently evaluated by regional wholesale FMCG distributors and independent bookkeeping practices for AP reconciliation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Founder Section */}
      <section className="py-16 md:py-20 border-b border-[#E2DFD7] bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#1D4ED8] font-mono mb-2">
                FOUNDER
              </p>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-[#111318] tracking-tight leading-[1.2]">
                Built by David Osili
              </h2>
              <div className="mt-4 pt-4 border-t border-[#E2DFD7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[2px] bg-[#111318] flex items-center justify-center text-white font-bold text-[14px] font-mono">
                    DO
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#111318]">David Osili</h4>
                    <p className="text-[12px] text-[#5A5852]">Solo Founder &amp; Builder • Lagos, Nigeria</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                      <a
                        href="https://linkedin.com/in/davidosili"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1D4ED8] hover:underline"
                      >
                        LinkedIn Profile →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7]">
                <p className="text-[16px] sm:text-[18px] text-[#111318] leading-relaxed font-medium">
                  "MyLedgerLens is being built by David Osili, a solo founder focused on making business document
                  processing more reliable, structured, and accessible. The product combines AI-powered information
                  extraction with deterministic validation and human review, helping businesses turn unstructured
                  invoices into usable financial data."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#5A5852] leading-relaxed">
                <div className="border-l-2 border-[#111318] pl-4">
                  <h4 className="text-[14px] font-bold text-[#111318] mb-1 font-sans">
                    Hands-On Engineering
                  </h4>
                  <p>
                    David designs and engineers the end-to-end technical stack of MyLedgerLens—from the React/TypeScript
                    front-end application and Supabase multi-tenant backend to the Gemini serverless integration and
                    deterministic arithmetic validation rules.
                  </p>
                </div>

                <div className="border-l-2 border-[#111318] pl-4">
                  <h4 className="text-[14px] font-bold text-[#111318] mb-1 font-sans">
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
      <section className="py-16 md:py-20 border-b border-[#E2DFD7] bg-[#FAFAF8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#1D4ED8] font-mono mb-2">
              INFRASTRUCTURE &amp; CLOUD
            </p>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#111318] tracking-tight leading-[1.2]">
              Cloud infrastructure and development
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#5A5852] leading-relaxed">
              MyLedgerLens is built on practical cloud infrastructure and AI-powered document processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Multimodal AI */}
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6">
              <div className="w-8 h-8 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#111318] mb-4">
                <Cpu className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#111318] mb-2 font-sans">
                Multimodal AI Processing
              </h3>
              <p className="text-[13px] text-[#5A5852] leading-relaxed mb-4">
                Powered by Google Gemini 2.5 Flash for high-speed document understanding, vision processing, and structured schema extraction.
              </p>
              <div className="text-[10px] font-mono text-[#111318] bg-[#FAFAF8] border border-[#DDD7CD] px-2 py-0.5 rounded-[2px] inline-block font-medium">
                GOOGLE GEMINI API
              </div>
            </div>

            {/* Relational Backend & Storage */}
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6">
              <div className="w-8 h-8 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#111318] mb-4">
                <Database className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#111318] mb-2 font-sans">
                PostgreSQL & Object Storage
              </h3>
              <p className="text-[13px] text-[#5A5852] leading-relaxed mb-4">
                Built on Supabase managed infrastructure with multi-tenant Row-Level Security (RLS) policies and encrypted document bucket isolation.
              </p>
              <div className="text-[10px] font-mono text-[#111318] bg-[#FAFAF8] border border-[#DDD7CD] px-2 py-0.5 rounded-[2px] inline-block font-medium">
                SUPABASE PLATFORM
              </div>
            </div>

            {/* Hosting & Serverless Functions */}
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6">
              <div className="w-8 h-8 rounded-[2px] bg-[#FAFAF8] border border-[#DDD7CD] flex items-center justify-center text-[#111318] mb-4">
                <Server className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#111318] mb-2 font-sans">
                Serverless Edge Deployment
              </h3>
              <p className="text-[13px] text-[#5A5852] leading-relaxed mb-4">
                Deployed via Vercel edge infrastructure with serverless execution boundaries, automated branch builds, and strict security headers.
              </p>
              <div className="text-[10px] font-mono text-[#111318] bg-[#FAFAF8] border border-[#DDD7CD] px-2 py-0.5 rounded-[2px] inline-block font-medium">
                VERCEL INFRASTRUCTURE
              </div>
            </div>
          </div>

          {/* Cloud Development Commitment & Portability */}
          <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] p-6 text-[13px] text-[#5A5852] leading-relaxed">
            <h4 className="text-[15px] font-bold text-[#111318] mb-2 font-sans">
              Architecture Portability & Future Ecosystem Support
            </h4>
            <p>
              As MyLedgerLens scales from its working MVP toward wider commercial deployment, the core extraction
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
          <div className="bg-[#FAFAF8] border border-[#E2DFD7] rounded-[2px] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

            <div className="max-w-xl">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#1D4ED8] font-mono mb-2">
                EXPERIENCE THE WORKFLOW
              </p>
              <h2 className="text-[24px] sm:text-[32px] font-bold text-[#111318] tracking-tight leading-snug mb-3">
                See how MyLedgerLens works
              </h2>
              <p className="text-[14px] text-[#5A5852] leading-relaxed">
                Explore the working MVP to see how intelligent extraction, deterministic checks, and human review
                come together in an active document workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[13px] font-bold text-white bg-[#111318] hover:bg-[#1D4ED8] rounded-[2px] transition-colors focus-ring shadow-sm font-mono"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>WATCH DEMO (15S)</span>
              </button>
              <Link
                to="/app"
                className="inline-flex items-center justify-center px-5 py-3.5 text-[13px] font-medium text-[#111318] bg-[#FFFFFF] hover:bg-[#F6F5F1] border border-[#DDD7CD] rounded-[2px] transition-colors focus-ring font-mono"
              >
                <span>OPEN WORKSPACE</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#111318]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Modal */}
      <DemoVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </main>
  );
};