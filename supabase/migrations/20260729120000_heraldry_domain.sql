-- Heraldik & maktikonografi — egen ontologi-domän. Design ur diskussion 2026-07-29 (Daniel).
--
-- GRUNDDISTINKTION (hela poängen): SYSTEM ≠ MOTIV.
--   iconographic_motifs = det emblematiska motivet (lejon, örn, korp, tre kronor, kejsarbild).
--     Har en djup biografi: mediterran förlaga → brakteat/solidus → bildsten → … → heraldiskt vapen.
--     ASPATIALT och ATEMPORALT som begrepp — plats och datering bor på attesteringarna (som ärver
--     geografi från myntet/hällen/kyrkan de pekar på). Ett lejon-motiv kan därför bära en obruten
--     influenskedja utan att noden själv låtsas ha EN datering eller EN plats.
--   coats_of_arms = den SENA, formaliserade, ärftliga kompositionen av motiv (ca 1150+). Systemet.
--
-- ATTESTERINGSDISCIPLIN (mönster från hällristnings-schemat): ett påstående om att ett mynt/en häll
--   "bär Bjälbovapnet" utan avsändare = påstående utan källa → förbjuds strukturellt. Varje
--   attestering bär source_id (NOT NULL) + evidence_class (belagd/tillskriven/rekonstruerad/omtvistad).
--   is_attributed på coats_of_arms fångar retroaktivt tillskrivna (fiktiva) vapen — källkritik.
--
-- RECONCILIATION (forka INTE): attesteringar hänger POLYMORFT på befintlig ryggrad —
--   coin / heritage_site / christian_site / artefact / picture_stone_reuse. target='external' +
--   target_ref (source_uri) bär det som ännu inte är modellerat (SDHK-sigill: ingen charter-tabell än).
--   Grafnoderna (motiv, vapen) registreras i entity_registry; influensen "följa ikoner" = derives_from-
--   kanter i relationship. Källor = historical_sources.
--
-- CRS: ingen egen geom — spatialitet ärvs via target. (Motiv/vapen är begrepp, inte platser.)
-- Kör i SQL-editorn (pooler-psql) el. MCP execute_sql, sedan migration repair --status applied + regen types.ts (--linked).

begin;

-- ---------- ENUMS (guardade för säker manuell apply) ----------
do $$ begin
  if not exists (select 1 from pg_type where typname='motif_category') then
    create type motif_category as enum
      ('djur','fagel','fabeldjur','kors','himlakropp','vaxt','manniska','foremal','geometrisk','komposit'); end if;
  if not exists (select 1 from pg_type where typname='heraldic_evidence') then
    create type heraldic_evidence as enum ('belagd','tillskriven','rekonstruerad','omtvistad'); end if;
  if not exists (select 1 from pg_type where typname='heraldic_target') then
    create type heraldic_target as enum
      ('coin','heritage_site','christian_site','artefact','picture_stone','external'); end if;
  if not exists (select 1 from pg_type where typname='bearer_kind') then
    create type bearer_kind as enum
      ('dynasty','king','person','bishopric','town','realm','province','institution','family'); end if;  -- province = landskapsvapen
end $$;

