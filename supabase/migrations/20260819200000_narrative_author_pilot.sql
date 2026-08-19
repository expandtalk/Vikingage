-- AI-FÖRFATTARE — släktplats-pilot (datamodell).
-- Tre bärande principer (Daniel):
--   1) Stilarketyper, INTE röstkopia av levande författare — stil beskrivs som hantverk (register,
--      meningsbyggnad, metafortäthet, lexikala filter), aldrig "skriv som X".
--   2) Fakta ≠ fiktion får aldrig smälta ihop — narrativet (tolkning/fiktion) lagras skilt från de
--      källbelagda fakta det vilar på. Samma disciplin som grundtext-i-översättning + claim-liggaren.
--   3) Verifierare i loopen — varje faktapåstående är spårbart till källa och får status
--      (belagt/tolkning/obelagt) + granskning innan publicering.

-- ── Stilarketyper ────────────────────────────────────────────────────────────
create table if not exists public.narrative_styles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name_sv       text not null,
  name_en       text,
  -- Register beskrivet som HANTVERK, ej författarnamn.
  register      text not null,                 -- t.ex. 'saga_lakonisk','slaktkronika','popvet_reporter'
  description_sv text,
  -- Craft-parametrar: meningsbyggnad, metafortäthet, POV, lexikala filter (t.ex. rensa sena lånord).
  craft         jsonb not null default '{}'::jsonb,
  -- Ev. EGET (in-house/PD) exempel — författas människa-i-loopen, aldrig auto-genererad kanon.
  example_sv    text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Narrativ (tolkning/fiktion — ALLTID märkt) ───────────────────────────────
create table if not exists public.place_narratives (
  id            uuid primary key default gen_random_uuid(),
  -- Platsen narrativet handlar om (socken/ort). place_ref = place_names.id när det finns; annars fritt.
  place_ref     uuid references public.place_names(id) on delete set null,
  place_label   text not null,                 -- läsbar plats (socken/ort) även utan place_ref
  style_id      uuid references public.narrative_styles(id) on delete set null,
  title_sv      text,
  body_sv       text,                          -- SJÄLVA narrativet — tolkning/fiktion
  -- Obligatorisk märkning: detta är AI-genererad tolkning, inte fastställd fakta.
  disclaimer_sv text not null default 'AI-genererad tolkning grundad i plattformens källbelagda data — inte en fastställd historisk skildring. Se beläggen nedan.',
  lang          text not null default 'sv',
  model         text,                          -- vilken modell/agent som genererade
  prompt        text,                          -- användarens prompt (reproducerbarhet)
  review_status text not null default 'draft'  -- draft | verified | rejected
                 check (review_status in ('draft','verified','rejected')),
  created_by    uuid,                          -- auth.uid() (nullbar för system/pilot)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_place_narratives_place on public.place_narratives(place_ref);
create index if not exists idx_place_narratives_status on public.place_narratives(review_status);

-- ── Faktapåståenden bakom narrativet (källkritik-ryggraden, verifierarens kö) ──
create table if not exists public.narrative_claims (
  id            uuid primary key default gen_random_uuid(),
  narrative_id  uuid not null references public.place_narratives(id) on delete cascade,
  claim_sv      text not null,                 -- det källbelagda faktapåståendet (skilt från prosan)
  -- Proveniens: vilken sorts källa + referens (obligatoriskt för att en mening ska få stå i narrativet).
  source_type   text,                          -- 'place_name'|'inscription'|'church'|'wikidata'|'sdhk'|...
  source_ref    text,                          -- uuid / external_id / URI
  source_citation text,
  -- Status ORTOGONALT mot narrativets review_status (jfr claim-liggaren).
  status        text not null default 'tolkning'
                 check (status in ('belagt','tolkning','obelagt')),
  verified_by   uuid,
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_narrative_claims_narrative on public.narrative_claims(narrative_id);

-- ── Seed: stilarketyper (definitioner/parametrar — INGEN auto-genererad exempelprosa) ──
insert into public.narrative_styles (slug, name_sv, name_en, register, description_sv, craft) values
  ('saga-lakonisk', 'Isländsk sagastil', 'Icelandic saga style', 'saga_lakonisk',
   'Lakonisk, kärv, underdrifter (litoteser), yttre handling framför inre monolog. Kenningar sparsamt och korrekt.',
   '{"pov":"tredje_person","meningsbyggnad":"kort_parataktisk","metafortathet":"lag","litoteser":true,"lexikalt_filter":"rensa_sena_lanord","kenningar":"sparsamt"}'::jsonb),
  ('slaktkronika', 'Släktkrönika över generationer', 'Multi-generation family chronicle', 'slaktkronika',
   'Landskapet som bärare av släktens tid över generationer (Roots som GENRE, ej kopia). Varm, konkret, platsförankrad.',
   '{"pov":"nara_tredje_eller_forsta","meningsbyggnad":"flodande","metafortathet":"medel","tidsspann":"generationer","platsforankring":"hog"}'::jsonb),
  ('popvet-reporter', 'Populärvetenskaplig reporter', 'Popular-science reporter', 'popvet_reporter',
   'Nutida, förklarande, nyfiken reporterröst. Fakta först, tydliga källhänvisningar, inga anakronismer.',
   '{"pov":"forklarande","meningsbyggnad":"tydlig","metafortathet":"lag","kallhanvisningar":"explicita","ton":"nyfiken"}'::jsonb)
on conflict (slug) do nothing;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.narrative_styles   enable row level security;
alter table public.place_narratives   enable row level security;
alter table public.narrative_claims   enable row level security;

-- Publik läsning: stilar alltid; narrativ + belägg ENDAST när granskade (verified).
drop policy if exists narrative_styles_read on public.narrative_styles;
create policy narrative_styles_read on public.narrative_styles for select using (true);

drop policy if exists place_narratives_read on public.place_narratives;
create policy place_narratives_read on public.place_narratives for select
  using (review_status = 'verified' or public.is_admin());

drop policy if exists narrative_claims_read on public.narrative_claims;
create policy narrative_claims_read on public.narrative_claims for select
  using (exists (select 1 from public.place_narratives n
                 where n.id = narrative_id and (n.review_status = 'verified' or public.is_admin())));

-- Skrivning: endast admin (människa-i-loopen). Agenter FÖRESLÅR, skriver aldrig kanon själva.
drop policy if exists narrative_styles_write on public.narrative_styles;
create policy narrative_styles_write on public.narrative_styles for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists place_narratives_write on public.place_narratives;
create policy place_narratives_write on public.place_narratives for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists narrative_claims_write on public.narrative_claims;
create policy narrative_claims_write on public.narrative_claims for all
  using (public.is_admin()) with check (public.is_admin());
