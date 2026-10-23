import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Mail,
  ArrowRight,
  Calculator,
  Layers,
  Users,
  Cpu,
  Info,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Pricing & Commercial Model | LedgerLens AI';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Transparent, predictable proposed pricing for B2B invoice intelligence. Explore proposed plans for distributors, accounting firms, and finance teams.'
      );
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Pricing & Commercial Model | LedgerLens AI');
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Transparent, predictable proposed pricing for B2B invoice intelligence. Explore proposed plans for distributors, accounting firms, and finance teams.'
      );
    }
    window.scrollTo(0, 0);
  }, []);

  const proposedTiers = [
    {
      name: 'Starter',
      badge: 'Evaluation & Small Teams',
      isPopular: false,
      proposedPrice: '$49',
      billingPeriod: 'per month (proposed)',
      currencyNote: 'USD (Proposed baseline)',
      targetDescription:
        'Designed for small commercial businesses and finance operators evaluating automated invoice data extraction and review workflows.',
      documentAllowance: 'Up to 100 invoices / month (proposed)',
      liveFeatures: [
        'Single invoice upload (PDF, PNG, JPEG up to 20MB)',
        'Google Gemini 2.5 Flash multimodal vision extraction',
        'Deterministic arithmetic validation (subtotals, tax rates, grand totals)',
        'Workspace duplicate invoice detection',
        'Human review & field correction console',
        'Formula-injection-safe CSV export of approved records',
        '1 isolated workspace with member roles',
        'Resilient local heuristic OCR fallback',
      ],
      plannedFeatures: [],
      ctaText: 'Explore the MVP Workspace',
      ctaHref: '/app/auth',
      ctaType: 'internal',
    },
    {
      name: 'Business',
      badge: 'Recommended for Regular Workloads',
      isPopular: true,
      proposedPrice: '$149',
      billingPeriod: 'per month (proposed)',
      currencyNote: 'USD (Proposed baseline)',
      targetDescription:
        'Built for wholesale distributors, logistics operators, and growing companies processing recurring supplier invoices every week.',
      documentAllowance: 'Up to 500 invoices / month (proposed)',
      liveFeatures: [
        'All Starter plan features included',
        'Multi-user shared workspace with role permissions (owner, member, reviewer)',
        'Side-by-side document review with bounding-box highlights',
        'Immutable, append-only audit trail logging (invoice_audit_events)',
        'Deterministic state machine governance (uploaded → approved / rejected)',
        'Priority processing queue',
      ],
      plannedFeatures: [
        'Batch multi-file upload queue (Planned)',
        'Cross-document 2-way Purchase Order matching (Roadmap)',
      ],
      ctaText: 'Inquire About Pilot Program',
      ctaHref: 'mailto:support@ledgerlens.ai?subject=LedgerLens%20Business%20Pilot%20Inquiry',
      ctaType: 'email',
    },
    {
      name: 'Professional',
      badge: 'High-Volume & Accounting Firms',
      isPopular: false,
      proposedPrice: '$399',
      billingPeriod: 'per month (proposed)',
      currencyNote: 'USD (Proposed baseline)',
      targetDescription:
        'Designed for accounting firms managing client portfolios, high-volume importers, and enterprise accounts-payable operations.',
      documentAllowance: 'Up to 2,000+ invoices / month (custom volume available)',
      liveFeatures: [
        'All Business plan features included',
        'Multi-workspace management for client accounting portfolios',
        'High-concurrency document processing capacity',
        'Formula-safe CSV export with custom column mapping options',
        'Extended audit trail export for compliance reviews',
      ],
      plannedFeatures: [
        'Direct accounting software sync (QuickBooks Online, Xero) (Roadmap)',
        'Automated 3-way matching (Invoice vs. PO vs. Goods Received) (Roadmap)',
        'Dedicated API access & webhook notifications (Planned)',
      ],
      ctaText: 'Request Commercial Consultation',
      ctaHref: 'mailto:support@ledgerlens.ai?subject=LedgerLens%20Professional%20Inquiry',
      ctaType: 'email',
    },
  ];

  const targetWorkloads = [
    {
      title: 'Distributors & Wholesalers',
      role: 'High-volume recurring supplier orders',
      description:
        'Receive hundreds of multi-item supplier packing lists and manifests each month. LedgerLens AI extracts supplier TINs, checks arithmetic consistency, and catches identical duplicate invoice numbers before payment approval.',
    },
    {
      title: 'Accounts-Payable Teams',
      role: 'Operational payment verification',
      description:
        'Eliminate tedious line-by-line manual spreadsheet entry. Reviewers inspect highlighted bounding boxes, correct discrepancies in seconds, and maintain an immutable audit trail for internal controls.',
    },
    {
      title: 'Accounting & Bookkeeping Firms',
      role: 'Client paperwork preparation',
      description:
        'Transform diverse client invoices and receipts into standardized structured records. Clean, formula-injection-safe CSV exports make downstream bookkeeping reconciliation faster and more predictable.',
    },
    {
      title: 'Growing Commercial Enterprises',
      role: 'Scaling finance operations',
      description:
        'Scale invoice verification as operational volume grows without linearly increasing administrative overhead or sacrificing financial oversight.',
    },
  ];

  return (
    <main className="bg-[#FFFFFF] text-[#202722] py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Badges */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-[12px] font-mono text-[#626B64] mb-3">
            <Link to="/" className="hover:text-[#176B50] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#176B50] font-semibold">Pricing</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#EDF4EF] border border-[#176B50]/20 text-[#176B50] text-[12px] font-mono font-medium mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Commercial Model &amp; Proposed Plans</span>
          </div>

          <h1 className="text-[32px] sm:text-[44px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-4">
            Transparent, Predictable Invoice Intelligence
          </h1>

          <p className="text-[16px] text-[#626B64] leading-relaxed">
            Positioned for businesses handling recurring supplier paperwork. Built around predictable monthly processing volume, evidence-backed AI extraction, and deterministic financial verification.
          </p>
        </div>

        {/* Commercial Status Transparency Notice */}
        <div className="max-w-4xl mx-auto mb-14 p-5 rounded-[6px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2">
          <div className="flex items-center gap-2 text-[#176B50] font-semibold text-[13px] uppercase tracking-wider font-mono">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Notice on Commercial Stage &amp; Proposed Pricing</span>
          </div>
          <p className="text-[13px] text-[#626B64] leading-relaxed">
            LedgerLens AI is currently operating as a working technical Minimum Viable Product (MVP). The tiers, document allowances, and pricing figures below represent our <strong>proposed commercial model</strong> for upcoming commercial launch. The application does not currently process active credit card transactions, and no recurring charges will be incurred. Organizations interested in participating in our structured pilot program are invited to explore the working MVP or contact our team directly.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {proposedTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[6px] flex flex-col justify-between transition-all ${
                tier.isPopular
                  ? 'border-2 border-[#176B50] bg-[#FFFFFF] shadow-md relative'
                  : 'border border-[#E2E6E1] bg-[#FFFFFF]'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#176B50] text-white text-[11px] font-mono font-semibold uppercase tracking-wider px-3 py-0.5 rounded-[3px]">
                  Proposed Flagship
                </div>
              )}

              <div className="p-6 sm:p-7 flex-grow">
                {/* Tier Header */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[22px] font-bold text-[#202722]">
                    {tier.name}
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-[3px] bg-[#F7F8F6] border border-[#E2E6E1] text-[#626B64]">
                    {tier.badge}
                  </span>
                </div>

                <p className="text-[13px] text-[#626B64] leading-relaxed mb-6">
                  {tier.targetDescription}
                </p>

                {/* Price Display */}
                <div className="border-y border-[#E2E6E1] py-5 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[36px] font-bold text-[#202722] tracking-tight">
                      {tier.proposedPrice}
                    </span>
                    <span className="text-[13px] text-[#626B64] font-mono">
                      {tier.billingPeriod}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#626B64] font-mono mt-1">
                    Currency: {tier.currencyNote}
                  </div>
                </div>

                {/* Allowance */}
                <div className="mb-6 p-3 rounded-[4px] bg-[#EDF4EF] border border-[#176B50]/20 text-[12px] text-[#176B50] font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4 flex-shrink-0" />
                  <span>Proposed Allowance: <strong>{tier.documentAllowance}</strong></span>
                </div>

                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#202722] font-semibold">
                    Live MVP Capabilities
                  </div>
                  <ul className="space-y-2 text-[13px] text-[#626B64]">
                    {tier.liveFeatures.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#176B50] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.plannedFeatures.length > 0 && (
                    <div className="pt-3 border-t border-[#E2E6E1] space-y-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#626B64] font-semibold">
                        Planned / Roadmap
                      </div>
                      <ul className="space-y-1.5 text-[12px] text-[#626B64]">
                        {tier.plannedFeatures.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 italic">
                            <span className="text-[#176B50] font-bold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="p-6 pt-0 border-t border-[#E2E6E1] mt-auto">
                <div className="pt-5">
                  {tier.ctaType === 'internal' ? (
                    <Link
                      to={tier.ctaHref}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
                    >
                      {tier.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={tier.ctaHref}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium text-[#202722] bg-[#FFFFFF] hover:bg-[#F7F8F6] border border-[#E2E6E1] hover:border-[#176B50] rounded-[4px] transition-colors focus-ring"
                    >
                      <Mail className="w-4 h-4 text-[#176B50]" />
                      {tier.ctaText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Business Model & Unit Economics Explanation */}
        <section className="mb-20 rounded-[6px] border border-[#E2E6E1] bg-[#F7F8F6] p-8 sm:p-10">
          <div className="max-w-3xl mb-8">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
              Business Model &amp; Economics
            </p>
            <h2 className="text-[24px] sm:text-[30px] font-bold text-[#202722] tracking-tight">
              How LedgerLens AI Structures Commercial Value
            </h2>
            <p className="mt-2 text-[14px] text-[#626B64] leading-relaxed">
              We believe business software pricing should reflect underlying computational realities and actual operational value rather than opaque arbitrary markups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px]">
            <div className="p-5 rounded-[4px] bg-[#FFFFFF] border border-[#E2E6E1] space-y-2">
              <div className="flex items-center gap-2 text-[#202722] font-bold text-[14px]">
                <Cpu className="w-4 h-4 text-[#176B50]" />
                <h3>Multimodal AI Processing</h3>
              </div>
              <p className="text-[#626B64] leading-relaxed">
                Each document uploaded requires multimodal image analysis through Google Gemini 2.5 Flash, consuming visual input tokens and structured JSON generation. Monthly allowances ensure predictable operational margins without unexpected overage bills.
              </p>
            </div>

            <div className="p-5 rounded-[4px] bg-[#FFFFFF] border border-[#E2E6E1] space-y-2">
              <div className="flex items-center gap-2 text-[#202722] font-bold text-[14px]">
                <Calculator className="w-4 h-4 text-[#176B50]" />
                <h3>Deterministic Verification</h3>
              </div>
              <p className="text-[#626B64] leading-relaxed">
                Unlike pure OCR scanners, LedgerLens AI validates arithmetic across every line item, matches workspace supplier histories, and enforces state machine integrity, catching billing errors before invoices reach your ledger.
              </p>
            </div>

            <div className="p-5 rounded-[4px] bg-[#FFFFFF] border border-[#E2E6E1] space-y-2">
              <div className="flex items-center gap-2 text-[#202722] font-bold text-[14px]">
                <Users className="w-4 h-4 text-[#176B50]" />
                <h3>Human-in-the-Loop Value</h3>
              </div>
              <p className="text-[#626B64] leading-relaxed">
                The primary economic benefit is eliminating manual data re-keying while retaining full human control and immutable audit accountability for compliance, tax audits, and supplier dispute defense.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-[4px] bg-[#FFFFFF] border border-[#E2E6E1] text-[12px] text-[#626B64] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-[#202722]">Reconciliation Notice:</span> Document-processing allowances, AI token costs, file-size limits (currently 20MB), and plan economics will be finalized following pilot evaluation before active payment billing is introduced.
            </div>
            <div className="font-mono text-[#176B50] flex-shrink-0">
              Pilot Stage: Active
            </div>
          </div>
        </section>

        {/* Target B2B Workloads */}
        <section className="mb-20">
          <div className="max-w-2xl mb-10">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono mb-2">
              Workload Fit
            </p>
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#202722] tracking-tight">
              Designed for Recurring Invoice Operations
            </h2>
            <p className="mt-2 text-[15px] text-[#626B64]">
              LedgerLens AI is positioned specifically for commercial workflows where paperwork volume creates operational drag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {targetWorkloads.map((workload) => (
              <div
                key={workload.title}
                className="p-6 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]"
              >
                <div className="text-[11px] font-mono text-[#176B50] uppercase tracking-wider mb-1 font-semibold">
                  {workload.role}
                </div>
                <h3 className="text-[18px] font-bold text-[#202722] mb-2">
                  {workload.title}
                </h3>
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  {workload.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Commercial FAQs */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-[24px] sm:text-[30px] font-bold text-[#202722] tracking-tight">
              Frequently Asked Commercial Questions
            </h2>
            <p className="mt-1 text-[14px] text-[#626B64]">
              Clear answers regarding our commercial model, billing status, and pilot participation.
            </p>
          </div>

          <div className="space-y-4 text-[14px]">
            <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
              <h3 className="font-bold text-[#202722] mb-1.5">
                Can I purchase a paid subscription on the website today?
              </h3>
              <p className="text-[#626B64] leading-relaxed">
                No. LedgerLens AI is currently operating as a functional technical MVP. Payment processing (credit card checkouts, subscriptions) is not yet active. You can register for an account and evaluate the working application at no cost during this phase.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
              <h3 className="font-bold text-[#202722] mb-1.5">
                What currencies will be supported when commercial billing launches?
              </h3>
              <p className="text-[#626B64] leading-relaxed">
                Our proposed baseline pricing is denominated in United States Dollars (USD). Because our initial target market includes West African and international distribution networks, we are evaluating localized billing arrangements (including Nigerian Naira [NGN]) prior to full commercial checkout rollout.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
              <h3 className="font-bold text-[#202722] mb-1.5">
                What happens if our invoice volume exceeds the proposed allowance?
              </h3>
              <p className="text-[#626B64] leading-relaxed">
                During pilot evaluations, document allowances are advisory parameters to guide capacity modeling. In the commercial release, accounts will have options to seamlessly upgrade tiers or establish custom high-volume enterprise agreements.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
              <h3 className="font-bold text-[#202722] mb-1.5">
                Are our commercial invoices or extracted financial figures used to train AI models?
              </h3>
              <p className="text-[#626B64] leading-relaxed">
                No. LedgerLens AI does not use customer documents or extracted financial data for foundation model training or commercial profiling. Data is processed strictly to extract structured fields into your isolated workspace. See our <Link to="/privacy" className="text-[#176B50] underline">Privacy Policy</Link> for detailed third-party processor disclosures.
              </p>
            </div>

            <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
              <h3 className="font-bold text-[#202722] mb-1.5">
                How can our business participate in a pilot program?
              </h3>
              <p className="text-[#626B64] leading-relaxed">
                You can sign in to explore the live application immediately, or email our founding team directly at <a href="mailto:support@ledgerlens.ai" className="text-[#176B50] underline">support@ledgerlens.ai</a> with details about your typical monthly invoice volume, document formats, and accounting workflow requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Box */}
        <div className="p-8 sm:p-10 rounded-[6px] bg-[#F7F8F6] border border-[#E2E6E1] text-center max-w-3xl mx-auto">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#202722] mb-2">
            Ready to Evaluate the Workflow?
          </h2>
          <p className="text-[14px] text-[#626B64] max-w-lg mx-auto mb-6 leading-relaxed">
            Create a workspace, upload a sample invoice, and inspect AI extraction and arithmetic validation in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
            >
              Sign In to MVP Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@ledgerlens.ai"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-medium text-[#202722] bg-[#FFFFFF] hover:bg-[#F7F8F6] border border-[#E2E6E1] hover:border-[#176B50] rounded-[4px] transition-colors focus-ring"
            >
              <Mail className="w-4 h-4 text-[#176B50]" />
              Contact Our Team
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
