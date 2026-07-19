-- object_source.objectid pekade mot objects(objectid) (rundata-rest, 142 rader), men
-- appen läser kedjan object_source.objectid = runic_inscriptions.id
-- (useInscriptionExtendedData). Nyimporterade inskrifter har id = rundata objectid,
-- så rätt referensmål är runic_inscriptions. Repekar FK:n dit; sourceid-FK:n behålls.
alter table public.object_source drop constraint if exists fk_object;
alter table public.object_source
  add constraint fk_object foreign key (objectid)
  references public.runic_inscriptions(id) on delete cascade;
