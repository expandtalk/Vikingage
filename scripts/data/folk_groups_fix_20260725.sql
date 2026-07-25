-- folk_groups: mekaniska korrigeringar 2026-07-25
-- Vokabulär-normalisering (EN->SV), relabel Goterna/Götar, Gallerna-period, dedup Normannar
BEGIN;

UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Nordgermanska', language_subfamily='Nordgermanska' WHERE id='d393e75d-d682-4b1a-96ef-85c8a2c4ab15'; -- Daner
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Vikingakolonisatörer', language_subfamily='Nordgermanska' WHERE id='aa5f1033-47ee-4fc8-84b6-21b7d5c463a3'; -- Normander
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Sydsvenska', language_subfamily='Nordgermanska' WHERE id='14805cb7-341a-4926-9c5a-a7f5ea68eec7'; -- Virdar
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Centralkeltiska', language_subfamily='Keltiska' WHERE id='463b6b90-a874-492b-89cb-1bd1dc3c2108'; -- Bojer
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Brittiska kelter', language_subfamily='Keltiska' WHERE id='2395ce88-b7c8-4a09-ab93-ebaf79d18a4d'; -- Briganter
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Centralkeltiska', language_subfamily='Keltiska' WHERE id='351b6508-f17c-4490-bf9e-e82d48fdbdd5'; -- Helveter
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Dako-thrakiska', language_subfamily='Thrakiska' WHERE id='49b5d1b8-7949-458f-9ff3-c65381acea44'; -- Daker
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Paleobalkanska', language_subfamily='Illyriska' WHERE id='641e56d5-ea82-4d34-b5cc-49d144c6d321'; -- Illyrer
UPDATE folk_groups SET language_family='Indoeuropeiska', sub_category='Paleobalkanska', language_subfamily='Thrakiska' WHERE id='5a0658b0-3c75-4173-b2df-256a3d706390'; -- Thraker
UPDATE folk_groups SET name='Goterna' WHERE id='13ecddf0-763d-4e19-aab2-3c0ecca6ce72'; -- Götar
UPDATE folk_groups SET name='Götar' WHERE id='fbc19001-f646-451c-ae70-5bc21fa66bbf'; -- Geater
UPDATE folk_groups SET active_period_start=-500, active_period_end=-50 WHERE id='03160edb-b07d-4915-91fb-3ddc0b74fafb'; -- Gallerna

DELETE FROM folk_groups WHERE id='d8d7e005-4291-47df-b36b-a931325d5c20'; -- Normannar (dup av Normander)

COMMIT;