-- 1) Nya fält på coins: numismatisk fas (kontrollerad enum) + utgivarregion (fritext, rek. värden).
alter table coins add column if not exists numismatic_phase text;
alter table coins add column if not exists issuing_region text;
alter table coins drop constraint if exists coins_numismatic_phase_chk;
alter table coins add constraint coins_numismatic_phase_chk check (numismatic_phase is null or numismatic_phase in (
  'roman_denarii','roman_byzantine_gold','gold_bracteates','sceattas','islamic_silver',
  'western_deniers','domestic_viking','medieval_swedish','early_modern','bullion_prestige'));

-- Backfill fas (per rad, källkritiskt; York-präglingen 939 lämnas null = ej klassificerad).
update coins set numismatic_phase = case
  when category in ('guldfynd','prestige_gold','depåfynd','redskap') then 'bullion_prestige'
  when category='brakteat' then 'gold_bracteates'
  when category in ('roman_denar','romerskt mynt','myntskatt') then 'roman_denarii'
  when category='roman_solidus' then 'roman_byzantine_gold'
  when category='islamic' then 'islamic_silver'
  when category='medeltida' then 'medieval_swedish'
  when category='nordic_royal' and mint ilike '%york%' then null
  when category='nordic_royal' and period_end <= 1100 then 'domestic_viking'
  when category='nordic_royal' and period_start >= 1500 then 'early_modern'
  when category='nordic_royal' then 'medieval_swedish'
  when category='imitation' and period_end >= 990 then 'domestic_viking'
  when category='imitation' then 'western_deniers'
  when category='runmynt' and period_start < 800 then 'sceattas'
  when category='runmynt' then 'medieval_swedish'
  else null end
where numismatic_phase is null;

-- Backfill utgivarregion ur mint (bara belagt; annars null).
update coins set issuing_region = case
  when mint ilike '%bagdad%' or mint ilike '%madinat%' or mint ilike '%muhammadiyya%' then 'Abbasid Caliphate'
  when mint ilike '%tabaristan%' then 'Tabaristan'
  when mint ilike '%konstantinopel%' then 'Byzantium'
  when mint ilike '%ravenna%' or mint ilike '%milano%' then 'Western Roman Empire'
  when mint='Rom' or mint ilike '%(rom)%' then 'Roman Empire'
  when mint ilike '%york%' then 'Anglo-Scandinavian York'
  when mint ilike '%east anglia%' or mint ilike '%england%' then 'Anglo-Saxon England'
  when mint ilike '%lund%' or mint ilike '%danmark%' then 'Denmark'
  when mint ilike '%nidaros%' or mint='Norge' then 'Norway'
  when mint ilike '%gotland%' then 'Gotland'
  when mint ilike '%sigtuna%' or mint ilike '%stockholm%' or mint ilike '%lödöse%' or mint ilike '%birka%' or mint='Sverige' then 'Sweden'
  else null end
where issuing_region is null;

-- 2) Egen hoards-tabell (skattfynd som feature-vektor: komposition + t.p.q.).
create table if not exists hoards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  find_place text,
  parish text,
  landscape text,
  coordinates point,
  deposition_tpq integer,
  deposition_tpq_confidence text,
  n_coins integer,
  n_ornaments integer,
  bullion_share numeric,
  dominant_metal text,
  numismatic_phase text,
  composition_note text,
  discovery_year integer,
  museum_inv text,
  significance text,
  description text,
  sources text,
  source_uri text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table hoards enable row level security;
drop policy if exists "hoards public read" on hoards;
create policy "hoards public read" on hoards for select using (true);
drop policy if exists "hoards admin write" on hoards;
create policy "hoards admin write" on hoards for all using (is_admin()) with check (is_admin());

-- Migrera de 12 skatt-raderna ur coins -> hoards (bevaras; sedan bort ur coins).
insert into hoards (name, find_place, coordinates, dominant_metal, numismatic_phase, deposition_tpq, significance, description, sources)
select name, find_place, coordinates, metal,
  case when period_start < 300 then 'roman_denarii'
       when period_start between 300 and 650 then 'roman_byzantine_gold'
       when period_start between 700 and 1000 then 'islamic_silver'
       else 'medieval_swedish' end,
  period_end, significance, description, sources
from coins where category='hoard';

delete from coins where category='hoard';
