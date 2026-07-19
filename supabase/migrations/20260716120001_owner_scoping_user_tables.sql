-- Owner-scoping for user-owned tables.
--
-- Findings from a live audit (2026-07-16):
--   * research_notes        — already owner-scoped, but users cannot DELETE
--                             their own notes (only admins can). Add owner DELETE.
--   * inscription_comparisons — RLS enabled but ONLY a public SELECT policy and
--                             NO write policies, so nobody can create/update/delete
--                             a comparison (feature is effectively broken). Add
--                             owner-scoped writes. Public SELECT is preserved
--                             (comparisons are shared research artefacts); tighten
--                             later if per-user privacy is desired.
--   * researcher_profiles   — RLS enabled but ZERO policies, so the table is fully
--                             locked. Add public read + owner write. The privilege
--                             flag can_verify_notes must NOT be self-settable, so a
--                             guard trigger restricts it to admins (mirrors the
--                             existing prevent_self_privilege_escalation pattern on
--                             user_roles). Long-term this flag belongs in user_roles.
--
-- Non-destructive: adds/replaces policies and adds one trigger; no data touched.

-- research_notes: let owners delete their own notes -------------------------
DROP POLICY IF EXISTS "Users can delete own notes" ON public.research_notes;
CREATE POLICY "Users can delete own notes"
  ON public.research_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- inscription_comparisons: owner-scoped writes ------------------------------
DROP POLICY IF EXISTS "Users can create own comparisons" ON public.inscription_comparisons;
CREATE POLICY "Users can create own comparisons"
  ON public.inscription_comparisons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comparisons" ON public.inscription_comparisons;
CREATE POLICY "Users can update own comparisons"
  ON public.inscription_comparisons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comparisons" ON public.inscription_comparisons;
CREATE POLICY "Users can delete own comparisons"
  ON public.inscription_comparisons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all comparisons" ON public.inscription_comparisons;
CREATE POLICY "Admins can manage all comparisons"
  ON public.inscription_comparisons
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- researcher_profiles: public read + owner write, guard privilege flag -------
DROP POLICY IF EXISTS "Researcher profiles are publicly viewable" ON public.researcher_profiles;
CREATE POLICY "Researcher profiles are publicly viewable"
  ON public.researcher_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create own profile" ON public.researcher_profiles;
CREATE POLICY "Users can create own profile"
  ON public.researcher_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.researcher_profiles;
CREATE POLICY "Users can update own profile"
  ON public.researcher_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage researcher profiles" ON public.researcher_profiles;
CREATE POLICY "Admins can manage researcher profiles"
  ON public.researcher_profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Prevent non-admins from granting themselves the can_verify_notes privilege.
CREATE OR REPLACE FUNCTION public.prevent_self_grant_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND COALESCE(NEW.can_verify_notes, false) = true AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can set can_verify_notes';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.can_verify_notes IS DISTINCT FROM OLD.can_verify_notes AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change can_verify_notes';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_grant_verify ON public.researcher_profiles;
CREATE TRIGGER prevent_self_grant_verify
  BEFORE INSERT OR UPDATE ON public.researcher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_grant_verify();
