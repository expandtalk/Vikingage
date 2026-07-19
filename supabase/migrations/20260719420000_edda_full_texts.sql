-- =====================================================================
-- Migration: Poetiska Eddan (Codex Regius) — fulltextsökbara källtexter
-- Fil: 20260719420000_edda_full_texts.sql
-- STATUS: EJ APPLICERAD. Granskbar. Kör via `supabase db push` efter review.
-- =====================================================================
--
-- SYFTE
--   Gör Poetiska Eddans dikter fulltextsökbara i Postgres. Endast fria
--   (public domain) texter lagras. Kända moderna, upphovsrättsskyddade
--   översättningar FLAGGAS (historical_sources.copyrighted_editions) men
--   lagras ALDRIG.
--
-- RÄTTIGHETSSTATUS (verifierad)
--   * Fornnordiskt original : Eddukvæði, Guðni Jónsson-normalisering
--                             (heimskringla.no / is.wikisource). Medeltida
--                             text -> public domain.
--   * Svenska               : Erik Brate, "Sämund den vises Edda" (1913).
--                             Brate d. 1924 -> PD (>70 år). Källa: sv.wikisource
--                             / Project Runeberg.
--   * Engelska              : Henry Adams Bellows, "The Poetic Edda" (1923).
--                             PD (publicerad 1923). Källa: sacred-texts.com /
--                             en.wikisource.
--   * EJ MEDTAGNA (skyddade): Åke Ohlmarks (1948), Björn Collinder (1957),
--                             Lars Lönnroth (2016) m.fl. -> flaggas nedan.
--
-- TEKNIK
--   * Dollar-quoting ($txt$ ... $txt$) för all textliteral -> inga
--     escape-problem med apostrofer eller þ ð æ ø ö.
--   * Idempotent: `where not exists` per (source_id, stanza_no) + unikt index.
--   * Generated tsvector-kolumn + GIN-index (swedish/english/simple).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tabell: source_texts
-- ---------------------------------------------------------------------
create table if not exists public.source_texts (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references public.historical_sources(id) on delete cascade,
  stanza_no       integer,
  original_norse  text,
  translation_sv  text,
  translation_en  text,
  sv_source       text,
  en_source       text,
  norse_source    text,
  created_at      timestamptz not null default now()
);

comment on table public.source_texts is
  'Fulltext för källtexter (t.ex. eddadikter). En rad per strof (stanza_no) eller hela verket (stanza_no null). Endast public domain-text.';
comment on column public.source_texts.stanza_no is
  'Strofnummer enligt standardnumrering. NULL = hela dikten/verket som en rad.';
comment on column public.source_texts.original_norse is 'Fornvästnordiskt original (PD).';
comment on column public.source_texts.translation_sv is 'Svensk PD-översättning (t.ex. Brate 1913).';
comment on column public.source_texts.translation_en is 'Engelsk PD-översättning (t.ex. Bellows 1923).';

create index if not exists idx_source_texts_source on public.source_texts(source_id);

-- Idempotent seed-nyckel för strofer (NULL-strofer hanteras separat i seed).
create unique index if not exists uq_source_texts_source_stanza
  on public.source_texts(source_id, stanza_no)
  where stanza_no is not null;


-- ---------------------------------------------------------------------
-- 2. Kolumn på historical_sources: kända skyddade utgåvor (ej medtagna)
-- ---------------------------------------------------------------------
alter table public.historical_sources
  add column if not exists copyrighted_editions text;

comment on column public.historical_sources.copyrighted_editions is
  'Kända moderna, upphovsrättsskyddade översättningar/utgåvor som medvetet EJ lagras i source_texts (t.ex. Ohlmarks 1948; Lönnroth 2016). Informativt för användaren.';


-- ---------------------------------------------------------------------
-- 3. Fulltext: generated tsvector + GIN-index
--    swedish för sv, english för en, simple för fornnordiskan
--    (ingen stämmare för fornvästnordiska finns; 'simple' ger exakt
--     tokenisering utan felaktig stemming).
-- ---------------------------------------------------------------------
alter table public.source_texts
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('swedish', coalesce(translation_sv, '')) ||
    to_tsvector('english', coalesce(translation_en, '')) ||
    to_tsvector('simple',  coalesce(original_norse, ''))
  ) stored;

