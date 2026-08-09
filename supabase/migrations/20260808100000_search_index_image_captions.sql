-- Lever 1: gör bildtexter sökbara. inscription_media.description + photographer var förut
-- OSÖKBARA (bilder hämtades bara via plats/tema/närhet, aldrig via bildens egen text).
-- Enda ändringen mot prod-funktionen: en string_agg över inscription_media läggs till i
-- inskriftsgrenens body_sv. tsv_sv/tsv_simple/tsv_en är GENERATED ALWAYS → sökvektorn
-- uppdateras automatiskt vid rebuild. Resten av funktionen är oförändrad (trogen spegling av prod).
CREATE OR REPLACE FUNCTION public.rebuild_search_document(p_type text DEFAULT NULL::text, p_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
        (select string_agg(concat_ws(' ', im.description, im.photographer), ' ') from inscription_media im where im.inscription_id = r.id and im.media_url is not null)), chr(160), ' '),
      replace(concat_ws(' ', r.translation_en,
        (select string_agg(t.text, ' ') from translations t where t.inscriptionid = decode(replace(r.id::text,'-',''),'hex') and t.language like 'en%')), chr(160), ' ')
    from runic_inscriptions r where (p_id is null or r.id = p_id);
  end if;

  if p_type is null or p_type = 'landscape' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'landscape', md5('landscape:' || t.l)::uuid, t.l, 'landskap/region · ' || t.n || ' inskrifter',
      'Region: visa alla ' || t.n || ' inskrifter i ' || t.l || ' på kartan'
    from (select landscape as l, count(*) as n from runic_inscriptions where landscape is not null and landscape <> '' group by landscape) t
    where (p_id is null or md5('landscape:' || t.l)::uuid = p_id);
  end if;

  if p_type is null or p_type = 'carver' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'carver', c.id, c.name, concat_ws(' · ', 'ristare', nullif(c.region,'')), replace(coalesce(c.description,''), chr(160), ' ')
    from carvers c where (p_id is null or c.id = p_id);
  end if;

  if p_type is null or p_type = 'king' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'king', k.id, k.name, concat_ws(' · ', coalesce(k.role,'kung'), nullif(k.region,''),
        case when k.reign_start is not null then k.reign_start||'–'||coalesce(k.reign_end::text,'') end),
      concat_ws(' ', array_to_string(coalesce(k.name_variations,'{}'),' '), k.description)
    from historical_kings k where (p_id is null or k.id = p_id);
  end if;

  if p_type is null or p_type = 'source' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'source', s.id, s.title, concat_ws(' · ', coalesce(s.work_type,'källa'), nullif(s.author,''), s.written_year::text),
      concat_ws(' ', s.description), coalesce(s.title_en,'')
    from historical_sources s where (p_id is null or s.id = p_id);
  end if;

  if p_type is null or p_type = 'source_text' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_simple, body_sv, body_en)
    select 'source_text', st.id, hs.title || coalesce(' — strof ' || st.stanza_no, ''), 'källtext',
      coalesce(st.original_norse,''), coalesce(st.translation_sv,''), coalesce(st.translation_en,'')
    from source_texts st join historical_sources hs on hs.id = st.source_id where (p_id is null or st.id = p_id);
  end if;

  if p_type is null or p_type = 'theme' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'theme', t.id, t.name, 'tema', coalesce(t.description,''), concat_ws(' ', t.name_en, t.description_en)
    from themes t where (p_id is null or t.id = p_id);
  end if;

  if p_type is null or p_type = 'god' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_simple, body_sv)
    select 'god', g.id, g.name, concat_ws(' · ', 'gud', nullif(g.category,'')), coalesce(g.name_old_norse,''),
      concat_ws(' ', array_to_string(coalesce(g.domain,'{}'),' '), g.description, array_to_string(coalesce(g.symbols,'{}'),' '))
    from gods g where (p_id is null or g.id = p_id);
  end if;

  if p_type is null or p_type = 'coin' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'coin', c.id, c.name, concat_ws(' · ', 'mynt', nullif(c.mint,''), nullif(c.metal,'')),
      concat_ws(' ', c.issuer, c.description, c.significance, c.find_place), coalesce(c.description_en,'')
    from coins c where (p_id is null or c.id = p_id);
  end if;

  if p_type is null or p_type = 'dynasty' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'dynasty', d.id, d.name, 'dynasti', coalesce(d.description,'') from royal_dynasties d where (p_id is null or d.id = p_id);
  end if;

  if p_type is null or p_type = 'parish' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'parish', p.id, p.name, concat_ws(' · ', coalesce(p.parish_type,'socken'), nullif(l.landscape,''), nullif(p.country,'')),
      concat_ws(' ', p.rundata_name, h.name, l.landscape, p.country)
    from parishes p
    left join hundreds h on p.hundred_external_id is not null and upper(h.external_id) = upper(p.hundred_external_id)
    left join lateral (select mode() within group (order by r.landscape) as landscape from runic_inscriptions r where r.parish_id = p.id and r.landscape is not null) l on true
    where (p_id is null or p.id = p_id);
  end if;

  if p_type is null or p_type = 'place' then
    insert into search_document (entity_type, entity_id, label, sublabel)
    select 'place', pl.placeid, pl.place, 'ortnamn' from places pl where pl.place is not null and (p_id is null or pl.placeid = p_id);
  end if;

  if p_type is null or p_type = 'fortress' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'fortress', f.id, f.name, concat_ws(' · ', 'fornborg/fästning', nullif(f.region,''), nullif(f.country,'')),
      concat_ws(' ', f.region, f.description, f.historical_significance)
    from viking_fortresses f where (p_id is null or f.id = p_id);
  end if;

  if p_type is null or p_type = 'hillfort' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'hillfort', h.id, coalesce(nullif(h.name,''), 'Fornborg ' || coalesce(h.raa_number,'')),
      concat_ws(' · ', 'fornborg', nullif(h.landscape,''), nullif(h.municipality,'')),
      concat_ws(' ', h.landscape, h.municipality, h.county, h.description, h.period)
    from swedish_hillforts h where (p_id is null or h.id = p_id);
  end if;

  if p_type is null or p_type = 'shipwreck' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'shipwreck', s.id, s.name,
      concat_ws(' · ', 'skeppsvrak', nullif(s.vessel_type,''), nullif(s.parish,''), nullif(s.landscape,'')),
      concat_ws(' ', array_to_string(coalesce(s.also_known_as,'{}'),' '), s.identification, s.construction,
                     s.dating_summary, s.sinking_event, s.raa_number, s.notes)
    from shipwrecks s where (p_id is null or s.id = p_id);
  end if;

  if p_type is null or p_type = 'folk_group' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'folk_group', fg.id, fg.name, concat_ws(' · ', 'folkgrupp', nullif(fg.main_category::text,'')),
      concat_ws(' ', fg.description, fg.historical_significance, fg.language_family),
      concat_ws(' ', fg.name_en, fg.description_en)
    from folk_groups fg where (p_id is null or fg.id = p_id);
  end if;

  if p_type is null or p_type = 'excursion' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'excursion', md5('excursion:' || e.id)::uuid, e.name,
      concat_ws(' · ', 'utflykt', nullif(e.region,''), nullif(e.grp,'')),
      concat_ws(' ', e.region, e.grp, e.period, e.description_sv, e.signum),
      coalesce(e.description_en,'')
    from excursions e where (p_id is null or md5('excursion:' || e.id)::uuid = p_id);
  end if;

  if p_type is null or p_type = 'city' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'city', c.id, c.name, concat_ws(' · ', 'vikingastad', nullif(c.country,'')),
      concat_ws(' ', c.region, c.description, c.historical_significance)
    from viking_cities c where (p_id is null or c.id = p_id);
  end if;

  if p_type is null or p_type = 'christian_site' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'christian_site', s.id, s.name, concat_ws(' · ', coalesce(s.site_type,'kristen plats'), nullif(s.region,'')),
      concat_ws(' ', s.region, s.province, s.description, s.historical_notes), concat_ws(' ', s.name_en, s.description_en)
    from christian_sites s where (p_id is null or s.id = p_id);
  end if;

  if p_type is null or p_type = 'viking_name' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'viking_name', v.id, v.name, concat_ws(' · ', 'namn', nullif(v.gender,'')),
      concat_ws(' ', v.meaning, v.etymology, v.historical_info)
    from viking_names v where (p_id is null or v.id = p_id);
  end if;

  if p_type is null or p_type = 'road' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'road', r.id, r.name, 'väg/led', coalesce(r.description,''), coalesce(r.description_en,'')
    from viking_roads r where (p_id is null or r.id = p_id);
  end if;

  -- Nya grenar (durabilitet): ortnamn, fornlämningar, forskare (var tidigare direkt-inserted).
  if p_type is null or p_type = 'place_name' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'place_name', p.id, p.name,
      concat_ws(' · ', coalesce(p.feature_type,'ortnamn'), nullif(p.province,'')),
      concat_ws(' ', p.name, p.normed_name, p.province)
    from place_names p where p.name is not null and (p_id is null or p.id = p_id);
  end if;

  if p_type is null or p_type = 'heritage_site' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'heritage_site', h.id, coalesce(nullif(h.name,''), h.raa_type),
      concat_ws(' · ', h.raa_type, nullif(h.parish,''), nullif(h.municipality,''), nullif(h.landscape,'')),
      concat_ws(' ', h.name, h.raa_type, h.parish, h.municipality, h.landscape)
    from heritage_sites h where (p_id is null or h.id = p_id);
  end if;

  if p_type is null or p_type = 'scholar' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'scholar', s.id, s.name,
      concat_ws(' · ', 'forskare', nullif(s.role_title,''), nullif(s.affiliation,''), nullif(s.active_period,'')),
      concat_ws(' ', s.biography, s.affiliation, s.role_title)
    from research_scholars s where (p_id is null or s.id = p_id);
  end if;
