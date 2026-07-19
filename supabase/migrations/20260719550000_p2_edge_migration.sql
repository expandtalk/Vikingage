-- P2.2: Kantmigrering — fyll relationship från staging (rundata) + befintlig kurering.
-- Proveniens: source_ref anger ursprung; qualifiers bevarar all attributionsdata.
-- Konfidensmappning carved_by: signed→certain, attributed→probable, similar→possible.
-- Idempotent (on conflict do nothing).

begin;

-- ---------- 1. carved_by ur staging (1 276, auktoritativ rundata-attribution) ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select
  r.id, 'carved_by', pc.id,
  jsonb_strip_nulls(jsonb_build_object(
    'attribution', rci.attribution,
    'certainty', rci.certainty = 1,
    'notes', nullif(rci.notes, ''),
    'lang', rci.lang)),
  'rundata 2020-11-29 (carver_inscription)',
  case rci.attribution when 'signed' then 'certain' when 'attributed' then 'probable' else 'possible' end
from rundata_raw.carver_inscription rci
join rundata_raw.inscriptions i on i.inscriptionid = rci.inscriptionid
join public.runic_inscriptions r on r.rundata_objectid = i.objectid
join public.carvers pc on pc.rundata_carverid = rci.carverid
on conflict (subject_id, predicate, object_id) do nothing;

-- ---------- 2. carved_by ur befintlig kurering (bytea-tabellen; det som inte finns i rundata) ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select
  r.id, 'carved_by', pc.id,
  jsonb_strip_nulls(jsonb_build_object(
    'attribution', replace(ci.attribution::text, ' ', '_'),
    'certainty', ci.certainty,
    'notes', nullif(ci.notes, ''),
    'lang', ci.lang)),
  'kurerad (public.carver_inscription)',
  case ci.attribution::text when 'signed' then 'certain' when 'attributed' then 'probable' else 'possible' end
from public.carver_inscription ci
join public.runic_inscriptions r on replace(r.id::text, '-', '') = encode(ci.inscriptionid, 'hex')
join public.carvers pc on replace(pc.id::text, '-', '') = encode(ci.carverid, 'hex')
on conflict (subject_id, predicate, object_id) do nothing;

-- ---------- 3. has_artefact (14 298 ur rundata object_artefact) ----------
insert into public.relationship (subject_id, predicate, object_id, source_ref, confidence)
select distinct r.id, 'has_artefact', pa.id, 'rundata 2020-11-29 (object_artefact)', 'certain'
from rundata_raw.object_artefact oa
join public.runic_inscriptions r on r.rundata_objectid = oa.objectid
join public.artefacts pa on pa.id = oa.artefactid
on conflict (subject_id, predicate, object_id) do nothing;

-- ---------- 4. has_theme (befintliga theme_links) ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select tl.entity_id, 'has_theme', tl.theme_id,
  jsonb_strip_nulls(jsonb_build_object('notes', nullif(tl.notes, ''))),
  'kurerad (theme_links)', 'certain'
from public.theme_links tl
where exists (select 1 from public.entity_registry e where e.id = tl.entity_id)
on conflict (subject_id, predicate, object_id) do nothing;

-- ---------- 5. mentions_person (king_inscription_links) ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select kil.inscription_id, 'mentions_person', kil.king_id,
  jsonb_strip_nulls(jsonb_build_object(
    'connection_type', kil.connection_type,
    'evidence_strength', kil.evidence_strength,
    'notes', nullif(kil.analysis_notes, ''))),
  'kurerad (king_inscription_links)',
  case kil.evidence_strength when 'strong' then 'certain' when 'contested' then 'contested' else 'probable' end
from public.king_inscription_links kil
where exists (select 1 from public.entity_registry e where e.id = kil.inscription_id)
  and exists (select 1 from public.entity_registry e where e.id = kil.king_id)
on conflict (subject_id, predicate, object_id) do nothing;

-- ---------- 6. mentions_inscription (source_inscription_links) ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select sil.source_id, 'mentions_inscription', sil.inscription_id,
  jsonb_strip_nulls(jsonb_build_object('relation', sil.relation, 'notes', nullif(sil.notes, ''))),
  'kurerad (source_inscription_links)', 'certain'
from public.source_inscription_links sil
where exists (select 1 from public.entity_registry e where e.id = sil.source_id)
  and exists (select 1 from public.entity_registry e where e.id = sil.inscription_id)
on conflict (subject_id, predicate, object_id) do nothing;

commit;
