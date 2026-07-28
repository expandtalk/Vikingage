-- Plattformsövergripande statistik för wow-sidan (/statistics). Ett anrop → alla nyckeltal.
-- Ren räkning av verklig data (inget påhittat). Utökas när nya dataset läggs till.
create or replace function public.platform_stats()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'runic_total',        (select count(*) from public.runic_inscriptions),
    'runestones',         (select count(*) from public.runic_inscriptions where public.is_runestone(object_type)),
    'runic_with_cross',   (select count(*) from public.runic_inscriptions where has_cross),
    'runic_dated',        (select count(*) from public.runic_inscriptions where dating_tpq is not null or dating_taq is not null),
    'runic_christian',    (select count(*) from public.runic_inscriptions where christian_invocation is not null),
    'carvers',            (select count(*) from public.carvers),
    'churches',           (select count(*) from public.ecclesiastical_sites),
    'saints',             (select count(*) from public.saints),
    'heritage_sites',     (select count(*) from public.heritage_sites),
    'place_names',        (select count(*) from public.place_names),
    'coins',              (select count(*) from public.coins),
    'hillforts',          (select count(*) from public.swedish_hillforts),
    'fortresses',         (select count(*) from public.viking_fortresses),
    'thing_sites',        (select count(*) from public.thing_sites),
    'beacon_sites',       (select count(*) from public.beacon_sites),
    'harbors',            (select count(*) from public.harbors),
    'ore_sources',        (select count(*) from public.ore_sources),
    'genetic_individuals',(select count(*) from public.genetic_individuals),
    'kings',              (select count(*) from public.historical_kings),
    'sources',            (select count(*) from public.historical_sources),
    'picture_stone_reuse',(select count(*) from public.picture_stone_reuse),
    'estates',            (select count(*) from public.estates)
  );
$$;
