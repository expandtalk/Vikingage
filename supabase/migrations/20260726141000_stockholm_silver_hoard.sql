-- Tidigmedeltida silverskatt, Stockholms län (>24 000 mynt, sent 1100-tal).
-- Ekonomiska museet – Kungliga Myntkabinettet / Uppdrag arkeologi AB.
-- OBS: fyndplatsen är STRIKT SEKRETESSBELAGD → INGEN koordinat sätts (coordinates = NULL).
-- Ingen enskild utgivare → issuer_king_id NULL.

INSERT INTO public.coins
  (name, name_en, category, mint, metal, denomination, period_start, period_end,
   find_place, coordinates, significance, description, sources)
SELECT
  'Silverskatt, Stockholms län (>24 000 mynt)',
  'Silver hoard, Stockholm County (24,000+ coins)',
  'hoard',
  'Gotland + Sigtuna/Svealand (bl.a. ärkebiskopen i Uppsala)',
  'silver',
  'Brakteater + vikingatida mynt',
  1140, 1200,
  'Stockholms län — exakt fyndplats strikt sekretessbelagd',
  NULL,  -- fyndplats hemlig; ingen koordinat
  'Ökar forskningsmaterialet för svealändska brakteater från 1100-talets andra hälft mer än åttafalt (tidigare ~1 000 kända → >8 000). Kan komma att visa att myntningen i Sigtuna började redan under Erik den heliges tid (1150-talet), ungefär samtidigt som i Lödöse.',
  '>24 000 mynt (~4,7 kg) i ett fragmentariskt kopparkärl (~15×25 cm, järnhandtag). Ca 2/3 gotländska mynt, ca 1/3 svealändska brakteater; flera hundra präglade av ärkebiskopen i Uppsala; götaländska mynt saknas i stort. Minst 1 400 halverade brakteater. Dessutom minst 18 vikingatida mynt (2 islamiska 900-tal, 2 tyska under Otto III 983–1002, 14 engelska av Crux 991–997 / Long Cross 997–1003), nästan alla omgjorda till hängen/kedjor — bl.a. ett unikt föremål med tre myntkedjor sammanfogade på en kopparplatta. Undersökning: Uppdrag arkeologi AB på uppdrag av länsstyrelsen (2024/2025).',
  'Eeva Jonsson, ansvarig antikvarie, Ekonomiska museet – Kungliga Myntkabinettet; Uppdrag arkeologi AB.'
WHERE NOT EXISTS (SELECT 1 FROM public.coins WHERE name = 'Silverskatt, Stockholms län (>24 000 mynt)');
