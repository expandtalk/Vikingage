-- Tvånivå-inscriptions (Daniel 2026-07-20): namngivna stenar som ingång.
-- name_source anger varifrån populärnamnet kommer och bär notabilitetsnivån:
--   'wikipedia-artikel'       = stenen har egen Wikipedia-artikel (alfabetiska listan)
--   'wikipedia-landskapslista' = namnet står i landskapslistan
--   null                      = tidigare kuraterat namn utan känd källa
-- named_stones_v1 ger sidan allt i ETT anrop, inkl. första bilden ur inscription_media.

alter table public.runic_inscriptions add column if not exists name_source text;

create or replace function public.named_stones_v1()
returns table (
  id uuid, signum text, name text, name_source text,
  landscape text, country text, socken text,
  translation_sv text, translation_en text,
  image_url text, image_credit text
)
language sql stable as $$
  select ri.id, ri.signum, ri.name, ri.name_source,
    nullif(ri.landscape,''), nullif(ri.country,''), nullif(ri.socken,''),
    ri.translation_sv, ri.translation_en,
    im.media_url,
    nullif(concat_ws(', ', nullif(im.photographer,''), nullif(im.copyright_info,'')), '')
  from public.runic_inscriptions ri
  left join lateral (
    select media_url, photographer, copyright_info
    from public.inscription_media m
    where m.inscription_id = ri.id and m.media_type = 'image'
    order by (m.source_institution = 'egen dokumentation') desc, m.created_at
    limit 1
  ) im on true
  where ri.name is not null and ri.name <> ''
$$;

grant execute on function public.named_stones_v1() to anon, authenticated;
