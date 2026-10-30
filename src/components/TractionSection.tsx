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
    quote: 'Our biggest bottleneck was never typing figures—it was catching vendor calculation errors and duplicate delivery invoices before payment sign-off. MyLedgerLens catches discrepancies before money leaves the account.',
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
    <section className="bg-[#FFFFFF] py-16 md:py-24 border-b border-[#E2DFD7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#F6F5F1] border border-[#DDD7CD] text-[#5A5852]">
              REGISTER // 08
            </span>
            <p className="text-[11px] font-mono tracking-wider uppercase text-[#1D4ED8]">
              Product Traction & Validation
            </p>
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-[#111318] tracking-tight leading-[1.15]">
            Tested on real invoices. Validated by real finance operators.
          </h2>
          <p className="mt-4 text-[15px] text-[#5A5852] leading-relaxed">
            MyLedgerLens is grounded in empirical testing and active design-partner evaluation. We measure
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
                className="p-6 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7] flex flex-col justify-between hover:border-[#111318] transition-colors relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[32px] sm:text-[36px] font-bold text-[#111318] font-mono tracking-tight">
                      {item.value}
                    </span>
                    <div className="w-8 h-8 rounded-[2px] bg-[#FFFFFF] border border-[#DDD7CD] flex items-center justify-center text-[#111318]">
                      <Icon className="w-4 h-4 text-[#1D4ED8]" />
                    </div>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#111318] mb-2 font-sans">
                    {item.label}
                  </h3>
                  <p className="text-[12px] text-[#5A5852] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pilot Cohort Evaluations Header */}
        <div className="border-t border-[#E2DFD7] pt-12 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#111318] tracking-tight">
              Active Design Partner Pilots
            </h3>
            <p className="text-[13px] text-[#5A5852] mt-1">
              Currently testing real-world invoice processing across wholesale distribution and bookkeeping workflows.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#1B4938] bg-[#EBF3EE] px-2.5 py-1 rounded-[2px] border border-[#1B4938]/30 font-semibold self-start sm:self-auto uppercase">
            CLOSED BETA PILOTS
          </span>
        </div>

        {/* 2 Detailed Pilot Cohort Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {pilotCohorts.map((cohort, idx) => {
            const Icon = cohort.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAFAF8] border border-[#E2DFD7] rounded-[2px] p-6 sm:p-8 flex flex-col justify-between shadow-sm relative"
              >
                <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
                <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

                <div>
                  {/* Segment Badge & Icon */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2DFD7] mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[2px] bg-[#111318] flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1B4938] bg-[#EBF3EE] border border-[#1B4938]/30 px-2 py-0.5 rounded-[2px]">
                        {cohort.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5A5852]">
                      PILOT REGISTER
                    </span>
                  </div>

                  <h4 className="text-[18px] sm:text-[20px] font-bold text-[#111318] mb-3 font-sans">
                    {cohort.segment}
                  </h4>

                  <p className="text-[13px] text-[#5A5852] leading-relaxed mb-4">
                    {cohort.profile}
                  </p>

                  <div className="space-y-2.5 mb-6 text-[12px] bg-[#FFFFFF] p-4 rounded-[2px] border border-[#E2DFD7]">
                    <div>
                      <strong className="text-[#111318]">Workload Profile:</strong>{' '}
                      <span className="text-[#5A5852]">{cohort.workload}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E2DFD7]">
                      <strong className="text-[#111318]">Key Finding:</strong>{' '}
                      <span className="text-[#5A5852]">{cohort.keyFinding}</span>
                    </div>
                  </div>

                  {/* Quote from Evaluator */}
                  <div className="relative pl-6 border-l-2 border-[#111318] italic text-[13px] text-[#111318] leading-relaxed mb-4">
                    <Quote className="w-4 h-4 text-[#DDD7CD] absolute -left-2 -top-1 fill-current" />
                    "{cohort.quote}"
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DFD7] flex items-center gap-2 text-[11px] font-mono text-[#5A5852]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4938] flex-shrink-0" />
                  <span>{cohort.authorTitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluation Summary Box */}
        <div className="p-5 rounded-[2px] bg-[#FAFAF8] border border-[#E2DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-[#5A5852]">
          <p>
            <strong className="text-[#111318]">Structured Pilot Methodology:</strong> Pilot evaluations run on isolated, single-tenant workspace instances with zero cross-tenant data exposure. All extracted data is verified against ground-truth physical scans before approval.
          </p>
          <a
            href="mailto:support@myledgerlens.com?subject=MyLedgerLens%20Pilot%20Inquiry"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono font-bold text-[#1D4ED8] hover:underline whitespace-nowrap self-start sm:self-auto uppercase"
          >
            Inquire About Pilot Program →
          </a>
        </div>
      </div>
    </section>
  );
};
