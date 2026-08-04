-- Läge + jordmån per fornborg (Daniels sorteringsidé: byggd på höjd vs fattig/rik jordmån).
-- Kolumner fylls av scripts/data/sample-fort-terrain.mjs:
--   elevation_m/rel_height_m/on_height ur opentopodata EU-DEM 25 m (prominens = fort minus lägsta granne ~450 m)
--   soil_jordart/soil_fertility ur SGU jordarter 1:25–100k (WMS GetFeatureInfo, CC-BY; bördighet = transparent regel)
-- Ingen gissning — null där DEM/SGU saknar täckning.

ALTER TABLE swedish_hillforts
  ADD COLUMN IF NOT EXISTS elevation_m double precision,
  ADD COLUMN IF NOT EXISTS rel_height_m double precision,
  ADD COLUMN IF NOT EXISTS on_height boolean,
  ADD COLUMN IF NOT EXISTS soil_jordart text,
  ADD COLUMN IF NOT EXISTS soil_fertility text,
  ADD COLUMN IF NOT EXISTS terrain_sampled_at timestamptz;
