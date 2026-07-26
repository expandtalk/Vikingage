-- Task 2: markera regionala entiteter som regionala så kartan inte ritar dem som exakta nålar.
-- Task 3: städa 4 runkoord som är lågprecisa men felmärkta coord_confidence='high'.

-- folk_groups: peoples/territorier — alltid regionala (aldrig punkter)
ALTER TABLE public.folk_groups ADD COLUMN IF NOT EXISTS geo_precision text;
UPDATE public.folk_groups SET geo_precision = 'regional' WHERE geo_precision IS NULL;

-- species_introductions: blandat — härled ur decimalprecision (rund koord = regional placeholder)
ALTER TABLE public.species_introductions ADD COLUMN IF NOT EXISTS geo_precision text;
UPDATE public.species_introductions
SET geo_precision = CASE
  WHEN lat IS NULL OR lng IS NULL THEN NULL
  WHEN (CASE WHEN position('.' in lat::text)=0 THEN 0 ELSE length(rtrim(split_part(lat::text,'.',2),'0')) END) <= 1
   AND (CASE WHEN position('.' in lng::text)=0 THEN 0 ELSE length(rtrim(split_part(lng::text,'.',2),'0')) END) <= 1
    THEN 'regional'
  ELSE 'site' END;

-- Task 3: nedgradera de 4 lågprecisa runkoordinaterna felmärkta 'high' → 'low'
UPDATE public.runic_inscriptions SET coord_confidence = 'low'
WHERE coordinates IS NOT NULL AND coord_confidence = 'high'
  AND (CASE WHEN position('.' in (coordinates[1])::text)=0 THEN 0 ELSE length(rtrim(split_part((coordinates[1])::text,'.',2),'0')) END) <= 2
  AND (CASE WHEN position('.' in (coordinates[0])::text)=0 THEN 0 ELSE length(rtrim(split_part((coordinates[0])::text,'.',2),'0')) END) <= 2;
