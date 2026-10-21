-- ==============================================================================
-- LedgerLens AI — Phase 2: Invoice Intelligence, Validation & Audit Schema
-- Migration: 20261022000001_phase2_intelligence.sql
-- ==============================================================================

-- 1. Invoice Structured Extractions Table
CREATE TABLE IF NOT EXISTS public.invoice_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  supplier_name TEXT,
  supplier_address TEXT,
  supplier_tax_id TEXT,
  customer_name TEXT,
  customer_address TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  purchase_order_number TEXT,
  subtotal NUMERIC(14, 2),
  tax_rate NUMERIC(6, 4),
  tax_amount NUMERIC(14, 2),
  discount_amount NUMERIC(14, 2) DEFAULT 0,
  shipping_amount NUMERIC(14, 2) DEFAULT 0,
  grand_total NUMERIC(14, 2),
  payment_terms TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  field_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_extraction JSONB,
  extractor_provider TEXT NOT NULL DEFAULT 'heuristic_engine_v1',
  is_latest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_document_id ON public.invoice_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_extractions_workspace_id ON public.invoice_extractions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_extractions_supplier ON public.invoice_extractions(workspace_id, supplier_name);
CREATE INDEX IF NOT EXISTS idx_extractions_inv_num ON public.invoice_extractions(workspace_id, invoice_number);

-- 2. Invoice Validation Issues Table (Discrepancies, Missing Fields, Duplicate Flags)
CREATE TABLE IF NOT EXISTS public.invoice_validation_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('arithmetic_discrepancy', 'missing_field', 'date_inconsistency', 'duplicate_warning', 'format_warning')),
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
  field_key TEXT,
  message TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_validation_document_id ON public.invoice_validation_issues(document_id);
CREATE INDEX IF NOT EXISTS idx_validation_workspace_id ON public.invoice_validation_issues(workspace_id);

-- 3. Invoice Audit Events Table (Append-Only)
CREATE TABLE IF NOT EXISTS public.invoice_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'processing_queued',
      'processing_started',
      'extraction_completed',
      'validation_failed',
      'processing_failed',
      'field_corrected',
      'approved',
      'rejected',
      'exported',
      'reprocessed'
    )
  ),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_document_id ON public.invoice_audit_events(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_workspace_id ON public.invoice_audit_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.invoice_audit_events(created_at);

-- 4. Enable Row Level Security
ALTER TABLE public.invoice_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_validation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_audit_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for invoice_extractions
DROP POLICY IF EXISTS "Members can view extractions in their workspace" ON public.invoice_extractions;
CREATE POLICY "Members can view extractions in their workspace"
  ON public.invoice_extractions FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert extractions in their workspace" ON public.invoice_extractions;
CREATE POLICY "Members can insert extractions in their workspace"
  ON public.invoice_extractions FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can update extractions in their workspace" ON public.invoice_extractions;
CREATE POLICY "Members can update extractions in their workspace"
  ON public.invoice_extractions FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- 6. RLS Policies for invoice_validation_issues
DROP POLICY IF EXISTS "Members can view validation issues in their workspace" ON public.invoice_validation_issues;
CREATE POLICY "Members can view validation issues in their workspace"
  ON public.invoice_validation_issues FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert validation issues in their workspace" ON public.invoice_validation_issues;
CREATE POLICY "Members can insert validation issues in their workspace"
  ON public.invoice_validation_issues FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can update validation issues in their workspace" ON public.invoice_validation_issues;
CREATE POLICY "Members can update validation issues in their workspace"
  ON public.invoice_validation_issues FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- 7. RLS Policies for invoice_audit_events (Append-Only)
DROP POLICY IF EXISTS "Members can view audit events in their workspace" ON public.invoice_audit_events;
CREATE POLICY "Members can view audit events in their workspace"
  ON public.invoice_audit_events FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert audit events in their workspace" ON public.invoice_audit_events;
CREATE POLICY "Members can insert audit events in their workspace"
  ON public.invoice_audit_events FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- Note: No UPDATE or DELETE policies on invoice_audit_events to guarantee append-only immutability.

-- 8. Validated State Transition RPC Function
CREATE OR REPLACE FUNCTION public.transition_document_status(
  _document_id UUID,
  _target_status TEXT,
  _reason TEXT DEFAULT NULL,
  _event_details JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc RECORD;
  v_caller UUID;
  v_valid BOOLEAN := false;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update document status';
  END IF;

  SELECT * INTO v_doc FROM public.documents WHERE id = _document_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  -- Ensure caller is a member of the document's workspace
  IF NOT public.is_workspace_member(v_doc.workspace_id, v_caller) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this workspace';
  END IF;

  -- Enforce explicit lifecycle state machine:
  -- uploaded -> queued
  -- queued -> processing, failed
  -- processing -> review_required, failed
  -- review_required -> approved, rejected, queued (reprocess)
  -- rejected -> queued (retry)
  -- failed -> queued (retry)
  -- approved -> cannot transition
  IF v_doc.status = 'uploaded' AND _target_status = 'queued' THEN
    v_valid := true;
  ELSIF v_doc.status = 'queued' AND _target_status IN ('processing', 'failed') THEN
    v_valid := true;
  ELSIF v_doc.status = 'processing' AND _target_status IN ('review_required', 'failed') THEN
    v_valid := true;
  ELSIF v_doc.status = 'review_required' AND _target_status IN ('approved', 'rejected', 'queued') THEN
    v_valid := true;
  ELSIF v_doc.status = 'rejected' AND _target_status = 'queued' THEN
    v_valid := true;
  ELSIF v_doc.status = 'failed' AND _target_status = 'queued' THEN
    v_valid := true;
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Invalid document state transition from % to %', v_doc.status, _target_status;
  END IF;

  -- Update document status
  UPDATE public.documents
  SET status = _target_status,
      updated_at = now()
  WHERE id = _document_id;

  -- Record audit event
  INSERT INTO public.invoice_audit_events (
    document_id,
    workspace_id,
    actor_id,
    event_type,
    details
  )
  VALUES (
    _document_id,
    v_doc.workspace_id,
    v_caller,
    CASE
      WHEN _target_status = 'queued' AND v_doc.status IN ('review_required', 'rejected', 'failed') THEN 'reprocessed'::text
      WHEN _target_status = 'queued' THEN 'processing_queued'::text
      WHEN _target_status = 'processing' THEN 'processing_started'::text
      WHEN _target_status = 'review_required' THEN 'extraction_completed'::text
      WHEN _target_status = 'failed' THEN 'processing_failed'::text
      WHEN _target_status = 'approved' THEN 'approved'::text
      WHEN _target_status = 'rejected' THEN 'rejected'::text
      ELSE 'processing_queued'::text
    END,
    jsonb_build_object(
      'previous_status', v_doc.status,
      'new_status', _target_status,
      'reason', _reason,
      'metadata', _event_details
    )
  );

  RETURN jsonb_build_object(
    'document_id', _document_id,
    'previous_status', v_doc.status,
    'new_status', _target_status,
    'updated_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.transition_document_status(UUID, TEXT, TEXT, JSONB) TO authenticated, service_role;
