-- Kalmarsand-draget (Upplands-Bro/Håbo) — NY väg, korrekt placerad. OBS: skilj från Kalmar/Småland;
-- DB-stub 'kalmarsund-halvagar' (16.37/56.66) rör Kalmar och lämnas orörd. Koordinater verifierade
-- 2026-08-13: Lilla Ullfjärden (sv.wikipedia 59.59093/17.52919), Lillsjön (naturkartan 59.560268/
-- 17.552593). Exakt hålvägsgeometri = RAÄ Fornsök Håtuna 108. Källa: Börje Sandén / UKF (ukforsk.se).
-- Applicerad i prod via MCP; repo-spegel.
insert into public.viking_roads (id, name, name_en, road_type, slug, description, start_coordinates, end_coordinates)
select gen_random_uuid(),
  'Kalmarsand — Draget och hålvägarna', 'Kalmarsand — the Drag and the hollow ways', 'halvag', 'kalmarsand-draget',
  'Kalmarsand (Upplands-Bro/Håbo) — ett av Mälardalens främsta hålvägssystem samt ett båtdragställe (Draget) över näset mellan Mälarvikarna Lilla Ullfjärden i norr och Kalmarviken i söder, kring esker-sjön Lillsjön. Av riksintresse (bekräftat av Leif Gren, RAÄ, 1988); Draget listades som nr 1 av 133 "Märkliga äldre vägmiljöer" i Sveriges Nationalatlas 1994. Här drog man båtar över näset i mer än 1500 år (den nästan raka sjövägen Södertälje–Birka–Kalmarsand–Uppsala) sedan landhöjningen snörde av sundet före vår tideräkning; dragstället är belagt på Olaus Magnus Carta Marina 1539. Två hålvägssystem: det äldsta vid fornborgen vid Lilla Ullfjärden (hålvägar ca 50 m söder om fornborgsingången, Fornminne nr 108, Håtuna socken) och ett 1988 återfunnet system nordväst om Lillsjöns norra strand. Linjen är en grov korridor mellan belagda punkter — den exakta hålvägsgeometrin finns i RAÄ Fornsök (Håtuna 108). Källa: Börje Sandén / UKF (ukforsk.se/halvagar.htm).',
  point(17.52919,59.59093), point(17.552593,59.560268)
where not exists (select 1 from public.viking_roads where slug='kalmarsand-draget');

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.52919,59.59093), 1, 'Lilla Ullfjärden — fornborg + hålvägar (Fornminne 108)'),
  (point(17.552593,59.560268), 2, 'Lillsjön / Draget — näset (båtdragställe)')
) as p(coord, ord, nm)
where r.slug = 'kalmarsand-draget';
