-- Konfigurerbar ledkatalog för centralorts-projekten. Vilka led som RÄKNAS som kult är
-- FORSKARENS beslut (Agneta = Ångermanland, Daniel = Öland), inte hårdkodat. include-flaggan
-- styr om ett led vägs in i anrikningstestet + skrivs som element_key. Ledparsern läser detta.
-- Default: starka/svaga led PÅ; kontroversiella (stav/gull/katt) AV ("alternativ att ta bort").

begin;

create table if not exists public.ortnamn_element_config (
  id uuid primary key default gen_random_uuid(),
  element_key text unique not null,
  label text,
  category text,                              -- sacral | power
  strength text,                              -- strong | weak | contested
  include boolean not null default true,      -- forskaren styr in-/exkludering
  forms text,                                 -- dokumenterade förled-former (parserns matchare)
  owner text,                                 -- vem som beslutar (Agneta/Daniel/gemensam)
  note text,
  updated_at timestamptz not null default now()
);

alter table public.ortnamn_element_config enable row level security;
drop policy if exists oec_read on public.ortnamn_element_config;
create policy oec_read on public.ortnamn_element_config for select using (true);
drop policy if exists oec_write on public.ortnamn_element_config;
create policy oec_write on public.ortnamn_element_config for all using (public.is_admin()) with check (public.is_admin());

insert into public.ortnamn_element_config (element_key, label, category, strength, include, forms, owner, note) values
  ('tor',  'Tor (vädergud)',        'sacral', 'strong',    true,  'tors- (genitiv): Torsåker, Torslunda', 'gemensam', 'Teofor genitiv = mainstream-stark (Vikstrand). Torsåker erkänd sakralnamnstyp.'),
  ('frö',  'Frö/Fröja',             'sacral', 'strong',    true,  'frös-, frö-, frey-: Fröland, Frök', 'gemensam', 'Genitiv-s starkast; naket Frö- svagare.'),
  ('sal',  'Sal/Sala (hall)',       'power',  'strong',    true,  'sal(a|o|e|u): Sal, Sala, Salom, Salum', 'gemensam', 'Hall/elitsäte diskuteras seriöst (Brink).'),
  ('ross', 'Ross (heliga hästen)',  'sacral', 'weak',      true,  'ross-, hross-, hors-: Rossvik, Horsta', 'gemensam', 'Ofta topografiskt/vardaglig häst — svagt hästkult-stöd.'),
  ('vang', 'Vang (heliga vagnen)',  'sacral', 'weak',      true,  'vang: Vangsta', 'gemensam', 'Svagt.'),
  ('hov',  'Hov (gudahus)',         'sacral', 'weak',      true,  'hov-: Hov, Hova', 'gemensam', 'Tvetydigt: kultbyggnad ELLER gård/höjd.'),
  ('härn', 'Härn (Fröja-binamn)',   'sacral', 'weak',      true,  'härn-: Härna', 'gemensam', 'Härnön-etymologin omtvistad.'),
  ('stav', 'Stav (völvans stav)',   'sacral', 'contested', false, 'stav-: OBS fångar Stavre (topografiskt) fel', 'gemensam', 'AV som default: "Stavre" är eget topografiskt namn, ej völvans stav.'),
  ('gull', 'Gull (fruktbarhet)',    'sacral', 'contested', false, 'gull-: Gullberg/Gullvik', 'gemensam', 'AV som default: oftast "gyllene/lysande höjd" (topografiskt).'),
  ('katt', 'Katt (Fröjas katter)',  'sacral', 'contested', false, 'katt-: Kattögelberget', 'gemensam', 'AV som default: topografiskt/djur; Fröjas katter = tunt 1200-tals-Snorri-motiv.')
on conflict (element_key) do nothing;

commit;

-- Kontroll: select element_key, category, strength, include from ortnamn_element_config order by strength, element_key;
