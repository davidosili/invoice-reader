# LedgerLens AI

**AI-Native Invoice Intelligence & Verification Platform (Working MVP)**

LedgerLens AI extracts, validates, and organizes business invoice data for B2B operations. It combines Google Gemini 2.5 Flash multimodal vision extraction with deterministic arithmetic validation, workspace-scoped duplicate detection, an interactive human review console, and formula-injection-safe CSV exports.

Built for distributors, wholesalers, accounting firms, and import/export businesses processing high volumes of supplier invoices.

---

## Current MVP Capabilities (Verified Implemented)

1. **Document Ingestion & Validation**
   - Direct upload of PDF, PNG, and JPEG invoice documents up to 20MB.
   - Client and server-side magic-byte file signature validation to prevent file spoofing.
   - Secure storage in isolated, private Supabase Storage buckets.

2. **AI-Assisted Multimodal Extraction**
   - Primary engine: **Google Gemini 2.5 Flash** (`gemini-2.5-flash`), invoked server-side to extract supplier details, billing addresses, invoice identifiers, tax IDs, line items, taxes, and totals.
   - Deterministic heuristic fallback extractor (`server_heuristic_v1`) if the AI service is unreachable, ensuring continuous operational uptime.

3. **Deterministic Financial & Business Rule Validation**
   - Line-item verification: verifies `quantity × unit_price = total` across all line items.
   - Subtotal reconciliation: verifies that the sum of line items matches the stated subtotal.
   - Grand total reconciliation: verifies `subtotal + tax + shipping - discount = grand_total` within a 0.02 currency rounding tolerance.
   - Required field checks: flags missing supplier names, invoice numbers, billing dates, or totals.

4. **Workspace-Scoped Duplicate Detection**
   - Automatically detects duplicate invoices within the active workspace.
   - Normalizes supplier legal names (stripping punctuation and corporate suffixes like *Ltd*, *Inc*, *LLC*) and invoice numbers.
   - Flags identical invoice numbers from the same supplier as high-severity duplicates.

5. **Human Review & Field Correction Console**
   - Side-by-side document inspection with extracted field inputs.
   - Reviewers can inspect confidence flags, review arithmetic discrepancies, and edit/correct any field.
   - Persists latest corrections while maintaining versioned extraction history.

6. **Deterministic Decision State Machine**
   - Lifecycle progression enforced via PostgreSQL functions: `uploaded → queued → processing → review_required → approved / rejected`.
   - Prevents bypass of review gates or unauthorized status changes.

7. **Append-Only Audit Trail**
   - Every lifecycle event (upload, processing start, extraction completion, field edits, approval, rejection) is logged to `invoice_audit_events`.
   - Table security prevents update and delete operations, ensuring an immutable record.

8. **Security-Hardened CSV Export**
   - Export approved invoice data per workspace.
   - Formula-injection mitigation: automatically sanitizes cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r`.

> **Note on Demonstration Data:** All sample documents, supplier names, and figures included in repository tests and homepage interactive demos are synthetic fixtures created for testing and demonstration purposes.

---

## Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│  - Tailwind CSS, Lucide React, React Router v7         │
│  - Supabase Browser Client (RLS-scoped anonymous key)   │
│  - Human Review Console & Interactive Validation UI    │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       Static Assets & UI         Direct Storage & Auth
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│  Serverless / Node API │      │   Supabase (PostgreSQL)│
│  - POST /api/process   │      │  - Row-Level Security  │
│  - GET /api/export-csv │◄────►│  - Private Bucket      │
│  - GET /api/health     │      │  - Lifecycle Functions │
└───────────────┬────────┘      └────────────────────────┘
                │
                ▼
┌────────────────────────┐
│  Google Gemini 2.5     │
│  Multimodal Vision API │
└────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide React, React Router v7.
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage).
- **Backend API:** Vercel Serverless Functions (`api/`) and lightweight Node.js HTTP server (`server/`) for local development.
- **AI Extraction Engine:** Google Gemini 2.5 Flash Multimodal Vision (`https://generativelanguage.googleapis.com/v1beta`).

---

## Repository Structure

