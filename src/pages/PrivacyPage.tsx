import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Server,
  Database,
  AlertCircle,
  ArrowRight,
  Cpu,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | LedgerLens AI';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Read the LedgerLens AI Privacy Policy. Learn how we handle invoice documents, authentication data, AI extraction via Google Gemini, private storage, and workspace isolation.'
      );
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Privacy Policy | LedgerLens AI');
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        'Read the LedgerLens AI Privacy Policy. Learn how we handle invoice documents, authentication data, AI extraction via Google Gemini, private storage, and workspace isolation.'
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
            <span className="text-[#176B50] font-semibold">Privacy Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-[#EDF4EF] border border-[#176B50]/20 text-[#176B50] text-[12px] font-mono font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal Documentation &amp; Data Protection</span>
          </div>

          <h1 className="text-[32px] sm:text-[42px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-4">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#626B64] font-mono border-b border-[#E2E6E1] pb-6">
            <div>
              <span className="text-[#202722] font-semibold">Effective Date:</span> October 23, 2026
            </div>
            <div>
              <span className="text-[#202722] font-semibold">Last Updated:</span> October 23, 2026
            </div>
            <div>
              <span className="text-[#202722] font-semibold">Status:</span> MVP Operational Release
            </div>
          </div>
        </div>

        {/* Pre-Launch Verification Notice */}
        <div className="mb-10 p-4 sm:p-5 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2">
          <div className="flex items-center gap-2 text-[#176B50] font-semibold text-[13px] uppercase tracking-wider font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Transparency &amp; Pre-Publication Notice</span>
          </div>
          <p className="text-[13px] text-[#626B64] leading-relaxed">
            This Privacy Policy reflects the actual technical implementation and data-handling architecture of the LedgerLens AI platform as of October 23, 2026. Certain administrative identity placeholders (such as registered commercial entity name and registered office address) are marked for pre-launch confirmation prior to formal corporate incorporation.
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
                1. Introduction &amp; Scope
              </a>
            </li>
            <li>
              <a href="#section-2" className="hover:text-[#176B50] hover:underline">
                2. Information We Collect
              </a>
            </li>
            <li>
              <a href="#section-3" className="hover:text-[#176B50] hover:underline">
                3. How Information Is Used
              </a>
            </li>
            <li>
              <a href="#section-4" className="hover:text-[#176B50] hover:underline">
                4. AI Extraction &amp; Third-Party Processors
              </a>
            </li>
            <li>
              <a href="#section-5" className="hover:text-[#176B50] hover:underline">
                5. Storage, Security &amp; Retention
              </a>
            </li>
            <li>
              <a href="#section-6" className="hover:text-[#176B50] hover:underline">
                6. Multi-Tenant Workspace Isolation
              </a>
            </li>
            <li>
              <a href="#section-7" className="hover:text-[#176B50] hover:underline">
                7. Your Data Rights &amp; Regulatory Compliance
              </a>
            </li>
            <li>
              <a href="#section-8" className="hover:text-[#176B50] hover:underline">
                8. Policy Updates &amp; Contact Information
              </a>
            </li>
          </ol>
        </nav>

        {/* Policy Body */}
        <div className="space-y-12 text-[15px] leading-relaxed text-[#202722]">
          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              1. Introduction &amp; Scope
            </h2>
            <p>
              LedgerLens AI ("we", "us", or "our") provides an AI-native business document intelligence and verification platform. The service is designed specifically for business-to-business (B2B) operations—including distributors, wholesalers, accounting firms, and commercial enterprises—processing incoming supplier invoices, receipts, and associated paperwork.
            </p>
            <p>
              This Privacy Policy explains how LedgerLens AI collects, processes, stores, and protects information when authorized users access our public website, register for an account, create workspaces, upload invoice documents, and utilize our verification and export workflows.
            </p>
            <p>
              <strong>Target Audience:</strong> LedgerLens AI is intended exclusively for commercial entities and business representatives acting on behalf of an enterprise. It is not directed to consumers or individuals acting for personal, family, or household purposes, nor is it directed to children under 18 years of age.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              2. Information We Collect
            </h2>
            <p>
              We limit data collection to the categories necessary to operate our document verification platform. We collect information directly when provided by users or generated through system operations:
            </p>

            <div className="space-y-4 mt-3">
              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  A. Account &amp; Authentication Information (Required)
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  To access the application, create workspaces, or process documents, users must create an account.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Email address</li>
                  <li>Encrypted password credentials (managed securely via Supabase Auth; raw passwords are never visible to or stored by LedgerLens AI)</li>
                  <li>Assigned internal user UUID and email confirmation status</li>
                  <li>Authentication session tokens and login timestamps</li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  B. Workspace &amp; Membership Information (Required)
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Information required to organize multi-tenant data boundaries and assign permissions.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Workspace name and unique workspace identifier (UUID)</li>
                  <li>Workspace membership associations and user role designations (<code className="text-[#176B50] font-mono">owner</code>, <code className="text-[#176B50] font-mono">admin</code>, <code className="text-[#176B50] font-mono">member</code>, <code className="text-[#176B50] font-mono">reviewer</code>)</li>
                  <li>Workspace creation and modification timestamps</li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  C. Uploaded Invoice Documents (User-Provided)
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Commercial files uploaded by authorized workspace members for extraction and verification.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Original document binary content (PDF, PNG, or JPEG formats up to 20MB)</li>
                  <li>File metadata: original file name, MIME type, file size in bytes, and magic-byte header validation record</li>
                  <li>Storage path scoped to the active workspace: <code className="text-[#176B50] font-mono">&#123;workspace_id&#125;/&#123;document_id&#125;.&#123;ext&#125;</code></li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  D. Extracted Invoice Fields &amp; Derived Records (Application-Generated)
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Structured data extracted via AI vision and deterministic parsers from uploaded documents.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Supplier details: trading name, legal address, tax identifier (VAT / TIN / EIN)</li>
                  <li>Buyer details: customer name, billing address, purchase order number</li>
                  <li>Invoice metadata: invoice reference number, issue date, due date, payment terms, currency code</li>
                  <li>Financial figures: subtotal, applied tax rate, calculated tax amount, discounts, shipping fees, grand total</li>
                  <li>Line-item records: description, unit quantity, unit price, line total, and verification flag</li>
                  <li>Extraction metadata: confidence ratings (<code className="text-[#176B50] font-mono">high</code>, <code className="text-[#176B50] font-mono">medium</code>, <code className="text-[#176B50] font-mono">review</code>), estimated bounding-box percentages, and extractor provider ID</li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  E. Human Corrections, Review Actions &amp; Lifecycle Decisions
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Decisions made by human reviewers in the review console.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Manual field adjustments and correction overrides saved by reviewers</li>
                  <li>Approval certifications and rejection decisions (including optional rejection reasons)</li>
                  <li>Deterministic validation issue flags (arithmetic discrepancies, missing mandatory fields, date inconsistencies, duplicate invoice warnings)</li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  F. Append-Only Audit Trail Records
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Immutable event log maintained in PostgreSQL for organizational governance and accountability.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Lifecycle event types: <code className="text-[#176B50] font-mono">processing_queued</code>, <code className="text-[#176B50] font-mono">processing_started</code>, <code className="text-[#176B50] font-mono">extraction_completed</code>, <code className="text-[#176B50] font-mono">validation_failed</code>, <code className="text-[#176B50] font-mono">field_corrected</code>, <code className="text-[#176B50] font-mono">approved</code>, <code className="text-[#176B50] font-mono">rejected</code>, <code className="text-[#176B50] font-mono">exported</code></li>
                  <li>Associated timestamps, actor UUIDs, previous/new status values, and event payload details</li>
                </ul>
              </div>

              <div className="p-4 rounded-[4px] border border-[#E2E6E1] bg-[#FFFFFF]">
                <h3 className="text-[16px] font-bold text-[#202722] mb-1">
                  G. Technical Diagnostics &amp; Operational Logs
                </h3>
                <p className="text-[14px] text-[#626B64] mb-2">
                  Standard technical logs generated when interacting with serverless API functions and application endpoints.
                </p>
                <ul className="list-disc list-inside text-[13px] text-[#626B64] space-y-1 pl-2">
                  <li>Serverless execution logs (HTTP method, route, sanitized status code, duration)</li>
                  <li>Sanitized client error logs (database error codes such as PostgreSQL / PGRST are stripped to protect infrastructure details)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              3. How Information Is Used
            </h2>
            <p>
              LedgerLens AI uses the collected information strictly for operational and functional purposes to deliver our core B2B invoice intelligence service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                <strong className="text-[#202722]">Document Extraction:</strong> Converting unstructured document images and PDFs into structured financial fields.
              </li>
              <li>
                <strong className="text-[#202722]">Deterministic Arithmetic &amp; Rule Verification:</strong> Mathematically verifying line-item totals (<code className="font-mono text-xs">quantity × unit price</code>), reconciling subtotals against line sums, and validating grand totals with a strict 0.02 rounding tolerance.
              </li>
              <li>
                <strong className="text-[#202722]">Duplicate Invoice Detection:</strong> Comparing extracted invoice numbers and normalized supplier legal names against existing records in your active workspace to alert reviewers to duplicate billing.
              </li>
              <li>
                <strong className="text-[#202722]">Human Review &amp; Field Corrections:</strong> Displaying side-by-side document views with bounding-box highlights to assist human reviewers in inspecting and correcting values.
              </li>
              <li>
                <strong className="text-[#202722]">Workflow Progression &amp; Audit Governance:</strong> Progressing documents through the deterministic state machine (<code className="font-mono text-xs">uploaded → queued → processing → review_required → approved / rejected</code>) and recording an unalterable history of actions.
              </li>
              <li>
                <strong className="text-[#202722]">Secure CSV Exports:</strong> Producing formula-injection-sanitized CSV files containing approved invoice records for export to accounting software.
              </li>
              <li>
                <strong className="text-[#202722]">Platform Security:</strong> Authenticating users, enforcing workspace multi-tenant Row Level Security boundaries, and rejecting spoofed or oversized files.
              </li>
              <li>
                <strong className="text-[#202722]">Customer Support:</strong> Diagnosing service issues and responding to direct inquiries sent to <a href="mailto:support@myledgerlens.com" className="text-[#176B50] hover:underline">support@myledgerlens.com</a>.
              </li>
            </ul>

            <div className="p-4 rounded-[4px] bg-[#EDF4EF] border border-[#176B50]/30 text-[13px] text-[#176B50] space-y-1">
              <strong>Explicit Negative Assurances:</strong>
              <p>
                LedgerLens AI does <strong>not</strong> sell, rent, or trade customer documents, financial records, or personal data. We do <strong>not</strong> use uploaded documents or extracted invoice data to train public foundation models or third-party artificial intelligence engines. We do <strong>not</strong> run third-party advertising networks, behavioral profiling, or cross-site tracking scripts.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              4. AI Extraction &amp; Third-Party Processors
            </h2>
            <p>
              To provide multimodal visual extraction, database storage, and hosting, LedgerLens AI utilizes established cloud infrastructure providers:
            </p>

            <div className="space-y-4 mt-3">
              <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#F7F8F6]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#176B50]" />
                    <h3 className="text-[16px] font-bold text-[#202722]">
                      Google Gemini Multimodal Vision API (Google Cloud / Google AI)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] px-2 py-0.5 rounded text-[#626B64]">
                    AI Extraction Engine
                  </span>
                </div>
                <p className="text-[13px] text-[#626B64] leading-relaxed mb-3">
                  <strong>Role:</strong> When an authorized user requests invoice processing, the document image or PDF is transmitted server-side via encrypted HTTPS to Google Gemini (<code className="text-[#176B50] font-mono">gemini-2.5-flash</code>) using structured multimodal vision prompts.
                </p>
                <p className="text-[13px] text-[#626B64] leading-relaxed mb-3">
                  <strong>Data Handling Disclosures:</strong> Invoices contain commercial and financial data. When processed via the Gemini API, document content is transmitted to Google's infrastructure. Google processes requests under Google Cloud and Google AI Studio API Terms of Service. Enterprise API tiers generally stipulate that user inputs are not used to train Google models; however, customers should review Google's published developer terms. LedgerLens AI cannot independently guarantee that upstream providers do not maintain transient security or diagnostic logs.
                </p>
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  <strong>Offline / Heuristic Fallback:</strong> If the external Gemini API is unreachable, unconfigured, or encounters an upstream timeout, LedgerLens AI utilizes a local, deterministic server-side heuristic fallback extractor (<code className="text-[#176B50] font-mono">server_heuristic_v1</code>) that processes documents locally without communicating with external AI services.
                </p>
              </div>

              <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#F7F8F6]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#176B50]" />
                    <h3 className="text-[16px] font-bold text-[#202722]">
                      Supabase Inc.
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] px-2 py-0.5 rounded text-[#626B64]">
                    Database, Auth &amp; Private Storage
                  </span>
                </div>
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  <strong>Role:</strong> Supabase provides managed PostgreSQL database infrastructure, Supabase Auth user management, and private encrypted object storage (<code className="text-[#176B50] font-mono">invoices</code> bucket). Data is stored in isolated multi-tenant relational tables protected by PostgreSQL Row Level Security (RLS).
                </p>
              </div>

              <div className="p-5 rounded-[4px] border border-[#E2E6E1] bg-[#F7F8F6]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#176B50]" />
                    <h3 className="text-[16px] font-bold text-[#202722]">
                      Vercel Inc.
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] px-2 py-0.5 rounded text-[#626B64]">
                    Hosting &amp; Serverless Functions
                  </span>
                </div>
                <p className="text-[13px] text-[#626B64] leading-relaxed">
                  <strong>Role:</strong> Vercel hosts the static React Single Page Application and executes stateless serverless API functions (<code className="text-[#176B50] font-mono">POST /api/documents/:id/process</code>, <code className="text-[#176B50] font-mono">GET /api/workspaces/:id/export-csv</code>, <code className="text-[#176B50] font-mono">GET /api/health</code>). Serverless functions process incoming requests ephemerally and do not persist customer files on local function disks.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              5. Storage, Security &amp; Data Retention
            </h2>
            <p>
              We implement defense-in-depth technical and operational safeguards verified within our production architecture:
            </p>

            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                <strong className="text-[#202722]">Private Storage Bucket:</strong> The <code className="font-mono text-xs">invoices</code> storage bucket is configured with <code className="font-mono text-xs">public = false</code>. Files cannot be accessed via public URLs.
              </li>
              <li>
                <strong className="text-[#202722]">Time-Limited Signed URLs:</strong> Document previews in the human review console are served exclusively via short-lived signed URLs (default duration: 3,600 seconds / 1 hour) generated dynamically for authenticated members.
              </li>
              <li>
                <strong className="text-[#202722]">Server-Side Secret Isolation:</strong> Privileged credentials (<code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>, <code className="font-mono text-xs">GEMINI_API_KEY</code>) are stored exclusively in serverless environment variables and are never bundled into client browser code.
              </li>
              <li>
                <strong className="text-[#202722]">File Signature &amp; Magic-Byte Verification:</strong> Uploads undergo client-side and server-side magic-byte inspection (%PDF-, PNG, JPEG SOI) to reject disguised executable files or file extension spoofing.
              </li>
              <li>
                <strong className="text-[#202722]">Formula Injection Sanitization:</strong> CSV exports automatically prepend an apostrophe to cells beginning with formula triggers (<code className="font-mono text-xs">=</code>, <code className="font-mono text-xs">+</code>, <code className="font-mono text-xs">-</code>, <code className="font-mono text-xs">@</code>, <code className="font-mono text-xs">\t</code>, <code className="font-mono text-xs">\r</code>) to safeguard spreadsheet users from formula execution.
              </li>
            </ul>

            <h3 className="text-[17px] font-bold text-[#202722] pt-2">
              Data Retention &amp; Deletion Behavior
            </h3>
            <p className="text-[14px] text-[#626B64]">
              To maintain accuracy and auditability, we describe our actual implemented retention behavior:
            </p>
            <div className="p-4 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-3 text-[13px] text-[#626B64]">
              <div>
                <strong className="text-[#202722] block mb-0.5">Continuous Storage:</strong>
                Uploaded documents, structured extractions, and validation records remain stored in your workspace until an authorized user requests their deletion or until the workspace is decommissioned.
              </div>
              <div>
                <strong className="text-[#202722] block mb-0.5">No Automated Deletion Timers:</strong>
                The platform currently does <em>not</em> run automated deletion timers or scheduled time-to-live (TTL) expiration routines. Records persist until manually purged.
              </div>
              <div>
                <strong className="text-[#202722] block mb-0.5">Immutable Audit Trail:</strong>
                Records in <code className="text-[#176B50] font-mono">invoice_audit_events</code> are append-only. The database schema strictly prohibits <code className="font-mono">UPDATE</code> and <code className="font-mono">DELETE</code> operations to preserve a verifiable record of accounting approvals and lifecycle actions.
              </div>
              <div>
                <strong className="text-[#202722] block mb-0.5">Current Deletion Capabilities:</strong>
                While database Row Level Security policies permit document deletions, the current frontend MVP user interface does not yet expose a self-service "Delete Document" or "Delete Account" button. Account or document removal requests must be submitted directly to our support team at <a href="mailto:support@myledgerlens.com" className="text-[#176B50] underline">support@myledgerlens.com</a> for manual administrative fulfillment.
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              6. Multi-Tenant Workspace Isolation
            </h2>
            <p>
              LedgerLens AI employs a centralized multi-tenant architecture where organizational data is isolated by workspace:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                Every document, extraction record, validation issue, and audit event belongs to a designated <code className="font-mono text-xs">workspace_id</code>.
              </li>
              <li>
                Database queries are restricted at the PostgreSQL engine level via <strong>Row Level Security (RLS)</strong> policies. Users cannot view, query, update, or export records belonging to workspaces where they do not hold active membership.
              </li>
              <li>
                Storage access is validated via PostgreSQL security definer functions (<code className="font-mono text-xs">storage_workspace_id</code>) that parse the storage path prefix and verify the caller's membership before permitting file download or upload.
              </li>
              <li>
                Serverless API processing endpoints independently verify the caller's JWT authentication token and confirm active workspace membership before initiating document extraction.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              7. Your Data Rights &amp; Regulatory Compliance
            </h2>
            <p>
              Depending on the jurisdiction where your business operates, you may have specific statutory rights regarding personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#626B64] pl-2">
              <li>
                <strong className="text-[#202722]">Right of Access &amp; Portability:</strong> You can view all processed documents, extractions, and audit records within your workspace, and export approved invoices to CSV at any time.
              </li>
              <li>
                <strong className="text-[#202722]">Right to Rectification:</strong> Reviewers can correct any extracted invoice field, supplier information, or line item directly via the Human Review Console prior to approval.
              </li>
              <li>
                <strong className="text-[#202722]">Right to Erasure (Deletion):</strong> You may request the deletion of your account, workspace, or uploaded documents by contacting <a href="mailto:support@myledgerlens.com" className="text-[#176B50] hover:underline">support@myledgerlens.com</a>.
              </li>
            </ul>

            <div className="p-4 rounded-[4px] bg-[#F7F8F6] border border-[#E2E6E1] space-y-2 text-[13px] text-[#626B64]">
              <div className="font-semibold text-[#202722] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#176B50]" />
                <span>Applicable Data Protection Frameworks &amp; Legal Flag</span>
              </div>
              <p>
                LedgerLens AI seeks to adhere to core data-protection principles under the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong>, as well as international principles of purpose limitation, storage minimization, and data accuracy. Formal registration with national data protection authorities (such as the Nigeria Data Protection Commission - NDPC) and appointment of an external Data Protection Officer (DPO) will be completed upon corporate entity incorporation.
              </p>
              <p className="text-[12px] text-[#626B64] italic">
                *Pre-launch note: Prospective enterprise customers requiring customized Data Processing Agreements (DPAs) or Standard Contractual Clauses (SCCs) may contact <a href="mailto:support@myledgerlens.com" className="text-[#176B50] underline">support@myledgerlens.com</a>.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-24 space-y-4">
            <h2 className="text-[22px] font-bold text-[#202722] tracking-tight border-b border-[#E2E6E1] pb-2">
              8. Policy Updates &amp; Contact Information
            </h2>
            <p>
              We may revise this Privacy Policy periodically to reflect enhancements in application functionality, third-party provider updates, or changes in regulatory obligations. Any material modifications will be posted to this page with an updated "Last Updated" date. Because the current MVP does not operate an automated broadcast email system, we encourage users to review this page periodically.
            </p>

            <div className="mt-6 p-6 rounded-[6px] border border-[#E2E6E1] bg-[#FFFFFF] space-y-3">
              <h3 className="text-[16px] font-bold text-[#202722]">
                Privacy Inquiries &amp; Data Protection Contact
              </h3>
              <p className="text-[14px] text-[#626B64]">
                For questions regarding this policy, data subject requests, or privacy compliance, please contact:
              </p>
              <div className="text-[13px] font-mono space-y-1 text-[#202722] bg-[#F7F8F6] p-4 rounded-[4px] border border-[#E2E6E1]">
                <div>
                  <span className="text-[#626B64]">Project:</span> LedgerLens AI
                </div>
                <div>
                  <span className="text-[#626B64]">Lead Developer / Product Owner:</span> David Osili
                </div>
                <div>
                  <span className="text-[#626B64]">Contact Email:</span>{' '}
                  <a href="mailto:support@myledgerlens.com" className="text-[#176B50] underline">
                    support@myledgerlens.com
                  </a>
                </div>
                <div>
                  <span className="text-[#626B64]">Legal Entity Name:</span> [LEGAL_ENTITY_NAME — Pending Pre-Launch Incorporation]
                </div>
                <div>
                  <span className="text-[#626B64]">Registered Office Address:</span> [LEGAL_BUSINESS_ADDRESS — Pending Pre-Launch Confirmation]
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-[#E2E6E1] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <Link
            to="/terms"
            className="text-[#176B50] font-medium hover:underline inline-flex items-center gap-1.5"
          >
            Review Terms of Service
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/pricing"
            className="text-[#626B64] hover:text-[#202722] hover:underline"
          >
            View Proposed Commercial Model &amp; Pricing
          </Link>
        </div>
      </div>
    </main>
  );
};
