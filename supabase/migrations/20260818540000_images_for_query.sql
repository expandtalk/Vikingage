-- Bild-på-sök: union över bildarkivets tabeller. Renderbara URL:er = .jpg/.png/.webp,
-- ems.dimu.org/image/ (DigitaltMuseum-bildserver, utan filändelse) el. pub.raa.se-visning.
create or replace function public.images_for_query(p_q text, p_limit integer default 12)
returns table(image_url text, thumb_url text, title text, credit text, license_code text,
              source_institution text, category text)
language sql stable set search_path to 'public' as $$
  with q as (select lower(btrim(p_q)) t),
  hits as (
    select m.media_url as image_url, m.thumb_url as thumb_url,
           coalesce(nullif(m.description,''), ri.name, ri.signum) as title,
           m.photographer as credit, null::text as license_code, m.source_institution as source_institution,
           (case when m.media_type='teckning' then 'runestone_drawing' else 'runestone' end) as category, 1 as prio
    from public.inscription_media m
    join public.runic_inscriptions ri on ri.id = m.inscription_id, q
    where m.media_type in ('image','teckning')
      and (m.media_url ~* '\.(jpe?g|png|webp)(\?|$)' or m.media_url ~* 'ems\.dimu\.org/image/' or m.media_url ~* 'pub\.raa\.se/.*/visning')
      and (lower(coalesce(m.description,'')) like '%'||q.t||'%' or lower(coalesce(ri.name,'')) like '%'||q.t||'%'
           or (q.t ~ '(runst|runest|runinskr)' and m.media_type='image')
           or (q.t ~ '(teckning|drawing|fältrit|field draw)' and m.media_type='teckning'))
    union all
    select d.image_url, d.thumb_url, d.title, d.artist, d.license_code, d.source_institution,
           coalesce(d.subject_type,'depiction'), 2
    from public.historical_depictions d, q
    where (d.image_url ~* '\.(jpe?g|png|webp)(\?|$)' or d.image_url ~* 'ems\.dimu\.org/image/')
      and (lower(coalesce(d.title,'')) like '%'||q.t||'%' or lower(coalesce(d.place_name,'')) like '%'||q.t||'%'
           or (q.t ~ '(kyrk|church)' and d.subject_type='church'))
    union all
    select p.image_url, null, p.title, p.artist, p.license_code, p.source_institution, 'history_painting', 3
    from public.history_paintings p, q
    where p.image_url ~* '\.(jpe?g|png|webp)(\?|$)'
      and (lower(coalesce(p.title,'')) like '%'||q.t||'%'
           or exists (select 1 from unnest(p.match_terms) mt where lower(mt) like '%'||q.t||'%' or q.t like '%'||lower(mt)||'%'))
    union all
    select li.image_url, null, coalesce(li.title, li.landmark_name), li.photographer, li.license_code, li.source_institution, 'landmark', 4
    from public.landmark_images li, q
    where (li.image_url ~* '\.(jpe?g|png|webp)(\?|$)' or li.image_url ~* 'ems\.dimu\.org/image/')
      and (lower(coalesce(li.landmark_name,'')) like '%'||q.t||'%' or lower(coalesce(li.place_context,'')) like '%'||q.t||'%'
           or lower(coalesce(li.title,'')) like '%'||q.t||'%')
  )
  select distinct on (image_url) image_url, thumb_url, title, credit, license_code, source_institution, category
  from hits order by image_url, prio
  limit greatest(1, least(coalesce(p_limit,12), 40));
$$;
grant execute on function public.images_for_query(text,integer) to anon, authenticated;
