-- Boholmarna — öar i Kalmarsund (Kalmarsund-korridoren/ledung). 4 RAÄ/Lantmäteriet-
-- verifierade punkter (SWEREF99TM → WGS84). Läggs i kalmar_place_names (kategori 'ö',
-- samma som befintliga Styrsö), coord_precision='fornsök'. Höjd = Lantmäteriets bar-mark.
-- Idempotent. Applicerad via pooler; fil = proveniens.
INSERT INTO public.kalmar_place_names (name, category, lat, lng, coord_precision, source, sol_match, interpretation)
SELECT x.name, 'ö', x.lat, x.lng, 'fornsök', 'RAÄ Fornsök / Lantmäteriet (SWEREF99TM)', 'none', x.note
FROM (VALUES
  ('Boholmarna (Bo 1:133)', 56.66140, 16.28745, 'Fastighet KALMAR BO 1:133; ~5 m ö.h. (Lantmäteriet).'),
  ('Boholmarna (Bo 1:16)',  56.65741, 16.29198, 'Fastighet KALMAR BO 1:16; ~2 m ö.h. (Lantmäteriet).'),
  ('Boholmarna (nord)',     56.65223, 16.29764, '~3 m ö.h. (Lantmäteriet).'),
  ('Boholmarna (syd)',      56.64853, 16.29740, '~2 m ö.h. (Lantmäteriet).')
) AS x(name, lat, lng, note)
WHERE NOT EXISTS (
  SELECT 1 FROM public.kalmar_place_names k WHERE k.name = x.name
);
