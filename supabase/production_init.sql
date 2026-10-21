-- ==============================================================================
-- LedgerLens AI — Consolidated Production Database & Storage Setup
-- Run this complete script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lxupcuczoebhmgfhzfox/sql/new
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Workspaces Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Workspace Memberships Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 3. Security Definer Helper Functions (Avoids RLS policy recursion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND role = 'owner'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_workspace_owner(UUID, UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. Atomic Workspace Creation Function
-- Ensures creating a workspace atomically grants the caller the 'owner' role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ws_id UUID;
  clean_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a workspace';
  END IF;

  clean_name := TRIM(name);
  IF clean_name = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be empty';
  END IF;

  INSERT INTO public.workspaces (name, created_by)
  VALUES (clean_name, auth.uid())
  RETURNING id INTO new_ws_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_ws_id, auth.uid(), 'owner');

  RETURN new_ws_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. Documents Metadata Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 20971520), -- Max 20MB
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (
    status IN ('uploaded', 'queued', 'processing', 'review_required', 'approved', 'rejected', 'failed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performant workspace queries
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);

-- ------------------------------------------------------------------------------
-- 6. Trigger for updated_at on documents
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. Table Row Level Security Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Workspaces RLS
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces
  FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(id, auth.uid()));

DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.workspaces;
CREATE POLICY "Owners can update their workspaces"
  ON public.workspaces
  FOR UPDATE
  TO authenticated
  USING (public.is_workspace_owner(id, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.workspaces;
CREATE POLICY "Owners can delete their workspaces"
  ON public.workspaces
  FOR DELETE
  TO authenticated
  USING (public.is_workspace_owner(id, auth.uid()));

-- Workspace Members RLS
DROP POLICY IF EXISTS "Members can view memberships of their workspaces" ON public.workspace_members;
CREATE POLICY "Members can view memberships of their workspaces"
  ON public.workspace_members
  FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Only workspace owners can add members" ON public.workspace_members;
CREATE POLICY "Only workspace owners can add members"
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Only workspace owners can update member roles" ON public.workspace_members;
CREATE POLICY "Only workspace owners can update member roles"
  ON public.workspace_members
  FOR UPDATE
  TO authenticated
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Owners or members themselves can remove memberships" ON public.workspace_members;
CREATE POLICY "Owners or members themselves can remove memberships"
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    public.is_workspace_owner(workspace_id, auth.uid()) OR user_id = auth.uid()
  );

-- Documents RLS
DROP POLICY IF EXISTS "Members can view documents in their workspace" ON public.documents;
CREATE POLICY "Members can view documents in their workspace"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert documents into their workspace" ON public.documents;
CREATE POLICY "Members can insert documents into their workspace"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id, auth.uid())
    AND uploaded_by = auth.uid()
  );

DROP POLICY IF EXISTS "Members can update documents in their workspace" ON public.documents;
CREATE POLICY "Members can update documents in their workspace"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can delete documents in their workspace" ON public.documents;
CREATE POLICY "Members can delete documents in their workspace"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ------------------------------------------------------------------------------
-- 8. Storage Configuration & Storage RLS
-- ------------------------------------------------------------------------------

-- Ensure Private Storage Bucket Exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Helper function to extract workspace UUID from storage folder: {workspace_id}/{document_id}.{ext}
CREATE OR REPLACE FUNCTION public.storage_workspace_id(name TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN ((storage.foldername(name))[1])::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.storage_workspace_id(TEXT) TO authenticated, service_role;

-- Storage Objects Policies
DROP POLICY IF EXISTS "Workspace members can read invoice objects" ON storage.objects;
CREATE POLICY "Workspace members can read invoice objects"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );

DROP POLICY IF EXISTS "Workspace members can upload invoice objects" ON storage.objects;
CREATE POLICY "Workspace members can upload invoice objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );

DROP POLICY IF EXISTS "Workspace members can delete invoice objects" ON storage.objects;
CREATE POLICY "Workspace members can delete invoice objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );

-- ==============================================================================
-- 9. Phase 2: Invoice Intelligence, Validation & Audit Schema
-- ==============================================================================

-- 9.1 Invoice Structured Extractions Table
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

-- 9.2 Invoice Validation Issues Table
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

-- 9.3 Invoice Audit Events Table (Append-Only)
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

-- 9.4 Enable Row Level Security
ALTER TABLE public.invoice_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_validation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_audit_events ENABLE ROW LEVEL SECURITY;

-- 9.5 RLS Policies for invoice_extractions
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

-- 9.6 RLS Policies for invoice_validation_issues
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

-- 9.7 RLS Policies for invoice_audit_events (Append-Only)
DROP POLICY IF EXISTS "Members can view audit events in their workspace" ON public.invoice_audit_events;
CREATE POLICY "Members can view audit events in their workspace"
  ON public.invoice_audit_events FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert audit events in their workspace" ON public.invoice_audit_events;
CREATE POLICY "Members can insert audit events in their workspace"
  ON public.invoice_audit_events FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- 9.8 Validated State Transition RPC Function
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

  IF NOT public.is_workspace_member(v_doc.workspace_id, v_caller) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this workspace';
  END IF;

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

  UPDATE public.documents
  SET status = _target_status,
      updated_at = now()
  WHERE id = _document_id;

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

