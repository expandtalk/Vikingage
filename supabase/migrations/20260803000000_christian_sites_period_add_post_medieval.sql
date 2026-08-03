-- Vidga period-enum på christian_sites additivt med 'post_medieval'.
-- Bakgrund: flera öländska medeltidskyrkor revs och ersattes på 1600-1900-talet
-- (t.ex. Runsten kyrka 1836-1847, som ersatte den medeltida klövsadelskyrkan).
-- Dessa efterträdare kunde tidigare inte representeras ärligt utan att felmärkas
-- som 'medieval'/'late_medieval'. Ändringen är rent additiv och kan inte bryta
-- befintliga rader.

ALTER TABLE christian_sites DROP CONSTRAINT IF EXISTS christian_sites_period_check;
ALTER TABLE christian_sites ADD CONSTRAINT christian_sites_period_check
  CHECK (period = ANY (ARRAY['early_christian'::text, 'medieval'::text, 'late_medieval'::text, 'post_medieval'::text]));
