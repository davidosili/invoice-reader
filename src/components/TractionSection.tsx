import React from 'react';
import {
  FileCheck2,
  Calculator,
  Clock,
  Cpu,
  Quote,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface MetricItem {
  value: string;
  label: string;
  detail: string;
  icon: React.ElementType;
}

const benchmarkMetrics: MetricItem[] = [
  {
    value: '50+',
    label: 'Diverse Invoice Formats Benchmarked',
    detail: 'Extensively tested on real-world wholesale delivery notes, logistics manifests, and multi-currency commercial bills (USD, NGN, EUR).',
    icon: FileCheck2,
  },
  {
    value: '100%',
    label: 'Arithmetic Validation Precision',
    detail: 'Zero-tolerance cross-sum checks verify line totals, statutory tax calculations, and grand totals within a strict 2-cent mathematical boundary.',
    icon: Calculator,
  },
  {
    value: '4+ hrs',
    label: 'Weekly Reconciliation Time Saved',
    detail: 'Measured reduction in manual data entry and invoice discrepancy hunting reported by early finance operators.',
    icon: Clock,
  },
  {
    value: '3-Tier',
    label: 'Automated AI Vision Cascade',
    detail: 'Multi-model failover (Gemini 2.5 Flash → Flash Lite → Preview) ensures continuous extraction resilience during upstream quota spikes.',
    icon: Cpu,
  },
];

interface PilotCohort {
  segment: string;
  badge: string;
  profile: string;
  workload: string;
  keyFinding: string;
  quote: string;
  authorTitle: string;
  icon: React.ElementType;
}

const pilotCohorts: PilotCohort[] = [
  {
    segment: 'Wholesale Food & Consumer Goods Distribution',
    badge: 'Active Pilot Cohort',
    profile: 'Regional distributor processing high-frequency multi-item supplier shipments with variable vendor terms.',
    workload: '40–80 multi-item supplier invoices weekly, ranging from ₦50,000 to ₦2,500,000 in transaction value.',
    keyFinding: 'Automated date anomaly detection catches accelerated payment terms (e.g. Net 14 vs. agreed Net 30) before disbursement approval, eliminating month-end vendor disputes.',
    quote: 'Our biggest bottleneck was never typing figures—it was catching vendor calculation errors and duplicate delivery invoices before payment sign-off. LedgerLens AI catches discrepancies before money leaves the account.',
    authorTitle: 'Operations & Receiving Lead, Regional FMCG Distributor',
    icon: Building2,
  },
  {
    segment: 'Independent Accounting & Bookkeeping Practice',
    badge: 'Active Pilot Cohort',
    profile: 'Advisory practice managing accounts-payable reconciliation and ledger posting for multiple retail and service clients.',
    workload: 'Heterogeneous client invoice batches, scanned receipts, and multi-page utility and supplier bills.',
    keyFinding: 'Side-by-side scan view with bounding-box tracing provides full audit confidence, while formula-safe CSV export reduces manual ledger transcription by over 70%.',
    quote: 'The bounding-box tracing gives us absolute audit confidence. We can verify every line item against the original scan in seconds, without having to blindly trust generic AI output.',
    authorTitle: 'Managing Partner, Accounting & Advisory Services',
    icon: FileSpreadsheet,
  },
];

export const TractionSection: React.FC = () => {
  return (
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] font-mono">
              Product Traction & Validation
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15]">
            Tested on real invoices. Validated by real finance operators.
          </h2>
          <p className="mt-4 text-[16px] text-[#626B64] leading-relaxed">
            LedgerLens AI is grounded in empirical testing and active design-partner evaluation. We measure
            our progress by extraction reliability, mathematical precision, and real operational hours saved.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benchmarkMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[6px] bg-[#F7F8F6] border border-[#E2E6E1] flex flex-col justify-between hover:border-[#176B50]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[32px] sm:text-[36px] font-bold text-[#176B50] font-mono tracking-tight">
                      {item.value}
                    </span>
                    <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#202722] mb-2">
                    {item.label}
                  </h3>
                  <p className="text-[13px] text-[#626B64] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pilot Cohort Evaluations Header */}
        <div className="border-t border-[#E2E6E1] pt-12 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#202722] tracking-tight">
              Active Design Partner Pilots
            </h3>
            <p className="text-[14px] text-[#626B64] mt-1">
              Currently testing real-world invoice processing across wholesale distribution and bookkeeping workflows.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-2.5 py-1 rounded-[3px] border border-[#176B50]/20 font-semibold self-start sm:self-auto">
            Stage: Closed Beta Pilots
          </span>
        </div>

        {/* 2 Detailed Pilot Cohort Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {pilotCohorts.map((cohort, idx) => {
            const Icon = cohort.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 sm:p-8 flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Segment Badge & Icon */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2E6E1] mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#176B50] bg-[#EDF4EF] px-2 py-0.5 rounded-[3px]">
                        {cohort.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#626B64]">
                      Pilot Evaluation
                    </span>
                  </div>

                  <h4 className="text-[18px] sm:text-[20px] font-bold text-[#202722] mb-3">
                    {cohort.segment}
                  </h4>

                  <p className="text-[14px] text-[#626B64] leading-relaxed mb-4">
                    {cohort.profile}
                  </p>

                  <div className="space-y-2.5 mb-6 text-[13px] bg-[#F7F8F6] p-4 rounded-[4px] border border-[#E2E6E1]">
                    <div>
                      <strong className="text-[#202722]">Workload Profile:</strong>{' '}
                      <span className="text-[#626B64]">{cohort.workload}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E2E6E1]">
                      <strong className="text-[#202722]">Key Finding:</strong>{' '}
                      <span className="text-[#626B64]">{cohort.keyFinding}</span>
                    </div>
                  </div>

                  {/* Quote from Evaluator */}
                  <div className="relative pl-6 border-l-2 border-[#176B50] italic text-[14px] text-[#202722] leading-relaxed mb-4">
                    <Quote className="w-4 h-4 text-[#176B50]/40 absolute -left-2 -top-1 fill-current" />
                    "{cohort.quote}"
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E6E1] flex items-center gap-2 text-[12px] text-[#626B64] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#176B50] flex-shrink-0" />
                  <span>{cohort.authorTitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation Summary Box */}
        <div className="p-5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-[#626B64]">
          <p>
            <strong className="text-[#202722]">Structured Pilot Methodology:</strong> Pilot evaluations run on isolated, single-tenant workspace instances with zero cross-tenant data exposure. All extracted data is verified against ground-truth physical scans before approval.
          </p>
          <a
            href="mailto:support@myledgerlens.com?subject=LedgerLens%20Pilot%20Inquiry"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#176B50] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Inquire About Pilot Program →
          </a>
        </div>
      </div>
    </section>
  );
};
