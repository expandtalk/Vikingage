-- Grankullavik-fix: v_oland_model östgräns 17.12 klippte bort Hjerteskeppet (lng 17.122) +
-- jaktmuren (17.123) med marginal. Öland når 17.13 vid NE-udden. Höjer östgräns → 17.16
-- (öppet hav öster om Öland, drar inte in fastland). Samma def i övrigt.
begin;
create or replace view public.v_oland_model as
 select 'runestone'::text as kind, r.signum as name, r.coordinates[1] as lat, r.coordinates[0] as lng, coalesce(r.object_type,''::text) as note
   from runic_inscriptions r where r.signum ilike 'Öl %' and r.coordinates is not null
union all
 select 'hillfort', h.name, h.coordinates[1], h.coordinates[0], coalesce(h.fortress_type,'')
   from swedish_hillforts h where h.coordinates[1] between 56.20 and 57.37 and h.coordinates[0] between 16.38 and 17.16
union all
 select 'fro_name', p.name, p.lat, p.lng, 'Frö-namn'
   from place_names p where p.lat between 56.20 and 57.37 and p.lng between 16.38 and 17.16
     and (p.name ilike 'frö%' or p.name ilike '%frö' or p.name ilike 'frös%' or p.name ilike '%frö %')
union all
 select 'find', co.name, co.coordinates[1], co.coordinates[0], coalesce(co.denomination, co.category)
   from coins co where co.coordinates is not null and co.coordinates[1] between 56.20 and 57.37 and co.coordinates[0] between 16.38 and 17.16
union all
 select 'church', e.name, e.lat, e.lng, coalesce(e.built_from::text,'')
   from ecclesiastical_sites e where e.lat between 56.20 and 57.37 and e.lng between 16.38 and 17.16
union all
 select 'cult', cs.name, cs.lat, cs.lng, coalesce(cs.type,'')
   from cult_sites cs where cs.lat between 56.20 and 57.37 and cs.lng between 16.38 and 17.16;
commit;
