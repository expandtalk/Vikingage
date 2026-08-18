-- Tillåt subject_type 'manuscript' (medeltida handskrifter/illuminationer, PD) i historical_depictions.
alter table public.historical_depictions drop constraint if exists historical_depictions_subject_type_check;
alter table public.historical_depictions add constraint historical_depictions_subject_type_check
  check (subject_type in ('church','cult_site','mound','king','monument','manuscript','other'));
