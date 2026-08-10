-- Säkerhetsfix (whole-branch review): rebuild_charter_tags() är SECURITY DEFINER och
-- destruktiv (TRUNCATE charter_tags + charter_year + full ombygg). Default-PUBLIC-granten
-- gjorde den anropbar anonymt via PostgREST → billig anon-DoS (ACCESS EXCLUSIVE-lås stallar
-- alla facett-sökningar på /sv/medeltidsbrev). Endast service_role/postgres ska köra den
-- (orkestrator/cron). Ingen frontend-kod anropar den, så återkallandet är säkert.
revoke execute on function public.rebuild_charter_tags() from anon;
revoke execute on function public.rebuild_charter_tags() from authenticated;
revoke execute on function public.rebuild_charter_tags() from public;
