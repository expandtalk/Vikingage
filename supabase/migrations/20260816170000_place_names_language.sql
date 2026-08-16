-- Fånga Lantmäteris språk-attribut (sv/fi/samiska-varianter) per ortnamn. Möjliggör språkskikts-filter
-- (samiska/finska ortnamn som eget kulturarvslager) + koppling till ortnamns-språkskikt-specen.
alter table public.place_names add column if not exists language text;
comment on column public.place_names.language is 'Ortnamnets språk enl. Lantmäteris ortnamnsregister (sprak-fält): sv/fi/samiska-varianter. Fångas av ingest-ortnamn.mjs.';
