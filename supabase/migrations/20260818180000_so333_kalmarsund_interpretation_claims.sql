-- Sö 333 (Ärja ödekyrka, Åkers sn, Södermanland): registrera de KONKURRERANDE läsningarna av
-- runföljden "kalmarna · sutuma" i claim-liggaren, så metodikexemplet på /sv/vetenskapsmetodik
-- backas av verkliga poster (belägg ≠ tolkning; observation ≠ uttolkning).
--   1) ETABLERAD: udda skrivning för Kalmarsund (Brate & Wessén; bekräftad av Källström, RAÄ).
--   2) FÖRKASTAD: Peringskiölds rudbeckianska läsning "galileiska havet + Sodom" (1680-talet).
-- OBS källkritik: felet gäller Peringskiölds TOLKNING, inte hans observation — som runstenstecknare
-- var han en primärkälla för många nu försvunna stenar.
-- Sö 333 id = c8799b46-1ad8-477b-8989-43c787f9aa3d (verifierat mot runic_inscriptions).

insert into public.interpretation_claim
  (inscription_id, part_key, reading_translit, translation, scholar_name, year, source, status, confidence, note)
values
  ('c8799b46-1ad8-477b-8989-43c787f9aa3d', 'kalmarna_sutuma', 'kalmarna · sutuma',
   'ute i Kalmarsund',
   'Erik Brate & Elias Wessén (Södermanlands runinskrifter); bekräftad av Magnus Källström, RAÄ',
   null,
   'Södermanlands runinskrifter (Sö 333); Magnus Källström, RAÄ K-blogg 2020-03-24',
   'etablerad', 0.90,
   'Udda skrivning för Kalmarsund. Ristaren Eskils omkastade och utelämnade runor gör vissa '
   || 'namn-/ordformer instabila (Wessén) — därför 0.90, inte högre.'),
  ('c8799b46-1ad8-477b-8989-43c787f9aa3d', 'kalmarna_sutuma', 'kalmarna · sutuma',
   'namn på det galileiska havet och Sodom',
   'Johan Peringskiöld',
   null,
   'Peringskiöld (Monumenta, 1680-talets fältarbete); ref. Magnus Källström, RAÄ K-blogg 2020-03-24',
   'forkastad', 0.02,
   'Rudbeckiansk övertolkning — tänkt bevis för att forntida svenskar format bibelns historia. '
   || 'OBS: Peringskiöld var en förstklassig runstensTECKNARE vars avbildningar är primärkällor för '
   || 'försvunna stenar; felet gäller TOLKNINGEN, inte observationen.');
