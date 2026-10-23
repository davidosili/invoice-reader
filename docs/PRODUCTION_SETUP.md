# LedgerLens AI — Production Configuration & Deployment Guide

This guide describes the architecture, database migrations, serverless environment configuration, and verification runbooks for LedgerLens AI.

---

## 1. Centralized SaaS Architecture Model

LedgerLens AI operates as a **centrally managed, multi-tenant SaaS application**:

```
+-------------------------------------------------------------+
|                     End Customers                           |
|  - Sign up / Sign in at branded UI                          |
|  - Automatic atomic workspace provisioning                  |
|  - Never see or configure infrastructure                    |
|  - All database errors sanitized (no SQL / vendor leaks)    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|          LedgerLens AI Frontend (SPA - React 19)            |
|  - Public variables only: VITE_SUPABASE_URL, ANON_KEY       |
|  - Multi-tenant isolation: workspace_id path scoping        |
|  - Neutral "Service Unavailable" screen if unconfigured     |
|  - Restricted operator diagnostics (?diagnostics=1)         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               Central Supabase Infrastructure               |
|  - PostgreSQL with Row-Level Security (RLS) on all tables   |
|  - Private Storage Bucket: "invoices" (public = false)      |
|  - Atomic workspace creation: create_workspace_with_owner() |
|  - Storage RLS: enforces workspace folder ownership         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Serverless API Pipeline (Vercel / Node)          |
|  - Endpoints: /api/documents/:id/process, /api/export-csv   |
|  - Secrets: GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY       |
|  - Never exposed to browser bundle                          |
|  - Primary engine: Google Gemini 2.5 Flash Vision           |
|  - Resilient fallback: Server heuristic extractor          |
+-------------------------------------------------------------+
```

### Key Security & Isolation Guarantees
1. **Single Central Backend:** The product owner provisions and manages **one** Supabase project. Customers never configure databases or API keys.
2. **Strict Multi-Tenancy:** PostgreSQL Row Level Security (RLS) isolates workspaces, documents, extractions, validation issues, and audit events. Users can only query and mutate data belonging to workspaces where they hold active membership.
3. **Private Storage Isolation:** Files are stored in the private `invoices` bucket under `{workspace_id}/{document_id}.{ext}`. Storage policies verify workspace membership before granting read or write permissions.
4. **Client Secret Minimization:** The browser bundle contains *only* the public anonymous client key (`VITE_SUPABASE_ANON_KEY`). Service-role keys and AI provider credentials are stored strictly in server-side environments.
5. **Customer Experience Separation:** If infrastructure is unconfigured or unreachable, customers see an enterprise-grade service notice. Raw database error codes (`PGRST`, `relation does not exist`, `violates row-level security`) are intercepted and sanitized.

---

## 2. Infrastructure Setup: Step-by-Step

