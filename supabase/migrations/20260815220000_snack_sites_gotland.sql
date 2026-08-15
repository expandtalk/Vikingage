-- Gotlands snäck-platser (Olsson 1972) som källförda fynd — ledungsskepp-hamnar knutna till tingen.
-- KOORD-DISCIPLIN: Olsson anger socken + kartblad, INTE lat/lng. Vi placerar på SOCKEN-NIVÅ
-- (centroid, coord_status='socken-approx', tydligt märkt) — aldrig falsk precision. Exakt kustnära
-- läge kräver verifiering mot Olssons kartblad/Fornsök. Den vid Visby (Endre ting) saknar
-- socken-match → coord_status='obelagt' (ingen punkt). Parallell till thing_sites/beacon_sites.
create table if not exists public.snack_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  socken text,
  ting text,
  coast text,                       -- 'öst' / 'väst'
  geom geometry(Point,4326),
  coord_status text not null default 'obelagt',   -- 'belagt' / 'socken-approx' / 'obelagt'
  coord_source text,
  evidence text,
  interpretation text,
  source text not null,
  confidence text not null default 'hypotes',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (name, socken)
);
alter table public.snack_sites enable row level security;
drop policy if exists snack_sites_read on public.snack_sites;
create policy snack_sites_read on public.snack_sites for select using (true);

-- Ingest av de 13 (socken-centroid ur admin_boundaries; Gotland-filter mot Skåne-Tofta).
insert into public.snack_sites (name, socken, ting, coast, geom, coord_status, coord_source, evidence, interpretation, source, confidence)
select v.name, v.socken, v.ting, v.coast,
       a.centroid,
       case when a.centroid is not null then 'socken-approx' else 'obelagt' end,
       case when a.centroid is not null
            then 'Socken-centroid (Lantmäteri); exakt kustnära läge kräver verifiering mot Olsson 1972 kartblad/Fornsök'
            else 'Ingen socken-polygon-match (vid Visby); exakt läge kräver verifiering' end,
       v.evidence, v.interpretation,
       'Ingemar Olsson, "Snäck-namn på Gotland", Fornvännen 1972:180–208',
       'hypotes'
from (values
  ('Snäckhagen','Rute','Rute ting','öst', null::text, 'Snäck-plats vid Siiden/Sildviken; snäck-hamn ej styrkt av fosfatprov'),
  ('Snäckgärdet','Othem','Forsa ting','öst', null, 'Vid Bogeviken/Spillingsån (idag Knäppgärdet); nära rektangulär fornlämning'),
  ('Snäckskog','Boge','Bals ting','öst', 'Bogeviken — vikingatida strandbebyggelse (Per Lundström); Pilgårdsstenen', 'Skyddad vik; Strelow: "18 skibe" ur Bogewiig — hamn/handel'),
  ('Snäckänge','Norrlanda','Lina ting','öst', 'Gravfält intill; "Snakke gata" i sockengränsen', 'Skyddat läge vid Sandviken'),
  ('Snäckåker','Kräklingbo','Kräklinge ting','öst', 'Litet gravfält; "vastar" (stensträngar), möjlig husgrund', 'Vid Stora Hammars, klapperstensvall'),
  ('Snäckgärde','Lau','Garde ting','öst', 'Väg av kalksten; nära platå med möjlig fornborg/vårdkase', 'Vid Lausvik, Botvide'),
  ('Snäckhus','Burs','Burs ting','öst', 'STARKAST: vikingatida husgrund 30×8 m, 12 par stolphål, utgrävd av John Nihlén (Nihlén & Boéthius 1933); nitfynd, trol. båthus', 'Bandlundviken; "facit" för övriga snäck-platser'),
  ('Snäckhus','Vamlingbo','Hoburgs ting','väst', 'Snäckvik/Snäckhusård/Snäckhusvik; gravfält 30–40 gravar; sillfiskeläge (senare)', 'Skyddad vik, lätt att dra upp båtar'),
  ('Snäcku','Sanda','Banda ting','väst', 'Snäckåker/Snäckan; relaterat notvarp Snäcke i Klinte (Hejde ting)', 'Vid ås vid havet, skyddat av holmar/rev'),
  ('Snäckänge','Tofta','Stenkumla ting','väst', 'Vid Gnisvärd/åmynning; folktradition om vikingatidshamn + fynd av ekbord med tränaglar', 'Skydd innanför stenrevet Rive'),
  ('Snäckgärde','vid Visby (St. Hästnäs)','Endre ting','väst', 'Snäckviken; gravfält (vikingatid) vid Gustavsvik; vikingatida fynd vid Snäckgärdsbaden', 'Strelow/Schilder: "Sneckegärde hafver waret Skepsshamn"; ev. Visbys urhamn'),
  ('Snäckers','Hangvar','Forsa ting','väst', 'Gård vid Kappelshamnsviken; "Snäckebod" förra fiskeläget; namnet innehåller fem. snäcka', 'Väl skyddad landnings-/förvaringsplats för båtar'),
  ('Snäckhagen','Lärbro','Forsa ting','väst', 'Endast i äldre akter (1694–95); vid Storugns', 'Skyddat läge; nära Forsa tings gräns mot Rute ting')
) as v(name, socken, ting, coast, evidence, interpretation)
left join public.admin_boundaries a
  on a.level='socken' and a.name = v.socken
  and ST_Y(a.centroid) between 56.9 and 58.1 and ST_X(a.centroid) between 18.0 and 19.4
on conflict (name, socken) do update
  set ting=excluded.ting, coast=excluded.coast, geom=excluded.geom, coord_status=excluded.coord_status,
      coord_source=excluded.coord_source, evidence=excluded.evidence, interpretation=excluded.interpretation,
      source=excluded.source, updated_at=now();
