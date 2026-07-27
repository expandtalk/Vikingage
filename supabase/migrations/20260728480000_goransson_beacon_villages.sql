-- Göranssons vårdkasplatser identifierade via namngivna fiskebyar (Daniels avläsning av kartan,
-- Kalmar Stads Historia 1 s. 141). Daniels tolkning: vårdkasplatserna = de gamla fiskebyarna/
-- fiskehamnarna (och vägarna), belägna en bit UPP från kusten, inte vid vattnet. Koordinater =
-- byns/ortens centroid ur place_names (verifierat) — vårdkasen låg nära men en bit inåt/på höjd.
-- Uteslutna: Hornsudden + Eckelsudde (saknas i gazetteern), Bjärby (två på Öland — tvetydig).
begin;
insert into public.beacon_sites (name, landscape, municipality, parish, lat, lng, source_uri)
select v.namn, 'Öland', v.kommun, v.socken, v.lat, v.lng, 'Sölve Göransson 1978, Kalmar Stads Historia 1, s. 141'
from (values
  ('Vårdkasplats vid Össby (SÖ Öland)',      'Mörbylånga', 'Gräsgård',   56.2792, 16.4946),
  ('Vårdkasplats vid Gammalsby (sjömarker)', 'Mörbylånga', 'Gräsgård',   56.3220, 16.5186),
  ('Vårdkasplats vid Segerstad',             'Mörbylånga', 'Segerstad',  56.3629, 16.5370),
  ('Vårdkasplats vid Holmeboda (N Öland)',   'Borgholm',   'Böda',       57.3628, 17.0673),
  ('Vårdkasplats vid Byxelkrok (N Öland)',   'Borgholm',   'Böda',       57.3267, 17.0153),
  ('Vårdkasplats vid Borgholm',              'Borgholm',   'Borgholm',   56.8795, 16.6560),
  ('Vårdkasplats vid Färjestaden',           'Mörbylånga', 'Torslunda',  56.6517, 16.4722)
) as v(namn, kommun, socken, lat, lng)
where not exists (select 1 from public.beacon_sites b where b.name = v.namn);

update public.ortnamn_element_config
  set note = note || ' Daniels tolkning: vårdkasplatserna sammanfaller med de gamla fiskebyarna/fiskehamnarna (och vägnätet), belägna en bit upp från kusten. Namngivna belägg hittills: Össby, Gammalsby, Segerstad, Gräsgård (öst-Öland); Holmeboda, Byxelkrok, Borgholm, Färjestaden (N/V Öland). Ej koordinatsatta än: Hornsudden, Eckelsudde (övrig), Bjärby (tvetydig).'
  where element_key = 'böte';
commit;
