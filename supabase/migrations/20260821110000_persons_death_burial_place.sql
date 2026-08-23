-- Dödsplats (Wikidata P20) + gravplats (P119) för persons, för relationell locate ("var dog/begravdes X").
-- Samma form som birthplace (P19): qid + label + koordinat (P625) + härledd admin. Skördas separat,
-- gissas ALDRIG — saknas i Wikidata lämnas NULL och svaret säger "obelagt".
alter table public.persons
  add column if not exists death_place_qid    text,
  add column if not exists death_place_label  text,
  add column if not exists death_place_lat     double precision,
  add column if not exists death_place_lng     double precision,
  add column if not exists death_place_admin   text,
  add column if not exists burial_place_qid   text,
  add column if not exists burial_place_label text,
  add column if not exists burial_place_lat    double precision,
  add column if not exists burial_place_lng    double precision,
  add column if not exists burial_place_admin  text;

comment on column public.persons.death_place_label is 'Dödsplats ur Wikidata P20 (CC0). NULL = obelagt, gissas ej.';
comment on column public.persons.burial_place_label is 'Gravplats ur Wikidata P119 (CC0). NULL = obelagt, gissas ej.';