create index if not exists idx_source_texts_fts on public.source_texts using gin(fts);


-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table public.source_texts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'source_texts'
      and policyname = 'Public read source_texts'
  ) then
    create policy "Public read source_texts"
      on public.source_texts for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'source_texts'
      and policyname = 'Admins manage source_texts'
  ) then
    create policy "Admins manage source_texts"
      on public.source_texts for all
      using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 5. Search-RPC: search_source_texts(q text)
--    Returnerar dikttitel, strof och markerade snuttar (ts_headline).
-- ---------------------------------------------------------------------
create or replace function public.search_source_texts(q text)
returns table (
  source_id     uuid,
  title         text,
  title_en      text,
  stanza_no     integer,
  snippet_sv    text,
  snippet_en    text,
  snippet_norse text,
  rank          real
)
language sql
stable
security invoker
set search_path = public
as $fn$
  with tq as (
    select
      websearch_to_tsquery('swedish', q) as q_sv,
      websearch_to_tsquery('english', q) as q_en,
      websearch_to_tsquery('simple',  q) as q_si
  )
  select
    st.source_id,
    hs.title,
    hs.title_en,
    st.stanza_no,
    ts_headline('swedish', coalesce(st.translation_sv, ''), tq.q_sv),
    ts_headline('english', coalesce(st.translation_en, ''), tq.q_en),
    ts_headline('simple',  coalesce(st.original_norse, ''), tq.q_si),
    ts_rank(st.fts, tq.q_sv || tq.q_en || tq.q_si) as rank
  from public.source_texts st
  join public.historical_sources hs on hs.id = st.source_id
  cross join tq
  where st.fts @@ (tq.q_sv || tq.q_en || tq.q_si)
  order by rank desc, hs.title, st.stanza_no
  limit 50;
$fn$;

comment on function public.search_source_texts(text) is
  'Fulltextsök över source_texts (sv/en/fornnordiska). Returnerar titel, strof och ts_headline-snuttar per språk, rankade.';


-- ---------------------------------------------------------------------
-- 6. Flagga skyddade utgåvor på alla eddadikter (idempotent)
-- ---------------------------------------------------------------------
update public.historical_sources
set copyrighted_editions =
  $txt$Ohlmarks 1948; Collinder 1957/1972; Lönnroth 2016 — ej medtagna (upphovsrätt). Fria utgåvor i source_texts: fornnordiska (Guðni Jónsson, PD), svenska (Brate 1913, PD), engelska (Bellows 1923, PD).$txt$
where work_type = 'edda_poem'
  and copyrighted_editions is null;


-- ---------------------------------------------------------------------
-- 7. Seed: fria källtexter (kurerat urval av kända strofer)
--    Join sker på historical_sources.title (exakta svenska titlar
--    verifierade mot databasen). Idempotent via `where not exists`.
--
--    Källsträngar återanvänds:
--      norse : Guðni Jónsson-normalisering (heimskringla.no / is.wikisource), PD
--      sv    : Erik Brate, Sämund den vises Edda (1913), sv.wikisource, PD
--      en    : Henry Adams Bellows, The Poetic Edda (1923), sacred-texts / Wikisource, PD
-- ---------------------------------------------------------------------

