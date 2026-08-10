-- Självgående drift-vakt (Daniel 2026-08-10 "kör den"): pg_cron kör verify_place_claims() dagligen,
-- inuti Postgres — överlever helt utan Claude-session (till skillnad från CronCreate). Ren SQL.
-- Applicerad på prod via apply_migration (schedule_verify_place_claims_pgcron); denna fil = repo-spegel.
-- OBS: pg_cron.schedule tolkas i UTC på Supabase. '17 3 * * *' = 03:17 UTC (~04:17 vinter / 05:17 sommar sv tid).

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'verify_place_claims_daily') then
    perform cron.unschedule('verify_place_claims_daily');
  end if;
end $$;

select cron.schedule('verify_place_claims_daily', '17 3 * * *', $$select public.verify_place_claims();$$);

-- Körhistorik: select * from cron.job_run_details where jobid=(select jobid from cron.job where jobname='verify_place_claims_daily') order by start_time desc;
-- Avschemalägg: select cron.unschedule('verify_place_claims_daily');
