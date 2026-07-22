-- Fornborgsberikning: nearby_runestones. Applicerad via MCP execute_sql; fil = proveniens.
-- Antal runinskrifter (runic_inscriptions) inom 3 km från varje fornborg (PostGIS geodetisk
-- ST_DWithin). 1236 borgar beräknade; 507 har ≥1 runsten inom 3 km (max 158, Upplandstäta lägen).
-- Socken + geoposition fanns redan (parish + coordinates). Härad går EJ att härleda via
-- point-in-polygon — hundreds-tabellen saknar geometri (bara namn/id); kräver parish→härad-crosswalk.
alter table public.swedish_hillforts add column if not exists nearby_runestones integer;
with rp as (
  select id, ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326)::geography g
  from public.swedish_hillforts where coordinates is not null
),
ri as (
  select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326)::geography g
  from public.runic_inscriptions where coordinates is not null
)
update public.swedish_hillforts h set nearby_runestones = c.n
from (select rp.id, count(ri.*) n from rp left join ri on ST_DWithin(rp.g, ri.g, 3000) group by rp.id) c
where h.id = c.id;
