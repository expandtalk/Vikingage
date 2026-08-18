-- get_inscription_page: lägg thumb (m.thumb_url) i images-jsonb → inskriftssidan visar
-- komprimerad standardbild, original vid klick. Övrigt oförändrat.

CREATE OR REPLACE FUNCTION public.get_inscription_page(p_signum text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions'
AS $function$
  select to_jsonb(x) from (
    select
      ri.id, ri.signum, ri.name, ri.name_en, ri.name_source,
      ri.also_known_as, ri.alternative_signum,
      ri.transliteration, ri.normalization, ri.translation_sv, ri.translation_en,
      ri.dating_text, ri.period_start, ri.period_end,
      ri.socken, ri.harad, ri.landscape, ri.province, ri.county, ri.municipality,
      ri.location, ri.country, ri.current_location,
      ri.object_type, ri.material, ri.style_group, ri.rune_type, ri.meter,
      ri.scholarly_notes, ri.historical_context, ri.paleographic_notes, ri.condition_notes,
      ri.k_samsok_uri, ri.raa_number, ri.bibliography,
      (ri.coordinates)[0] as lng, (ri.coordinates)[1] as lat,
      (select coalesce(jsonb_agg(jsonb_build_object(
                'url', m.media_url, 'thumb', m.thumb_url, 'description', m.description,
                'photographer', m.photographer, 'credit', m.copyright_info,
                'source', m.source_institution)
              order by (m.source_institution = 'egen dokumentation') desc, m.created_at), '[]'::jsonb)
       from public.inscription_media m
       where m.inscription_id = ri.id and m.media_type in ('image','teckning')
         and (m.media_url ~* '\.(jpe?g|png|webp|gif)(\?|$)' or m.media_url like '/excursion-photos/%'
              -- RAÄ pub.raa.se-bildvisning saknar filändelse men serverar image/jpeg (verifierat). Utan
              -- detta doldes bilder på 158 inskrifter (t.ex. N B39, G 326). kulturarvsdata/shm/media (RDF),
              -- unimus/digitaltmuseum (HTML-sidor) och .tiff exkluderas medvetet (renderas ej i <img>).
              or m.media_url ~* 'pub\.raa\.se/.*/visning')
      ) as images,
      (select coalesce(jsonb_agg(distinct jsonb_build_object('id', c.id, 'name', c.name)), '[]'::jsonb)
       from public.carver_inscription ci
       join public.carvers c on replace(c.id::text,'-','') = encode(ci.carverid,'hex')
       where ci.inscriptionid = decode(replace(ri.id::text,'-',''),'hex')
      ) as carvers,
      (select coalesce(jsonb_agg(jsonb_build_object('type', rd.reading_type, 'text', rd.text)
                order by rd.reading_type), '[]'::jsonb)
       from public.readings rd where rd.inscription_id = ri.id and rd.text is not null and rd.text <> ''
      ) as readings,
      (select coalesce(jsonb_agg(jsonb_build_object('version', it.version, 'language', it.language, 'text', it.text)
                order by it.version, it.language), '[]'::jsonb)
       from public.interpretations it where it.inscription_id = ri.id and it.text is not null and it.text <> ''
      ) as interpretations,
      (select coalesce(jsonb_agg(jsonb_build_object('title', hs.title, 'source_id', hs.id, 'relation', sil.relation)), '[]'::jsonb)
       from public.source_inscription_links sil
       join public.historical_sources hs on hs.id = sil.source_id
       where sil.inscription_id = ri.id
      ) as literary_links
    from public.runic_inscriptions ri
    where lower(replace(ri.signum,' ','')) = lower(replace(p_signum,' ',''))
    limit 1
  ) x
$function$

