-- Royal Chronicles — schemautökning inför regent-/relationsimport (2026-07-18)
-- Steg 1 av importplanen (se scripts/data/royal-chronicles/SCHEMA-MAPPING.md).
-- Rena schemaändringar; ingen data rörs här. Kör i SQL-editorn, sedan:
--   supabase migration repair --status applied 20260718200000
--
-- Bakgrund: regents_missing.csv bär fält som saknar hemvist i historical_kings
-- (role, de_facto_ruler, external_attestation, sources), och relations_edges.csv
-- kräver en person↔person-tabell som inte finns. UI:t gissar idag "kung vs jarl"
-- ur namn/beskrivning (filterByRulerType) — en riktig role-kolumn ersätter det.

begin;

-- 1) Nya kolumner på historical_kings (alla nullable → befintliga 128 rader opåverkade)
alter table public.historical_kings
  add column if not exists role text,
  add column if not exists de_facto_ruler boolean not null default false,
  add column if not exists external_attestation text[] not null default '{}',
  add column if not exists sources text,
  add column if not exists node_control text;

comment on column public.historical_kings.role is
  'Strukturerad roll: King/Queen/Jarl/Drots/Riksföreståndare/Sjökonung/Härförare/Furste/Expeditionsledare/Motkonung. Ersätter textgissning i filterByRulerType.';
comment on column public.historical_kings.de_facto_ruler is
  'Styrde utan formell kungatitel (jarl/drots/riksföreståndare).';
comment on column public.historical_kings.external_attestation is
  'Externa källkategorier: frankisk/anglosaxisk/irisk/bysantinsk/arabisk/rysk/påvlig/tysk.';
comment on column public.historical_kings.sources is
  'Fritext-källbelägg per regent (ur revisionsunderlaget).';
comment on column public.historical_kings.node_control is
  'Maritim nodkontroll (sund/hamn/led) för sjökungar.';

-- 2) Person↔person-relationer (namnbaserad — många ändpunkter är inte kungar)
create table if not exists public.royal_relations (
  id uuid primary key default gen_random_uuid(),
  person_a text not null,
  person_b text not null,
  relation_type text not null,   -- äktenskap|förälder|fostran|exil_hos|tjänst_hos|fadderskap|dråp_strid
  period text,
  comment text,
  source text,
  king_a_id uuid references public.historical_kings(id) on delete set null,
  king_b_id uuid references public.historical_kings(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists royal_relations_person_a_idx on public.royal_relations (lower(person_a));
create index if not exists royal_relations_person_b_idx on public.royal_relations (lower(person_b));
create index if not exists royal_relations_king_a_idx on public.royal_relations (king_a_id);
create index if not exists royal_relations_king_b_idx on public.royal_relations (king_b_id);

alter table public.royal_relations enable row level security;

create policy "Anyone can view royal relations"
  on public.royal_relations for select using (true);

create policy "Admins can modify royal relations"
  on public.royal_relations for all using (public.is_admin());

commit;
