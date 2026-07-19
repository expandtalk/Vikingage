-- Kopplar skalden Brage Boddason i person-grafen (royal_relations, namnbaserad):
-- till Ragnar Lodbrok (via Ragnarsdrápa) och till kung Björn (hovskald/beställare enligt
-- Ousbäcks hypotes). Visas på respektive kungs detaljsida. Applicerad via MCP.
insert into public.royal_relations (id, person_a, person_b, relation_type, period, comment, source, king_b_id)
select gen_random_uuid(), v.pa, v.pb, v.rt, v.period, v.comment, v.source, v.kbid::uuid
from (values
  ('Brage Boddason','Ragnar Lodbrok','skald','800-talet','Ragnarsdrápa — Brages skölddikt (dróttkvätt) beskriver mytiska och heroiska motiv målade på en sköld som traditionellt tillskrivs Ragnar Lodbrok.','Bragi Boddason, Ragnarsdrápa','b21c8840-a270-4a1b-a8fe-6ee42c51f2fa'),
  ('Brage Boddason','Kung Björn','hovskald','829–850','Brage verkade som hovskald vid Björn at Haugis (Björn på Birka) hov. Enligt Ousbäcks hypotes var kung Björn beställare av Rökstenen, utförd av Brage.','Ousbäck-hypotesen; Rimbert, Vita Ansgarii','1c8ca81d-a90b-400f-a3b0-ff6e26de874b')
) as v(pa, pb, rt, period, comment, source, kbid)
where not exists (select 1 from public.royal_relations r where r.person_a=v.pa and r.person_b=v.pb and r.relation_type=v.rt);
