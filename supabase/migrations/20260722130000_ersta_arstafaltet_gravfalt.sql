-- Ersta (gård/by) + Årstafältets borttagna gravfältskomplex. Applicerad via MCP
-- execute_sql; fil = proveniens. Ersta ankrat vid Ersta gårdsväg (OSM, gården riven
-- 1970-tal → läge ungefärligt). Gravfältskomplexet borttaget 1958–59 → EJ exakt läge;
-- ETT flaggat märke ~150–450 m V om Ersta gård, ej fyra gissade punkter (hitta inte på).
-- Källa gravfält: Undersökningarna på Årstafältet 1958–59, Bih. nr 43 år 1960
-- (Stockholms stadsmuseum); Stockholmskällan post 30271. Hövdingagraven (SSM 39055:7,
-- tidigt 900-tal) ≠ Emund den gamle (d. ~1060) trots folktradition — ~100 år emellan.
insert into public.place_names (name, lat, lng, feature_type, province, earliest_attestation_year, attested_form, attestation_source, source, source_license, attribution, external_id)
select 'Ersta', 59.2921, 18.0362, 'bebyggelse (gård/by)', 'Södermanland', 1527, 'Eriksstad',
  'Gård/by i Brännkyrka sn, SV Årstafältet, SÖ om Årsta partihallar. Namnformer: Eriksstad, Erista, Jerstad, Jersta, Orestad (samt Aerstede, tolkning av platsen för slaget vid Brännkyrka 1518). 1527 köpt av borgmästare Anders Simonsson; 1535 anges 12 öresland (betydande gård). En av de äldsta gårdarna i Brännkyrka (gravfält från järnålder intill). Gården riven på 1970-talet; Ersta gårdsväg minner om läget. Källa: S. Rahmqvist; Wikipedia.',
  'Ägo-/ortnamnshistoria (Rahmqvist, Wikipedia) + OSM (koordinat: Ersta gårdsväg, ungefärligt läge)',
  'ODbL (koordinat)', 'Koordinat © OpenStreetMap-bidragsgivare (ODbL); läge ungefärligt (gården riven)', 'manual-ersta'
where not exists (select 1 from public.place_names where external_id='manual-ersta');

insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
select 'gravfält (borttaget 1958–59)', 'Årstafältets gravfältskomplex (Ersta/Åby/Brunnby)', 'Södermanland', 'Stockholm', 'Brännkyrka',
  59.2920, 18.0309, 'romersk järnålder–vikingatid (ca 100–950 e.Kr.)',
  'Tre gravfält utgrävda och BORTTAGNA 1958–59 för partihandelscentralen (~400 fornlämningar, Stadsmuseet). Läge UNGEFÄRLIGT (~150–450 m V om Ersta gård; exakt position ej bevarad). (1) Romerskt järnåldersgravfält (~100–200 e.Kr.), >200 gravar, bautastenar/treuddar, 4 vapengravar (sköldbucklor, tveeggat svärd ~200 e.Kr., knoppsporrar), guldfolierade glaspärlor — "Stockholm före Stockholm", ovanligt långt norrut. (2) Åby vikingatida bygravfält (~40 gravar, tillhört byn Åby, upphörde tidigt 1500-tal). (3) Brunnby vikingatida gravfält (>100 gravar); storhög med 7 begravningar, översta = hövdinga-/ryttargrav tidigt 900-tal med svärd nedstucket i marken, skäggyxa, selbågskrön, spelbrickor, guldtrådar i textil, Birka-paralleller (SSM 39055:7). Källa: Undersökningarna på Årstafältet 1958–59, Bih. nr 43 år 1960 (Stockholms stadsmuseum); Stockholmskällan post 30271.',
  'Bih. nr 43 år 1960 (Stockholms stadsmuseum), Årstafältet 1958–59; Stockholmskällan post 30271'
where not exists (select 1 from public.heritage_sites where source_uri like '%Bih. nr 43%');
