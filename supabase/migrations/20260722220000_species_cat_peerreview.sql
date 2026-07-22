-- Uppgraderar katt-raderna i species_introductions från populärhistoria (SVERAK,
-- 'hypotes') till peer-reviewad genomik ('belagd'). Applicerad via MCP execute_sql;
-- fil = proveniens. Exempel på att konfidenssystemet fungerar: populär → peer-review.
-- Källor:
--   De Martino et al. 2025, Science 390:eadt2642. Tamkatten (F. catus) från afrikansk
--     vildkatt (F. lybica lybica); till Europa ~2000 år sedan från Nordafrika MED
--     romarriket (ej neolitiskt). Äldsta europeiska klusterindivid: Genoni, Sardinien ~2200 f.n.
--   Han et al. 2026, Cell Genomics. Tamkatten till Kina ~730 e.Kr. via Sidenvägen
--     (Tongwan City FS12); Dzhankent, Kazakstan 775–940 e.Kr. Leopardkatten (Prionailurus
--     bengalensis) kommensal råttfångare ~5400 f.n.–150 e.Kr., aldrig domesticerad.
update public.species_introductions
set proxy_type='adna', date_from=-7500, date_to=-1500, confidence='trolig',
    date_text='domesticering: neolitisk Levant ~9500 f.n. el. faraonisk Egypten ~3500 f.n. (två kandidatcentra); härstammar från afrikansk vildkatt (F. lybica lybica)',
    source='De Martino et al. 2025, Science 390:eadt2642',
    note='Ikonografi (Bast). Domesticeringens plats fortf. öppen.'
where entity='katt' and site_name='Egypten (Bast-kult, Bubastis)';

update public.species_introductions
set proxy_type='adna', site_name='Europa (med romarriket)', region='Europa',
    date_from=1, date_to=100, confidence='belagd',
    date_text='~2000 år sedan (1:a årh. e.Kr.) — tamkattens genpool etableras i Europa, från Nordafrika med romarriket',
    source='De Martino et al. 2025, Science 390:eadt2642',
    note='Reviderar äldre neolitisk/mtDNA-bild: europeiska tamkatt-kluster syns först ~1:a årh. e.Kr. Nyttodjur (råttfångst).'
where entity='katt' and site_name='spridning Egypten→Italien→Europa';

insert into public.species_introductions (entity,category,proxy_type,site_name,region,landscape,date_text,date_from,date_to,uncertainty,confidence,source,note) values
('katt','djur','adna','Genoni','Italien','Sardinien','~2200 år sedan — äldsta europeiska F. lybica/F. catus-klusterindivid',-200,-200,'normal','belagd','De Martino et al. 2025, Science 390:eadt2642','Första vågen: nordvästafrikansk vildkatt → Sardinien.'),
('katt','djur','adna','Tongwan City (Shaanxi)','Kina',null,'~730 e.Kr. — äldsta tamkatten i Kina (FS12)',730,730,'normal','belagd','Han et al. 2026, Cell Genomics','Via Sidenvägen (levantinsk mtDNA IV-B); bland de senaste domesticerade i Kina.'),
('katt','djur','adna','Dzhankent','Kazakstan',null,'775–940 e.Kr. — äldsta tamkatten i Centralasien',775,940,'normal','belagd','Han et al. 2026, Cell Genomics (cit. Haruda et al. 2020)','Handelsburen spridning längs Sidenvägen.'),
('leopardkatt (kommensal)','djur','zooarchaeology','Quanhucun m.fl. (Kina)','Kina',null,'~5400 f.n.–150 e.Kr. — kommensal råttfångare i 3500 år, ej domesticerad',-3400,150,'normal','belagd','Han et al. 2026, Cell Genomics','Prionailurus bengalensis fyllde råttfångar-nischen före tamkatten.')
on conflict do nothing;
