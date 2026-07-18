-- Mynt/coins som egen kategori (2026-07-18)
-- Modellerar både (a) nordisk kunglig myntning kopplad till härskare och (b)
-- senromerska/bysantinska solidusfynd. Kopplas till historical_kings via issuer_king_id.
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718220000
-- Seed-data i scripts/data/coins-seed.sql (körs separat efter denna migration).

begin;

create table if not exists public.coins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  category text not null,        -- nordic_royal | roman_solidus | hoard | imitation
  issuer text,                   -- härskare/kung/kejsare (fritext)
  issuer_king_id uuid references public.historical_kings(id) on delete set null,
  mint text,                     -- myntort (Sigtuna, Lund, Konstantinopel, Milano…)
  metal text,                    -- silver | gold | copper | billon
  denomination text,             -- penning | solidus | örtug | brakteat | riksdaler…
  period_start integer,
  period_end integer,
  obverse text,                  -- åtsida
  reverse text,                  -- frånsida
  find_place text,
  coordinates point,             -- fyndplats/myntort (lng, lat) för karta
  significance text,
  description text,
  description_en text,
  sources text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coins_category_idx on public.coins (category);
create index if not exists coins_issuer_king_idx on public.coins (issuer_king_id);

alter table public.coins enable row level security;

create policy "Anyone can view coins"
  on public.coins for select using (true);
create policy "Admins can modify coins"
  on public.coins for all using (public.is_admin());

commit;
