-- Fler strandkontrollpunkter (Daniel 2026-07-23): Birka/Björkö (hög Mälar-isobas, välstuderad
-- ~5 m högre vattennivå — kontroll högt på gradienten), Fröjel/Ridanäs (Gotlands-isobasen),
-- Eketorp (KRONOLOGISKT ankare, ligger högt på alvaret ~15 m → EJ RSL-punkt). rsl-värden är
-- FLAGGADE expertuppskattningar (confidence+källa), ej mätdata; z_min_rh2000 = TBD LiDAR.
INSERT INTO strandkontroll
 (namn,kontrolltyp,region,lon_wgs84,lat_wgs84,date_from,date_to,landhojn_mmyr,
  feature,z_min_rh2000,rsl_obs_min,rsl_obs_max,z_is_rsl,confidence,source,note) VALUES
 ('Birka/Björkö','arkeologisk','Mälaren',17.5420,59.3360,750,970,4.7,
  'hamn/svarta jorden/bryggor',NULL,4.5,5.5,false,'medel-hög','Ambrosiani; Risberg',
  'PROVISORISK. Klassiskt ~5 m högre vattennivå vid vikingatid — hamnlägen/bryggor förutsätter det. Hög Mälar-isobas = kontroll högt på gradienten (~950).'),
 ('Fröjel/Ridanäs','arkeologisk','Gotland V',18.1560,57.3450,600,1150,1.5,
  'hamn/handelsplats vid strand',NULL,1.5,2.5,false,'låg-medel','Carlsson',
  'PROVISORISK. Vendel-vikingatida hamn vars funktion förutsätter dåtidens strandlinje. Ger Gotlands-isobasen.'),
 ('Eketorp','arkeologisk','Öland SÖ',16.4900,56.2900,300,1300,1.0,
  'ringborg pa alvaret (~15 m ö.h.)',NULL,NULL,NULL,false,'hög','Borg; Näsman',
  'KRONOLOGISKT ANKARE, EJ RSL-punkt: ligger högt på alvaret (~15 m). Tre faser daterar OCKUPATION, inte havsnivå.')
ON CONFLICT (namn) DO UPDATE
  SET landhojn_mmyr=EXCLUDED.landhojn_mmyr, rsl_obs_min=EXCLUDED.rsl_obs_min,
      rsl_obs_max=EXCLUDED.rsl_obs_max, note=EXCLUDED.note, source=EXCLUDED.source;

UPDATE strandkontroll
SET geom = ST_Transform(ST_SetSRID(ST_MakePoint(lon_wgs84,lat_wgs84),4326),3006)
WHERE geom IS NULL AND lon_wgs84 IS NOT NULL;
