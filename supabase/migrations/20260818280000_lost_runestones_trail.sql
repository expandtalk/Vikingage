-- "De försvunna stenarna"-spåret: runstenar som överlever som 1600-/1700-talsteckning
-- (Peringskiöld/Hadorph/Bautil). Källkritiskt: 'lost' = BELAGT försvunnen (condition/notes);
-- 'only_drawing' = finns i VÅRT arkiv bara som teckning (ingen foto/bild) — ett påstående om
-- vår data, INTE ett fysiskt förlust-påstående. Returnerar teckningen (thumb + original) +
-- upphovsperson, sorterat belagt-försvunna först.
create or replace function public.lost_runestones_trail(p_limit int default 160)
returns table(signum text, province text, socken text, status text, thumb text, full_url text, artist text)
language sql stable set search_path = public as $$
  with per as (
    select distinct on (ri.id)
      ri.signum, ri.province, ri.socken,
      case
        when ri.condition ilike '%försv%' or ri.condition ilike '%förlor%'
          or ri.condition_notes ilike '%försv%' or ri.scholarly_notes ilike '%försvunn%' then 'lost'
        when not exists (select 1 from inscription_media p
                         where p.inscription_id = ri.id and p.media_type in ('image','photo')) then 'only_drawing'
        else 'has_photo'
      end as status,
      coalesce(t.thumb_url, t.media_url) as thumb,
      t.media_url as full_url,
      t.photographer as artist
    from runic_inscriptions ri
    join inscription_media t on t.inscription_id = ri.id and t.media_type = 'teckning' and t.media_url is not null
    where ri.signum is not null
    order by ri.id, (t.license_code in ('PD','CC0')) desc, t.thumb_url nulls last
  )
  select signum, province, socken, status, thumb, full_url, artist
  from per
  where status in ('lost','only_drawing')
  order by (status = 'lost') desc, signum
  limit greatest(1, least(coalesce(p_limit,160), 400));
$$;
revoke all on function public.lost_runestones_trail(int) from public;
grant execute on function public.lost_runestones_trail(int) to anon, authenticated;