```
├── api/                               # Vercel Serverless Functions
│   ├── documents/[id]/process.js      # Document processing & extraction endpoint
│   ├── workspaces/[workspaceId]/export-csv.js # Formula-safe CSV export endpoint
│   └── health.js                      # Liveness and configuration healthcheck
├── src/                               # Frontend Application
│   ├── components/                    # UI components (Review console, Shell, Modals)
│   ├── context/                       # AuthContext & workspace state
│   ├── lib/                           # Client utilities, Supabase client, CSV export
│   │   ├── intelligence/              # Extraction schemas, validators, duplicate rules
│   │   └── intelligence/providers/    # Gemini and heuristic extraction providers
│   ├── pages/                         # DocumentListPage, DocumentDetailPage, SettingsPage, HomePage, AboutPage, PricingPage, PrivacyPage, TermsPage
│   └── types.ts                       # Shared TypeScript domain types
├── server/                            # Local Development Backend
│   ├── index.mjs                      # Local Node.js API server (:3001)
│   └── intelligence.mjs               # Shared extraction pipeline coordinator
├── supabase/                          # Database Migrations & Schemas
│   ├── migrations/                    # Ordered migration scripts
│   │   ├── 20261019000001_initial_schema.sql
│   │   ├── 20261019000002_storage_setup.sql
│   │   └── 20261022000001_phase2_intelligence.sql
│   └── production_init.sql            # Idempotent unified schema setup script
├── test/                              # Automated Test Suite (28 unit/integration tests)
│   ├── intelligence_engine.test.mjs   # Sanitization, arithmetic, & heuristic tests
│   ├── phase2_intelligence.test.mjs   # State machine, CSV safety, duplicate detection
│   ├── security_and_validation.test.mjs # MIME, magic-bytes, RLS, & error masking
│   ├── live_security_gate.mjs         # Live Supabase multi-tenant isolation tests
│   └── live_server_e2e_gate.mjs       # End-to-end extraction and export verification
├── docs/                              # Architecture and setup documentation
│   └── PRODUCTION_SETUP.md            # Production deployment and configuration guide
└── vercel.json                        # Vercel routing, timeouts, and security headers
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 20.0.0 or higher (`node -v`)
- npm 10 or higher
- A Supabase project (free tier is sufficient)
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "invoice handler"
npm install
```

### 2. Configure Environment Variables
Create `.env` for the client frontend:
```bash
cp .env.example .env
```
Fill in your Supabase project parameters:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For running the server-side extraction engine locally, create `.env.server` (ignored by git):
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Initialize Database Schema
Apply the migrations to your Supabase project using the Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run `supabase/production_init.sql` (or apply the files in `supabase/migrations/` sequentially).
3. Ensure the private `invoices` storage bucket exists with RLS enabled.

### 4. Run Development Servers
Start the local API backend:
```bash
npm run server
```

In a separate terminal, start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Running the Automated Test Suite

LedgerLens AI includes 48 automated unit, validation, CORS, legal readiness, and security regression tests:

```bash
# Run unit and security test suites (offline / local)
npm test
```

### Test Coverage Breakdown:
- **`cors.test.mjs`**: Hardened CORS policy, environment parsing, exact origin matching, header application, preflight OPTIONS rejection/approval, and health endpoint verification (14 tests).
- **`intelligence_engine.test.mjs`**: String sanitization, numerical currency parser, ISO date normalization, line-item arithmetic validation, supplier normalization, duplicate detection, heuristic fallback extraction (8 tests).
- **`legal_and_commercial_pages.test.mjs`**: Route accessibility, navigation/footer links, verifiable technical disclosures (Gemini, Supabase, Vercel), absence of fake checkout/billing, explicit pre-launch legal placeholders, and human-review disclaimers (6 tests).
- **`phase2_intelligence.test.mjs`**: State machine legal/illegal transitions, schema control-character sanitization, 2-cent rounding tolerance checks, CSV formula-injection neutralization, provider configuration checks (8 tests).
- **`security_and_validation.test.mjs`**: Magic-byte signature verification (PDF, PNG, JPEG), file extension spoofing rejection, PE executable rejection, workspace path isolation, 20MB limit enforcement, SQL RLS schema verification, customer error sanitization (12 tests).

### Live Environment Testing (Optional):
To run tests against an active Supabase instance:
```bash
npm run test:live
```

---

## Security & Isolation Model

- **Multi-Tenant Workspaces:** Every document, extraction, and validation issue belongs to a `workspace_id`. Cross-workspace reads and writes are blocked at the PostgreSQL level via Row Level Security (RLS).
- **Private Storage:** Files stored in the `invoices` bucket cannot be read publicly. Access requires a signed URL generated by an authenticated workspace member.
- **Client Secret Minimization:** Only public keys (`VITE_SUPABASE_ANON_KEY`) are bundled into client code. The `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are strictly server-side.
- **Error Sanitization:** Raw database errors (`PGRST`, `relation does not exist`, `violates row-level security`) are intercepted by `src/lib/authErrors.ts` and masked before reaching the user interface.

---

## Planned Capabilities (Roadmap)

The following capabilities are in active development or planned for subsequent releases:
- **Batch Processing:** Multi-file drag-and-drop queueing with aggregate review.
- **Cross-Document PO Matching:** Automated 2-way and 3-way matching between invoices, purchase orders, and receiving slips.
- **Accounting & ERP Sync:** Direct integrations with QuickBooks Online, Xero, and NetSuite.
- **Multi-Page Pagination:** Explicit multi-page PDF navigation with page-level bounding box coordinates.
- **Self-Hosted AI Endpoints:** Optional support for private Ollama or vLLM extraction models.

---

## License & Credits

Built by **David Osili**. All rights reserved.
