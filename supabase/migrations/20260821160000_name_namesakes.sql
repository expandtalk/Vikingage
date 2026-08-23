-- name_namesakes: bibliska/litterära/mytiska namngestalter kopplade till ett förnamn.
-- SEPARAT från "Kända bärare" (verkliga personer i persons). Varje post bär en tydlig
-- kind-etikett så fakta/fiktion aldrig blandas. name_slugs är en array så smeknamn kan
-- hänga på flera namn (Kit -> {Kit, Christopher}).
-- RÄTTIGHET: FAKTA om verk/gestalt är fritt; bild bara om PD/CC (image_url NULL annars).

create table if not exists public.name_namesakes (
  id            uuid primary key default gen_random_uuid(),
  name_slugs    text[]      not null,                 -- kanoniska namn posten visas under
  figure_name   text        not null,                 -- "Daniel i lejongropen"
  kind          text        not null check (kind in ('biblical','literary','mythological','legendary','historical')),
  summary_sv    text,
  summary_en    text,
  work_title    text,
  work_author   text,
  work_year     integer,
  source_ref    text,                                 -- bibelställe / verk / URL (belägg)
  image_url     text,                                 -- endast PD/CC, annars NULL
  image_license text,
  image_credit  text,
  sort_order    integer     not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists name_namesakes_slugs_idx on public.name_namesakes using gin (name_slugs);

alter table public.name_namesakes enable row level security;

drop policy if exists "name_namesakes public read" on public.name_namesakes;
create policy "name_namesakes public read" on public.name_namesakes
  for select using (true);

drop policy if exists "name_namesakes admin write" on public.name_namesakes;
create policy "name_namesakes admin write" on public.name_namesakes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Pilot-seed: 5 poster (Daniel, Jonatan, Kit) ----
insert into public.name_namesakes (name_slugs, figure_name, kind, summary_sv, work_title, work_author, work_year, source_ref, sort_order) values
(array['Daniel'], 'Daniel i lejongropen', 'biblical',
 'Judisk profet i Gamla testamentet. Enligt Daniels bok kap. 6 kastas han i en lejongrop för att ha bett till sin egen Gud, men skonas. Namnet är hebreiskt, Dāniyyēl, ”Gud är min domare”. Källkritiskt dateras Daniels bok oftast till omkring 165 f.Kr., varför Daniel bör ses som en skrift- och traditionsgestalt snarare än en säkert historisk person.',
 null, null, null, 'Daniels bok 6 (Gamla testamentet)', 10),

(array['Daniel'], 'Daniel Doppsko', 'literary',
 'Titelfigur i Lennart Hellsings barnbok Daniel Doppsko (1959), med bilder av Stig Lindberg. Daniel Doppsko bor i staden Sålunda, som till hälften ligger under vatten. En ”doppsko” är metallbeslaget på spetsen av en svärdsbalja, käpp eller paraply — samma slags beslag som vikingatida svärdsdoppskor (chapes).',
 'Daniel Doppsko', 'Lennart Hellsing', 1959, 'Hellsing, Lennart: Daniel Doppsko (Rabén & Sjögren, 1959), ill. Stig Lindberg', 20),

(array['Jonatan','Jonathan'], 'Jonatan (Sauls son)', 'biblical',
 'Kung Sauls förstfödde son och Davids nära vän i Gamla testamentet. Han stupar tillsammans med sin far i slaget vid berget Gilboa (1 Sam 31). Namnet är hebreiskt, Yəhōnātān, ”JHVH har givit”.',
 null, null, null, '1 Samuelsboken (särsk. kap. 31), Gamla testamentet', 10),

(array['Jonatan','Jonathan'], 'Jonatan Lejonhjärta', 'literary',
 'Äldste brodern i Astrid Lindgrens Bröderna Lejonhjärta (1973), illustrerad av Ilon Wikland. Efternamnet Lejonhjärta anspelar på kung Rikard Lejonhjärta. Jonatan dör när han räddar sin lillebror Skorpan ur en brand och återförenas med honom i sagolandet Nangijala.',
 'Bröderna Lejonhjärta', 'Astrid Lindgren', 1973, 'Lindgren, Astrid: Bröderna Lejonhjärta (Rabén & Sjögren, 1973)', 20),

(array['Kit','Christopher'], 'Kit Walker / Fantomen', 'literary',
 'Fantomens borgerliga namn i Lee Falks serie (dagstripp från 17 februari 1936, King Features Syndicate). ”Kit” är en kortform av Christopher. I seriens fiktion börjar Fantomensläkten redan 1536 — exakt 400 år före stripens verkliga premiär. I Sverige har Fantomen egna serier sedan 1960-talet (Egmont/Team Fantomen).',
 'The Phantom (Fantomen)', 'Lee Falk', 1936, 'Lee Falk, The Phantom, King Features Syndicate, dagstripp fr.o.m. 1936-02-17', 20);
