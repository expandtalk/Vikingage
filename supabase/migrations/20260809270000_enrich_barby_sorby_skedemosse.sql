-- Berika Bårby borg + Sörby borg i swedish_hillforts (fanns tunt) med belagt RAÄ/projektmaterial;
-- koppla Skedemosse -> Sörby borg (Kvinnön); registrera källor. Freja-tillskrivningen påstås EJ.
update swedish_hillforts set
  parish='Mörbylånga', municipality='Mörbylånga', county='Kalmar', landscape='Öland',
  fortress_type='ring_fortress', period='Folkvandringstid (400–700-tal) + medeltida återbruk',
  period_start=400, period_end=700,
  dating_basis='Arkeologiska fynd + seminarieundersökning 2025 (Kris, konflikt och klimat 300–700)',
  dating_confidence='god',
  description='Halvcirkel-/hästskoformad fornborg (RAÄ Mörbylånga 17:1 / L1957:4873) på landborgskanten (~20–30 m stup), diameter ~150 m; enda öländska borgen på naturlig bergbrant. Fynd: bysantinskt guldmynt (Justinus 518–527, SHM 12723), guldsolidus, bronsdolk, flintmejsel, dräktspännen. Seminarieundersökning 2025: brända hus, förkolnade sädeskorn, djurben (gris/häst/fisk), benpilspets, silverringsfragment, Snartemobägar-glas. Intill: gravfält + Galgerör (galgbacke in på 1800-talet).',
  cultural_significance='Öländsk folkvandringstida borg (samtida med Eketorp/Gråborg); undersökt 2025.',
  source_reference='RAÄ Fornsök L1957:4873; Linnéuniversitetet 2025', updated_at=now()
where name ilike 'Bårby borg';

update swedish_hillforts set
  parish='Gärdslösa', municipality='Borgholm', county='Kalmar', landscape='Öland', period='Järnålder',
  description='Ölands STÖRSTA fornborg, på Kvinnön (ö i sjön innan Skedemosse dikades ut ~400 år sedan). Omnämnd 1703 av Nicholaus Vallinus ("Om Öland"), återupptäckt 2021 av Jan-Henrik Fallgren. Intill Skedemosse offerplats. Freja-tillskrivning framförd (film) men EJ belagd i skriftliga källor.',
  cultural_significance='Ölands största fornborg; rumsligt kopplad till Skedemosse.',
  source_reference='Fallgren 2023 (Öländska horisonter, ISBN 978-91-519-9962-3); SVT/Kalmar läns museum 2021', updated_at=now()
where name ilike 'Sörby borg';

update heritage_sites set
  description='En av Sveriges största järnåldersoffer­platser. BELAGT: häst-/vapen-/människooffer + 7 guldringar (~1,3 kg); förromersk järnålder–sen vikingatid. På Kvinnön ligger Sörby borg (Ölands största fornborg, återupptäckt 2021, Fallgren). Museum: skedemossemuseum.se. Freja-tillskrivning ej belagd i skriftliga källor.',
  updated_at=now()
where name='Skedemosse (offerplats)';

insert into historical_sources (title, title_en, author, written_year, language, reliability, work_type, collection, description, source_key)
values
('Nyfunnen–återfunnen fornborg på Kvinnö i Bredsättra socken','A rediscovered hillfort on Kvinnö','Jan-Henrik Fallgren',2023,'sv','secondary','artikel','Öländska horisonter (Ölands hembygdsförbund), ISBN 978-91-519-9962-3','Återupptäckten (2021) av Sörby borg, Ölands största fornborg, på Kvinnön i Skedemosse.','fallgren-2023-sorby-borg'),
('Om Öland (dissertation)','On Öland (dissertation)','Nicholaus Vallinus',1703,'la','secondary','avhandling','Akademisk avhandling','Äldsta skriftliga omnämnandet av Sörby borg (1703).','vallinus-1703-om-oland')
on conflict do nothing;
