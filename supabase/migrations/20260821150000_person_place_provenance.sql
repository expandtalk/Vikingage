-- Förfinad provenansmodell (OpenAI-metoden, källgranskad): gå från DOKUMENTERADE ägarövergångar, inte
-- från "platser som sägs tillhöra ätten". Två nya fält:
--   provenance_level 1–4: 1=explicit arv ("jure hereditario"), 2=dokumenterad ägarkedja (ej uttryckligt arv),
--     3=dynastisk egendom (inträde i ätten okänt), 4=hypotes.
--   analysis_source: ANNOTERING av vilken AI/vem som gjort analysen (transparenskrav, Daniel).
alter table public.person_place_claims
  add column if not exists provenance_level smallint check (provenance_level between 1 and 4),
  add column if not exists analysis_source text;
comment on column public.person_place_claims.provenance_level is '1=explicit arv, 2=dokumenterad ägarkedja, 3=dynastisk egendom, 4=hypotes';
comment on column public.person_place_claims.analysis_source is 'Vilken AI/person som gjort evidensanalysen (transparens). Ej slutverifierad av människa förrän markerat.';
