-- Person↔plats som KÄLLKRITISK historisk-geografisk datamodell (Daniel/OpenAI-modellen för Birger jarl,
-- generaliserad till valfri stormans/persons maktgeografi). INGEN GISSNING: varje rad bär evidensgrad +
-- coord_status + källa; tradition/hypotes skiljs från belagt. Två LAGER: (1) personen själv, (2) ättens
-- gods/arv. BJI = MÄRKT forskningsheuristik (aldrig "faktum"). Jfr [[claim-ledger-architecture]],
-- [[coordinate-provenance-discipline]], [[location-hypotheses-framework]], [[epistemic-engine-independence]].

create table if not exists public.person_place_claims (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references public.persons(id),  -- nullable (kungar kan sakna persons-rad)
  person_name       text not null,                       -- t.ex. 'Birger jarl'
  place_label       text not null,
  lat               double precision,
  lng               double precision,
  -- verified = Wikidata P625 / RAÄ; approx = ungefärlig lokaliseringspunkt (ej mätpunkt); disputed =
  -- läget omtvistat (t.ex. Jälbolung); none = ingen koordinat.
  coord_status      text not null default 'none' check (coord_status in ('verified','approx','disputed','none')),
  coord_source      text,                                -- 'Wikidata P625 Q…' / 'RAÄ' / …
  period_from       int,
  period_to         int,
  -- Relationstyp (håll isär belagd handling från tradition):
  relation_type     text not null check (relation_type in
    ('birth','death','grave','residence','estate','inheritance','mint','battle','council',
     'charter_issued','donation','purchase','exchange','office_property','campaign','tradition','uncertain')),
  evidence_grade    text not null check (evidence_grade in ('A+','A','B','C','D')),
  layer             smallint not null default 1 check (layer in (1,2)), -- 1=personen själv, 2=ättens gods/arv
  event             text,
  inheritance_chain text,                                -- 'Birger jarl → Magnus Ladulås → Valdemar Magnusson → Uppsala domkyrka'
  primary_source    text,                                -- diplom/SDHK/SBL/DNA-studie …
  secondary_source  text,
  archaeological_support text,
  -- BJI-komponenter (0–1): dokumentär, personlig/politisk, arkeologisk, traditionell. MÄRKT heuristik.
  bji_d             numeric(3,2), bji_p numeric(3,2), bji_a numeric(3,2), bji_t numeric(3,2),
  uncertain         boolean not null default false,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists person_place_claims_person_idx on public.person_place_claims (lower(person_name));
create index if not exists person_place_claims_layer_idx  on public.person_place_claims (layer);

-- BJI = 0.35D + 0.30P + 0.20A + 0.15T (dokumentär tyngst, tradition lättast). GENERERAD kolumn så den
-- aldrig kan avvika från komponenterna; är en JÄMFÖRELSE-heuristik, INTE ett historiskt faktum.
alter table public.person_place_claims
  add column if not exists bji numeric(4,3)
  generated always as (round((0.35*coalesce(bji_d,0)+0.30*coalesce(bji_p,0)+0.20*coalesce(bji_a,0)+0.15*coalesce(bji_t,0))::numeric,3)) stored;

alter table public.person_place_claims enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='person_place_claims' and policyname='ppc public read') then
    create policy "ppc public read" on public.person_place_claims for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='person_place_claims' and policyname='ppc admin write') then
    create policy "ppc admin write" on public.person_place_claims for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
