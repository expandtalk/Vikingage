-- Brorshall (FMIS "Brorshall, Gränsmärke", Virestad sn, Älmhult, Småland) — VERIFIERAD lämning.
-- Koord ur FMIS (56.4940, 14.3181). Daniels HYPOTES: detta är Landamäris 6:e sten "Brömse sten",
-- på Skånes/Smålands gräns (ej Blekinge–Möre). EJ Brömsebro-fredsstenen (flyttad 1933 till Grönadal).
insert into heritage_sites (raa_type, name, landscape, municipality, lat, lng, description, source_uri)
values (
  $q$gränsmärke$q$,
  $q$Brorshall (Brömse sten? Landamäri #6 — hypotes)$q$,
  $q$Småland$q$,
  $q$Älmhult$q$,
  56.4940, 14.3181,
  $q$FMIS-lämning "Brorshall, Gränsmärke" i Virestad socken (Småland), i gränszonen Skåne–Blekinge–Småland, ~10 km från tre-läns-röset. Daniels hypotes (2026-07-24): detta, snarare än en sten vid Blekinge–Möre, är Landamäris sjätte gränsmärke "Brömse sten" — dvs på Skånes gräns mot Småland. Stöds av att "mellan Blekinge och Möre" är den enda gränsangivelsen bland de sex stenarna (möjlig senare interpolation efter Blekinges införlivande i Danmark; Blekinge var ej danskt vid Landamäri 1) samt av traktnamn (Brömsholm/Brorsö, Bremsa-/Brimsabackarna, Broshall). EJ = Brömsebro-fredsstenen "Brömsen" (flyttad 1933 till Grönadal, Kristianopel). KANDIDAT/hypotes, ej fastställd.$q$,
  $q$https://kulturarvsdata.se/raa/lamning/d8b82a85-c344-42bd-918d-671ebcd87ad1$q$
)
on conflict (source_uri) do nothing;
