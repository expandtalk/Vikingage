-- Sökfix 2 efter Öland-test: socknar hittas nu via sitt LANDSKAP.
--  * Ölands socknar (Algutsrum, Resmo, Köping...) innehåller inte ordet "Öland"
--    → matchade aldrig. Parish-dokumenten får härlett landskap (mode() över
--    socknens inskrifter) + häradsnamn i brödtext och sublabel.
--  * Typ-taket i diversifieringen höjs 12→20 (16 Ölandsborgar ska få plats).
-- Ombyggda parish-rader återinsätts utan embedding → backfill-loopen tar dem.

begin;

-- ---------- 1. parish-blocket i rebuild_search_document (endast det ändras) ----------
-- (funktionen ersätts i sin helhet; övriga block identiska med 20260719660000)
create or replace function public.rebuild_search_document(p_type text default null, p_id uuid default null)
returns void language plpgsql security definer set search_path = public as $fn$
begin
  delete from search_document
  where (p_type is null or entity_type = p_type)
    and (p_id is null or entity_id = p_id);

  if p_type is null or p_type = 'inscription' then
    insert into search_document (entity_type, entity_id, signum, signum_norm, label, sublabel, body_simple, body_sv, body_en)
    select 'inscription', r.id, r.signum,
      lower(replace(coalesce(r.primary_signum, r.signum), ' ', '')),
      coalesce(nullif(r.name, ''), r.signum),
      concat_ws(' · ', nullif(r.location,''), nullif(r.socken,''), nullif(r.country,'')),
      replace(concat_ws(' ',
        r.transliteration, r.normalization, r.name, r.name_en,
        array_to_string(coalesce(r.alternative_signum,'{}'), ' '),
        array_to_string(coalesce(r.also_known_as,'{}'), ' '),
        r.location, r.socken, r.harad, r.landscape, r.province, r.county, r.country,
        (select string_agg(rd.text, ' ') from readings rd where rd.inscription_id = r.id),
        (select string_agg(it.text, ' ') from interpretations it where it.inscription_id = r.id)
      ), chr(160), ' '),
      replace(concat_ws(' ',
        r.translation_sv, r.scholarly_notes, r.historical_context, r.paleographic_notes,
        (select string_agg(t.text, ' ') from translations t
          where t.inscriptionid = decode(replace(r.id::text,'-',''),'hex') and t.language like 'sv%')
      ), chr(160), ' '),
      replace(concat_ws(' ',
        r.translation_en,
        (select string_agg(t.text, ' ') from translations t
          where t.inscriptionid = decode(replace(r.id::text,'-',''),'hex') and t.language like 'en%')
      ), chr(160), ' ')
    from runic_inscriptions r
    where (p_id is null or r.id = p_id);
  end if;

  if p_type is null or p_type = 'landscape' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'landscape', md5('landscape:' || t.l)::uuid, t.l,
      'landskap/region · ' || t.n || ' inskrifter',
      'Region: visa alla ' || t.n || ' inskrifter i ' || t.l || ' på kartan'
    from (
      select landscape as l, count(*) as n
      from runic_inscriptions
      where landscape is not null and landscape <> ''
      group by landscape
    ) t
    where (p_id is null or md5('landscape:' || t.l)::uuid = p_id);
  end if;

  if p_type is null or p_type = 'carver' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'carver', c.id, c.name, concat_ws(' · ', 'ristare', nullif(c.region,'')), replace(coalesce(c.description,''), chr(160), ' ')
    from carvers c where (p_id is null or c.id = p_id);
  end if;

  if p_type is null or p_type = 'king' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'king', k.id, k.name,
      concat_ws(' · ', coalesce(k.role,'kung'), nullif(k.region,''),
        case when k.reign_start is not null then k.reign_start||'–'||coalesce(k.reign_end::text,'') end),
      concat_ws(' ', array_to_string(coalesce(k.name_variations,'{}'),' '), k.description)
    from historical_kings k where (p_id is null or k.id = p_id);
  end if;

  if p_type is null or p_type = 'source' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'source', s.id, s.title,
      concat_ws(' · ', coalesce(s.work_type,'källa'), nullif(s.author,''), s.written_year::text),
      concat_ws(' ', s.description), coalesce(s.title_en,'')
    from historical_sources s where (p_id is null or s.id = p_id);
  end if;

  if p_type is null or p_type = 'source_text' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_simple, body_sv, body_en)
    select 'source_text', st.id,
      hs.title || coalesce(' — strof ' || st.stanza_no, ''),
      'källtext',
      coalesce(st.original_norse,''), coalesce(st.translation_sv,''), coalesce(st.translation_en,'')
    from source_texts st join historical_sources hs on hs.id = st.source_id
    where (p_id is null or st.id = p_id);
  end if;

  if p_type is null or p_type = 'theme' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'theme', t.id, t.name, 'tema', coalesce(t.description,''), concat_ws(' ', t.name_en, t.description_en)
    from themes t where (p_id is null or t.id = p_id);
  end if;

  if p_type is null or p_type = 'god' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_simple, body_sv)
    select 'god', g.id, g.name, concat_ws(' · ', 'gud', nullif(g.category,'')),
      coalesce(g.name_old_norse,''),
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
    select 'dynasty', d.id, d.name, 'dynasti', coalesce(d.description,'')
    from royal_dynasties d where (p_id is null or d.id = p_id);
  end if;

  if p_type is null or p_type = 'parish' then
    -- NYTT: landskap härleds ur socknens inskrifter (mode) + häradsnamn indexeras
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'parish', p.id, p.name,
      concat_ws(' · ', coalesce(p.parish_type,'socken'), nullif(l.landscape,''), nullif(p.country,'')),
      concat_ws(' ', p.rundata_name, h.name, l.landscape, p.country)
    from parishes p
    left join hundreds h on p.hundred_external_id is not null and upper(h.external_id) = upper(p.hundred_external_id)
    left join lateral (
      select mode() within group (order by r.landscape) as landscape
      from runic_inscriptions r where r.parish_id = p.id and r.landscape is not null
    ) l on true
    where (p_id is null or p.id = p_id);
  end if;

  if p_type is null or p_type = 'place' then
    insert into search_document (entity_type, entity_id, label, sublabel)
    select 'place', pl.placeid, pl.place, 'ortnamn'
    from places pl where pl.place is not null and (p_id is null or pl.placeid = p_id);
  end if;

  if p_type is null or p_type = 'fortress' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'fortress', f.id, f.name, concat_ws(' · ', 'fornborg/fästning', nullif(f.region,''), nullif(f.country,'')),
      concat_ws(' ', f.region, f.description, f.historical_significance)
    from viking_fortresses f where (p_id is null or f.id = p_id);
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
end $fn$;

