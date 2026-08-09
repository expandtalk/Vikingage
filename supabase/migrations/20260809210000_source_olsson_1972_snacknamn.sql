-- Attribution för snäck/ledung-testet: registrera Ingemar Olsson, "Snäck-namn på Gotland"
-- (Fornvännen 1972:180-208, RAÄ öppen). Källkritisk grund för snäck-ledet i ortnamnskatalogen.
insert into historical_sources
  (title, title_en, author, written_year, language, reliability, work_type, collection, description, url, repository, repository_ref, peer_reviewed, source_key)
values
('Snäck-namn på Gotland', 'Snäck place-names on Gotland', 'Ingemar Olsson', 1972, 'sv', 'secondary', 'artikel', 'Fornvännen 1972 (3-4), s. 180-208',
 'Onomastisk studie av gotländska snäck-namn (snäcka = ledungs-/krigsskepp). Snäck-platsernas läge (skyddade vikar innanför uddar/rev, ofta vid en å, gravfält intill); 10-12 namn markerar landnings-/förvaringsplatser för ledungsskepp. Nyckelfynd: snäck-namnen fördelar sig på de gamla gotländska tingen. Facit: Snäckhus i Burs (vikingatida huslämning 30x8 m).',
 'http://kulturarvsdata.se/raa/fornvannen/html/1972_180', 'RAÄ / Fornvännen (samla.raa.se, DiVA)', 'urn:nbn:se:raa:diva-886', true, 'olsson-1972-snacknamn-gotland')
on conflict do nothing;
