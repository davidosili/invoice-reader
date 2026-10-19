-- LedgerLens AI - Phase 1 Migration: Private Storage Bucket Setup & Security
-- Migration: 20261019000002_storage_setup.sql

-- 1. Create Private Bucket for Invoice Files
-- Enforces: private access (public=false), 20MB size limit, strict allowed MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  20971520, -- 20MB in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- 2. Storage Objects RLS Policies
-- Storage paths adhere to the convention: {workspace_id}/{document_id}.{ext}
-- storage.foldername(name) returns array of folders, index [1] is the workspace_id

-- Helper expression to safely extract workspace_id from storage path
-- Returns NULL if path doesn't contain a valid UUID in first position
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

-- Allow workspace members to read/download invoice objects in their workspace
CREATE POLICY "Workspace members can read invoice objects"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );

-- Allow workspace members to upload invoice objects into their workspace folder
CREATE POLICY "Workspace members can upload invoice objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );

-- Allow workspace members to delete invoice objects in their workspace folder
CREATE POLICY "Workspace members can delete invoice objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND public.storage_workspace_id(name) IS NOT NULL
    AND public.is_workspace_member(public.storage_workspace_id(name), auth.uid())
  );
