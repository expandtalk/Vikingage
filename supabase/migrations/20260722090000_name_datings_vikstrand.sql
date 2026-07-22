-- Källförda åldersbedömningar av bebyggelsenamn (Vikstrand 2013, Järnålderns
-- bebyggelsenamn, Isof Serie B:13, ISBN 978-91-86959-07-4). Applicerad via MCP
-- execute_sql; fil = proveniens. VIKTIGT: dateringen är fyndplatsens (boplats/
-- gravfält) och en HYPOTES om namnets ålder — ej objektiv mätpunkt (Vikstrand s.96).
-- uncertainty='hög' där Vikstrand satt frågetecken. Endast FAKTA extraherade (namn/
-- socken/period/sida), ej hans text. Koordinater sätts separat via entydig OSM-match
-- (source-spårbart), aldrig genererade.
create table if not exists public.name_datings (
  id uuid primary key default gen_random_uuid(),
  name text not null, socken text, landscape text, name_type text,
  dating_text text, dating_basis text, uncertainty text, page integer,
  source text not null default 'Vikstrand 2013, Järnålderns bebyggelsenamn (Isof, Serie B:13)',
  note text, place_name_id uuid references public.place_names(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.name_datings enable row level security;
drop policy if exists nd_read on public.name_datings;
create policy nd_read on public.name_datings for select using (true);
drop policy if exists nd_write on public.name_datings;
create policy nd_write on public.name_datings for all using (public.is_admin()) with check (public.is_admin());

insert into public.name_datings (name, socken, landscape, name_type, dating_text, dating_basis, uncertainty, page, note) values
('Gredelby','Knivsta','Uppland','by','romersk järnålder','boplats','normal',104,null),
('Hagby','Täby','Uppland','by','tidig vikingatid','boplats','normal',106,null),
('Hässelby','Fors','Södermanland','by','omkr. 400 e.Kr.','boplats','normal',109,null),
('Mälby','Tillinge','Uppland','by','romersk järnålder','boplats','normal',110,null),
('Säby','Barva','Södermanland','by','senast romersk järnålder','boplats','normal',111,null),
('Säby','Norrsunda','Uppland','by','romersk järnålder','boplats','normal',114,null),
('Säby','Vintrosa','Närke','by','senast folkvandringstid?','boplats','hög',117,'Vikstrands frågetecken'),
('Tunby','S:t Ilians','Västmanland','by','förromersk järnålder?','boplats','hög',119,'Vikstrands frågetecken'),
('Täby','Vänge','Uppland','by','förromersk järnålder','boplats','normal',121,null),
('Vallby','Tierp','Uppland','by','folkvandringstid','boplats','normal',121,null),
('Åby','Axberg','Närke','by','vikingatid','boplats','normal',127,null),
('Skärna','Gamla Uppsala','Uppland','hem','förromersk järnålder?',null,'hög',140,'Vikstrands frågetecken'),
('Ärja','Åkers','Södermanland','hem','järnåldern',null,'normal',147,null),
('Forsuma','Torpa','Södermanland','hem','äldre järnålder',null,'normal',129,null),
('Gränome','Stavby','Uppland','hem','äldre järnålder/bronsålder',null,'normal',129,'fornlämningsmiljö av bronsålderskaraktär'),
('Mariad (nu Marieberg)','Grödinge','Södermanland','hem','äldre järnålder',null,'normal',132,'rekonstruerad form *Mariad'),
('Markim','Markims','Uppland','hem','äldre järnålder',null,'normal',134,null),
('Marma','Lagga','Uppland','hem','yngre järnålder',null,'normal',136,'höjdläge utesluter hög ålder (ej äldre än ~500 e.Kr.)'),
('Marum','Ljusterö','Uppland','hem','yngre järnålder',null,'normal',137,null),
('Salem','Salems','Södermanland','hem','bronsålder',null,'normal',139,'starkast fall för namnkontinuitet från bronsålder'),
('Tadem','Skånela','Uppland','hem','förromersk järnålder',null,'normal',143,null),
('Viad','Grödinge','Södermanland','hem','äldre järnålder',null,'normal',144,'rekonstruerad form *Vihem'),
('Våxome','Alunda','Uppland','hem','äldre järnålder',null,'normal',146,'landhöjning gör bronsålder osannolik (s.42)'),
('Arninge','Täby','Uppland','-inge','förromersk järnålder','boplats','normal',149,null),
('Brillinge','Vaksala','Uppland','-inge','(senast) äldre romersk järnålder','boplats','normal',152,null),
('Ledinge','Skederids','Uppland','-inge','omkring Kristi födelse','boplats','normal',155,'Vikstrand bedömer dateringen som stark'),
('Kymlinge','Spånga','Uppland','-inge','folkvandringstid (o. 400 e.Kr.)','gravfält','normal',154,null),
('Ärvinge','Spånga','Uppland','-inge','tidig romersk järnålder','gravfält','normal',158,null),
('Görla','Frötuna','Uppland','plural','yngre romersk järnålder','boplats','normal',160,null),
('Kalvshälla','Järfälla','Uppland','plural','yngre bronsålder','boplats','normal',162,'snarast boplatsnamn (ej bebyggelsenamn), *Halla'),
('Kumla','Botkyrka','Södermanland','plural','vikingatid','boplats','normal',164,null),
('Kumla','Härads','Södermanland','plural','vendeltid','boplats','normal',166,null),
('Lida (och Tuna)','Åkers','Södermanland','plural','folkvandringstid?','boplats','hög',168,'datering avser Lida'),
('Lunda','Strängnäs lfs','Södermanland','plural','romersk järnålder (omkr. 200 e.Kr.)','boplats','normal',173,null),
('Odenslunda','Fresta','Uppland','plural','senast folkvandringstid','boplats','normal',175,'teofort: Oden + lund(a)'),
('Rickomberga','Bondkyrko','Uppland','plural','senast äldre romersk järnålder','boplats','normal',176,null),
('Sanda','Fresta','Uppland','plural','senast 400-talet','boplats','normal',179,null),
('Tuna','Alsike','Uppland','plural','omkr. 500 e.Kr.','boplats','normal',181,null),
('Tuna','Vendels','Uppland','plural','400-talet','boplats','normal',184,'rekonstruerad form *Tuna'),
('Valla','Täby','Uppland','plural','förromersk järnålder','boplats','normal',187,null),
('Via','Vintrosa','Närke','plural','förromersk järnålder','boplats','normal',188,null),
('Lunda','Lovö','Uppland','plural','senast yngre romersk järnålder (omkr. 400 e.Kr.)','gravfält','normal',171,null),
('Tuna','Badelunda','Västmanland','plural','yngre romersk järnålder (200-talet)','gravfält','normal',183,null),
('Barksta','Malma','Västmanland','stad','senast romersk järnålder?','boplats','hög',191,'tab. anger sn Kolsva; TOC anger Malma sn'),
('Brista','Norrsunda','Uppland','stad','äldre romersk järnålder','boplats','normal',193,null),
('Herresta','Järfälla','Uppland','stad','omkr. år 800 eller vendeltid','boplats','normal',196,'kan vara äldre'),
('Hjulsta','Spånga','Uppland','stad','vendeltid (500-talets senare del)','boplats','normal',198,null),
('Högsta','Övergrans','Uppland','stad','äldre romersk järnålder?','boplats','hög',199,'Vikstrands frågetecken'),
('Kyrsta','Ärentuna','Uppland','stad','bronsålder eller romersk järnålder?','boplats','hög',202,'extremfall — namnets ålder starkt osäker'),
('Kättsta','Ärentuna','Uppland','stad','äldre romersk järnålder?','boplats','hög',204,'Vikstrands frågetecken'),
('Pollista','Övergrans','Uppland','stad','senast 700-talets andra hälft','boplats','normal',206,'äldre boplatsläge strax S om bytomten'),
('Skämsta','Tierps','Uppland','stad','romersk järnålder?','boplats','hög',209,'Vikstrands frågetecken'),
('Valsta','Norrsunda','Uppland','stad','senast omkr. 800','boplats','normal',210,'namnetablering under romersk järnålder fullt möjlig')
on conflict do nothing;

-- Koordinatsättning görs INTE i SQL. En naiv "en OSM-träff = entydig" match är
-- osäker: den enda OSM-noden med ett namn kan ligga i fel landskap (t.ex. enda
-- "Odenslunda" i OSM låg i Västergötland, inte i Fresta/Uppland som Vikstrand avser).
-- Istället körs scripts/data/disambiguate-name-datings.mjs som för VARJE namn kräver
-- ett socken-anker (medelläge av fornlämningar per socken + riktad Wikidata på
-- "X socken") och bara sätter place_name_id om närmaste OSM-bebyggelsepunkt med rätt
-- namn ligger <20 km från ankaret. Övriga lämnas null (hitta inte på). 2026-07-22:
-- 18/53 koordinatsatta; resterande saknar OSM-punkt eller socken-anker.
