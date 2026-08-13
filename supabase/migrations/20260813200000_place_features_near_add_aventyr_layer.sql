-- Lägg till ÄVENTYR-lager (experiences: bad/fiske/upplevelser) i den återanvändbara platskartan.
-- Daniel: platssidorna (Göteborg m.fl.) ska ha nutidslager "Äventyr & natur" överst, inte bara arkeologi.
-- Allt annat oförändrat (CREATE OR REPLACE → grants till anon/auth består). Applicerad i prod via MCP;
-- denna fil = repo-spegling. 2026-08-13.
create or replace function public.place_features_near(
  p_lat double precision, p_lng double precision,
  p_radius_m integer default 25000, p_per_layer integer default 400
) returns table(layer text, id text, name text, lat double precision, lng double precision, sublabel text, source text)
language sql stable set search_path to 'public','extensions'
as $$
with center as (select ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography as g),
raw as (
  select case
      when h.raa_type ~* '(megalit|dös|dos|gånggrift|ganggrift|domarring|skeppssättn|hällkist)' then 'megalit'
      when h.raa_type ~* '(hällrist|hallrist|skålgrop|skalgrop|ristning)' then 'hallristning'
      when h.raa_type ~* 'grott' then 'grotta'
      when h.raa_type ~* '(offer|kult|helig|källa med tradition)' then 'offer'
      when h.raa_type ~* '(avrätt|galg|stegel)' then 'avrattning'
      when h.raa_type ~* '(rest sten|bautasten|resta sten)' then 'rest_sten'
      else 'fornlamning' end as layer,
    h.id::text, h.name, h.lat, h.lng, h.raa_type as sublabel, 'heritage_sites' as source
  from public.heritage_sites h, center c
  where h.geom is not null and ST_DWithin(h.geom::geography, c.g, p_radius_m)
  union all
  select case when r.object_category ilike '%bildsten%' or r.object_type ilike '%bildsten%' or r.object_type ilike '%picture%'
              then 'bildsten' else 'runsten' end,
    r.id::text, coalesce(nullif(r.name,''), r.signum), r.coordinates[1], r.coordinates[0], r.signum, 'runic_inscriptions'
  from public.runic_inscriptions r, center c
  where r.coordinates is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326)::geography, c.g, p_radius_m)
  union all
  select 'mynt', co.id::text, coalesce(nullif(co.name,''), 'Myntfynd'), co.coordinates[1], co.coordinates[0], co.find_place, 'coins'
  from public.coins co, center c
  where co.coordinates is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(co.coordinates[0], co.coordinates[1]),4326)::geography, c.g, p_radius_m)
  union all
  select 'kyrka', e.id::text, e.name, e.lat, e.lng, null, 'ecclesiastical_sites'
  from public.ecclesiastical_sites e, center c
  where e.geom is not null and ST_DWithin(e.geom::geography, c.g, p_radius_m)
  union all
  select 'kristen', cs.id::text, cs.name, cs.coordinates[1], cs.coordinates[0], cs.site_type, 'christian_sites'
  from public.christian_sites cs, center c
  where cs.coordinates is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(cs.coordinates[0], cs.coordinates[1]),4326)::geography, c.g, p_radius_m)
  union all
  select 'offer', ct.id::text, ct.name, ct.lat, ct.lng, 'kultplats', 'cult_sites'
  from public.cult_sites ct, center c
  where ct.lat is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(ct.lng, ct.lat),4326)::geography, c.g, p_radius_m)
  union all
  -- ÄVENTYR & NATUR (nutid): bad, fiske, upplevelser. sublabel bär typ (bath_kind/subtype/category).
  select 'aventyr', ex.id::text, ex.name, ex.lat, ex.lng,
    coalesce(nullif(ex.bath_kind,''), nullif(ex.subtype,''), ex.category), 'experiences'
  from public.experiences ex, center c
  where ex.lat is not null and ex.lng is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(ex.lng, ex.lat),4326)::geography, c.g, p_radius_m)
),
ranked as (
  select *, row_number() over (partition by layer order by (name is null), name) as rn from raw
)
select layer, id, name, lat, lng, sublabel, source from ranked where rn <= p_per_layer;
$$;
