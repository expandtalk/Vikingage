-- UGC-moderering: admin får läsa/uppdatera ALLA fältfynd (verifiera-kön), utöver ägarens egna
-- (field_obs_select_own/update_own finns kvar). place_suggestions har redan en bred admin-policy.
-- Idempotent.

DROP POLICY IF EXISTS field_obs_admin_read ON public.field_observations;
CREATE POLICY field_obs_admin_read ON public.field_observations
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS field_obs_admin_update ON public.field_observations;
CREATE POLICY field_obs_admin_update ON public.field_observations
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
