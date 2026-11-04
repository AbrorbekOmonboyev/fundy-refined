-- =============================================================================
-- File storage
--
-- Every upload goes into a folder named after the uploader's user id:
--     <bucket>/<user_id>/<file>
-- so users can only add, replace or delete files in their own folder.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  -- Project cover and gallery images — anyone can view.
  ('project-images', 'project-images', true, 5242880,
     array['image/jpeg', 'image/png', 'image/webp']),
  -- Profile pictures — anyone can view.
  ('avatars', 'avatars', true, 2097152,
     array['image/jpeg', 'image/png', 'image/webp']),
  -- Registration certificates, business plans, ID — private, for review only.
  ('project-documents', 'project-documents', false, 10485760,
     array['application/pdf', 'image/jpeg', 'image/png']);

-- Public images: upload / replace / delete only in your own folder.
create policy "upload own images" on storage.objects for insert to authenticated with check (
  bucket_id in ('project-images', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "read own images" on storage.objects for select to authenticated using (
  bucket_id in ('project-images', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "replace own images" on storage.objects for update to authenticated using (
  bucket_id in ('project-images', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "delete own images" on storage.objects for delete to authenticated using (
  bucket_id in ('project-images', 'avatars')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Private documents: the uploader and admins can read; only the uploader can add/delete.
create policy "upload own documents" on storage.objects for insert to authenticated with check (
  bucket_id = 'project-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "read own documents or as admin" on storage.objects for select to authenticated using (
  bucket_id = 'project-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin())
);
create policy "delete own documents" on storage.objects for delete to authenticated using (
  bucket_id = 'project-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
