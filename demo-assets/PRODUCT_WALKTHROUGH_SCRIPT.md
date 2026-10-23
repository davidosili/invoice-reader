# LedgerLens AI — Product Walkthrough Script & Storyboard

**Duration:** ~90 seconds  
**Target Audience:** Microsoft for Startups evaluators, technical reviewers, and prospective B2B pilot partners.  
**Tone:** Concise, evidence-based, transparent, and technically grounded.  
**Demonstration Dataset:** Fictional synthetic invoices from `demo-assets/synthetic-invoices/`.

---

## 1. Ordered Storyboard & Visual Sequence

| Time | Scene | Visual Asset / Interface Screen | Core Message / Demonstration Point |
|---|---|---|---|
| **0:00 – 0:12** | **Scene 1: Introduction & Architecture** | `demo-assets/screenshots/01_homepage.png`<br>`demo-assets/screenshots/02_pricing_page.png` | AI-native invoice verification for high-volume B2B workloads. Combines Google Gemini 2.5 Flash multimodal vision with deterministic arithmetic validation. |
| **0:12 – 0:25** | **Scene 2: Multi-Tenant Workspace & Ingestion** | `demo-assets/screenshots/06_authenticated_workspace_documents.png` | Authenticated, multi-tenant workspace with PostgreSQL Row Level Security. Secure document upload (PDF, PNG, JPEG up to 20MB) to private cloud storage. |
| **0:25 – 0:42** | **Scene 3: Multimodal Extraction & Review Console** | `demo-assets/screenshots/07_scenario_a_clean_review_console.png` | Side-by-side inspection console. Google Gemini extracts supplier details, tax IDs, line items, and totals with visual coordinate bounding boxes. |
| **0:42 – 0:58** | **Scene 4: Deterministic Arithmetic Verification** | `demo-assets/screenshots/08_scenario_c_arithmetic_discrepancy.png` | Deterministic rules engine catches arithmetic discrepancies ($2,450 printed vs $1,980 calculated). Human-in-the-loop field correction and persistence. |
| **0:58 – 1:12** | **Scene 5: Date Conflict & Duplicate Detection** | `demo-assets/screenshots/09_scenario_e_date_inconsistency.png`<br>`demo-assets/screenshots/10_scenario_f_duplicate_warning.png` | High-confidence duplicate invoice detection and inverted due date warnings. Reviewer rejects fraudulent/redundant billing. |
| **1:12 – 1:30** | **Scene 6: Governance, Audit Trail & CSV Export** | Terminal / CSV Export Output | PostgreSQL-enforced state machine (`uploaded → approved/rejected`). Immutable append-only audit trail and formula-injection-safe CSV export. |

---

## 2. Narration Script & On-Screen Action

### Scene 1: Platform Overview (0:00 – 0:12)
- **Visual:** Display public marketing homepage (`demo-assets/screenshots/01_homepage.png`), then transition to transparent pricing (`02_pricing_page.png`).
- **Voiceover / Narration:**
  > *"Welcome to LedgerLens AI. For distributors, wholesalers, and accounting operations, supplier paperwork is a major bottleneck. LedgerLens AI transforms incoming invoices into structured, mathematically verified records. It bridges probabilistic AI multimodal extraction with deterministic financial arithmetic to guarantee human review over every consequential business figure."*

### Scene 2: Secure Multi-Tenant Ingestion (0:12 – 0:25)
- **Visual:** Display authenticated document list (`demo-assets/screenshots/06_authenticated_workspace_documents.png`) showing uploaded synthetic benchmark invoices with status badges (`approved`, `rejected`, `review_required`).
- **Voiceover / Narration:**
  > *"Here is the authenticated workspace. Every document belongs to an isolated workspace protected by PostgreSQL Row Level Security. Documents up to 20MB are ingested into private cloud storage with client and server-side magic-byte validation to reject disguised files or malicious scripts."*

### Scene 3: Multimodal AI Extraction in Action (0:25 – 0:42)
- **Visual:** Open Scenario A clean invoice review view (`demo-assets/screenshots/07_scenario_a_clean_review_console.png`). Show original PDF preview on the left and extracted structured fields on the right.
- **Voiceover / Narration:**
  > *"When a document is processed, Google Gemini 2.5 Flash analyzes the visual layout server-side. Within seconds, it extracts the supplier legal name, VAT identification, invoice numbers, line items, and totals. Notice the coordinate bounding boxes that trace each extracted field directly back to its source on the document."*

### Scene 4: Deterministic Arithmetic Verification & Human Correction (0:42 – 0:58)
- **Visual:** Open Scenario C invoice (`demo-assets/screenshots/08_scenario_c_arithmetic_discrepancy.png`). Highlight the prominent error banner: `Grand total discrepancy: Stated total ($2,450.00) does not match calculated total ($1,980.00)`. Show the reviewer typing the corrected $1,980.00 amount and saving.
- **Voiceover / Narration:**
  > *"Pure OCR often fails silently on corrupted totals. LedgerLens AI runs deterministic math: verifying quantity times unit price, subtotal sums, and tax rates. On this invoice, the printed total was artificially inflated to $2,450. Our engine flagged the $470 variance immediately. The reviewer corrects the figure to $1,980, saves the record, and the update is permanently persisted."*

### Scene 5: Date Inconsistencies & Workspace Duplicate Detection (0:58 – 1:12)
- **Visual:** Quick split-view of Scenario E (`demo-assets/screenshots/09_scenario_e_date_inconsistency.png`) showing date warning, followed by Scenario F (`demo-assets/screenshots/10_scenario_f_duplicate_warning.png`) showing duplicate invoice warning badge.
- **Voiceover / Narration:**
  > *"The engine also identifies date conflicts—such as payment due dates preceding issue dates—and detects duplicate invoices within the workspace by normalizing supplier legal suffixes and reference numbers. Redundant or unverified bills can be immediately rejected with an audit explanation."*

### Scene 6: Immutable Audit Governance & CSV Export (1:12 – 1:30)
- **Visual:** Scroll down to the Audit Events timeline showing `processing_queued → processing_started → extraction_completed → field_corrected → approved`. Click 'Export CSV' to display the formula-injection-safe CSV output.
- **Voiceover / Narration:**
  > *"Every lifecycle decision is logged to an immutable, append-only PostgreSQL table that cannot be edited or deleted. Finally, certified approved invoices export into standardized CSV files, automatically sanitized against spreadsheet formula injection. That is LedgerLens AI: grounded vision AI, deterministic math verification, and transparent human control."*

---

## 3. Evaluator Reproduction Instructions

Technical evaluators can reproduce this exact 8-scenario benchmark locally in under 2 minutes:

1. **Start the benchmark verification runner:**
   ```bash
   node scripts/verify_synthetic_workflow.mjs
   ```
2. **Review the structured benchmark results:**
   ```bash
   cat demo-assets/synthetic_verification_results.json | jq .
   ```
3. **Inspect the generated high-resolution screenshots:**
   ```bash
   ls -la demo-assets/screenshots/
   ```
4. **Inspect the synthetic invoice PDF fixtures:**
   ```bash
   ls -la demo-assets/synthetic-invoices/
   ```
