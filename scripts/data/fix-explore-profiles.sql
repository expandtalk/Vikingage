-- Rätta explore_profiles-config (styr runtime; koden är fallback).
-- Geneticist: bort med runstenar, in med folkgrupper. Trade: lägg till vägar (rivers-synk).
-- Kör i SQL-editorn.

-- Geneticist: ta bort runic_inscriptions, lägg till folk_groups, uppdatera primaryLayers.
update public.explore_profiles
set config = jsonb_set(
      jsonb_set(config, '{layers}',
        ((config->'layers') - 'runic_inscriptions') || '{"folk_groups": true}'::jsonb),
      '{primaryLayers}', '["archaeological_sites","folk_groups"]'::jsonb
    )
where id = 'geneticist';

-- Trade: lägg till viking_roads (paritet med focus=rivers vattennätverk + vägar).
update public.explore_profiles
set config = jsonb_set(config, '{layers,viking_roads}', 'true')
where id = 'trade';

-- Verifiering:
-- select id, config->'layers', config->'primaryLayers' from explore_profiles where id in ('geneticist','trade');
