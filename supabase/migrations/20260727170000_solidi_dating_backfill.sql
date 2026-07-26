-- Solidi saknade issued_from/to → periodfiltret visade dem i ALLA perioder (även
-- paleolitikum, vilket är fel — solidi är folkvandringstida). Backfill:a datering.
UPDATE public.solidi SET issued_from = 461, issued_to = 465
  WHERE ruler ILIKE 'Libius Severus%' AND issued_from IS NULL;   -- Libius Severus regerade 461–465
UPDATE public.solidi SET issued_from = 450, issued_to = 550
  WHERE issued_from IS NULL;   -- imitationer: folkvandringstid (Fischer 2023), ej exakt daterade