select public.rebuild_search_document('parish');

-- ---------- 2. diversifieringstaket 12 → 20 ----------
create or replace function public.search_v1(p_q text, p_limit integer default 30, p_types text[] default null)
returns table (entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
language sql stable as $fn$
with q as (
  select trim(p_q) as raw,
         lower(replace(trim(p_q), ' ', '')) as qnorm,
         websearch_to_tsquery('simple', p_q) as tq_simple,
         websearch_to_tsquery('swedish', p_q) as tq_sv,
         websearch_to_tsquery('english', p_q) as tq_en
),
exact_sig as (
  select d.entity_type, d.entity_id, 1::bigint as rnk
  from search_document d, q
  where length(q.qnorm) >= 2
    and (d.signum_norm = q.qnorm or lower(d.label) = lower(q.raw))
),
trgm as (
  select entity_type, entity_id, row_number() over (order by sim desc) as rnk
  from (
    select d.entity_type, d.entity_id, similarity(d.label, q.raw) as sim
    from search_document d, q
    where length(q.raw) >= 2 and (d.label % q.raw or d.label ilike '%' || q.raw || '%')
    order by sim desc limit 60
  ) x
),
fts as (
  select entity_type, entity_id, row_number() over (order by rank desc) as rnk
  from (
    select d.entity_type, d.entity_id,
      greatest(ts_rank(d.tsv_simple, q.tq_simple),
               ts_rank(d.tsv_sv, q.tq_sv),
               ts_rank(d.tsv_en, q.tq_en)) as rank
    from search_document d, q
    where d.tsv_simple @@ q.tq_simple or d.tsv_sv @@ q.tq_sv or d.tsv_en @@ q.tq_en
    order by rank desc limit 300
  ) x
),
fused as (
  select entity_type, entity_id, sum(w / (60 + rnk)) as score
  from (
    select entity_type, entity_id, rnk, 3.0 as w from exact_sig
    union all select entity_type, entity_id, rnk, 1.5 from trgm
    union all select entity_type, entity_id, rnk, 1.0 from fts
  ) s
  group by entity_type, entity_id
),
diversified as (
  select f.*, row_number() over (partition by f.entity_type order by f.score desc) as type_rn
  from fused f
)
select d.entity_type, d.entity_id, d.signum, d.label, d.sublabel,
  ts_headline('simple',
    left(concat_ws(' ', d.body_sv, d.body_en, d.body_simple), 600),
    q.tq_simple, 'MaxWords=18, MinWords=6, MaxFragments=1') as snippet,
  f.score
from diversified f
join search_document d using (entity_type, entity_id)
cross join q
where f.type_rn <= 20
  and (p_types is null or d.entity_type = any (p_types))
order by f.score desc
limit p_limit
$fn$;

commit;
