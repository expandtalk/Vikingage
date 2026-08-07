-- U 855 Bökstastenen (Balingsta sn, Uppland) — jaktmotivet med ryttare/falk/hundar/skidlöpare. Hade
-- object_category='unknown' (fel, är runsten) + tunn beskrivning. Rättar object_category='runestone' +
-- källkritisk historical_context. "Äldsta skidavbildningen" redovisas som TOLKNING/omtvistat, ej faktum
-- (INGEN GISSNING). Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.runic_inscriptions set
  object_category = 'runestone',
  historical_context = 'Bökstastenen (Balingsta socken, Uppland; nära Viks slott) bär ett ovanligt jaktmotiv: '
    'en ryttare, hundar och villebråd samt en skidlöpare med båge; en fågel ingår i kompositionen. '
    'Stenen är skadad och lagad i mitten. Skidlöparen med båge tolkas ibland som guden Ull (skidornas och '
    'jaktens gud). TOLKNING/OMTVISTAT: påståendet att detta är "den äldsta kända avbildningen av skidor" '
    'förekommer i populärlitteratur men är inte säkert belagt — redovisas som tolkning, ej faktum, och bör '
    'verifieras mot forskningslitteratur. Källor: Rundata (U 855); RAÄ/K-samsök (bildmaterial).'
where signum = 'U 855';
