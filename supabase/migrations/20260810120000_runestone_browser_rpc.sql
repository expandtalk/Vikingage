-- Runstensbläddrare: lean payload för hela geopositionerade korpusen (~7 400).
-- Normaliserar signum-serie (= landskapsindelningen i runologin) server-side.
-- coordinates är point (lng,lat): [0]=lng, [1]=lat (verifierat mot Uppland-stenar 59–60N/17–18E).
create or replace function public.runestone_browser()
returns table(
  id uuid,
  signum text,
  series text,
  lat double precision,
  lng double precision,
  style_group text,
  object_category text,
  has_cross boolean,
  period_start integer,
  dating_text text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ri.id,
    coalesce(ri.primary_signum, ri.signum) as signum,
    upper(substring(coalesce(ri.primary_signum, ri.signum) from '^[A-Za-zÖÅÄöåä]+')) as series,
    ri.coordinates[1]::double precision as lat,
    ri.coordinates[0]::double precision as lng,
    ri.style_group,
    ri.object_category,
    ri.has_cross,
    ri.period_start,
    ri.dating_text
  from public.runic_inscriptions ri
  where ri.coordinates is not null;
$$;

grant execute on function public.runestone_browser() to anon, authenticated;
