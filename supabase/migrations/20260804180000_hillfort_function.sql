-- fort_function på swedish_hillforts: funktionsaxel (försvar vs handel/skatt) för /sv/borgar-facetten.
-- STRIKT evidensbaserad — INGEN blanket-typologi (flera folkvandringstida borgar hade produktion,
-- t.ex. Broborg=glas/emalj, Gåseborg=bronsgjutning, så "alla fornborgar = försvar" vore en gissning).
-- Endast borgar vars text uttryckligen anger tillflykt/refug eller massaker klassas som 'defense'.
-- Värden: 'defense' | 'control_trade' | 'administrative' | 'royal_residence' (fri text; null = oklassificerad).

ALTER TABLE swedish_hillforts ADD COLUMN IF NOT EXISTS fort_function text;

UPDATE swedish_hillforts SET fort_function = 'defense'
WHERE fort_function IS NULL AND (
  description ILIKE '%tillflykt%' OR cultural_significance ILIKE '%tillflykt%'
  OR period ILIKE '%massaker%' OR description ILIKE '%massaker%'
);
