# LedgerLens AI — Production SaaS Configuration Guide

This guide describes the one-time centralized infrastructure setup for the LedgerLens AI production platform.

---

## 1. Centralized SaaS Architecture Model

LedgerLens AI operates as a **centrally managed, multi-tenant SaaS application**:

```
+-------------------------------------------------------------+
|                     End Customers                           |
|  - Sign up / Sign in at branded UI                          |
|  - Automatic atomic workspace provisioning                  |
|  - Never see or configure infrastructure                    |
|  - All errors sanitized (no SQL / vendor leaks)             |
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
                               v (Phase 2 Serverless Pipeline)
+-------------------------------------------------------------+
|            Server-Side Edge Functions (Phase 2)             |
|  - Secrets: ANTHROPIC_API_KEY / OPENAI_API_KEY / OCR creds  |
|  - Never exposed to client bundle                           |
+-------------------------------------------------------------+
```

### Key Security & Isolation Guarantees
1. **Single Central Backend:** The product owner provisions and manages **one** Supabase project. Customers never create their own Supabase accounts or configure databases.
2. **Strict Multi-Tenancy:** PostgreSQL Row Level Security (RLS) isolates workspaces and documents. Users can only query and mutate data belonging to workspaces where they hold active membership.
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
   - **Region:** Select a region close to your primary customers (e.g., `eu-west-1` for Europe or `us-east-1` for North America).
3. Under **Project Settings -> API**, retrieve:
   - **Project URL:** `https://<your-project-id>.supabase.co`
   - **Project API Keys -> `anon` (public):** `eyJhbGciOi...`
   - *(Note: Do NOT copy the `service_role` key into client environment files).*

---

### Step 2: Apply Database Schema & Migrations

Navigate to the **SQL Editor** in the Supabase Dashboard and run the migrations in order:

#### 1. Core Schema & Row-Level Security
Run `supabase/migrations/20261019000001_initial_schema.sql`:
- Creates tables:
  - `public.workspaces`: ID, name, slug, timestamps.
  - `public.workspace_members`: ID, workspace_id, user_id, role (`owner`, `admin`, `member`, `reviewer`), timestamps.
  - `public.documents`: ID, workspace_id, user_id, original_filename, storage_path, file_size_bytes, mime_type, status, timestamps.
- Enables **Row Level Security (RLS)** on all three tables.
- Creates helper functions:
  - `public.is_workspace_member(_workspace_id, _user_id)`: Security definer function for leak-proof membership validation.
  - `public.create_workspace_with_owner(workspace_name)`: Atomic transaction creating the workspace and registering the creator as `owner`.
- Configures RLS policies guaranteeing:
  - Users can only view workspaces they belong to.
  - Only owners and admins can invite members or update workspace settings.
  - Users can only read and upload documents within their active workspace.

#### 2. Private Storage Bucket & Storage Policies
Run `supabase/migrations/20261019000002_storage_setup.sql`:
- Creates the private storage bucket:
  - **Bucket Name:** `invoices`
  - **Public:** `false` (Direct URLs without tokens return HTTP 403 Forbidden).
  - **Max File Size:** `20971520` (20 MB).
  - **Allowed MIME Types:** `application/pdf`, `image/png`, `image/jpeg`.
- Creates Storage RLS policies on `storage.objects`:
  - **Read:** Workspace members can read objects where `storage.foldername(name)[1] == workspace_id`.
  - **Insert:** Workspace members can upload objects matching their workspace prefix with strict size and MIME verification.
  - **Update/Delete:** Limited to authorized workspace members.

---

### Step 3: Configure Authentication & Redirect URLs

In the Supabase Dashboard, navigate to **Authentication -> URL Configuration**:

1. **Site URL:**
   - Production: `https://app.ledgerlens.ai` (or your primary domain).
2. **Redirect URLs:**
   Add each environment redirect URL:
   - `https://app.ledgerlens.ai/**`
   - `https://*.ledgerlens.ai/**`
   - `http://localhost:5173/**` (for local development)
3. **Email Settings:**
   - Under **Authentication -> Email Templates**, brand the confirmation and password reset emails with LedgerLens AI headers.
   - For production high-volume delivery, configure a custom SMTP provider (e.g., SendGrid, Postmark, AWS SES, Resend) under **Authentication -> SMTP Settings**.

---

### Step 4: Deploy Frontend & Environment Variables

Deploy the React SPA to your hosting platform (Vercel, Cloudflare Pages, Netlify, AWS Amplify, or Docker/Nginx):

#### Production Environment Variables
| Variable Name | Description | Visibility | Example |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Central Supabase Project URL | Public / Client | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anonymous Key | Public / Client | `eyJhbGciOi...` |

#### Build Settings
- **Build Command:** `npm run build` (runs `tsc -b && vite build`)
- **Output Directory:** `dist`
- **Node.js Version:** `18+` or `20+`

#### SPA Rewrite Configuration
Ensure the web server routes all non-static requests to `index.html`:

**Vercel (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify (`public/_redirects`):**
```text
/*    /index.html   200
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

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

## 4. Phase 2 AI Pipeline Preparation & Secrets Management

In Phase 2, automated OCR and AI extraction will process uploaded invoices.

### Server-Side Secrets Architecture
- **AI Credentials:** AI vendor API keys (Anthropic Claude, OpenAI, or document extraction endpoints) must **NEVER** be prefixed with `VITE_` or embedded in the client application.
- **Serverless Edge Functions:** All AI extraction will run in Supabase Edge Functions (`supabase/functions/process-invoice/index.ts`).
- **Storing Edge Secrets:**
  ```bash
  # In terminal via Supabase CLI
  supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
  supabase secrets set OPENAI_API_KEY="sk-proj-..."
  ```
- **Execution Lifecycle:**
  1. Frontend uploads invoice to `invoices` bucket -> inserts record into `public.documents` with `status = 'pending_processing'`.
  2. Database webhook or Storage trigger invokes the Edge Function with the `document_id`.
  3. The Edge Function verifies authentication via service-role key, downloads the file buffer, invokes the AI model, validates cross-sums, and records extracted fields.
  4. The client receives realtime updates or fetches the structured result when navigating to `/app/documents/:id`.

---

## 5. Verification Runbook & Health Checks

After configuring production, execute this verification runbook:

1. **Test Suite:**
   ```bash
   npm test
   ```
   *Expected: All 12 security, MIME validation, path isolation, and error sanitization tests pass.*

2. **Production Build:**
   ```bash
   npm run build
   ```
   *Expected: Clean TypeScript compilation and Vite build with 0 errors.*

3. **Public Website Integrity:**
   - Verify `/` loads marketing homepage with interactive demo and zero console errors.
   - Verify `/about` loads editorial about page with company principles.

4. **Customer Onboarding Smoke Test:**
   - Navigate to `/app/auth`.
   - Register a new user: `testuser@example.com` with company name `Apex Logistics`.
   - Check Supabase Dashboard -> `public.workspaces` has record `Apex Logistics`.
   - Check `public.workspace_members` has the user as `role = 'owner'`.
   - Verify user is redirected to `/app/documents`.

5. **Storage & Multi-Tenant Isolation Smoke Test:**
   - Upload a test PDF invoice (`sample-invoice.pdf`).
   - Verify file is stored in `invoices` bucket under `<workspace_id>/<document_uuid>.pdf`.
   - Click "Download Original" -> signed URL generates with 3600-second expiration.
   - Log out and attempt direct download without signed token -> HTTP 403 Forbidden.
