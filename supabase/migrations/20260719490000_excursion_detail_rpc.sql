-- RPC för utflyktsdetaljsidor: hämtar en runstens inskrift + ristare (bytea-brygga)
-- + edda-/källänkar i ETT anrop, som JSON. Används av /excursions/:id.
create or replace function public.get_excursion_detail(p_signum text)
returns jsonb language sql stable security invoker set search_path = public as $fn$
  select case when ri.id is null then null else jsonb_build_object(
    'signum', ri.signum,
    'meter', ri.meter,
    'transliteration', ri.transliteration,
    'translation_sv', ri.translation_sv,
    'translation_en', ri.translation_en,
    'dating', ri.dating_text,
    'location', ri.location,
    'scholarly_notes', ri.scholarly_notes,
    'carvers', coalesce((
      select jsonb_agg(jsonb_build_object('name', c.name, 'attribution', ci.attribution::text, 'certainty', ci.certainty)
             order by ci.attribution::text)
      from public.carver_inscription ci
      join public.carvers c on encode(ci.carverid,'hex') = replace(c.id::text,'-','')
      where lower(encode(ci.inscriptionid,'hex')) = lower(replace(ri.id::text,'-',''))), '[]'::jsonb),
    'edda', coalesce((
      select jsonb_agg(jsonb_build_object('title', s.title, 'relation', l.relation, 'notes', l.notes))
      from public.source_inscription_links l
      join public.historical_sources s on s.id = l.source_id
      where l.inscription_id = ri.id), '[]'::jsonb)
  ) end
  from public.runic_inscriptions ri
  where ri.signum = p_signum
  limit 1;
$fn$;
grant execute on function public.get_excursion_detail(text) to anon, authenticated;
