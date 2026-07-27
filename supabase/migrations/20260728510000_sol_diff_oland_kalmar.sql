-- Öland/Kalmar-diff mot Svenskt ortnamnslexikon 2003 (läst direkt). Forskarens läsning STÄLLS BREDVID
-- SOL:s — diffen flaggas, men SOL skriver aldrig över (Daniel äger Öland/Kalmar-materialet; SOL är
-- referens, inte dom). En diff = påminnelse att granska, inte ett fel. owner = Daniel (Öland/Kalmar).
begin;
create table if not exists public.ortnamn_sol_comparison (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  landscape text,
  our_reading text,       -- forskarens/plattformens läsning
  our_source text,
  sol_reading text,       -- SOL 2003:s behandling (i egen form)
  sol_entry text,         -- SOL-uppslag/referens
  diff text,              -- 'ja' | 'nej' | 'SOL saknar uppslag'
  owner text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.ortnamn_sol_comparison enable row level security;
drop policy if exists osc_read on public.ortnamn_sol_comparison;
create policy osc_read on public.ortnamn_sol_comparison for select using (true);
drop policy if exists osc_write on public.ortnamn_sol_comparison;
create policy osc_write on public.ortnamn_sol_comparison for all using (public.is_admin()) with check (public.is_admin());

insert into public.ortnamn_sol_comparison (name, landscape, our_reading, our_source, sol_reading, sol_entry, diff, owner, note)
select v.* from (values
  ('Gårdby','Öland','Förleden ofta läst som gård (gård + by).','folketymologisk/naiv läsning',
     'Förleden är dialektordet gorr ''gyttja, dy'', efterleden by ''gård; by''.','Gårdby sn, Möckleby hd','ja','Daniel (Öland/Kalmar)',
     'Klassisk folketymologi-fälla: gorr (dy) ≠ gård. Värt att korrigera i materialet.'),
  ('Kalmar','Småland (Möre)','Ingen egen etymologi lagrad; folketymologin ''kall mar'' förekommer.','—',
     'Förleden dialektordet kalm ''stenröse, stenanhopning'' (SÖ Sverige); efterleden mar/marn ''grund vik / grusrevel'' (jfr armn-elementet, stadsnamnet Kalmar).','Kalmar; armn-artikeln; Hellberg, Forn-Kalmar (KSH 1)','ja','Daniel (Öland/Kalmar)',
     'SOL/Hellberg: stenig grusrevel/grund vik — inte ''kall mar''. Referens: Hellberg, Forn-Kalmar, i Kalmar stads historia 1.'),
  ('Kättilen','Småland (Kalmar hamn)','kättil ''skål/kittel'' (< ty. kattila < lat. catillus), syftar på hamnbassängens form.','Kalmar Lexikon (Daniel)',
     'SOL har inget uppslag för Kättilen. SOL:s Kättil-ortnamn (Kättilstad, Kättilsmåla) innehåller mansnamnet Ketil.','(saknas; jfr Kättilstad/Kättilsmåla)','SOL saknar uppslag','Daniel (Öland/Kalmar)',
     'Kättilen = bestämd form av hamnnamnet, skild från personnamnet Kättil. ''Skål''-läsningen står — SOL vare sig stöder eller motsäger den.'),
  ('Färjestaden','Öland','Färjeställe vid Kalmarsund (färjeläget).','plattformen',
     'fsv. færiostadher ''färjeställe'', gammal landningsplats för transporter över Kalmarsund (Færiostadha 1389).','Färjestaden, Torslunda sn','nej','Daniel (Öland/Kalmar)',
     'Samstämmigt.'),
  ('Köpingsvik','Öland','Köping-hub / handelsplats (öns dominerande runstensnod).','plattformen',
     'Köpings sn; förleden köping ''handelsplats'', vik(en) vid Kalmarsund.','Köpingsvik, Köpings sn','nej','Daniel (Öland/Kalmar)',
     'köping bekräftat.'),
  ('Borgholm','Öland','Borg (befästning/klippan) + holm.','plattformen',
     'Gammalt sockennamn Borg (äldre befästning / kalkstensklippan där slottsruinen ligger) + holm.','Borgholm kn, stad','nej','Daniel (Öland/Kalmar)',
     'Samstämmigt.'),
  ('Öland','Öland','Ö-landet.','plattformen',
     'ö ''ö'' + land (Olandia 1268).','Öland ö, landskap','nej','Daniel (Öland/Kalmar)',
     'Samstämmigt.'),
  ('Torslunda','Öland','Teofort Tor-namn (Tor + lund), kult-led.','ortnamn_element_config (tor)',
     'Tors + lunda (Tor + lund).','Torslunda sn, Algutsrums hd','nej','Daniel (Öland/Kalmar)',
     'Teofort Tor bekräftat av SOL.')
) as v(name, landscape, our_reading, our_source, sol_reading, sol_entry, diff, owner, note)
where not exists (select 1 from public.ortnamn_sol_comparison o where o.name = v.name and o.owner = v.owner);
commit;
