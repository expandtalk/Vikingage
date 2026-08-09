-- Lägg fornborgs-id (swedish_hillforts.id) i v_oland_model så Öland-kartan kan länka fornborgs-
-- popupen till /fortresses/:id (claim-liggaren: faser/fynd/hypoteser/claims/källor). id läggs SIST
-- (CREATE OR REPLACE tillåter bara att kolumner läggs till på slutet). Endast hillfort-grenen bär id.
create or replace view public.v_oland_model as
 select 'runestone'::text as kind, r.signum as name, r.coordinates[1] as lat, r.coordinates[0] as lng,
    coalesce(r.object_type, ''::text) as note, null::uuid as id
   from runic_inscriptions r
  where r.signum ~~* 'Öl %'::text and r.coordinates is not null
union all
 select 'hillfort'::text as kind, h.name, h.coordinates[1] as lat, h.coordinates[0] as lng,
    coalesce(h.fortress_type, ''::text) as note, h.id
   from swedish_hillforts h
  where h.coordinates[1] >= 56.20 and h.coordinates[1] <= 57.37 and h.coordinates[0] >= 16.38 and h.coordinates[0] <= 17.16
union all
 select 'fro_name'::text as kind, p.name, p.lat, p.lng, 'Frö-namn'::text as note, null::uuid as id
   from place_names p
  where p.lat >= 56.20 and p.lat <= 57.37 and p.lng >= 16.38 and p.lng <= 17.16 and (p.name ~~* 'frö%' or p.name ~~* '%frö' or p.name ~~* 'frös%' or p.name ~~* '%frö %')
union all
 select 'find'::text as kind, co.name, co.coordinates[1] as lat, co.coordinates[0] as lng,
    coalesce(co.denomination, co.category) as note, null::uuid as id
   from coins co
  where co.coordinates is not null and co.coordinates[1] >= 56.20 and co.coordinates[1] <= 57.37 and co.coordinates[0] >= 16.38 and co.coordinates[0] <= 17.16
union all
 select 'church'::text as kind, e.name, e.lat, e.lng, coalesce(e.built_from::text, ''::text) as note, null::uuid as id
   from ecclesiastical_sites e
  where e.lat >= 56.20 and e.lat <= 57.37 and e.lng >= 16.38 and e.lng <= 17.16
union all
 select 'cult'::text as kind, cs.name, cs.lat, cs.lng, coalesce(cs.type, ''::text) as note, null::uuid as id
   from cult_sites cs
  where cs.lat >= 56.20 and cs.lat <= 57.37 and cs.lng >= 16.38 and cs.lng <= 17.16;
