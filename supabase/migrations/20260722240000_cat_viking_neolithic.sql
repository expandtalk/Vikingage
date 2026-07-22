-- Vikingatidskatt (mtDNA IV-D, Freja-koppling) + neolitisk omtolkning. Applicerad via
-- MCP execute_sql; fil = proveniens. Källor: Ottoni et al. 2017 (Nat Ecol Evol 1:0139,
-- mtDNA-grupp IV-D = vikingatida katt, Danmark ~900–1100, sprids till Shetland/Orkney/
-- Brittiska öarna/Polen); Baca et al. 2018 (Heredity 121:557) omtolkad av De Martino
-- et al. 2025 (Science). Freja-koppling = tolkning (sagornas völvor i vitt kattskinn;
-- Freyja i kattdragen vagn). Kattfittor (Agneta) = contested hypotes-vokabulär, ej infört.
insert into public.species_introductions (entity,category,proxy_type,site_name,region,date_text,date_from,date_to,uncertainty,confidence,source,note) values
('katt','djur','adna','Danmark (mtDNA-grupp IV-D)','Skandinavien','~900–1100 e.Kr. — vikingatida kattlinje',900,1100,'normal','belagd','Ottoni et al. 2017, Nat Ecol Evol 1:0139','Freja-koppling (tolkning): völvor i vitt kattskinn; Freyja i kattdragen vagn. Päls/ritual/råttfångst på gård + skepp.'),
('katt (omtolkad vildkatt/hybrid)','djur','adna','Centraleuropa (Polen, grottkontext)','Centraleuropa','~5300–4200 cal BP — F. lybica-mtDNA men EJ tamkatt',-3300,-2200,'hög','omtvistad','Baca et al. 2018, Heredity 121:557 — omtolkad av De Martino et al. 2025, Science','Tidiga afrikanska mtDNA-signaler i neolitiska Europa = främst forntida hybridisering, ej tamkattsspridning.')
on conflict do nothing;
