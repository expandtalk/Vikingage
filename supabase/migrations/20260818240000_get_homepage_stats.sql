-- Prestanda: startsidans statistik hämtades via ~25 SEPARATA count-anrop (flera sekventiella) →
-- en kritisk nätverkskedja på ~4,7 s som försenade LCP och gav pop-in-känslan. Ersätts med ETT
-- RPC som räknar allt server-side i en round-trip. Returnerar exakt DbStats-formen (nästlad
-- layerCounts). STABLE + security definer så anon kan läsa räkningarna utan RLS-krångel.
create or replace function public.get_homepage_stats()
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'layerCounts', jsonb_build_object(
      'churches',    (select count(*) from ecclesiastical_sites),
      'coins',       (select count(*) from coins),
      'spolia',      (select count(*) from picture_stone_reuse),
      'species',     (select count(*) from species_introductions),
      'adnaSites',   (select count(distinct site_id) from genetic_individuals where site_id is not null),
      'heritageTotal',(select count(*) from heritage_sites),
      'estates',     (select count(*) from estates)
    ),
    'totalInscriptions', (select count(*) from runic_inscriptions),
    'totalRunestones',   public.count_runestones(),
    'totalCoordinates',  (select count(*) from coordinates),
    'totalCarvers',      (select count(*) from carvers),
    'totalArtefacts',    (select count(*) from artefacts),
    'totalCities',       (select count(*) from viking_cities),
    'totalFortresses',   (select count(*) from viking_fortresses) + (select count(*) from swedish_hillforts),
    'totalVikingNames',  coalesce((select total_names from get_viking_names_stats() limit 1), 0),
    'totalHundreds',     (select count(*) from hundreds),
    'totalParishes',     (select count(*) from parishes),
    'totalFolkGroups',   (select count(*) from folk_groups),
    'totalGods',         (select count(*) from gods),
    'totalGeneticEvents',(select count(*) from genetic_individuals),
    'totalRoyalChronicles', (select count(*) from historical_kings) + (select count(*) from historical_sources) + (select count(*) from royal_dynasties),
    'totalRivers',       (select count(*) from river_systems)
  );
$$;

revoke all on function public.get_homepage_stats() from public;
grant execute on function public.get_homepage_stats() to anon, authenticated;
