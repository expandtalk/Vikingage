-- Security fix: close the anonymous write hole on media tables.
--
-- Migration 20250716173531 created write policies on media_images and
-- inscription_media using `WITH CHECK (true)` / `USING (true)`, which let ANY
-- client (including anonymous) INSERT, UPDATE and DELETE media rows. This
-- migration replaces those permissive policies with admin-only write policies,
-- consistent with the rest of the schema (public read, admin write via
-- public.is_admin()). Public SELECT is intentionally preserved.
--
-- Non-destructive: only RLS policies are changed; no data or columns are
-- touched. If non-admin (but authenticated) researchers must be able to upload
-- media, relax the INSERT check to `auth.uid() IS NOT NULL` instead of
-- is_admin().

-- inscription_media -----------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert inscription media" ON public.inscription_media;
DROP POLICY IF EXISTS "Users can update inscription media" ON public.inscription_media;
DROP POLICY IF EXISTS "Users can delete inscription media" ON public.inscription_media;

CREATE POLICY "Admins can insert inscription media"
  ON public.inscription_media
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update inscription media"
  ON public.inscription_media
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete inscription media"
  ON public.inscription_media
  FOR DELETE
  USING (public.is_admin());

-- media_images ----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert media images" ON public.media_images;
DROP POLICY IF EXISTS "Users can update media images" ON public.media_images;
DROP POLICY IF EXISTS "Users can delete media images" ON public.media_images;

CREATE POLICY "Admins can insert media images"
  ON public.media_images
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update media images"
  ON public.media_images
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete media images"
  ON public.media_images
  FOR DELETE
  USING (public.is_admin());
