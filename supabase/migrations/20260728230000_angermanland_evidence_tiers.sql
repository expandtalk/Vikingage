-- Ångermanland: sätt evidence_tier på de 21 nya klusterpunkterna (saknade tier → osynliga på
-- /sv/angermanland som filtrerar core/extended). Gradering enligt evidensstyrka:
--   core     = fysiska, arkeologiskt/Länsstyrelse-verifierade monument (högar, gravfält, fornborg)
--   extended = namntolkningar / hypotes (svagare, ofta omtvistad onomastik)
-- (De 41 ursprungliga hade redan tier satt.)

begin;

-- Alla nyinfogade (tier saknas) → extended som utgångspunkt.
update public.central_place_names set evidence_tier = 'extended' where evidence_tier is null;

-- Fysiska, verifierade monument (Länsstyrelsen Y24 / arkeologi) → core.
update public.central_place_names set evidence_tier = 'core'
where name in (
  'Storhögen (Hovsjorden)', 'Salom gravfält', 'Rossvik gravhögar', 'Holshögen',
  'Salum högstatusgrav', 'Ärsta gravhögar', 'Rogsta fornborg'
);

commit;

-- Kontroll: select evidence_tier, count(*) from central_place_names group by 1;
