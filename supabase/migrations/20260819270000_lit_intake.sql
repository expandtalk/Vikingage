-- Litteratur-intag ("Last 30 days" för VETENSKAP): brett intag av färska artiklar/preprints via öppna
-- metadata-API:er (OpenAlex/Crossref/DiVA/bioRxiv) → rå-intag-lager, aldrig kanon. Filtrering/befordran
-- sker vid grinden (staging→granskning), inte vid intaget (Daniel: "få in allt, filtrera sedan").
-- Metadata + DOI-utlänk är fritt; OA/CC BY-artiklar (is_oa) får visas fylligare. Se [[fornvannen-harvest]].

create table if not exists lit_intake (
  id bigint generated always as identity primary key,
  source text not null,                 -- openalex | crossref | diva | biorxiv | europepmc
  ext_id text,                          -- OpenAlex-id el. motsv.
  doi text,
  title text not null, authors text, journal text, publication_date date,
  url text, oa_url text, is_oa boolean, license text,
  abstract text, concepts text[],
  matched_query text, relevance real,
  status text not null default 'new',   -- new | relevant | irrelevant | promoted
  created_at timestamptz not null default now(),
  unique (source, ext_id));
create index if not exists lit_intake_doi_idx on lit_intake (doi);
create index if not exists lit_intake_status_idx on lit_intake (status, publication_date desc);
alter table lit_intake enable row level security;   -- privat rå-intag: ingen publik läspolicy (bara service_role)

-- Sökfrågor (kombinerbara sökord) — datadrivet, du kan lägga till/stänga av.
create table if not exists lit_queries (
  id bigint generated always as identity primary key,
  label text, query text not null, active boolean not null default true,
  min_relevance real default 0, created_at timestamptz default now(), unique(query));
insert into lit_queries (label, query) values
 ('Viking DNA','Viking Age ancient DNA Scandinavia'),
 ('Mesolitikum Skandinavien','Mesolithic Scandinavia'),
 ('Neandertal-DNA','Neanderthal DNA genome'),
 ('Benbevaring','bone collagen preservation archaeology'),
 ('Romartid Norden','Roman Iron Age Scandinavia'),
 ('Öland/Gotland arkeologi','Öland Gotland archaeology'),
 ('Medeltid Sverige','medieval Sweden archaeology'),
 ('Runstenar/runor','runestone runic inscription'),
 ('Vikingaskatter','Viking hoard silver'),
 ('Medeltida skatter','medieval coin hoard'),
 ('Solidus-mynt','solidus gold coin migration period'),
 ('Stenålder Norden','Stone Age Scandinavia Sweden Norway'),
 ('Arkeometri/isotoper','strontium isotope provenance archaeology'),
 ('aDNA befolkning','population genomics ancient Scandinavia'),
 ('Fornborgar/järnålder','hillfort Iron Age Sweden')
on conflict (query) do nothing;

-- Bevakade tidskrifter (referens för boost/filter; Daniels lista).
create table if not exists lit_journals (
  name text primary key, note text, created_at timestamptz default now());
insert into lit_journals (name) values
 ('Nature'),('Science'),('PLoS Biology'),('Archaeometry'),('Journal of Anthropological Archaeology'),
 ('Antiquity'),('Oecologia'),('BMC Evolutionary Biology'),('Molecular Ecology'),
 ('Journal of Archaeological Science'),('Genetics Selection Evolution'),('Fornvännen'),
 ('Current Biology'),('Proceedings of the National Academy of Sciences'),('Cell')
on conflict (name) do nothing;
