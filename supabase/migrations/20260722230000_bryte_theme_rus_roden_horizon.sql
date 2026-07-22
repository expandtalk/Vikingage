-- Korrigerad djuptidsförankring för bryte/förvaltnings-temat.
-- Daniel 2026-07-22: roþ-konceptet är äldre än U 11 (~1065). Rus-etymologin (fornnord.
-- *rōþs- rodd → finskans Ruotsi → roddardistrikten Roden/Roslagen) tar "roþ"-folket bakåt
-- till ~839 (Rhos-sändebuden i Annales Bertiniani, en SAMTIDA frankisk källa) — 226 år
-- före U 11, och oberoende av den halvlegendariske Rurik (Nestorskrönikan ~1113).
-- Detta är en starkare förankring än den obelagda folkvandringstida linjen; ersätter den
-- som djuptidsankare. Etymologin är dominerande men politiskt laddad (normaniststriden).

UPDATE themes SET description = description ||
  ' Djuptidsförankring (korr.): roþ-konceptet är äldre än U 11. Rus-etymologin (fornnord. *rōþs-, rodd → finskans Ruotsi → roddardistrikten Roden/Roslagen) tar "roþ"-folket bakåt till ~839 (Rhos-sändebuden i Annales Bertiniani, samtida frankisk källa) — 226 år före U 11. Källkritiskt lager: Roden-KONCEPTET belagt ~839 (starkast, extern samtida källa + Ruotsi); personen Rurik svagast (Nestorskrönikan ~1113, halvlegendarisk, Rörik-av-Dorestad = hypotes); roþ som formaliserat skattedistrikt U 11 (~1065) + 1200-talslagarna. Etymologin dominerande men politiskt laddad (normaniststriden). Detta ersätter den obelagda folkvandringstida linjen som djuptidsankare.'
WHERE slug='bryte-forvaltningsorganisation' AND description NOT LIKE '%Djuptidsförankring (korr.)%';
