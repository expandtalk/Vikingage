-- Komplettera Grimskär med RAÄ-verifierad koordinat (Daniel). Tidigare 'forskare'-läge
-- (egen inprickning) ~25 m från RAÄ-centrum. RAÄ Fornsök SWEREF99TM N6279525 E583998
-- → WGS84 56.65233, 16.37003 (2 m ö.h.). coord_precision höjs till 'fornsök'.
-- Applicerad via pooler; fil = proveniens.
UPDATE public.kalmar_place_names
SET lat = 56.65233, lng = 16.37003, coord_precision = 'fornsök', updated_at = now()
WHERE name ILIKE 'grimskär%' OR name ILIKE 'grimskar%';
