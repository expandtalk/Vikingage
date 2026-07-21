-- Årsta: gravfält RAÄ Brännkyrka 77:1 + Göta landsväg RAÄ Stockholm 227 → heritage_sites.
-- Applicerad via MCP execute_sql; fil = proveniens. Koordinater ur förundersöknings-
-- rapporten (Sweref 99 TM) konverterade via PostGIS ST_Transform(3006→4326):
--   Brännkyrka 77:1: E 673750 N 6576850 → 59.29473, 18.05105
--   Stockholm 227:   E 674050 N 6576750 → 59.29371, 18.05622
-- Källa: Vinberg, A., Larsson, E. & Jensen, R. 2012. Förundersökning i avgränsande syfte
-- vid gravfältet RAÄ 77:1 (Brännkyrka sn) och färdvägen RAÄ 227 (Stockholms sn), Göta
-- landsväg. Stiftelsen Kulturmiljövård, KM projekt 12017, Lst dnr 431-10-8585.
-- OBS: det 1950-tal-utgrävda gravfältet på SÖDRA Årstafältet (ryttar-/svärdsgraven
-- SSM 39055:7, 900–950) är ett ANNAT läge, borttaget för partihallarna — exakt position
-- ej bevarad, därför ej infört som kartpunkt här (hitta inte på).
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
select 'gravfält', 'Gravfält RAÄ Brännkyrka 77:1 (Valla/Nedre Valla)', 'Södermanland', 'Stockholm', 'Brännkyrka',
  ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint(673750,6576850),3006),4326)),
  ST_X(ST_Transform(ST_SetSRID(ST_MakePoint(673750,6576850),3006),4326)),
  'järnålder (yngre)',
  'Gravfält strax nordost om Valla torg; ca 35 registrerade gravar (+ ca 10 i intilliggande RAÄ 77:2). Bytomten Valla/Nedre Valla ca 150 m SÖ. Förundersökning 2012 avgränsade fältet åt öster. Källa: Vinberg, Larsson & Jensen 2012, Stiftelsen Kulturmiljövård (KM 12017), Lst dnr 431-10-8585.',
  'Fornsök RAÄ Brännkyrka 77:1; Vinberg m.fl. 2012 (KM 12017)'
where not exists (select 1 from public.heritage_sites where source_uri like '%Brännkyrka 77:1%');

insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
select 'färdväg', 'Göta landsväg RAÄ Stockholm 227', 'Södermanland', 'Stockholm', 'Stockholm',
  ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint(674050,6576750),3006),4326)),
  ST_X(ST_Transform(ST_SetSRID(ST_MakePoint(674050,6576750),3006),4326)),
  'medeltid–nyare tid (Göta landsväg)',
  'Del av Göta landsväg, gamla riksvägen från Stockholm söderut, ca 300 m SÖ om gravfältet RAÄ 77:1. Vägbana (grus/småsten) belagd i schakt över minst 34 m, i linje med ekonomiska kartan (1951) och häradskartan (1901–06). Övrig Göta landsväg på Årstafältet: RAÄ 34:1. Källa: Vinberg, Larsson & Jensen 2012, Stiftelsen Kulturmiljövård (KM 12017).',
  'Fornsök RAÄ Stockholm 227; Vinberg m.fl. 2012 (KM 12017)'
where not exists (select 1 from public.heritage_sites where source_uri like '%Stockholm 227%');
