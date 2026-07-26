-- Bild (mynt/sigill/tidig avbildning) på historical_kings. Endast verifierbara,
-- ej påhittade porträtt (vikingatida kungar har inga samtida porträtt — bara mynt).
-- Renderas i KingCell-modalen (tabellvy) + KingDetailPanel (kortvy).
-- Bilder serveras från public/excursion-photos/allmana-bilder/.
--
-- OBS: Applicerad via MCP. Dokumentation av schemat.

ALTER TABLE historical_kings
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_caption text,
  ADD COLUMN IF NOT EXISTS image_credit text;

-- Datasättning (gjord separat):
--  Sven Tveskägg   → mynt, PD (Hauberg 1900)
--  Knut den store  → penny, CC BY-SA 2.0 (A. Marsden / Portable Antiquities Scheme)
--  Magnus Ladulås, Magnus Eriksson, Albrekt av Mecklenburg, Karl Knutsson (Bonde) → medeltida kungasigill (PD)
