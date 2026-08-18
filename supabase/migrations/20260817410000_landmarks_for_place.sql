-- Landmärkesbilder för en plats — används av AnswerContext-panelen (även i LandscapeNode-läget, där
-- entity_answer_context-galleriet inte visas). Matchar place_context (pilot: 'Kalmar') ELLER närhet till
-- centrum. Diversifierar: max 3 per landmärke, slott→domkyrka→stadsmur, interfolierat. Fri licens (hotlänk).
-- SECURITY INVOKER (landmark_images har publik läs-RLS). Aggregat-läsning; anon/authenticated EXECUTE.

create or replace function public.landmarks_for_place(
  p_name text, p_lat double precision default null, p_lng double precision default null, p_radius_m int default 25000)
returns table (
  image_url text, landmark_name text, category text, license_code text, license_url text,
  photographer text, descr_url text, source_institution text
) language sql stable set search_path = public as $$
  select z.image_url, z.landmark_name, z.category, z.license_code, z.license_url,
         z.photographer, z.descr_url, z.source_institution
  from (
    select li.*,
      -- place_context-träff (exakt ort/region) rankas FÖRE ren närhets-träff, så "Kalmar" visar
      -- Kalmars landmärken och inte Öland-fort som råkar ligga <25 km bort.
      (li.place_context is not null
        and (li.place_context ilike trim(p_name) or trim(p_name) ilike '%'||li.place_context||'%')) as pc_match,
      row_number() over (partition by li.landmark_key
        order by (li.license_code in ('PD','CC0')) desc, li.image_url) as rn
    from public.landmark_images li
    where
      (li.place_context is not null
        and (li.place_context ilike trim(p_name) or trim(p_name) ilike '%'||li.place_context||'%'))
      or (li.geom is not null and p_lat is not null and p_lng is not null
        and st_dwithin(li.geom::geography, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, greatest(1000, coalesce(p_radius_m, 25000))))
  ) z
  where z.rn <= 3
  order by z.pc_match desc, z.rn, (case z.category when 'castle' then 0 when 'cathedral' then 1 else 2 end)
  limit 9;
$$;

revoke all on function public.landmarks_for_place(text, double precision, double precision, int) from public;
grant execute on function public.landmarks_for_place(text, double precision, double precision, int) to anon, authenticated;
