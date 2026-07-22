-- Skålgropssten RAÄ Brännkyrka 222:1 (Årsta partihallar, Östberga) → heritage_sites.
-- Applicerad via MCP execute_sql; fil = proveniens. Koordinat direkt ur Fornsök i WGS84
-- (59.29217 N, 18.03093 Ö) — ingen konvertering. Del av Årsta/Valla-komplexet.
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
select 'hällristning (skålgropssten)', 'Skålgropssten RAÄ Brännkyrka 222:1', 'Södermanland', 'Stockholm', 'Brännkyrka',
  59.29217, 18.03093, 'bronsålder',
  'Hällristning, skålgropssten (älvkvarn) vid Årsta partihallar, Östberga. Skålgropar tolkas som offer-/blotstenar (bronsålder). Ligger i samma område som Årstafältets utgrävda gravfält.',
  'Fornsök RAÄ Brännkyrka 222:1'
where not exists (select 1 from public.heritage_sites where source_uri like '%Brännkyrka 222:1%');
