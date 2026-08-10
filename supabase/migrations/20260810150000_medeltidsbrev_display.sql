-- Medeltidsbrev (Steg 1 av visningsuppdatering): datum-ärlighet + formulär-flagga.
--
-- sdhk_date_display(date_raw) speglar kvalificerarna i pipelinens parse_date_field:
--   ingen giltig 8-siffrig token (eller "0"/"00000000")  -> 'odaterad'
--   "efter"/"tidigast"                                    -> 'efter <år>'
--   "före"/"senast"                                        -> 'före <år>'
--   "omkr"/"ca"                                            -> 'omkr. <år>'
--   annars                                                 -> rent årtal (YYYY)
-- <år> = public.sdhk_year(date_raw), dvs samma härledning som redan används i
-- medieval_charters_browse/medieval_charter_detail (första giltiga 8-siffror-tokens
-- första fyra siffror). Kvalificerarord matchas ordgräns-säkert och case-insensitivt
-- (~*) så "eftersom" el. liknande INTE felaktigt triggar 'efter'. OBS: Postgres ARE
-- använder \y för ordgräns (INTE \b — \b betyder backspace-tecken i Postgres regex
-- och matchar därför aldrig; verifierat mot databasen innan migration skrevs om).
create or replace function public.sdhk_date_display(date_raw text)
returns text
language sql
immutable
as $$
  select case
    when public.sdhk_year(date_raw) is null then 'odaterad'
    when date_raw ~* '\y(efter|tidigast)\y' then 'efter ' || public.sdhk_year(date_raw)::text
    when date_raw ~* '\y(f[oö]re|senast)\y' then 'före ' || public.sdhk_year(date_raw)::text
    when date_raw ~* '\y(omkr\.?|ca\.?)\y' then 'omkr. ' || public.sdhk_year(date_raw)::text
    else public.sdhk_year(date_raw)::text
  end;
$$;

-- sdhk_is_formula: true för formulärbrev i Öberg, Formularia Lincopensia (1997)-serien.
-- Diplomatikern har flaggat nr 2-8 som formulär, men bara några av dem har den
-- explicita "(Formulär)"-taggen i summary (t.ex. saknas den på nr 6/8) — de sitter
-- ändå i samma Öberg-serie enligt print_ref. Konservativt: matchar ENDAST explicit
-- (Formulär)-tagg i summary ELLER Öberg/Formularia Lincopensia-referens i print_ref.
create or replace function public.sdhk_is_formula(summary text, print_ref text)
returns boolean
language sql
immutable
as $$
  select
    coalesce(summary,'') ilike '%(formulär)%'
    or coalesce(print_ref,'') ilike '%formularia lincopensia%'
    or coalesce(print_ref,'') ilike '%öberg%formular%';
$$;

-- medieval_charters_browse: lägg till date_display + is_formula. Signatur (args)
-- oförändrad så frontend + Steg 2-argbyggaren fortsätter binda korrekt.
drop function if exists public.medieval_charters_browse(text,text,text,integer,boolean,integer,integer);

create function public.medieval_charters_browse(
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
  lang_raw text, regest text, has_fulltext boolean, total_count bigint,
  date_display text, is_formula boolean
)
language sql stable security definer set search_path = public
as $$
  with base as (
    select
      lr.sdhk_id,
      public.sdhk_year(lr.date_raw) as year,
      lr.date_raw, lr.place_raw, lr.lang_raw,
      lr.summary as regest,
      (lr.edition_text is not null and btrim(lr.edition_text) <> '') as has_fulltext,
      public.sdhk_date_display(lr.date_raw) as date_display,
      public.sdhk_is_formula(lr.summary, lr.print_ref) as is_formula
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
  select sdhk_id, year, date_raw, place_raw, lang_raw, regest, has_fulltext, total_count,
         date_display, is_formula
  from counted
  order by
    case when sort='year'  and dir='asc'  then year end asc  nulls last,
    case when sort='year'  and dir='desc' then year end desc nulls last,
    case when sort='place' and dir='asc'  then place_raw end asc  nulls last,
    case when sort='place' and dir='desc' then place_raw end desc nulls last,
    case when sort='sdhk'  and dir='desc' then sdhk_id end desc,
    sdhk_id asc
  limit  greatest(1, least(100, coalesce(page_size, 30)))
  offset greatest(0, (greatest(1, coalesce(page, 1)) - 1) * greatest(1, least(100, coalesce(page_size, 30))));
$$;

-- medieval_charter_detail: lägg till date_display + is_formula. Signatur oförändrad.
drop function if exists public.medieval_charter_detail(integer);

create function public.medieval_charter_detail(p_sdhk_id integer)
returns table(
  sdhk_id integer, date_raw text, year integer, place_raw text, lang_raw text,
  author_raw text, summary text, comments text, edition_text text,
  print_ref text, translation_ref text, seals text, original_ref text,
  date_display text, is_formula boolean
)
language sql stable security definer set search_path = public
as $$
  select lr.sdhk_id, lr.date_raw, public.sdhk_year(lr.date_raw), lr.place_raw, lr.lang_raw,
         lr.author_raw, lr.summary, lr.comments, lr.edition_text,
         lr.print_ref, lr.translation_ref, lr.seals, lr.original_ref,
         public.sdhk_date_display(lr.date_raw), public.sdhk_is_formula(lr.summary, lr.print_ref)
  from sdhk.letters_raw lr
  where lr.sdhk_id = p_sdhk_id;
$$;

grant execute on function public.sdhk_date_display(text) to anon, authenticated;
grant execute on function public.sdhk_is_formula(text, text) to anon, authenticated;
grant execute on function public.medieval_charters_browse(text,text,text,integer,boolean,integer,integer) to anon, authenticated;
grant execute on function public.medieval_charter_detail(integer) to anon, authenticated;
