-- Nils Stensson Sture (Q4154342, 1512–1527) — "Daljunkern". Källkritisk person-post, sökbar, länkbar
-- från Gustav Vasa-noden. Deterministiskt id (md5) → idempotent + rebuild kan referera det. Endast DENNA
-- person omindexeras (rebuild_search_document_x med id) — nollställer inga andra sök-signaler.
insert into public.persons (id, name, wikidata_qid, birth_year, death_year, description_sv, sitelinks)
values (
  md5('nils-stensson-sture-q4154342')::uuid,
  'Nils Stensson Sture',
  'Q4154342',
  1512, 1527,
  'Son till riksföreståndaren Sten Sture den yngre och Kristina Nilsdotter (Gyllenstierna); Gustav Vasas kusin och den äldre Sturepartiets arvinge. Namnet bakom Daljunkern-upproret 1527 mot Gustav Vasa — en tronpretendent (Wikipedia: "pretendent till Sveriges tron"). KÄLLKRITIK: om upprorsmannen "Daljunkern" verkligen var Nils är omstritt — äldre forskning ansåg honom bedragare (Nils uppges ha dött i pest 1527, begravd i Uppsala domkyrka), medan Lars-Olof Larsson (2002) och Harrison & Eriksson (2010) menar att det troligen var Nils själv (i så fall avrättad i Rostock 1528). LAGLIG tronarvinge var han dock inte: Sverige var valrike, och arvrike i Vasa-ätten först genom Västerås arvförening 1544. Alltså Sturepartiets pretendent och Gustavs dynastiska rival — inte "legitim kronarvinge". Källor: sv. Wikipedia (CC BY-SA); Wikidata Q4154342.',
  2
)
on conflict (id) do update set
  name = excluded.name, wikidata_qid = excluded.wikidata_qid,
  birth_year = excluded.birth_year, death_year = excluded.death_year,
  description_sv = excluded.description_sv, sitelinks = excluded.sitelinks;

select public.rebuild_search_document_x('person', md5('nils-stensson-sture-q4154342')::uuid);
