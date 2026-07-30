-- Fornsigtuna (Signhildsberg) — kungsgård i Håtuna sn, Upplands-Bro, ~4 km väster om Sigtuna.
-- Datahål: fanns inte i place_names. Koordinat verifierad (Wikipedia P625 = 59°37′25″N 17°39′10″Ö),
-- korsad mot Upplandsmuseets rapport 2022:15 + RAÄ Fornsök L2016:1229 m.fl. Ingen gissning.
-- Idempotent. Applicerad mot fjärr-DB via pooler; denna fil = proveniens.
INSERT INTO public.place_names
  (name, lat, lng, feature_type, province, earliest_attestation_year, attested_form, attestation_source, source, source_license, attribution)
SELECT 'Fornsigtuna (Signhildsberg)', 59.6236, 17.6528, 'kungsgård', 'Uppland', 1170,
       'Fornsigtuna', 'Påvebrev ca 1170',
       'Wikipedia/Upplandsmuseet 2022:15', 'CC BY 4.0',
       '© RAÄ Fornsök L2016:1229 m.fl.; koordinat Wikipedia (P625); Upplandsmuseets rapporter 2022:15'
WHERE NOT EXISTS (
  SELECT 1 FROM public.place_names WHERE name ILIKE 'fornsigtuna%' OR name ILIKE 'signhildsberg%'
);
