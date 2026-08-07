-- Discoverability-lucka i skala: 301 runstenar vars fyndplats/nuvarande plats är en kyrka hade name=null
-- → sök-label var bara signum → osökbara via kyrko-/sockennamn (samma lucka som Sö 314 hade). Fyll name
-- med den faktiska platstexten + signum (t.ex. "Adelsö kyrka (U 2)"). Ackurat (platsen är källan), fyller
-- bara NULL, trg_search_refresh auto-syncar varje rad → runstenen dyker upp när man söker sin kyrka/socken.
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.runic_inscriptions ri
set name = btrim(coalesce(nullif(ri.current_location,''), ri.location)) || ' (' || ri.signum || ')'
where ri.name is null
  and (ri.current_location ilike '%kyrk%' or ri.location ilike '%kyrk%')
  and coalesce(nullif(ri.current_location,''), ri.location) is not null;

-- Munsö kyrka: källverifierad rundkyrko-beskrivning (Stockholms läns museum; RAÄ BBR). Fyller bara tomt.
update public.ecclesiastical_sites set
  description = coalesce(nullif(description,''),
    'Romansk rundkyrka vid Mälaren, uppförd på 1100-talet – sannolikt som gårds- och försvarskyrka åt '
    'ärkebiskopen i Uppsala (kyrkan omnämns i ett påvebrev 1185). Ursprungligen i huvudsak ett tjockt runt '
    'stentorn; sakristia, vapenhus och gravkor samt tornhuv tillkom senare. På rundhusets vind fanns ett '
    'skyddsrum ("Jungfrukammaren"). En av endast tretton bevarade rundkyrkor i Sverige. '
    'Källor: Stockholms läns museum; Riksantikvarieämbetet (Bebyggelseregistret/BBR).'),
  historical_notes = coalesce(nullif(historical_notes,''),
    'Den runda formen hade delvis en försvarsfunktion (skyddsrum vid oroligheter); formtypen förknippas '
    'traditionellt med Den heliga gravens kyrka i Jerusalem.')
where id = 'b4056946-7261-4dea-85bd-f4e1a7903056';
