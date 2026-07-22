-- Artefaktsidan visade bara numeriska ID:n (Daniel 2026-07-20). Det intressanta
-- är grafkanterna: 12 995 has_artefact-kanter (inskrift → artefakttyp) lyftes i P0/P2
-- men sidan läste rundata_artefacts som INTE delar id-rymd med kanterna (0 träffar).
-- Två RPC:er: typlistan med inskriftsantal (kategori hämtas ur rundata_artefacts via
-- namnbrygga), och inskrifterna för en vald typ.

create or replace function public.artefact_types_v1()
returns table (id uuid, name text, category text, inscription_count bigint)
language sql stable as $$
  select a.id, a.artefact as name,
    (select max(ra.category_mapping) from public.rundata_artefacts ra
      where lower(ra.artefact_name) = lower(a.artefact)) as category,
    count(r.id) as inscription_count
  from public.artefacts a
  left join public.relationship r on r.object_id = a.id and r.predicate = 'has_artefact'
  group by a.id, a.artefact
$$;

create or replace function public.get_artefact_inscriptions(p_artefact_id uuid)
returns table (id uuid, signum text, name text, socken text, landscape text, translation_sv text)
language sql stable as $$
  select ri.id, ri.signum, ri.name, ri.socken, ri.landscape, ri.translation_sv
  from public.relationship r
  join public.runic_inscriptions ri on ri.id = r.subject_id
  where r.predicate = 'has_artefact' and r.object_id = p_artefact_id
  order by ri.signum
$$;

grant execute on function public.artefact_types_v1() to anon, authenticated;
grant execute on function public.get_artefact_inscriptions(uuid) to anon, authenticated;
