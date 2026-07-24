-- Vite sten (Landamäris 5:e gränsmärke, Sverige–Danmark ~1050) — FMIS-verifierad.
-- Lämning "Vitesten, Gränsmärke", RAÄ Skånes-Fagerhult 36:1, Örkelljunga, Skåne.
-- Koord ur FMIS presentation (56.40546, 13.47449). EJ = Stockholms Vita sten (Brännkyrka 230).
insert into heritage_sites (raa_type, name, landscape, municipality, lat, lng, description, source_uri)
values (
  $q$gränsmärke$q$,
  $q$Vite sten (Skånes-Fagerhult 36:1, Landamäri)$q$,
  $q$Skåne$q$,
  $q$Örkelljunga$q$,
  56.40546, 13.47449,
  $q$Vitlav-beklätt stenblock, ett av Landamäris sex gränsmärken mellan Sverige och Danmark (ca 1050), femte stenen. Svennungs (Fornvännen 1966) placering: knappt 1 km NV om Healt, utanför Örkelljunga, vid en hålväg som enligt FMIS använts för att korsa gränsen; ~1 km till dagens Smålandsgräns, ~3 km till tre-läns-röset Halland–Skåne–Småland. "Vite/Fit"-toponymer i trakten (Vitesjön, Vita Sjö, Vitaholm). Daniels hypotes: markerar Skånes gräns mot Småland (ej Blekinge), i linje med att fem av sex stenar följer Halland-linjen. RAÄ Skånes-Fagerhult 36:1. EJ = Stockholms lokala Vita sten (Brännkyrka 230:1).$q$,
  $q$https://kulturarvsdata.se/raa/lamning/5e9e1ee9-b335-4524-8a0f-57c73fe8e223$q$
)
on conflict (source_uri) do nothing;
