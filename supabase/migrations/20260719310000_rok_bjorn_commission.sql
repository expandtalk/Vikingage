-- Ousbäcks hypotes vidare: Rökstenen som beställningsverk av kung Björn på Birka
-- (Björn at Haugi, ca 829–850), utfört av hovskalden Brage Boddason. Omdiskuterad
-- king_inscription_links-kant (contested) + kompletterade noteringar. Applicerad via MCP.
insert into public.king_inscription_links (king_id, inscription_id, connection_type, evidence_strength, analysis_notes)
select '1c8ca81d-a90b-400f-a3b0-ff6e26de874b'::uuid, '0be64520-b663-4e19-aa3e-bb0c9ffbb8ba'::uuid,
  'commissioned', 'contested',
  'OMDISKUTERAD hypotes (Fredrik Ousbäck): Rökstenen (Ög 136) som ett beställningsverk av kung Björn på Birka (Björn at Haugi, ca 829–850), utfört av hans hovskald Brage Boddason. Ej allmänt accepterad; huvudtolkningen är att Varin reste stenen efter sin son Vämod.'
where not exists (select 1 from public.king_inscription_links k
  where k.king_id='1c8ca81d-a90b-400f-a3b0-ff6e26de874b'::uuid and k.inscription_id='0be64520-b663-4e19-aa3e-bb0c9ffbb8ba'::uuid);

update public.runic_inscriptions set scholarly_notes = scholarly_notes ||
  ' Enligt Ousbäcks hypotes skulle Rökstenen vara ett beställningsverk av kung Björn på Birka, utfört av hans hovskald Brage Boddason.'
where id='0be64520-b663-4e19-aa3e-bb0c9ffbb8ba' and scholarly_notes not like '%beställningsverk av kung Björn%';

update public.carvers set description = description ||
  ' Enligt Ousbäcks hypotes utfördes Rökstenen på beställning av Brages beskyddare kung Björn på Birka (Björn at Haugi).'
where id='c0000000-0000-4000-8000-000000000004'::uuid and description not like '%beställning av Brages beskyddare%';
