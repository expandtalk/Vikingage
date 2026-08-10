-- Medeltidsbrev: publik läs-yta över sdhk.letters_raw (CC BY 4.0, Riksarkivet).
-- sdhk-schemat exponeras ej av PostgREST → SECURITY DEFINER-RPC:er i public.
-- Server-side paging/sök/sortering (44 264 rader × regesttext = för stort för klient).
--
-- Unaccent-beslut (Step 1): endast STABLE extensions.unaccent(text) finns i denna
-- databas — ingen IMMUTABLE public-wrapper (f_unaccent/immutable_unaccent saknas).
-- Därför anropas extensions.unaccent(...) direkt (schema-kvalificerat, oberoende av
-- search_path) i WHERE-satsen nedan, och trigram-indexet i brief Step 7 skippas
-- (kan inte indexera på en STABLE funktion).

-- Härledd årtalstolkning (speglar parse_date_field i sdhk_pipeline.py): första
-- 8-siffriga token <> '00000000', årtal = första fyra siffrorna.
create or replace function public.sdhk_year(date_raw text)
returns integer language sql immutable as $$
  select nullif(left((
    select t[1] from regexp_matches(coalesce(date_raw,''),'([0-9]{8})','g') t
    where t[1] <> '00000000' limit 1
  ), 4), '')::integer;
$$;

create or replace function public.medieval_charters_browse(
  q text default null,
  sort text default 'sdhk',
  dir text default 'asc',
  century integer default null,
  has_fulltext boolean default null,
  page integer default 1,
  page_size integer default 30
)
returns table(
  sdhk_id integer, year integer, date_raw text, place_raw text,
  lang_raw text, regest text, has_fulltext boolean, total_count bigint
)
language sql stable security definer set search_path = public
as $$
  with base as (
    select
      lr.sdhk_id,
      public.sdhk_year(lr.date_raw) as year,
      lr.date_raw, lr.place_raw, lr.lang_raw,
      lr.summary as regest,
      (lr.edition_text is not null and btrim(lr.edition_text) <> '') as has_fulltext
    from sdhk.letters_raw lr
    where
      (q is null or btrim(q) = '' or
        extensions.unaccent(coalesce(lr.summary,'')||' '||coalesce(lr.place_raw,'')||' '||coalesce(lr.author_raw,''))
        ilike '%' || extensions.unaccent(btrim(q)) || '%')
      and (century is null or public.sdhk_year(lr.date_raw) between century and century + 99)
      and (has_fulltext is null
           or (lr.edition_text is not null and btrim(lr.edition_text) <> '') = has_fulltext)
  ),
  counted as (select *, count(*) over() as total_count from base)
  select sdhk_id, year, date_raw, place_raw, lang_raw, regest, has_fulltext, total_count
  from counted
  order by
    case when sort='year'  and dir='asc'  then year end asc  nulls last,
    case when sort='year'  and dir='desc' then year end desc nulls last,
    case when sort='place' and dir='asc'  then place_raw end asc  nulls last,
    case when sort='place' and dir='desc' then place_raw end desc nulls last,
    case when sort='sdhk'  and dir='desc' then sdhk_id end desc,
    sdhk_id asc
  limit  greatest(1, least(100, page_size))
  offset greatest(0, (greatest(1, page) - 1) * greatest(1, least(100, page_size)));
$$;

create or replace function public.medieval_charters_stats()
returns table(century integer, n bigint, n_fulltext bigint)
language sql stable security definer set search_path = public
as $$
  select (public.sdhk_year(date_raw) / 100) * 100 as century,
         count(*) as n,
         count(*) filter (where edition_text is not null and btrim(edition_text) <> '') as n_fulltext
  from sdhk.letters_raw
  group by 1 order by 1 nulls last;
$$;

create or replace function public.medieval_charter_detail(p_sdhk_id integer)
returns table(
  sdhk_id integer, date_raw text, year integer, place_raw text, lang_raw text,
  author_raw text, summary text, comments text, edition_text text,
  print_ref text, translation_ref text, seals text, original_ref text
)
language sql stable security definer set search_path = public
as $$
  select lr.sdhk_id, lr.date_raw, public.sdhk_year(lr.date_raw), lr.place_raw, lr.lang_raw,
         lr.author_raw, lr.summary, lr.comments, lr.edition_text,
         lr.print_ref, lr.translation_ref, lr.seals, lr.original_ref
  from sdhk.letters_raw lr
  where lr.sdhk_id = p_sdhk_id;
$$;

grant execute on function public.sdhk_year(text) to anon, authenticated;
grant execute on function public.medieval_charters_browse(text,text,text,integer,boolean,integer,integer) to anon, authenticated;
grant execute on function public.medieval_charters_stats() to anon, authenticated;
grant execute on function public.medieval_charter_detail(integer) to anon, authenticated;