-- === Valans spådom / Völuspá, strof 1 (norse + sv Brate + en Bellows) ===
insert into public.source_texts
  (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1,
  $txt$Hljóðs bið ek allar
helgar kindir,
meiri ok minni
mögu Heimdallar;
viltu, at ek, Valföðr,
vel fram telja
forn spjöll fira,
þau er fremst um man.$txt$,
  $txt$Hören mig alla
heliga släkten,
större och smärre
söner av Heimdall;
du vill ju, Valfader,
att väl jag täljer
forntida sägner,
de första, jag minnes.$txt$,
  $txt$Hearing I ask
from the holy races,
From Heimdall's sons,
both high and low;
Thou wilt, Valfather,
that well I relate
Old tales I remember
of men long ago.$txt$,
  $txt$Eddukvæði, Guðni Jónsson-normalisering (heimskringla.no / is.wikisource) — PD$txt$,
  $txt$Erik Brate, Sämund den vises Edda (1913), sv.wikisource — PD$txt$,
  $txt$Henry Adams Bellows, The Poetic Edda (1923), sacred-texts.com / Wikisource — PD$txt$
from public.historical_sources hs
where hs.title = $txt$Valans spådom$txt$ and hs.work_type = 'edda_poem'
  and not exists (
    select 1 from public.source_texts st where st.source_id = hs.id and st.stanza_no = 1
  );

-- === Den Höges sång / Hávamál, strof 1 (norse; sv/en uppskjutna, ej verifierade ordagrant) ===
insert into public.source_texts
  (source_id, stanza_no, original_norse, norse_source)
select hs.id, 1,
  $txt$Gáttir allar,
áðr gangi fram,
um skoðask skyli,
um skyggnask skyli;
því at óvíst er at vita,
hvar óvinir
sitja á fleti fyrir.$txt$,
  $txt$Eddukvæði, Guðni Jónsson-normalisering (heimskringla.no / is.wikisource) — PD$txt$
from public.historical_sources hs
where hs.title = $txt$Den Höges sång$txt$ and hs.work_type = 'edda_poem'
  and not exists (
    select 1 from public.source_texts st where st.source_id = hs.id and st.stanza_no = 1
  );

-- === Den Höges sång / Hávamál, strof 76 (norse + en Bellows) ===
insert into public.source_texts
  (source_id, stanza_no, original_norse, translation_en, norse_source, en_source)
select hs.id, 76,
  $txt$Deyr fé,
deyja frændr,
deyr sjalfr it sama,
en orðstírr
deyr aldregi,
hveim er sér góðan getr.$txt$,
  $txt$Cattle die,
and kinsmen die,
And so one dies one's self;
But a noble name
will never die,
If good renown one gets.$txt$,
  $txt$Eddukvæði, Guðni Jónsson-normalisering (heimskringla.no / is.wikisource) — PD$txt$,
  $txt$Henry Adams Bellows, The Poetic Edda (1923), sacred-texts.com / Wikisource — PD$txt$
from public.historical_sources hs
where hs.title = $txt$Den Höges sång$txt$ and hs.work_type = 'edda_poem'
  and not exists (
    select 1 from public.source_texts st where st.source_id = hs.id and st.stanza_no = 76
  );

-- === Den Höges sång / Hávamál, strof 77 (norse + en Bellows) ===
insert into public.source_texts
  (source_id, stanza_no, original_norse, translation_en, norse_source, en_source)
select hs.id, 77,
  $txt$Deyr fé,
deyja frændr,
deyr sjalfr it sama,
ek veit einn,
at aldrei deyr:
dómr um dauðan hvern.$txt$,
  $txt$Cattle die,
and kinsmen die,
And so one dies one's self;
One thing now
that never dies,
The fame of a dead man's deeds.$txt$,
  $txt$Eddukvæði, Guðni Jónsson-normalisering (heimskringla.no / is.wikisource) — PD$txt$,
  $txt$Henry Adams Bellows, The Poetic Edda (1923), sacred-texts.com / Wikisource — PD$txt$
from public.historical_sources hs
where hs.title = $txt$Den Höges sång$txt$ and hs.work_type = 'edda_poem'
  and not exists (
    select 1 from public.source_texts st where st.source_id = hs.id and st.stanza_no = 77
  );


-- =====================================================================
-- UPPSKJUTET (Fas 1b): full strof-för-strof-ingestion
--   * Brate 1913 (sv) för Hávamål samt övriga dikter — källa bekräftad
--     (sv.wikisource "Den höges sång" m.fl.), hämtas ordagrant.
--   * Prioritet 1b (runsten-länkade): Sången om Fafner (Fáfnismál),
--     Sången om Regin (Reginsmál), Sången om Sigdriva (Sigrdrífumál),
--     Kvädet om Hymer (Hymiskviða), Sången om Hamder (Hamðismál),
--     Gudruns eggelse (Guðrúnarhvöt).
--   * Övriga 24 eddadikter därefter.
--
-- UPPSKJUTET (Fas 2): SAGOR (work_type='saga') — Heimskringla, Völsunga
--   saga, islänningasagor. Ryms i samma schema (source_texts + samma FTS).
-- =====================================================================
