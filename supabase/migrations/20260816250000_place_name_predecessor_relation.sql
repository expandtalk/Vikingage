-- Föregångsnamn (predecessor_of) + andra namn-relationer, claim-ledgrat.
-- Skilj från place_names.superseded_by (dedup av SAMMA namn) — detta är OLIKA namn på samma lokus
-- över tid (onomastiskt palimpsest). ALLTID med proponent + källa + status; aldrig fast sanning.

create table if not exists public.place_name_relation (
  id uuid primary key default gen_random_uuid(),
  from_place_name_id uuid references public.place_names(id) on delete set null,
  to_place_name_id   uuid references public.place_names(id) on delete set null,
  from_name text,                 -- denormaliserat (relation kan finnas utan DB-rad)
  to_name   text,
  relation  text not null check (relation in
    ('predecessor_of','variant_of','same_referent','folk_etymology_of')),
  note text,
  source_id uuid references public.historical_sources(id) on delete set null,
  proponent text,                 -- forskare/upphovsman till relationen (fullständigt namn)
  confidence numeric check (confidence between 0 and 1),
  verification_status text not null default 'hypotes'
    check (verification_status in ('belagt','hypotes','obelagt','verified','forkastad')),
  created_by_method text,
  created_at timestamptz not null default now(),
  constraint pnr_has_endpoints check (
    (from_place_name_id is not null or from_name is not null) and
    (to_place_name_id   is not null or to_name   is not null)
  )
);
comment on table public.place_name_relation is
  'Namn-relationer över tid (föregångsnamn m.m.), claim-ledgrat. predecessor_of = äldre namn ersatt av yngre på samma lokus. Skilj från place_names.superseded_by (dedup samma namn).';

create index if not exists idx_pnr_from on public.place_name_relation(from_place_name_id);
create index if not exists idx_pnr_to   on public.place_name_relation(to_place_name_id);
create index if not exists idx_pnr_rel  on public.place_name_relation(relation);

alter table public.place_name_relation enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='place_name_relation' and policyname='pnr_public_read') then
    create policy pnr_public_read on public.place_name_relation for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='place_name_relation' and policyname='pnr_admin_write') then
    create policy pnr_admin_write on public.place_name_relation for all
      using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Registrera Nyholms FÖREGÅNGSNAMNS-hypotes som ett claim (metod-nivå, ej per plats).
-- Testbar, EJ antagen: teofora namn (särsk. Tor-) undertrycktes vid kristnandet (~1100).
insert into public.place_claim_attribute (attribute, claim_type, unit, description) values
  ('predecessor_name_suppression','onomastic_hypothesis',null,
   'Hypotes att ett äldre (ofta teofort/förkristet) namnskikt undertrycktes/ersattes vid religionsskifte.')
on conflict (attribute) do nothing;

insert into public.place_claim
  (claim_key, entity_type, attribute, statement, source_id, confidence,
   verification_status, created_by_method, note)
select 'nyholm_predecessor_name_suppression', 'onomastic_hypothesis',
       'predecessor_name_suppression',
       'Teofora personnamn (särskilt Tor-) blev sällsynta efter kristnandet (~1100); ett förkristet namnskikt antas ha undertryckts/ersatts (föregångsnamn).',
       (select id from public.historical_sources where author='Agneta Nyholm' and title ILIKE 'I modern%'),
       0.3, 'unpublished_hypothesis',
       'proponent: Agneta Nyholm (Sofiainstitutet) — hypotesgenerator',
       'TESTBAR ej antagen. Prövas genom frekvens av Tor-/teofora led PRE/POST ~1100 i (a) daterade ortnamn (period_stratum), (b) personnamn (runkorpus/viking_names/Peterson). Faller frekvensen skarpt = stöd; annars faller hypotesen. Konkreta A→B-föregångsnamn förs in i place_name_relation ENDAST med filolog/SOL-belägg.'
where not exists (select 1 from public.place_claim where claim_key='nyholm_predecessor_name_suppression');
