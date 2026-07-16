-- Watertight RLS: close public write holes + open locked reference tables.
--
-- Live audit (2026-07-17) on the PUBLIC repo's database found:
--  * runic_inscriptions — PUBLIC INSERT + UPDATE (anyone with the anon key could
--    create or edit runestone records). Critical.
--  * coordinates, crosses, crossforms, crossdescs, cross_crossform, translations —
--    "Allow all operations" (FOR ALL USING true) → anonymous write/delete.
--  * object_artefact, qpadm_analysis, reference_populations, swedish_localities —
--    RLS enabled but ZERO policies → locked (reads fail).
--
-- Model everywhere: public SELECT, admin-only write via public.is_admin().
-- Non-destructive: only policies change; no data touched.

-- ── runic_inscriptions: drop public writes, add admin-only writes ────────────
DROP POLICY IF EXISTS "Allow public insert access to runic inscriptions" ON public.runic_inscriptions;
DROP POLICY IF EXISTS "Allow public update access to runic inscriptions" ON public.runic_inscriptions;
DROP POLICY IF EXISTS "Admins manage runic inscriptions" ON public.runic_inscriptions;
CREATE POLICY "Admins manage runic inscriptions"
  ON public.runic_inscriptions FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
-- (existing public SELECT policies are preserved)

-- ── coordinates: has a separate public SELECT already; just drop ALL-true ────
DROP POLICY IF EXISTS "Allow all operations on coordinates" ON public.coordinates;
DROP POLICY IF EXISTS "Admins manage coordinates" ON public.coordinates;
CREATE POLICY "Admins manage coordinates"
  ON public.coordinates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── crosses / crossforms / crossdescs / cross_crossform / translations ───────
-- These had ONLY an ALL-true policy (no separate SELECT), so replace with
-- public SELECT + admin write.
DROP POLICY IF EXISTS "Allow all operations on crosses" ON public.crosses;
CREATE POLICY "Public read crosses" ON public.crosses FOR SELECT USING (true);
CREATE POLICY "Admins manage crosses" ON public.crosses FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow all operations on crossforms" ON public.crossforms;
CREATE POLICY "Public read crossforms" ON public.crossforms FOR SELECT USING (true);
CREATE POLICY "Admins manage crossforms" ON public.crossforms FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow all operations on crossdescs" ON public.crossdescs;
CREATE POLICY "Public read crossdescs" ON public.crossdescs FOR SELECT USING (true);
CREATE POLICY "Admins manage crossdescs" ON public.crossdescs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow all operations on cross_crossform" ON public.cross_crossform;
CREATE POLICY "Public read cross_crossform" ON public.cross_crossform FOR SELECT USING (true);
CREATE POLICY "Admins manage cross_crossform" ON public.cross_crossform FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow all access for authenticated users on translations" ON public.translations;
CREATE POLICY "Public read translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins manage translations" ON public.translations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Locked reference tables: add public read + admin write ───────────────────
CREATE POLICY "Public read object_artefact" ON public.object_artefact FOR SELECT USING (true);
CREATE POLICY "Admins manage object_artefact" ON public.object_artefact FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read qpadm_analysis" ON public.qpadm_analysis FOR SELECT USING (true);
CREATE POLICY "Admins manage qpadm_analysis" ON public.qpadm_analysis FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read reference_populations" ON public.reference_populations FOR SELECT USING (true);
CREATE POLICY "Admins manage reference_populations" ON public.reference_populations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read swedish_localities" ON public.swedish_localities FOR SELECT USING (true);
CREATE POLICY "Admins manage swedish_localities" ON public.swedish_localities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
