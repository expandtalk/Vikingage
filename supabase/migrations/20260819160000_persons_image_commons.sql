-- Persondomän hero-bild: rå Commons-filnamn (Wikidata P18) lagras först; image_url/license/credit
-- sätts av licenspasset (ingest-person-portraits.mjs) ENDAST för PD/CC-bilder (aldrig skyddade porträtt).
alter table public.persons add column if not exists image_commons_file text;
