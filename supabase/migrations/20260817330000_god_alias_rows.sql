-- Alias-RADER i sök-indexet för internationella gudanamn → rankar guden #1 vid engelsk/latinsk
-- stavning. Synonym-i-body (förra migr.) räckte inte: label-prefix-träffar (Thora, Thorbiorn) slog
-- guden. En egen rad med label='Thor' exakt-matchar → topp. Syntetiskt entity_id (md5) undviker
-- dedup-krock med gudens riktiga rad. Route = /explore?focus=gods (via signum). FAKTA: namnvarianter.

insert into public.search_document (entity_type, entity_id, signum, label, sublabel, body_sv, body_en, prominence)
select 'god',
  md5('god_alias:' || v.alias)::uuid,
  '/explore?focus=gods',
  v.alias,
  v.sv || ' (fornnordisk gud/gudinna)',
  v.alias || ' ' || v.sv || ' fornnordisk gud asatro mytologi',
  v.alias || ' ' || v.sv || ' Norse god mythology',
  1.2
from (values
  ('Thor', 'Tor'), ('Þórr', 'Tor'), ('Donar', 'Tor'),
  ('Odin', 'Oden'), ('Óðinn', 'Oden'), ('Woden', 'Oden'), ('Wotan', 'Oden'),
  ('Freyr', 'Frej'), ('Frey', 'Frej'),
  ('Freyja', 'Freja'), ('Freya', 'Freja'),
  ('Loki', 'Loke'),
  ('Baldr', 'Balder'), ('Baldur', 'Balder'),
  ('Njord', 'Njörd'), ('Njörðr', 'Njörd'),
  ('Frigga', 'Frigg'),
  ('Heimdallr', 'Heimdall'),
  ('Idunn', 'Idun'), ('Iðunn', 'Idun'),
  ('Aegir', 'Ägir'), ('Ægir', 'Ägir'),
  ('Bragi', 'Brage')
) as v(alias, sv)
where not exists (
  select 1 from public.search_document sd
  where sd.entity_type = 'god' and sd.entity_id = md5('god_alias:' || v.alias)::uuid
);
