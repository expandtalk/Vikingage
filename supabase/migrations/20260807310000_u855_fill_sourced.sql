-- U 855 Bökstastenen: fyll källbelagda luckor (sv.wikipedia/Rundata). translation_sv (svensk läsning
-- m. markerade lakuner), dating_text (stil Pr 2, Gräslunds kronologi), condition_notes (fem delar,
-- femte biten återfunnen 2004). Ristare LÄMNAS null (osignerad, verifierat). coalesce → skriver ej över
-- befintligt. Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.runic_inscriptions set
  translation_sv = coalesce(nullif(translation_sv,''),
    'Inge-… och Jogärd lät resa denna sten efter Est, sin son. Ärnfast och bröderna reste stenen efter sin bror …'),
  dating_text = coalesce(nullif(dating_text,''),
    'Mitten av 1000-talet; runstensstil Pr 2 (Gräslunds kronologi; stilattribution osäker).'),
  condition_notes = coalesce(nullif(condition_notes,''),
    'Sönderbruten i fem delar men hopfogad; den saknade femte delen återfanns 2004 vid utgrävning (källa: sv.wikipedia, Bökstastenen).')
where signum = 'U 855';