### Step 1: Provision Central Supabase Project
1. Log in to [Supabase Management Console](https://supabase.com/dashboard).
2. Create a new project:
   - **Name:** `ledgerlens-production` (or your company naming convention).
   - **Database Password:** Store securely in your company's password manager / secrets vault.
   - **Region:** Select a region close to your primary customers.
3. Under **Project Settings -> API**, retrieve:
   - **Project URL:** `https://<your-project-id>.supabase.co`
   - **Project API Keys -> `anon` (public):** `eyJhbGciOi...`
   - **Project API Keys -> `service_role` (secret):** `eyJhbGciOi...` *(Store securely; never put in frontend code)*.

---

### Step 2: Apply Database Schema & Migrations

All migrations are located in `supabase/migrations/` and can be run sequentially in the Supabase **SQL Editor**, or applied all at once via `supabase/production_init.sql`.

#### 1. Core Schema & Row-Level Security
Run `supabase/migrations/20261019000001_initial_schema.sql`:
- Creates tables:
  - `public.workspaces`: ID, name, slug, timestamps.
  - `public.workspace_members`: ID, workspace_id, user_id, role (`owner`, `admin`, `member`, `reviewer`), timestamps.
  - `public.documents`: ID, workspace_id, user_id, original_filename, storage_path, file_size_bytes, mime_type, status, timestamps.
- Enables **Row Level Security (RLS)** on all three tables.
- Creates helper functions:
  - `public.is_workspace_member(_workspace_id, _user_id)`: Security definer function for leak-proof membership verification.
  - `public.create_workspace_with_owner(workspace_name, owner_user_id)`: Atomic workspace creation with owner assignment.

#### 2. Private Storage Bucket Setup
Run `supabase/migrations/20261019000002_storage_setup.sql`:
- Creates private storage bucket `invoices` (`public = false`).
- Configures 20MB file size limit.
- Enforces allowed MIME types (`application/pdf`, `image/png`, `image/jpeg`).
- Applies storage policies scoped to `{workspace_id}/...`.

#### 3. Invoice Intelligence & Lifecycle Engine
Run `supabase/migrations/20261022000001_phase2_intelligence.sql`:
- Creates intelligence tables:
  - `public.invoice_extractions`: Structured header data, line items, field confidence metadata, version tracking (`is_latest`).
  - `public.invoice_validation_issues`: Deterministic arithmetic, date, required field, and duplicate issues.
  - `public.invoice_audit_events`: Immutable, append-only log of all workflow actions (no UPDATE or DELETE policies).
- Configures `public.transition_document_status()` PostgreSQL function enforcing legal state machine transitions.

---

### Step 3: Configure Authentication Settings in Supabase

In the Supabase Dashboard:

1. **Email Auth:**
   - Navigate to **Authentication -> Providers -> Email**.
   - Enable "Email provider".
   - In production, enable "Confirm email" and customize the branded email template.

2. **Redirect URLs:**
   - Navigate to **Authentication -> URL Configuration**.
   - Set **Site URL** to your production domain: `https://app.ledgerlens.ai` (or your active Vercel domain).
   - Add **Redirect URLs**:
     - `https://app.ledgerlens.ai/app/auth`
     - `https://app.ledgerlens.ai/**`
     - `http://localhost:5173/app/auth` (for local development)

---

### Step 4: Serverless API & Frontend Deployment (Vercel)

#### Environment Variables Configuration

**In Vercel Project Settings -> Environment Variables:**

| Variable Name | Description | Target Scope | Example Value |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Public Supabase project URL | Production, Preview, Dev | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous client key | Production, Preview, Dev | `eyJhbGciOi...` |
| `SUPABASE_URL` | Backend Supabase project URL | Production, Preview (Serverless) | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged service role key | Production, Preview (Serverless) | `eyJhbGciOi...` |
| `GEMINI_API_KEY` | Google Gemini API Key | Production, Preview (Serverless) | `AIzaSy...` |
| `GEMINI_PRIMARY_MODEL` | Primary AI vision extraction model | Production, Preview (Serverless) | `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODELS` | Comma-separated quota fallback AI models | Production, Preview (Serverless) | `gemini-flash-lite-latest,gemini-3-flash-preview` |
| `ALLOWED_ORIGINS` | Permitted frontend origins (comma-separated) | Production, Preview (Serverless) | `https://app.ledgerlens.ai,https://ledgerlens.ai` |

> **Security Rule:** Never prefix `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`. They are utilized exclusively by server-side endpoints in `api/`.

#### Build & Routing Settings
- **Build Command:** `npm run build` (`tsc -b && vite build`)
- **Output Directory:** `dist`
- **Node.js Version:** `20.x`
- Routing and timeouts are pre-configured in `vercel.json` (30-second serverless execution for document processing).

---

## 3. Customer Experience & Error Safeguards

### Unconfigured Production Fallback
If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing in production:
- Customers see a clean, branded **"Service Temporarily Unavailable"** interface.
- Customers are never shown technical instructions, API keys, or database setup guides.
- Action buttons allow users to return to the homepage or contact support (`support@ledgerlens.ai`).

### Operator Diagnostics Mode
Authorized developers and platform operators can inspect configuration status:
- In local development (`import.meta.env.DEV`), diagnostic details appear below the notice.
- In production, operators can append `?diagnostics=1` to the URL (e.g. `https://app.ledgerlens.ai/app/auth?diagnostics=1`) to view:
  - Supabase URL status (configured / missing)
  - Anon key status
  - Migration checklist
  - Environment variable template
  - *No secret keys are ever printed or exposed.*

### Enterprise Error Sanitization
All raw error responses from the backend are filtered through `src/lib/authErrors.ts`:
- Invalid credentials: *"The email address or password you entered is incorrect. Please verify your details and try again."*
- Unconfirmed email: *"Please check your email inbox and confirm your address before signing in."*
- Database or RLS violation: *"Our authentication service encountered a temporary error. Please try again shortly or contact support@ledgerlens.ai."*
- Raw strings containing `PGRST`, `PostgreSQL`, `row-level security`, `jwt`, or `schema` are strictly intercepted and suppressed.

---

## 4. AI Extraction Engine & Server Secrets Configuration

The invoice intelligence engine is fully implemented:

### Server-Side Pipeline Execution
1. Document upload saves the original file to private storage (`invoices` bucket) and creates a row in `documents` with status `uploaded`.
2. Frontend calls `POST /api/documents/:id/process` with an authenticated Bearer token.
3. Server endpoint verifies caller membership in the document's workspace.
4. Server transitions document status to `queued` → `processing` and logs audit events.
5. Extraction is executed using **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via multimodal vision JSON prompting.
6. If the Gemini API key is missing or the external service encounters a temporary error (e.g. HTTP 503), the engine automatically falls back to the deterministic heuristic extractor (`server_heuristic_v1`).
7. Deterministic arithmetic validation (`validator.ts`) and workspace duplicate checks (`duplicates.ts`) are evaluated.
8. Results are atomically persisted to `invoice_extractions` and `invoice_validation_issues`.
9. Document status transitions to `review_required` and an `extraction_completed` audit event is logged.

---

## 5. Implementation Status: Completed vs. Deployment Tasks

### Implemented & Verified in Codebase
- [x] Multi-tenant workspace isolation with PostgreSQL RLS.
- [x] Private Supabase Storage bucket with magic-byte file signature validation.
- [x] Multimodal AI extraction via Google Gemini 2.5 Flash (`gemini-2.5-flash`).
- [x] Resilient heuristic OCR fallback extractor (`server_heuristic_v1`).
- [x] Deterministic financial arithmetic validation (subtotals, tax rates, line items, 0.02 rounding tolerance).
- [x] Workspace-scoped duplicate invoice detection.
- [x] Interactive human review console with inline field correction.
- [x] Deterministic lifecycle state machine (`transition_document_status`).
- [x] Immutable, append-only audit trail (`invoice_audit_events`).
- [x] Formula-injection-safe CSV export endpoint.
- [x] Legal readiness and commercial positioning pages (`/privacy`, `/terms`, `/pricing`).
- [x] Synthetic invoice benchmark dataset (Scenarios A through H) and manifest.
- [x] Automated test suite with 53 passing unit/integration, legal, benchmark, and security tests.

### Remaining Deployment Tasks (Operator Setup)
- [ ] Set `GEMINI_API_KEY` in Vercel project environment settings.
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel project environment settings.
- [ ] Configure `ALLOWED_ORIGINS` in Vercel with your production domain(s).
- [ ] Configure custom domain DNS records (CNAME pointing to `cname.vercel-dns.com`).
- [ ] Verify Supabase Auth Site URL and Redirect URLs match the production domain.

---

## 6. Verification Runbook & Health Checks

Execute this verification runbook before and after production deployment:

### 1. Offline Automated Test Suite
```bash
npm test
```
*Expected: All 53 automated tests pass across CORS security policy, server intelligence, lifecycle state machine, schema sanitization, financial arithmetic validation, duplicate detection, CSV formula injection mitigation, file signatures, legal readiness disclosures, synthetic benchmark fixtures, and error masking.*

### 2. TypeScript Compilation & Production Build
```bash
npm run build
```
*Expected: Clean compilation with 0 TypeScript errors and Vite bundle generated in `dist/`.*

### 3. Server Endpoint Health Check
Query the health check endpoint:
```bash
curl -s http://localhost:3001/api/health | jq .
# Or against production:
curl -s https://app.ledgerlens.ai/api/health | jq .
```
*Expected JSON response:*
```json
{
  "status": "ok",
  "service": "LedgerLens AI Intelligence Server",
  "configured": true,
  "ai_configured": true,
  "ai_model": "gemini-2.5-flash"
}
```

### 4. Optional Live Supabase Environment Gate
To run full end-to-end integration tests against an active Supabase test instance:
```bash
npm run test:live
```
*Expected:*
- `live_security_gate.mjs`: 20/20 multi-tenant isolation tests pass.
- `security_constraints_gate.mjs`: All storage and DB constraint gates pass.
- `live_phase2_gate.mjs`: 10/10 lifecycle transition and review gates pass.
- `live_server_e2e_gate.mjs`: End-to-end extraction and export verification passes.
