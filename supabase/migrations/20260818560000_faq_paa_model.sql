-- FAQ/PAA-lager: källkritiska, fler-perspektiv-svar med öppen bias-redovisning.
-- Skiljer sig från Wikipedias NPOV genom (1) disciplin-linser (samma fråga, olika svar per
-- metod/evidens), (2) explicit bias-ruta, (3) proveniens/konfidens/status per lins.
-- Innehållet (linserna) författas av agentflottan och granskas av människa — INGET gissas här.

-- Disciplin-referens = agentflottans linser.
create table if not exists public.research_discipline (
  code text primary key,
  label_sv text not null,
  label_en text not null,
  blurb_sv text,
  sort int default 100
);
insert into public.research_discipline (code,label_sv,label_en,blurb_sv,sort) values
  ('runolog','Runolog','Runologist','Läsning, datering (stiltypologi) och ristarattribution av runinskrifter.',10),
  ('arkeolog','Arkeolog','Archaeologist','Fornlämningar, boplatser och materiell kultur; kulturmiljö.',20),
  ('marinarkeolog','Marinarkeolog','Maritime archaeologist','Vrak, farleder och överfarter — segelkronologin (rodd före segel, ~700).',30),
  ('osteolog','Osteolog','Osteologist','Ben: ålder, kön, patologi och trauma — skattningar med osäkerhet.',40),
  ('arkeogenetiker','Arkeogenetiker','Archaeogeneticist','Släktskap och härkomst ur aDNA — härkomst är inte etnicitet.',50),
  ('forensiker','Forntida forensiker','Forensic (past)','Våld och "brott" i forntiden: trauma- och händelserekonstruktion, källkritiskt.',60),
  ('historiker','Historiker','Historian','Skriftliga källor och kronologi med klassisk källkritik; saga skiljs från historia.',70),
  ('diplomatiker','Diplomatiker','Diplomatist','Medeltidsbrev, stadsböcker: aktyp, formler, sigill, prosopografi; latin/medellågtyska/fornsvenska.',80),
  ('kulturgeograf','Kulturgeograf','Cultural geographer','Landskap, ortnamn, centralplatser; mönster prövas mot slumpbakgrund.',90),
  ('filolog','Filolog & ortnamnsforskare','Philologist','Språkhistoria, etymologi, namnled; skiljer äldsta belägg från namnets ålder.',100)
on conflict (code) do nothing;

-- FAQ-fråga = topik-nod (matchar normaliserad fråga + parafraser för PAA).
create table if not exists public.faq_question (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  question_sv text not null,
  question_en text,
  variants text[] default '{}',           -- parafraser/frågevarianter för PAA-matchning
  entity_type text,                        -- 'place'|'king'|'deity'|'historical_event'|'theme'|'inscription'|'topic'
  entity_id uuid,
  period_start int, period_end int,        -- temporal facett (historiska händelser)
  status text not null default 'draft' check (status in ('draft','reviewed','published')),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists faq_question_entity_idx on public.faq_question(entity_type, entity_id);

-- Disciplin-lins-svar (flera per fråga) — proveniens, konfidens, status per lins.
create table if not exists public.faq_answer_lens (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.faq_question(id) on delete cascade,
  discipline text not null references public.research_discipline(code),
  answer_sv text not null, answer_en text,
  evidence_sv text,                        -- vilket belägg linsen vilar på
  status text not null default 'tolkning' check (status in ('belagt','tolkning','omstridt','obelagt')),
  confidence numeric,
  scholar_name text,
  sources text[] default '{}',             -- källor/URI:er (RAÄ, SOL, Wikidata, publikation)
  review_status text not null default 'draft' check (review_status in ('draft','verified')),
  agent_run_ref text,                      -- proveniens: agent-körning
  sort int default 100, created_at timestamptz default now()
);
create index if not exists faq_lens_q_idx on public.faq_answer_lens(question_id);

-- Bias-ruta: namnger biasen historieskrivning bär (ej falsk balans — belägg väger tyngst).
create table if not exists public.faq_bias_note (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.faq_question(id) on delete cascade,
  bias_type text not null check (bias_type in ('nationell','genus','kalloverlevnad','teleologi','eurocentrism','ovrig')),
  note_sv text not null, note_en text, created_at timestamptz default now()
);
create index if not exists faq_bias_q_idx on public.faq_bias_note(question_id);

-- PAA-träd: relaterade frågor ("people also ask").
create table if not exists public.faq_related (
  question_id uuid not null references public.faq_question(id) on delete cascade,
  related_id uuid not null references public.faq_question(id) on delete cascade,
  relation text default 'paa' check (relation in ('paa','deeper','prerequisite')),
  rank int default 100,
  primary key (question_id, related_id)
);

-- RLS: publik läsning endast av PUBLICERADE frågor + deras verifierade linser; skrivning = admin.
alter table public.faq_question enable row level security;
alter table public.faq_answer_lens enable row level security;
alter table public.faq_bias_note enable row level security;
alter table public.faq_related enable row level security;
alter table public.research_discipline enable row level security;
do $$ begin
  create policy faq_q_read on public.faq_question for select using (status='published');
  create policy faq_lens_read on public.faq_answer_lens for select using (
    review_status='verified' and exists (select 1 from public.faq_question q where q.id=question_id and q.status='published'));
  create policy faq_bias_read on public.faq_bias_note for select using (
    exists (select 1 from public.faq_question q where q.id=question_id and q.status='published'));
  create policy faq_rel_read on public.faq_related for select using (true);
  create policy disc_read on public.research_discipline for select using (true);
exception when duplicate_object then null; end $$;

-- Assemblerings-RPC: fråga (slug el. normaliserad text) → hela FAQ:n (publicerad + verifierat).
create or replace function public.get_faq(p_q text)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with n as (select coalesce(normalize_search_query(p_q), lower(btrim(p_q))) nm),
  qrow as (
    select q.* from public.faq_question q, n
    where q.status='published' and (q.slug = n.nm or lower(q.question_sv)=n.nm
          or n.nm = any(select lower(v) from unnest(coalesce(q.variants,'{}'::text[])) v))
    limit 1)
  select case when not exists(select 1 from qrow) then null else (
    select to_jsonb(qr) || jsonb_build_object(
      'lenses', coalesce((select jsonb_agg(jsonb_build_object(
          'discipline', l.discipline, 'discipline_label', d.label_sv,
          'answer_sv', l.answer_sv, 'answer_en', l.answer_en, 'evidence_sv', l.evidence_sv,
          'status', l.status, 'confidence', l.confidence, 'scholar', l.scholar_name, 'sources', l.sources)
          order by d.sort, l.sort)
        from public.faq_answer_lens l join public.research_discipline d on d.code=l.discipline
        where l.question_id=qr.id and l.review_status='verified'),'[]'::jsonb),
      'bias', coalesce((select jsonb_agg(jsonb_build_object('type', b.bias_type, 'note_sv', b.note_sv, 'note_en', b.note_en))
        from public.faq_bias_note b where b.question_id=qr.id),'[]'::jsonb),
      'related', coalesce((select jsonb_agg(jsonb_build_object('slug', rq.slug, 'question_sv', rq.question_sv) order by r.rank)
        from public.faq_related r join public.faq_question rq on rq.id=r.related_id
        where r.question_id=qr.id and rq.status='published'),'[]'::jsonb))
    from qrow qr) end;
$$;
grant execute on function public.get_faq(text) to anon, authenticated;
