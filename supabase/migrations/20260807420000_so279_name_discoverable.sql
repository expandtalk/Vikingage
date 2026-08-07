-- Sö 279 (Ingvarssten vid Strängnäs domkyrka) hade name=null → osökbar under "Strängnäs" (missades av
-- kyrko-backfillen eftersom platsen inte låg i current_location/location, bara i museets motiv-fält).
-- Sätter beskrivande namn + plats → trg_search_refresh gör den sökbar. Applicerad via MCP; repo-spegling. 2026-08-07.
update public.runic_inscriptions set
  name = coalesce(nullif(name,''), 'Strängnäs domkyrka (Sö 279)'),
  current_location = coalesce(nullif(current_location,''), 'Vid Strängnäs domkyrka, sydvästra hörnet (RAÄ Strängnäs 125:1)')
where signum = 'Sö 279';
