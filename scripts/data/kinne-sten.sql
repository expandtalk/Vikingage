-- Kinne sten (Landamäris 3:e gränsmärke, Sverige–Danmark ~1050) — kandidat.
-- FMIS L1971:562 / RAÄ Kinnared 9:1 (+ Södra Hestra 286). Koordinat SWEREF 99 TM
-- (N 6323134, E 385824) → WGS84 via PostGIS ST_Transform (exakt, ej gissad).
insert into heritage_sites (raa_type, name, landscape, municipality, lat, lng, description, source_uri)
select
  $q$gränsmärke$q$,
  $q$Kinne sten (Kinnared 9:1 / L1971:562)$q$,
  $q$Småland$q$,
  $q$Gislaved$q$,
  ST_Y(p), ST_X(p),
  $q$Frostsprängt block på avsats i SÖ-sluttning av moränhöjd, nära Smålandsgränsen, Södra Hestra socken. Utpekat som Kinne sten — ett av Landamäris sex gränsmärken mellan Sverige och Danmark (ca 1050). Tradition: "Kinnesten", enda stora stenen vid Halland/Småland-gränsen i Kinnared (sagesman Josua Andersson; Svennung, Fornvännen 1966). RAÄ Kinnared 9:1 / Södra Hestra 286 / L1971:562. Lägesosäkerhet ~30 m. KANDIDAT, ej entydigt fastställd.$q$,
  $q$https://kulturarvsdata.se/raa/lamning/L1971:562$q$
from (select ST_Transform(ST_SetSRID(ST_MakePoint(385824, 6323134), 3006), 4326) as p) t
on conflict (source_uri) do nothing;
