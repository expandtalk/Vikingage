-- Zoom-gating + viewport-laddning för place_names (efter nationell ingest = 358k namn).
-- Utan detta laddar kart-lagret .neq('osm') = 316k rader (frys/godtyckliga 1000). Nu: label_min_zoom
-- per typ (tätort/kyrka syns tidigt, gård/torp först vid inzoomning) + en bbox+zoom-RPC som cappar.

-- 1) label_min_zoom per Lantmäteri-namntyp (och OSM/övrigt). Lägre = syns tidigare (mer prominent).
update public.place_names set label_min_zoom = case
  when feature_type = 'BEBTÄTTX' then 7   -- tätort
  when feature_type = 'KYRKATX'  then 9   -- kyrka
  when feature_type = 'KULTURTX' then 10  -- kultur/fornlämning
  when feature_type = 'ANLTX'    then 11  -- anläggning
  when feature_type = 'BEBTX'    then 12  -- bebyggelse (by/gård/torp) — bara vid inzoomning
  when feature_type in ('TERRTX','VATTTX','VATTDRTX','VATTDELTX','SANKTX','NATTX','TRAKTTX') then 12
  else 12 end
where source = 'lantmateriet_ortnamn';

-- 2) Bbox+zoom-RPC: returnera bara namn i vyn OCH vars label_min_zoom <= aktuell zoom, cappat.
--    Minoritetsspråk (ej SV) visas ett zoomsteg tidigare (kulturellt värdefulla, glesare).
create or replace function public.place_names_in_view(
  p_bbox double precision[], p_zoom integer, p_limit integer default 800)
 returns table(id uuid, name text, lat double precision, lng double precision,
   element_keys text[], element_category text, feature_type text, province text,
   earliest_attestation_year integer, attested_form text, language text, source text, source_license text)
 language sql stable
 set search_path to 'public'
as $function$
  select p.id, p.name, p.lat, p.lng, p.element_keys, p.element_category, p.feature_type, p.province,
         p.earliest_attestation_year, p.attested_form, p.language, p.source, p.source_license
  from public.place_names p
  where p.source <> 'osm'
    and p.lat is not null and p.lng is not null
    and (array_length(p_bbox,1) = 4 and p.geom && ST_MakeEnvelope(p_bbox[1],p_bbox[2],p_bbox[3],p_bbox[4],4326))
    and coalesce(p.label_min_zoom, 12) - (case when p.language is not null and p.language <> 'SV' then 1 else 0 end) <= p_zoom
  order by coalesce(p.label_min_zoom, 12) asc, p.wikidata_sitelinks desc nulls last
  limit greatest(1, least(p_limit, 2000));
$function$;
