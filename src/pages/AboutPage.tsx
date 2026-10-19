import React, { useEffect } from 'react';
import { ArrowRight, Shield, Eye, Cpu, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = "About LedgerLens AI | Our Approach to Document Intelligence";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        "Learn about LedgerLens AI's vision for AI-assisted document extraction, structured validation, and more reliable business document workflows."
      );
    }
    window.scrollTo(0, 0);
  }, []);

  const roadmapItems = [
    { title: "Intelligent document extraction", status: "Core Architecture Phase", tag: "Design Stage" },
    { title: "Document classification & sorting", status: "Categorization Pipeline", tag: "Specification" },
    { title: "Structured data validation", status: "Deterministic Rules Engine", tag: "Specification" },
    { title: "Multi-signal duplicate detection", status: "Historical Collision Auditing", tag: "Planned" },
    { title: "Cross-document matching (PO to Invoice)", status: "Reconciliation Protocol", tag: "Planned" },
    { title: "Review and correction operator workflows", status: "Human-in-the-Loop Interface", tag: "Prototype" },
    { title: "Structured exports (CSV, JSON, UBL)", status: "Interoperability Layer", tag: "Planned" },
    { title: "Future accounting & ERP integrations", status: "Ecosystem Connectivity", tag: "Future Roadmap" }
  ];

  return (
    <main className="w-full bg-[#FFFFFF]">
      {/* 7.1 About Hero */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#E2E6E1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
              <span className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50]">
                About LedgerLens AI
              </span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-bold tracking-tight text-[#202722] leading-[1.1] mb-6">
              Making business documents more useful.
            </h1>

            <p className="text-[17px] sm:text-[19px] text-[#626B64] leading-relaxed">
              LedgerLens AI is being developed to help businesses transform unstructured financial paperwork
              into organized, verifiable information. By combining AI-assisted extraction with structured validation
              and human review, our vision is to make document-heavy workflows simpler and more reliable.
            </p>
          </div>
        </div>
      </section>

      {/* 7.2 The Problem We Want to Solve */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-2">
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

      {/* 7.3 Our Approach */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-2">
              Engineering Principles
            </p>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              Built around intelligence, verification, and control.
            </h2>
            <p className="mt-3 text-[15px] text-[#626B64]">
              We adhere to four foundational principles that govern our system architecture and user experience.
            </p>
          </div>

          <div className="border-t border-[#E2E6E1] divide-y divide-[#E2E6E1]">
            {/* Principle 1 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-[18px] font-bold text-[#202722]">
                  AI-native by design
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-[15px] text-[#626B64] leading-relaxed">
                  AI-assisted document understanding and information extraction are central to the proposed product
                  rather than superficial add-ons. Instead of rigid coordinate templates that break whenever a vendor
                  rearranges a layout, our models are designed to understand document semantics, tables, and relationships.
                </p>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-[18px] font-bold text-[#202722]">
                  Verification matters
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-[15px] text-[#626B64] leading-relaxed">
                  Extracted information should be checked against document evidence and relevant validation rules
                  wherever possible. Arithmetic must balance down to the penny, statutory tax formulas must compute
                  correctly, and master vendor registries must confirm account ownership.
                </p>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="text-[18px] font-bold text-[#202722]">
                  Transparency by default
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-[15px] text-[#626B64] leading-relaxed">
                  Uncertain values and potential discrepancies should be visible to users. We explicitly reject
                  opaque algorithms that hallucinate or silently guess ambiguous numbers. If a scan is smudged or a
                  due date deviates from purchase agreements, the system flags it cleanly for inspection.
                </p>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-[18px] font-bold text-[#202722]">
                  Human accountability
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-[15px] text-[#626B64] leading-relaxed">
                  AI supports information processing, while authorized people remain responsible for financial approvals
                  and consequential decisions. LedgerLens AI accelerates the review cycle, but governance and fiduciary
                  authorization remain firmly in human hands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7.4 What We Are Building: Roadmap */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-2">
              Development Roadmap
            </p>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              A foundation for smarter document workflows.
            </h2>
            <p className="mt-3 text-[15px] text-[#626B64] leading-relaxed">
              We distinguish our long-term product vision from work in active technical development. The roadmap below
              outlines the staged capabilities underway as we build the LedgerLens platform.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] divide-y divide-[#E2E6E1] overflow-hidden">
            {roadmapItems.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-[#176B50] font-semibold w-6">
                    {`0${idx + 1}`}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#202722]">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#626B64]">{item.status}</p>
                  </div>
                </div>
                <span className="inline-flex items-center self-start sm:self-auto text-[11px] font-mono font-medium px-2.5 py-1 rounded-[3px] bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[12px] text-[#626B64] italic">
            Roadmap items represent planned milestones. LedgerLens AI is actively undergoing architecture and prototype validation.
          </p>
        </div>
      </section>

      {/* 7.5 Who We Serve */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-2">
              Audience & Sector Focus
            </p>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-[#202722] tracking-tight leading-[1.2]">
              Designed for document-intensive businesses.
            </h2>
            <p className="mt-3 text-[15px] text-[#626B64] leading-relaxed">
              Our initial product engineering is optimized specifically around supplier invoices and related business
              documents, with future iterations tailored for wider transactional paper trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-[#E2E6E1] p-6 rounded-[4px] bg-[#FFFFFF]">
              <span className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px] uppercase font-semibold">
                Primary Focus
              </span>
              <h3 className="text-[18px] font-bold text-[#202722] mt-3 mb-2">
                Distributors and Wholesalers
              </h3>
              <p className="text-[14px] text-[#626B64] leading-relaxed">
                Wholesale businesses receive heavy daily deliveries accompanied by multi-page invoices with numerous
                line items. LedgerLens AI helps parse line-level prices, reconcile shipping quantities against delivery
                receipts, and spot unit discrepancies before invoices are cleared for payment.
              </p>
            </div>

            <div className="border border-[#E2E6E1] p-6 rounded-[4px] bg-[#FFFFFF]">
              <span className="text-[11px] font-mono text-[#626B64] bg-[#F7F8F6] px-2 py-0.5 rounded-[3px] uppercase font-semibold">
                Expansion Sector
              </span>
              <h3 className="text-[18px] font-bold text-[#202722] mt-3 mb-2">
                Accounting and Bookkeeping Firms
              </h3>
              <p className="text-[14px] text-[#626B64] leading-relaxed">
                Practices handling records for dozens of clients struggle with varied document conditions and formats.
                LedgerLens AI provides structured pre-processing that organizes receipts and invoices into consistent
                exportable data prior to client accounting imports.
              </p>
            </div>

            <div className="border border-[#E2E6E1] p-6 rounded-[4px] bg-[#FFFFFF]">
              <span className="text-[11px] font-mono text-[#626B64] bg-[#F7F8F6] px-2 py-0.5 rounded-[3px] uppercase font-semibold">
                Expansion Sector
              </span>
              <h3 className="text-[18px] font-bold text-[#202722] mt-3 mb-2">
                Procurement & Operations Teams
              </h3>
              <p className="text-[14px] text-[#626B64] leading-relaxed">
                Procurement professionals require dependable verification that agreed contract rates match final
                disbursements. The platform is designed to flag payment term shifts and rate modifications automatically.
              </p>
            </div>

            <div className="border border-[#E2E6E1] p-6 rounded-[4px] bg-[#FFFFFF]">
              <span className="text-[11px] font-mono text-[#626B64] bg-[#F7F8F6] px-2 py-0.5 rounded-[3px] uppercase font-semibold">
                Expansion Sector
              </span>
              <h3 className="text-[18px] font-bold text-[#202722] mt-3 mb-2">
                Importers and Growing Businesses
              </h3>
              <p className="text-[14px] text-[#626B64] leading-relaxed">
                Growing organizations that want to maintain rigorous auditability and avoid duplicate payments without
                scaling up administrative back-office headcounts prematurely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7.6 Our Vision */}
      <section className="py-16 md:py-20 border-b border-[#E2E6E1] bg-[#F7F8F6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-2">
              Long-Term Outlook
            </p>
            <h2 className="text-[26px] sm:text-[34px] font-bold text-[#202722] tracking-tight leading-[1.2] mb-6">
              A more intelligent foundation for business operations.
            </h2>
            <div className="space-y-4 text-[16px] text-[#626B64] leading-relaxed">
              <p className="text-[#202722] font-medium text-[17px]">
                Our long-term vision is to help businesses move from fragmented paperwork to organized, traceable,
                and usable information. We believe document intelligence can provide a practical foundation for better
                review processes, more consistent records, and increasingly connected business workflows.
              </p>
              <p>
                As business commerce continues to digitize, the boundary between unstructured physical paper and
                structured digital systems remains the single biggest source of operational slowdown. By making document
                understanding trustworthy, transparent, and auditable, we aim to eliminate that friction entirely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7.7 About Page CTA */}
      <section className="py-16 md:py-20 bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F7F8F6] border border-[#E2E6E1] rounded-[6px] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-[24px] sm:text-[30px] font-bold text-[#202722] tracking-tight leading-snug mb-3">
                Help us build a better way to process business documents.
              </h2>
              <p className="text-[15px] text-[#626B64] leading-relaxed">
                We're developing LedgerLens AI around the real needs of businesses that handle invoices and financial
                paperwork every day. We welcome early conversations with operators and accounting practitioners.
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="/#early-access"
                className="inline-flex items-center justify-center px-6 py-3.5 text-[15px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
              >
                <span>Get Early Access</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