-- ---------- 1. MOTIVET (djup biografi, aspatial nod) ----------
create table if not exists public.iconographic_motifs (
  motif_id      uuid primary key default gen_random_uuid(),
  name          text not null,
  name_en       text,
  category      motif_category not null,
  heraldic_term text,                    -- blasoneringsterm (t.ex. 'lejon rampant'); NULL för för-heraldiska motiv
  origin_note   text,                    -- t.ex. "mediterran/främreorientalisk härskarsymbol"
  description   text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- 2. VAPNET (sen, formaliserad komposition) ----------
create table if not exists public.coats_of_arms (
  arms_id        uuid primary key default gen_random_uuid(),
  name           text not null,          -- "Folkungavapnet", "Sveriges stora riksvapen"
  name_en        text,
  blazon         text,                   -- blasonering, fritext
  blazon_en      text,
  field_division text,                   -- kluven, kvadrerad, ginstyckad…
  marshalling    text,                   -- kvadrering/kluvning = allianser/anspråk
  is_attributed  boolean not null default false,   -- retroaktivt tillskrivet (fiktivt) vapen → källkritik-flagga
  earliest_year  integer,                -- tidigaste belägg (negativt = f.Kr.; ingen år 0)
  origin_theories text[] default '{}',   -- omtvistat ursprung, flervärt, ingen vald sanning (jfr Tre kronor: heliga tre konungar / tre riken / allmän kunglighetssymbol)
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- 3. KOMPOSITION: vilka motiv bygger ett vapen ----------
create table if not exists public.coat_charges (
  id             uuid primary key default gen_random_uuid(),
  arms_id        uuid not null references public.coats_of_arms(arms_id) on delete cascade,
  motif_id       uuid not null references public.iconographic_motifs(motif_id),
  tincture       text,                   -- laddningens färg/metall (guld, gules…)
  field_tincture text,                   -- fältets färg
  ordinary       text,                   -- häroldsbild (bjälke, sparre, ginbalk…)
  position_note  text,
  source_id      uuid references public.historical_sources(id),
  unique (arms_id, motif_id, ordinary)
);
create index if not exists coat_charges_arms_idx  on public.coat_charges (arms_id);
create index if not exists coat_charges_motif_idx on public.coat_charges (motif_id);

-- ---------- 4. BÄRARE (polymorf: vem förde vapnet, över tid) ----------
create table if not exists public.armorial_bearers (
  id           uuid primary key default gen_random_uuid(),
  arms_id      uuid not null references public.coats_of_arms(arms_id) on delete cascade,
  bearer_kind  bearer_kind not null,
  bearer_id    uuid,                     -- entity_registry/respektive tabell när modellerad (mjuk länk)
  bearer_name  text,                     -- ordagrant namn (obligatoriskt om ingen id)
  period_start integer,
  period_end   integer,
  evidence     heraldic_evidence not null default 'belagd',
  source_id    uuid not null references public.historical_sources(id),
  notes        text,
  constraint bearer_needs_ref check (bearer_id is not null or bearer_name is not null),
  constraint bearer_years_ordered check (period_start is null or period_end is null or period_start <= period_end)
);
create index if not exists armorial_bearers_arms_idx   on public.armorial_bearers (arms_id);
create index if not exists armorial_bearers_bearer_idx on public.armorial_bearers (bearer_id);

-- ---------- 5. ATTESTERING (polymorf kärna — VAR motivet/vapnet är belagt) ----------
create table if not exists public.heraldic_attestations (
  attestation_id uuid primary key default gen_random_uuid(),
  -- VAD attesteras: exakt ett av motiv/vapen
  motif_id       uuid references public.iconographic_motifs(motif_id) on delete cascade,
  arms_id        uuid references public.coats_of_arms(arms_id) on delete cascade,
  -- VAR: polymorf target på befintlig ryggrad, eller external + source_uri
  target         heraldic_target not null,
  target_id      uuid,                   -- FK-lös (polymorf) mot coin/heritage_site/… när target≠external
  target_ref     text,                   -- source_uri för external (SDHK-sigill m.m. ännu ej modellerat)
  side           text,                   -- åtsida/frånsida/sigill/kontrasigill
  evidence_class heraldic_evidence not null default 'belagd',
  start_year     integer,                -- attesteringens datering (negativt = f.Kr.)
  end_year       integer,
  source_id      uuid not null references public.historical_sources(id),  -- inget belägg utan avsändare
  notes          text,
  created_at     timestamptz not null default now(),
  constraint one_subject check (num_nonnulls(motif_id, arms_id) = 1),
  constraint target_ref_shape check ((target = 'external') = (target_id is null)),
  constraint external_needs_ref check (target <> 'external' or target_ref is not null),
  constraint attest_years_ordered check (start_year is null or end_year is null or start_year <= end_year)
);
create index if not exists heraldic_attest_motif_idx  on public.heraldic_attestations (motif_id);
create index if not exists heraldic_attest_arms_idx   on public.heraldic_attestations (arms_id);
create index if not exists heraldic_attest_target_idx on public.heraldic_attestations (target, target_id);

-- ---------- RLS (plattformsmönster: publik läsning, admin-skrivning) ----------
do $$
declare t text;
begin
  foreach t in array array['iconographic_motifs','coats_of_arms','coat_charges','armorial_bearers','heraldic_attestations']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_read', t);
    execute format('create policy %I on public.%I for select using (true);', t||'_read', t);
    execute format('drop policy if exists %I on public.%I;', t||'_write', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin());', t||'_write', t);
  end loop;
end $$;

-- ---------- ONTOLOGI-PREDIKAT (influensgrafen) ----------
-- "följa ikoner visar influenser" = derives_from-kanter mellan motiv i relationship.
--
-- TRANSMISSION (källkritik): en influenskant räcker inte som "A liknar B" — den bär HUR motivet reste,
--   i relationship.qualifiers (jsonb). Kontrollerad vokabulär för qualifiers->>'channel':
--     'imitatio_imperii'        — kejsarbild efterbildad (brakteat, solidus, örn-som-imperiearv)
--     'imperial_claim'          — anspråk på romerskt/bysantinskt imperiearv (aquila → dubbelörn → Reichsadler)
--     'christian_import'        — heraldiken importerad med kristnandet + 1200-talets stormannaklass
--     'tournament_seal_practice'— den feodala drivkraften (slutna hjälmar, sigillbruk)
--     'direct_copy'
-- BROTT-REGELN (Skandinavien): vikingatidens symbolvärld (korpfana, Odenssymbolik, djurornamentik)
--   ärvdes INTE in i heraldiken — den importerades i stort sett färdig söderifrån. Dra därför ALDRIG
--   en derives_from-kant nordiskt-förheraldiskt → heraldiskt "för att båda är nordiska". Nordiska
--   för-heraldiska motiv får origin_note = "EJ inhemsk kontinuitet — importerad via frankisk/engelsk
--   riddarkultur". Brottet kodas, det antas inte bort (samma anda som palimpsest-spärren).
do $$ begin
  if to_regclass('public.rel_predicates') is not null then
    insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, description) values
      ('derives_from','härleds från','derives from','iconographic_motif','iconographic_motif',
        'Ikonografisk influens/härledning motiv→motiv. qualifiers->>''channel'' bär HUR (imitatio_imperii/imperial_claim/christian_import/tournament_seal_practice/direct_copy).'),
      ('bears_charge','bär laddning','bears charge','coat_of_arms','iconographic_motif',
        'Vapnet innehåller motivet som heraldisk laddning.'),
      ('borne_by','förs av','borne by','coat_of_arms','*',
        'Vapnet fördes av bärare (dynasti/kung/stift/stad/landskap).'),
      ('attested_on','belagd på','attested on','*','*',
        'Motiv/vapen fysiskt belagt på target-entitet (mynt/häll/kyrka) — när target finns i entity_registry.')
    on conflict (code) do nothing;
  end if;
end $$;

commit;

-- ---------- ONTOLOGI-REGISTRERING & SEED (efter apply — behöver rad-ID:n) ----------
-- Mönster som picture_stone_reuse: registrera noder i entity_registry, materialisera kanter i relationship.
--   1. insert into entity_registry (id, entity_type, label)
--        select motif_id,'iconographic_motif',name from iconographic_motifs ... on conflict do nothing;
--        select arms_id,'coat_of_arms',name    from coats_of_arms       ... on conflict do nothing;
--   2. influens:  insert into relationship (subject_id, predicate, object_id, confidence, source_ref)
--        select bjalbo_lejon, 'derives_from', mediterrant_lejon, 'possible', '…';
--   3. tema:      registrera tema 'Heraldik & maktikonografi' (slug heraldik-maktikonografi) och
--        länka motiv/vapen via theme_links-vyn (write-through → has_theme i relationship).
--
-- PILOT (vertikalt testfall, bevisar båda lagren på data du redan äger):
--   motiv 'lejon' → attesteringar: guldbrakteat (coin, Söderby) → solidus (coin) → Bjälbolejonet
--   (coat_of_arms, 1200-tal) → Sveriges STORA riksvapen (2:a/3:e fältet, lejon över ginbalkar).
--   derives_from-kedjan mellan motiv-noderna = influensgrafen, med channel-qualifier per steg.
--   OBS källkritik (rättat 2026-07-29): lilla riksvapnet = TRE KRONOR, inte Folkungalejonet —
--   seeda inte lejonet där. Ölands landskapsvapen = hjort (att verifiera), EJ Folkungalejonet.
--   Fabricera INGA koordinater/dateringar/vapentillhörigheter utan verifierad källa.
--
-- BÄRARKORPUS: adelsvapen.com/genealogi (Adelsvapen-Wiki = digitaliserad Elgenstierna, "Den
--   introducerade svenska adelns ättartavlor"). Registrera som historical_sources (kind='dataset',
--   url). Ger blasonering + genealogi → coats_of_arms + armorial_bearers + influenser (giftermål,
--   kvadrering, adopterade vapenbilder). Riktad hämtning per ätt, EJ råskrap — respektera sidan.
--
-- KALMAR-SHOWCASE: (a) Kalmars stadssigill (bland de äldsta svenska) → heraldic_attestations
--   target='external'/artefact, side='sigill'. (b) Kalmar domkyrkas frälsevapen på väggen (rikt
--   utsmyckade, sannolikt begravningsvapen) → attesteringskluster på christian_site (Kalmar domkyrka).
