-- Kurerad seed för king_inscription_links (var tom, 0 rader). INTE textmatchning
-- (kunganamn som Sven/Erik är vanliga personnamn -> fel), utan de vetenskapligt
-- väletablerade kung↔runsten-kopplingarna. evidence_strength: certain | strong | contested.
-- connection_type: raised_by (kungen lät resa) | commemorates (rest till minne av kungen)
-- | mentions (kungen namnges i texten). Idempotent.
insert into public.king_inscription_links (king_id, inscription_id, connection_type, evidence_strength, analysis_notes)
select v.kid::uuid, v.iid::uuid, v.ctype, v.strength, v.notes
from (values
  -- Jellingstenarna
  ('11e1bca1-1bad-44dd-aaec-1c449977edb6','caf94b05-9803-4cb4-b331-32a87bc5141b','raised_by','certain','Stora Jellingstenen (DR 42) — Harald lat gora kumlen efter Gorm och Thyra; den Harald som vann sig hela Danmark och Norge och gjorde danerna kristna.'),
  ('dad80e7c-8ff5-4664-adec-84cc11044eee','caf94b05-9803-4cb4-b331-32a87bc5141b','commemorates','certain','Stora Jellingstenen (DR 42) rest av sonen Harald till minne av Gorm.'),
  ('dad80e7c-8ff5-4664-adec-84cc11044eee','79ac8ada-e150-43ec-9981-bde134de2457','raised_by','certain','Lilla Jellingstenen (DR 41) — Gorm den Gamle lat gora kumlet efter sin hustru Thyra.'),
  -- Sonder Vissing
  ('11e1bca1-1bad-44dd-aaec-1c449977edb6','4c22d9e0-54c2-4c4f-a450-d9356bad1560','mentions','strong','Sonder Vissing (DR 55) — Tofa, Mistivirs dotter och Haralds (Gorms sons) hustru; Harald Blatand namnges.'),
  -- Hedeby / Sigtrygg-stenarna
  ('4e7f694c-5092-4159-91a8-9a3c07526d2c','dcebc371-9df9-411c-af88-7d97c0daacb2','commemorates','certain','Hedeby/Gunnarsstenen (DR 3) — Asfrid gjorde efter kung Sigtrygg, sin och Gnupas son.'),
  ('04a8b328-6845-42bf-a8be-86a1264d8521','dcebc371-9df9-411c-af88-7d97c0daacb2','mentions','strong','DR 3 — Sigtrygg anges som Gnupas son; Gnupa namngiven indirekt.'),
  ('4e7f694c-5092-4159-91a8-9a3c07526d2c','ab377de6-9d07-4c9e-a8ce-a0737ec92bb5','commemorates','strong','Hedeby (DR 4) — Asfrid efter kung Sigtrygg.'),
  -- Hallestad — Toke Gormsson
  ('1bd961dc-efe5-4da7-827a-e55e5976b05b','16944a9f-f295-49e3-b6dc-827dbd508d54','commemorates','strong','Hallestad 1 (DR 295) — Askel reste efter Toke Gormsson, en trogen herre som ej flydde vid Uppsala.'),
  ('1bd961dc-efe5-4da7-827a-e55e5976b05b','45c81298-0238-4cb6-aff1-05b2348f07bc','mentions','strong','Hallestad 2 (DR 296) — del av samma monument kring Toke Gormsson.'),
  -- Omdiskuterade (markerade contested — inte pastadda som fakta)
  ('e9bfd664-8f55-47bf-8bb4-c814e4da8385','42e299fd-c03d-44ac-bf77-96957083cfae','raised_by','contested','Hedeby/Skarthistenen (DR 1) — kung Sven reste efter Skarde; vilken Sven (ev. Sven Tveskagg) debatteras.'),
  ('e9bfd664-8f55-47bf-8bb4-c814e4da8385','c92f84ef-80e6-40ca-8dbb-cfb1cb693d28','mentions','contested','Hedeby (DR 2) — rest av Torulv, kung Svens hemtegn, efter Erik; identiteten av kung Sven debatteras.'),
  ('98463092-e941-4128-980f-937c3a8bf786','de493999-520d-401f-8651-9955dabb7ed1','mentions','contested','Hovgardsstenen (U 11, Adelso) — namner kung Hakon; identiteten omdiskuterad.')
) as v(kid, iid, ctype, strength, notes)
where not exists (
  select 1 from public.king_inscription_links k
  where k.king_id = v.kid::uuid and k.inscription_id = v.iid::uuid
);