end $function$;

-- Ombyggnad + ÅTERSTÄLL signaler (DURABILITET): rebuild_search_document gör DELETE+INSERT och
-- sätter INTE period/geom/popularity/prominence/embedding — de fylls av separata efter-steg.
-- En 'inscription'-rebuild måste därför följas av dessa (annars tappas signalerna). embedding
-- fylls av scripts/backfill-embeddings.sh (edge-fn embed-search, service-role) — ej SQL.
SELECT public.rebuild_search_document('inscription');

UPDATE public.search_document sd
   SET period_start=r.period_start, period_end=r.period_end,
       geom = CASE WHEN r.coordinates IS NOT NULL THEN ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326) END
  FROM public.runic_inscriptions r WHERE sd.entity_type='inscription' AND sd.entity_id=r.id;

WITH tv AS (SELECT theme_id, max(volume) v FROM public.theme_keywords GROUP BY theme_id),
     ep AS (SELECT tl.entity_type, tl.entity_id, max(tv.v) pop FROM public.theme_links tl JOIN tv ON tv.theme_id=tl.theme_id GROUP BY 1,2)
UPDATE public.search_document sd SET popularity = ep.pop
FROM ep WHERE ep.entity_type=sd.entity_type AND ep.entity_id=sd.entity_id AND sd.entity_type='inscription';

UPDATE public.search_document sd
   SET popularity = greatest(coalesce(sd.popularity,0), wp.volume)
  FROM public.wiki_popularity wp
 WHERE lower(sd.label) = lower(wp.entity_name) AND sd.entity_type='inscription';

SELECT public.refresh_search_prominence();
