-- Lever 2: rikare bildsök. Fångar K-samsöks pres:motive (vad bilden föreställer) + pres:tag[]
-- (ämnesord) på inscription_media och gör dem sökbara. Kolumnerna fylls framåt av
-- ingest-raa-images.mjs och bakåt av scripts/data/backfill-raa-image-metadata.mjs (per-UUID
-- presentation-XML). Sökindexets inskriftsgren får motive + keywords i body_sv.
-- Applicerad i prod via MCP 2026-08-08 (kolumner + funktion + rebuild); denna fil = spegling.

ALTER TABLE public.inscription_media
  ADD COLUMN IF NOT EXISTS motive text,
  ADD COLUMN IF NOT EXISTS keywords text[];
COMMENT ON COLUMN public.inscription_media.motive IS 'K-samsök pres:motive — vad bilden föreställer (t.ex. Runsten)';
COMMENT ON COLUMN public.inscription_media.keywords IS 'K-samsök pres:tag[] — ämnesord (kan vara generiska)';

-- Endast inskriftsgrenens body_sv ändras mot 20260808100000: bildtext-subqueryn tar nu även
-- im.motive + im.keywords. (Övriga grenar identiska — utelämnade här; full funktion i prod
-- via pg_get_functiondef. Denna fil dokumenterar deltat + den operativa ombyggnaden.)
CREATE OR REPLACE FUNCTION public.rebuild_search_document(p_type text DEFAULT NULL::text, p_id uuid DEFAULT NULL::uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  delete from search_document where (p_type is null or entity_type = p_type) and (p_id is null or entity_id = p_id);

  if p_type is null or p_type = 'inscription' then
    insert into search_document (entity_type, entity_id, signum, signum_norm, label, sublabel, body_simple, body_sv, body_en)
    select 'inscription', r.id, r.signum, lower(replace(coalesce(r.primary_signum, r.signum), ' ', '')),
      coalesce(nullif(r.name, ''), r.signum),
      concat_ws(' · ', nullif(r.location,''), nullif(r.socken,''), nullif(r.country,'')),
      replace(concat_ws(' ', r.transliteration, r.normalization, r.name, r.name_en,
        array_to_string(coalesce(r.alternative_signum,'{}'), ' '), array_to_string(coalesce(r.also_known_as,'{}'), ' '),
        r.location, r.socken, r.harad, r.landscape, r.province, r.county, r.country,
        (select string_agg(rd.text, ' ') from readings rd where rd.inscription_id = r.id),
        (select string_agg(it.text, ' ') from interpretations it where it.inscription_id = r.id)), chr(160), ' '),
      replace(concat_ws(' ', r.translation_sv, r.scholarly_notes, r.historical_context, r.paleographic_notes,
        (select string_agg(t.text, ' ') from translations t where t.inscriptionid = decode(replace(r.id::text,'-',''),'hex') and t.language like 'sv%'),
        (select string_agg(concat_ws(' ', im.description, im.photographer, im.motive, array_to_string(im.keywords,' ')), ' ')
           from inscription_media im where im.inscription_id = r.id and im.media_url is not null)), chr(160), ' '),
      replace(concat_ws(' ', r.translation_en,
        (select string_agg(t.text, ' ') from translations t where t.inscriptionid = decode(replace(r.id::text,'-',''),'hex') and t.language like 'en%')), chr(160), ' ')
    from runic_inscriptions r where (p_id is null or r.id = p_id);
  end if;

  -- ⟨landscape/carver/king/source/source_text/theme/god/coin/dynasty/parish/place/fortress/
  --   hillfort/shipwreck/folk_group/excursion/city/christian_site/viking_name/road/place_name/
  --   heritage_site/scholar-grenarna oförändrade — se 20260808100000⟩
  perform 1;
end $function$;

-- OBS: ovan är en FÖRKORTAD spegling (bara inskriftsgrenen). Den FULLA funktionen (alla grenar,
-- med denna inskriftsändring) applicerades i prod. Efter apply körs ombyggnad + signalåterställning
-- (durabilitet, se [[search-rebuild-signal-wipe]]):
--   SELECT public.rebuild_search_document('inscription');
--   UPDATE search_document ... period/geom ur runic_inscriptions;
--   UPDATE search_document ... popularity ur theme_keywords + wiki_popularity;
--   SELECT public.refresh_search_prominence();
