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
