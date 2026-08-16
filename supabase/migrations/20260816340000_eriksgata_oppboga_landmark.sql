-- Eriksgatan: lägg saknad överlämningsplats Oppboga bro (gisslebyte Närke↔Västmanland) som landmärke.
-- Koord DB-verifierad ur place_names (Oppboga, Arbogaån 59.4331,15.5501 — ej ur minnet). Fakta ur
-- landskapslagarna + Populär Historia 1/2021 (Olle Larsson); egna ord, ej verbatim.
insert into public.road_landmarks (road_id, name, name_en, landmark_type, coordinates, description, description_en, historical_significance)
select r.id, 'Oppboga bro', 'Oppboga bridge', 'junction', '(15.5501,59.4331)',
  'Gränsövergång Närke↔Västmanland på Eriksgatan. Vid Oppboga bro — ett vadställe vid Arbogaån — avlöstes närkingarna av västmanlänningarna (gisslebyte) innan kungen fördes vidare mot Sagån och Uppsala. Källa: landskapslagarna; Populär Historia 1/2021 (Olle Larsson).',
  'A border crossing between Närke and Västmanland on the Eriksgata. At Oppboga bridge — a ford on the river Arbogaån — the men of Närke handed the king over to those of Västmanland.',
  'En av de belagda överlämningsplatserna (gisslebyten) i landskapslagarna.'
from public.viking_roads r
where r.name = 'Eriksgatan'
  and not exists (select 1 from public.road_landmarks l where l.road_id = r.id and l.name ilike 'Oppboga%');
