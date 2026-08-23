-- Namnsdag (svenska namnlängden, nuvarande). FAKTA (datum) — källa Wikipedia (CC BY-SA) + Isof.
-- Struktur för både visning och "vem har namnsdag idag"-uppslag.
ALTER TABLE public.name_authority
  ADD COLUMN IF NOT EXISTS name_day_month int,
  ADD COLUMN IF NOT EXISTS name_day_day int,
  ADD COLUMN IF NOT EXISTS name_day_text text,
  ADD COLUMN IF NOT EXISTS name_day_source text;
CREATE INDEX IF NOT EXISTS name_authority_nameday ON public.name_authority (name_day_month, name_day_day);
