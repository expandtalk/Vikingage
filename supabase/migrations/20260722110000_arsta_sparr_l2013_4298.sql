-- Spärranordning Årstaviken (RAÄ Stockholm 660 / Fornsök L2013:4298) → heritage_sites.
-- Applicerad via MCP execute_sql; fil = proveniens. Koordinat ur Fornsök i SWEREF 99 TM
-- (N 6578181, E 673571) konverterad via PostGIS ST_Transform(3006→4326) = 59.306738,
-- 18.048976. Lägesosäkerhet 45 m (manuell inprickning på sjökort). Datering 900–1200,
-- ej dendrokronologiskt bestämd. geom är genererad kolumn — sätts ej explicit.
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
select 'spärranordning', 'Spärranordning, Årstaviken (Årstaholmar)', 'Södermanland', 'Stockholm', 'Stockholm',
  59.306738, 18.048976,
  'vikingatid–tidig medeltid (900–1200, ej dendrokronologiskt bestämt)',
  'Möjlig fornlämning: tät pålrad/stockspärr, SO om Årstavikens östra vik vid Årstaholmarna; kontrollerade passagen mellan holmarna. Lägesosäkerhet 45 m (manuell inprickning, sjökort 1:25 000). Litt.: Arkeologiska utredningar. Årstabron. Tredje spåret. Riksantikvarieämbetet 1995. Arkiv: Svenskt marinarkeologiskt arkiv (SMA); SjöMIS 6141:025 (Statens maritima museer).',
  'Fornsök L2013:4298 (RAÄ Stockholm 660), publ. Riksantikvarieämbetet 2018-08-27'
where not exists (select 1 from public.heritage_sites where source_uri like '%L2013:4298%');

-- Spärren lades även i kart-lagret src/hooks/map/useStakeBarrierMarkers.ts (STAKE_BARRIERS
-- är fortf. hårdkodad; bör göras DB-driven mot heritage_sites raa_type='spärranordning').
