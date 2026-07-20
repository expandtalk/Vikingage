-- Fas A / A3: atomär, admin-gatad rollsättning. Sätter EN roll-rad per användare.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Blockerar självändring (footgun-skydd). validate_role_change-triggern loggar fortfarande.
CREATE OR REPLACE FUNCTION public.set_user_role(target_user uuid, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Endast administratörer kan ändra roller';
  END IF;
  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'Du kan inte ändra din egen roll';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user, new_role);
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;

COMMENT ON FUNCTION public.set_user_role(uuid, public.app_role) IS
  'Admin-gatad: sätter en enda roll-rad för target_user. Blockerar självändring.';
