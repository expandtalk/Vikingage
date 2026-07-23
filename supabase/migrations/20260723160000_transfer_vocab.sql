-- 20260723160000_transfer_vocab.sql
INSERT INTO vocabulary (scheme, code, label_sv, label_en) VALUES
  ('acquisition_mode','morgongava','morgongåva','morning gift'),
  ('acquisition_mode','hemfoljd','hemföljd','dowry'),
  ('acquisition_mode','arv','arv','inheritance'),
  ('acquisition_mode','forlaning','förläning','enfeoffment'),
  ('acquisition_mode','donation','donation','donation'),
  ('acquisition_mode','kop','köp','purchase'),
  ('acquisition_mode','pant','pant','mortgage'),
  ('acquisition_mode','byte','byte','exchange'),
  ('acquisition_mode','konfiskation','konfiskation','confiscation'),
  ('holder_kind','king','kung','king'),
  ('holder_kind','consort','gemål','consort'),
  ('holder_kind','dynasty','dynasti','dynasty'),
  ('holder_kind','bryte','bryte','steward'),
  ('holder_kind','institution','institution','institution'),
  ('holder_kind','person','person','person'),
  ('fiscal_system','skatte','skatte','tax land'),
  ('fiscal_system','fralse','frälse','noble-exempt'),
  ('fiscal_system','rusttjanst','rusttjänst','cavalry service'),
  ('fiscal_system','krono','krono','crown land'),
  ('fiscal_system','kyrka','kyrkojord','church land'),
  ('fiscal_system','ledung','ledung/roden','naval levy'),
  ('fiscal_system','uppsala_od','uppsala öd','royal domain')
ON CONFLICT (scheme, code) DO NOTHING;

-- Migrera befintlig fri-text-kod till vokabulärkoden.
-- Matcha på exakta UTF8-byten (skal-oberoende): 0x66c3b6726cc3a46e696e67 = "förläning".
UPDATE estate_holdings SET acquired_via = 'forlaning'
 WHERE acquired_via::bytea = '\x66c3b6726cc3a46e696e67'::bytea;
