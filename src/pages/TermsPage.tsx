import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Scale,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | LedgerLens AI';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Read the LedgerLens AI Terms of Service. Understand terms of use, human review requirements, limitations of AI extraction, data responsibilities, and proposed commercial terms.'
      );
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Terms of Service | LedgerLens AI');
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Read the LedgerLens AI Terms of Service. Understand terms of use, human review requirements, limitations of AI extraction, data responsibilities, and proposed commercial terms.'
      );
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-[#FFFFFF] text-[#202722] py-12 md:py-20">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Badge */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[12px] font-mono text-[#626B64] mb-3">
            <Link to="/" className="hover:text-[#176B50] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#176B50] font-semibold">Terms of Service</span>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-[#EDF4EF] border border-[#176B50]/20 text-[#176B50] text-[12px] font-mono font-medium mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Commercial Terms &amp; Conditions</span>
          </div>

          <h1 className="text-[32px] sm:text-[42px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-4">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#626B64] font-mono border-b border-[#E2E6E1] pb-6">
            <div>
              <span className="text-[#202722] font-semibold">Effective Date:</span> October 23, 2026
            </div>
            <div>
              <span className="text-[#202722] font-semibold">Last Updated:</span> October 23, 2026
            </div>
            <div>
              <span className="text-[#202722] font-semibold">Application Stage:</span> MVP Operational Release
            </div>
          </div>
        </div>

        {/* Pre-Launch Verification Notice */}
        <div className="mb-10 p-4 sm:p-5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2">
          <div className="flex items-center gap-2 text-[#176B50] font-semibold text-[13px] uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Important Notice for Evaluators &amp; Business Users</span>
          </div>
          <p className="text-[13px] text-[#626B64] leading-relaxed">
            These Terms of Service govern the use of the LedgerLens AI platform. LedgerLens AI provides assisted document extraction, deterministic validation, and review tooling. It is not an autonomous certified public accountant, licensed auditor, legal adviser, or infallible fraud-prevention system. Commercial decisions, tax filings, and disbursements require independent human verification.
          </p>
        </div>

        {/* Table of Contents */}
        <nav
          aria-label="Table of Contents"
          className="mb-12 p-6 rounded-[6px] bg-[#F7F8F6] border border-[#E2E6E1]"
        >
          <h2 className="text-[14px] font-bold text-[#202722] uppercase tracking-wider font-mono mb-3">
            Table of Contents
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#626B64]">
            <li>
              <a href="#section-1" className="hover:text-[#176B50] hover:underline">
                1. Acceptance &amp; Eligibility
              </a>
            </li>
            <li>
              <a href="#section-2" className="hover:text-[#176B50] hover:underline">
                2. Description of the Service
              </a>
            </li>
            <li>
              <a href="#section-3" className="hover:text-[#176B50] hover:underline">
                3. User Responsibilities &amp; Acceptable Use
              </a>
            </li>
            <li>
              <a href="#section-4" className="hover:text-[#176B50] hover:underline">
                4. AI Output, Probabilistic Accuracy &amp; Human Review
              </a>
            </li>
            <li>
              <a href="#section-5" className="hover:text-[#176B50] hover:underline">
                5. Service Availability &amp; Modifications
              </a>
            </li>
            <li>
              <a href="#section-6" className="hover:text-[#176B50] hover:underline">
                6. Proposed Commercial Model &amp; Billing Status
              </a>
            </li>
            <li>
              <a href="#section-7" className="hover:text-[#176B50] hover:underline">
                7. Suspension, Account Closure &amp; Data Deletion
              </a>
            </li>
            <li>
              <a href="#section-8" className="hover:text-[#176B50] hover:underline">
                8. Limitations of Liability &amp; Disclaimers
              </a>
            </li>
            <li>
              <a href="#section-9" className="hover:text-[#176B50] hover:underline">
                9. Governing Law, Contact &amp; Updates
              </a>
            </li>
          </ol>
        </nav>

        {/* Terms Body */}
        <div className="space-y-12 text-[15px] leading-relaxed text-[#202722]">
          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              1. Acceptance &amp; Eligibility
            </h2>
            <p>
              By accessing, browsing, creating an account on, or otherwise using LedgerLens AI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all terms and conditions set forth herein, you must immediately discontinue use of the platform.
            </p>
            <p>
              <strong>B2B Representation:</strong> LedgerLens AI is designed exclusively for business entities, organizations, commercial enterprises, and professionals acting in their business capacity. By using this service, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[14px] text-[#626B64] pl-2">
              <li>You have the full legal capacity and requisite corporate or organizational authority to bind yourself or the legal entity on whose behalf you are accessing the service.</li>
              <li>You are at least 18 years of age (or the legal age of majority in your jurisdiction).</li>
              <li>You will use the platform strictly for legitimate commercial document-processing workflows in compliance with all applicable local, national, and international laws.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              2. Description of the Service
            </h2>
            <p>
              LedgerLens AI provides software tools to assist businesses in structuring and verifying incoming invoice documents. The platform currently includes the following operational capabilities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                <strong className="text-[#202722]">Document Ingestion:</strong> Secure upload of PDF, PNG, and JPEG documents up to 20MB into private, workspace-isolated cloud storage with magic-byte file signature validation.
              </li>
              <li>
                <strong className="text-[#202722]">AI-Assisted Field Extraction:</strong> Server-side multimodal vision extraction powered by Google Gemini (<code className="text-[#176B50] font-mono">gemini-2.5-flash</code>) or a deterministic server-side heuristic fallback extractor (<code className="text-[#176B50] font-mono">server_heuristic_v1</code>) to capture supplier details, invoice metadata, line items, and totals.
              </li>
              <li>
                <strong className="text-[#202722]">Deterministic Arithmetic Validation:</strong> Strict mathematical checks across line items (<code className="font-mono text-xs">qty × price = line total</code>), subtotal reconciliation, and grand total verification with a strict 0.02 rounding tolerance.
              </li>
              <li>
                <strong className="text-[#202722]">Workspace-Scoped Duplicate Detection:</strong> Automatic comparison of supplier names (with corporate legal suffixes normalized) and invoice reference numbers within your active workspace.
              </li>
              <li>
                <strong className="text-[#202722]">Human Review &amp; Field Correction Console:</strong> Side-by-side inspection tooling allowing authorized operators to review discrepancies, adjust field values, and maintain correction history.
              </li>
              <li>
                <strong className="text-[#202722]">Decision State Machine:</strong> PostgreSQL-enforced lifecycle progression (<code className="font-mono text-xs">uploaded → queued → processing → review_required → approved / rejected</code>).
              </li>
              <li>
                <strong className="text-[#202722]">Append-Only Audit Trail:</strong> Immutable logging of all processing, edit, approval, and rejection events in <code className="font-mono text-xs">invoice_audit_events</code>.
              </li>
              <li>
                <strong className="text-[#202722]">Formula-Safe CSV Export:</strong> Exporting certified, approved invoices with active spreadsheet formula injection mitigation.
              </li>
            </ul>

            <div className="p-4 rounded-[4px] bg-[#EDF4EF] border border-[#176B50]/30 text-[13px] text-[#176B50] space-y-1">
              <strong>Professional Disclaimer:</strong>
              <p>
                LedgerLens AI is a software assistance tool intended to reduce manual data entry and highlight arithmetic inconsistencies. The platform does <strong>not</strong> provide certified accounting, tax, legal, or licensed audit advice. It is not an autonomous fiduciary or certified public accountant. You remain solely responsible for the financial accuracy of your enterprise books, accounts, supplier payments, and statutory filings.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              3. User Responsibilities &amp; Acceptable Use
            </h2>
            <p>
              As a user of LedgerLens AI, you agree to adhere to the following operational standards:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                <strong className="text-[#202722]">Document Rights &amp; Lawful Authority:</strong> You represent and warrant that you hold all necessary rights, licenses, consents, and business authorizations to upload each document submitted to LedgerLens AI, and that doing so does not infringe upon any third-party intellectual property, privacy, or trade secret rights.
              </li>
              <li>
                <strong className="text-[#202722]">Mandatory Human Verification:</strong> You agree to review and verify extracted values, arithmetic flags, and supplier details before authorizing payments, signing checks, or transferring data into downstream accounting and ERP systems.
              </li>
              <li>
                <strong className="text-[#202722]">Credential Protection:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your login session. You must notify us immediately of any unauthorized access.
              </li>
              <li>
                <strong className="text-[#202722]">Spreadsheet &amp; Data Hygiene:</strong> When downloading CSV exports, you agree to exercise appropriate data governance in your downstream spreadsheet and financial software environments.
              </li>
              <li>
                <strong className="text-[#202722]">Prohibited Conduct:</strong> You agree not to:
                <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-[13px] text-[#626B64]">
                  <li>Upload malicious software, executable payloads, macro-enabled attack files, or documents containing unlawful content.</li>
                  <li>Attempt to bypass, test the vulnerability of, or probe the multi-tenant Row Level Security (RLS) boundaries of the database or storage system.</li>
                  <li>Access or attempt to access another customer's or workspace's confidential documents or extractions.</li>
                  <li>Reverse engineer, decompile, or copy the underlying proprietary algorithms or architecture of the platform.</li>
                  <li>Impose an unreasonable or disproportionately large load on our serverless API endpoints or cloud infrastructure.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              4. AI Output, Probabilistic Accuracy &amp; Human Review
            </h2>
            <p>
              To maintain transparency regarding modern multimodal artificial intelligence:
            </p>
            <div className="space-y-3 text-[14px] text-[#626B64]">
              <p>
                <strong className="text-[#202722]">Deterministic Checks vs. Probabilistic AI:</strong> LedgerLens AI combines two distinct calculation approaches:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#F7F8F6]">
                  <h4 className="text-[14px] font-bold text-[#202722] mb-1 font-mono">
                    Deterministic Calculations
                  </h4>
                  <p className="text-[12px] text-[#626B64]">
                    Mathematical checks (such as multiplying line quantity by unit price and summing line totals) are deterministic rule-based computations. If input numbers are accurate, mathematical results are strictly exact.
                  </p>
                </div>
                <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#F7F8F6]">
                  <h4 className="text-[14px] font-bold text-[#202722] mb-1 font-mono">
                    Probabilistic AI Extraction
                  </h4>
                  <p className="text-[12px] text-[#626B64]">
                    Visual layout analysis and text extraction performed by Google Gemini 2.5 Flash are probabilistic. Multimodal models interpret visual tokens and may occasionally misread degraded scans, handwritten notes, or non-standard invoice layouts.
                  </p>
                </div>
              </div>
              <p>
                <strong className="text-[#202722]">No Extraction Accuracy Guarantee:</strong> While LedgerLens AI strives for high fidelity, we make <strong>no representation or warranty</strong> that AI extraction will achieve 100% accuracy, that all duplicate invoices will be identified, or that fraudulent or altered invoices will be detected. The platform is an assistive verification aid, not an autonomous audit system.
              </p>
              <p>
                <strong className="text-[#202722]">Field Confidence Indicators:</strong> Confidence levels (<code className="text-[#176B50] font-mono">high</code>, <code className="text-[#176B50] font-mono">medium</code>, <code className="text-[#176B50] font-mono">review</code>) and bounding-box coordinates presented in the UI are heuristic indicators designed to guide visual inspection. They do not constitute an absolute guarantee that a field is error-free.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              5. Service Availability &amp; Modifications
            </h2>
            <p>
              LedgerLens AI is currently provided on an <strong>"AS-IS"</strong> and <strong>"AS-AVAILABLE"</strong> basis as a technical Minimum Viable Product (MVP):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[14px] text-[#626B64] pl-2">
              <li>We do not warrant that the service will operate uninterrupted, timely, secure, or completely error-free.</li>
              <li>We do not offer a formal Service Level Agreement (SLA), guaranteed uptime percentage, or contracted emergency recovery time objective in the MVP release.</li>
              <li>We reserve the right to deploy updates, enhance validation algorithms, alter serverless API endpoints, or temporarily suspend access for routine maintenance or security upgrades.</li>
              <li>We may discontinue or modify any individual feature at our discretion as the platform evolves toward commercial release.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              6. Proposed Commercial Model &amp; Billing Status
            </h2>
            <p>
              Please review the commercial status of LedgerLens AI carefully:
            </p>
            <div className="p-4 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2 text-[13px] text-[#626B64]">
              <div className="font-semibold text-[#202722] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#176B50]" />
                <span>Proposed Pricing Notice</span>
              </div>
              <p>
                All subscription tiers, document volume allowances, and price figures published on our <Link to="/pricing" className="text-[#176B50] underline font-medium">Pricing Page</Link> represent a <strong>proposed commercial model</strong> for upcoming production launch.
              </p>
              <p>
                <strong>No Active Automated Billing:</strong> The platform does not currently incorporate active payment gateway checkout (e.g., Stripe, Paystack). No credit card information is collected through the website, and no user will be automatically charged or enrolled in a recurring subscription without explicit written agreement and prior consent.
              </p>
              <p>
                Organizations interested in participating in pilot programs or enterprise evaluations may contact <a href="mailto:support@ledgerlens.ai" className="text-[#176B50] underline">support@ledgerlens.ai</a> to discuss bespoke pilot terms and volume arrangements.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              7. Suspension, Account Closure &amp; Data Deletion
            </h2>
            <p>
              We reserve the right to immediately suspend, restrict, or terminate account access to LedgerLens AI, with or without notice, in the event of:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[14px] text-[#626B64] pl-2">
              <li>A material breach of these Terms or suspected fraudulent activity.</li>
              <li>Attempts to bypass multi-tenant security boundaries or exploit application vulnerabilities.</li>
              <li>Requests by law enforcement, regulatory bodies, or applicable government authorities.</li>
              <li>Extended operational inactivity or technical security threats to the platform.</li>
            </ul>
            <p className="text-[14px] text-[#626B64]">
              <strong>Data Deletion Requests:</strong> Because automated self-service account and data deletion workflows are currently in development, users wishing to close an account or permanently expunge workspace files may send a written request to <a href="mailto:support@ledgerlens.ai" className="text-[#176B50] underline">support@ledgerlens.ai</a>.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              8. Limitations of Liability &amp; Disclaimers
            </h2>
            <div className="space-y-3 text-[14px] text-[#626B64]">
              <p>
                <strong>"AS-IS" DISCLAIMER:</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p>
                <strong>LIMITATION OF CONSEQUENTIAL DAMAGES:</strong> IN NO EVENT SHALL LEDGERLENS AI, ITS FOUNDERS, OPERATORS, AFFILIATES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, BUSINESS INTERRUPTION, OVERPAYMENTS MADE TO SUPPLIERS, INCORRECT TAX FILINGS, OR DISCREPANCIES RESULTING FROM UNVERIFIED AI EXTRACTION OR SYSTEM DOWNTIME.
              </p>
              <p>
                <strong>AGGREGATE LIABILITY CAP:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE USE OF THE SERVICE SHALL BE LIMITED TO THE GREATER OF: (A) THE TOTAL AMOUNT PAID BY YOU TO LEDGERLENS AI IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED UNITED STATES DOLLARS ($100 USD).
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              9. Governing Law, Contact &amp; Updates
            </h2>
            <p>
              We reserve the right to revise or update these Terms at any time by publishing the amended version on this page and updating the "Last Updated" date. Continued use of the platform after the publication of revised Terms signifies your binding acceptance.
            </p>

            <div className="p-4 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2 text-[13px] text-[#626B64]">
              <div className="font-semibold text-[#202722] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#176B50]" />
                <span>Pre-Launch Legal Decision Flag</span>
              </div>
              <p>
                Formal choice of law and exclusive dispute-resolution forum designations (<code className="font-mono text-xs">[GOVERNING_JURISDICTION]</code> and <code className="font-mono text-xs">[DISPUTE_FORUM]</code>) are subject to confirmation by qualified legal counsel upon corporate entity registration.
              </p>
            </div>

            <div className="mt-6 p-6 rounded-[6px] border border-[#E2E6E1] bg-[#FFFFFF] space-y-3">
              <h3 className="text-[16px] font-bold text-[#202722]">
                Commercial &amp; Legal Inquiries
              </h3>
              <p className="text-[14px] text-[#626B64]">
                For questions regarding these Terms of Service or commercial evaluation agreements, please contact:
              </p>
              <div className="text-[13px] font-mono space-y-1 text-[#202722] bg-[#F7F8F6] p-4 rounded-[4px] border border-[#E2E6E1]">
                <div>
                  <span className="text-[#626B64]">Project:</span> LedgerLens AI
                </div>
                <div>
                  <span className="text-[#626B64]">Product Owner:</span> David Osili
                </div>
                <div>
                  <span className="text-[#626B64]">Email:</span>{' '}
                  <a href="mailto:support@ledgerlens.ai" className="text-[#176B50] underline">
                    support@ledgerlens.ai
                  </a>
                </div>
                <div>
                  <span className="text-[#626B64]">Entity Name:</span> [LEGAL_ENTITY_NAME — Pending Pre-Launch Incorporation]
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-[#E2E6E1] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <Link
            to="/privacy"
            className="text-[#176B50] font-medium hover:underline inline-flex items-center gap-1.5"
          >
            Review Privacy Policy
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/pricing"
            className="text-[#626B64] hover:text-[#202722] hover:underline"
          >
            Explore Proposed Pricing &amp; Business Model
          </Link>
        </div>
      </div>
    </main>
  );
};
