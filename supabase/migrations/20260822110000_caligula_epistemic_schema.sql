-- Caligula fas 1 — epistemiskt schema (claim/evidens/oberoende). Enhetlig modell tvärs domäner
-- (rekommendation §6.1 i scratch-caligula-scoping.md) så oberoende-grafen inte splittras.
-- TOMMA nya tabeller — ingen datamutation, rör ej befintliga. Caligula SKRIVER ALDRIG kanon:
-- allt landar som status='staging'; verifieraren befordrar; människan beslutar.
-- Ref: [[caligula-epistemic-engine]], [[epistemic-engine-independence]], [[claim-ledger-architecture]].

-- 1. Atomärt, prövbart påstående om ett subjekt (KG-entitet) ELLER ett externt dokument som bedöms.
create table if not exists public.epistemic_claim (
  id            uuid primary key default gen_random_uuid(),
  subject_type  text,                              -- entity_registry-typ (place/person/inscription…); null för dokument-claim
  subject_id    uuid,
  document_ref  text,                              -- extern sajt/PDF som poängsätts (dokument-ingång)
  predicate     text not null,                     -- 'sex','founded_year','etymology','dedication','dating'…
  stated_value  text,
  claim_kind    text not null default 'interpretation'
    check (claim_kind in ('observation','interpretation','tradition','hypothesis')),
  epistemic     text not null default 'obelagt'
    check (epistemic in ('belagt','hypotes','omtvistat','obelagt')),
  confidence    numeric check (confidence is null or (confidence >= 0 and confidence <= 1)), -- BERÄKNAD, ej handsatt
  is_negative   boolean not null default false,    -- påstående grundat på FRÅNVARO (vägs ned)
  author_kind   text not null default 'agent' check (author_kind in ('agent','human','external')),
  status        text not null default 'staging' check (status in ('staging','verified','rejected')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists epistemic_claim_subject on public.epistemic_claim(subject_type, subject_id);

-- 2. En bevislänk FÖR/MOT ett påstående, från en källa. Falsifiering kräver att MOT-evidens kan lagras.
create table if not exists public.epistemic_evidence (
  id              uuid primary key default gen_random_uuid(),
  claim_id        uuid not null references public.epistemic_claim(id) on delete cascade,
  source_id       uuid,                            -- mjuk ref → historical_sources (flera källtabeller finns)
  external_ref    text,                            -- URI om källan ej katalogiserad
  stance          text not null default 'supports' check (stance in ('supports','refutes','neutral')),
  evidence_line   text not null,                   -- osteology/aDNA/grave_goods/typology/toponymy/topography/philology/written_source/archaeology/hydrology
  discipline      text,
  strength        numeric not null default 0.5 check (strength >= 0 and strength <= 1),
  observation_note text,                            -- vad som FAKTISKT iakttogs (skilt från tolkningen)
  created_by      text,
  created_at      timestamptz not null default now()
);
create index if not exists epistemic_evidence_claim on public.epistemic_evidence(claim_id);

-- 3. Härkomst mellan bevislänkar — KÄRNAN (Högom-problemet). Fångar delad anfader så konvergens
-- kan skiljas från oberoende. Exakt en av (depends_on_evidence, depends_on_source) sätts.
create table if not exists public.evidence_dependency (
  id                  uuid primary key default gen_random_uuid(),
  evidence_id         uuid not null references public.epistemic_evidence(id) on delete cascade,
  depends_on_evidence uuid references public.epistemic_evidence(id) on delete cascade,
  depends_on_source   uuid,                        -- anfader-källa (historical_sources) om roten är en källa
  dependency_kind     text not null default 'cites'
    check (dependency_kind in ('cites','reproduces','reuses_assumption','reanalyzes','independent')),
  check (num_nonnulls(depends_on_evidence, depends_on_source) = 1)
);
create index if not exists evidence_dependency_ev on public.evidence_dependency(evidence_id);

-- Oberoendegrad: antal DISTINKTA rötter bland stödjande evidens, inte antal länkar.
-- Länkar som ärver ett antagande (cites/reproduces/reuses_assumption) kollapsar till sin anfader;
-- 'reanalyzes'/'independent'/ingen länk = egen rot. Högom: 3 "man"-texter → 1 rot (svag);
-- osteologi+DNA+gravinventarium → 3 rötter (stark). v1 = djup-1-kollaps; transitiv traversering senare.
create or replace function public.epistemic_independence(p_claim uuid)
returns integer
language sql
stable
as $$
  select count(distinct root_key)::int from (
    select coalesce(
             'src:' || d.depends_on_source::text,
             case when d.depends_on_evidence is not null then 'ev:' || d.depends_on_evidence::text end,
             'ev:' || e.id::text
           ) as root_key
    from public.epistemic_evidence e
    left join public.evidence_dependency d
      on d.evidence_id = e.id
     and d.dependency_kind in ('cites','reproduces','reuses_assumption')
    where e.claim_id = p_claim and e.stance = 'supports'
  ) t;
$$;

-- RLS: publik läsning bara för BEFORDRADE claims; skrivning admin (Caligula kör server-side som admin).
alter table public.epistemic_claim      enable row level security;
alter table public.epistemic_evidence   enable row level security;
alter table public.evidence_dependency  enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='epistemic_claim' and policyname='epistemic_claim_read') then
    create policy epistemic_claim_read on public.epistemic_claim for select using (status = 'verified');
    create policy epistemic_claim_admin on public.epistemic_claim for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='epistemic_evidence' and policyname='epistemic_evidence_read') then
    create policy epistemic_evidence_read on public.epistemic_evidence for select
      using (exists (select 1 from public.epistemic_claim c where c.id = claim_id and c.status='verified'));
    create policy epistemic_evidence_admin on public.epistemic_evidence for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='evidence_dependency' and policyname='evidence_dependency_admin') then
    create policy evidence_dependency_admin on public.evidence_dependency for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
