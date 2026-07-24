-- Vita sten, Brännkyrka 230:1 — LOKALT gränsmärke i södra Stockholm (Sockenvägen).
-- OBS: EJ samma som Landamäris riksgränssten "Vite sten" (Skåne/Småland/Halland-gränsen).
-- Koordinat verifierad (Wikipedia: 59°16′46.46″N 18°06′58.21″Ö). Unik info per sten.
insert into heritage_sites (raa_type, name, landscape, municipality, lat, lng, description, source_uri)
values (
  $q$gränsmärke$q$,
  $q$Vita sten (Brännkyrka 230:1)$q$,
  $q$Södermanland$q$,
  $q$Stockholm$q$,
  59.279572, 18.116169,
  $q$Äldre gränsmärke i södra Stockholm, vid Sockenvägens södra sida (ung. mellan hus 555–565). Markerade punkten där gårdarna Enskede, Hammarby och Skarpnäck möttes. Ca 2 m högt, upptill avsmalnande flyttblock (istid) med inslaget järnrör i toppen; tillsammans med moränhöjden "Gränsberget" mittemot en naturlig gränsmarkering. På karta 1729 "Stora Stenen i Kiärr Laggen"; vid uppmätning av Hammarby ägor 1792–93 "Hwita sten" (då redan vitmålad). Restaurerad/vitmålad 2012 (Skarpnäcks Trädgårdsstadsförening). RAÄ Brännkyrka 230:1, skyddad enligt KML 2 kap. EJ Landamäris riksgränssten Vite sten.$q$,
  $q$https://sv.wikipedia.org/wiki/Vita_sten$q$
)
on conflict (source_uri) do nothing;
