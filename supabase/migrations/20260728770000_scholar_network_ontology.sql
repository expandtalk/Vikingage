-- Forskarnätet in i ontologin: scholars + datasets som förstklassiga entiteter, nätet som
-- relationship-kanter. Så Göransson ↔ Uppsala-krets ↔ arvtagare blir en graf, inte lösa rader.
-- Registrera entitetstyp → entity_registry-nod → relationship-kant (KG-materialiseringsmönstret).

-- 1) Entitetstyper
insert into public.ontology_entity_types (code,label_sv,label_en,physical_table,id_column,coord_kind,provenance_columns,status,description) values
 ('scholar','forskare','scholar','research_scholars','id','none','{source}','active','Modern forskare/upphovsperson vars data plattformen bevarar (meta-lager).'),
 ('dataset','forskardataset','research dataset','research_datasets','id','none','{source_citation}','active','Namngiven, attribuerad datasamling bidragen av en forskare.')
on conflict (code) do nothing;

-- 2) Predikat för nätet
insert into public.rel_predicates (code,label_sv,label_en,subject_type,object_type,qualifier_schema,description) values
 ('authored','författade','authored','scholar','dataset','{"role":"text"}'::jsonb,'Forskaren skapade/bidrog datasetet.'),
 ('collaborated_with','samarbetade med','collaborated with','scholar','scholar','{"context":"text"}'::jsonb,'Forskarna samarbetade/umgicks (attributionsnät).'),
 ('student_of','elev till','student of','scholar','scholar','{}'::jsonb,'Lärling/elev-relation mellan forskare.'),
 ('steward_of','förvaltare av','steward of','scholar','scholar','{"note":"text"}'::jsonb,'Person som förvaltar/ärver en forskares material.')
on conflict (code) do nothing;

-- 3) Sonen som egen nod (namn ej registrerat — inget påhittat namn)
insert into public.research_scholars (id, name, life_status, biography, source)
values ('33333333-3333-3333-3333-3333333333a3'::uuid, 'Sölve Göranssons son (namn ej registrerat)', 'aktiv',
  'Intresserad av öländsk historia — möjlig förvaltare av faderns forskningsmaterial.', 'Daniel Larsson (muntligt).')
on conflict (id) do nothing;

-- 4) Noder i entity_registry (id = fysisk rad-id → mappar till research_scholars/research_datasets)
insert into public.entity_registry (id, entity_type, label) values
 ('11111111-1111-1111-1111-1111111111a1'::uuid, 'scholar', 'Sölve Göransson'),
 ('33333333-3333-3333-3333-3333333333a3'::uuid, 'scholar', 'Sölve Göranssons son (namn ej registrerat)'),
 ('22222222-2222-2222-2222-2222222222a2'::uuid, 'dataset', 'Ölands vårdkassystem')
on conflict (id) do nothing;

-- 5) Kanter
insert into public.relationship (subject_id, predicate, object_id, source_ref, confidence, created_by) values
 ('11111111-1111-1111-1111-1111111111a1'::uuid, 'authored', '22222222-2222-2222-2222-2222222222a2'::uuid,
  'Sölve Göransson 1978, Kalmar Stads Historia 1, s. 141', 'certain', 'platform'),
 ('33333333-3333-3333-3333-3333333333a3'::uuid, 'steward_of', '11111111-1111-1111-1111-1111111111a1'::uuid,
  'Daniel Larsson (muntligt)', 'probable', 'platform')
on conflict do nothing;

-- Koppla scholar_links-sonen till den nya noden
update public.research_scholar_links set to_scholar='33333333-3333-3333-3333-3333333333a3'::uuid
 where from_scholar='11111111-1111-1111-1111-1111111111a1'::uuid and to_scholar is null;
