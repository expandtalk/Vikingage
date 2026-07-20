-- Två "Kung Valdemars segelled" ritades på kartan (Daniel 2026-07-20):
--  1) Den detaljerade STRECKADE kodlinjen (valdemarsRoute.ts) — kustnära,
--     jordeboks-belagd, Utlängan→Stockholm→Arholma. Den är korrekt och behålls.
--  2) river_systems-linjen (20260719680000) — 9 grova punkter där segmenten
--     Utlängan→Kalmarsund→Landsort skar rakt över land söder om Kalmar.
-- Fix: kapa DB-linjens svenska ben (seq 1–3). Kvar blir Arholma→Lemböte→Kökar→
-- Jungfrusund→Hangö→Reval — förlängningen österut som kodlinjen inte täcker,
-- och den tar vid EXAKT där kodlinjen slutar (Arholma 59.85/19.07).

delete from public.river_coordinates rc
using public.river_systems rs
where rc.river_system_id = rs.id
  and rs.name = 'Kung Valdemars segelled'
  and rc.sequence_order <= 3;

update public.river_systems
set description = 'Ålands- och Revalbenet av den medeltida farled som beskrivs i "Det danska itinerariet" i Kung Valdemars jordebok (ca 1300). Den svenska kuststräckan (Utlängan–Arholma) ritas av den detaljerade streckade leden; härifrån fortsätter itinerariet över Ålands hav till Lemböte, genom Skärgårdshavet (Kökar, Jungfrusund vid Hitis) till Reval (Tallinn). Nordens äldsta bevarade seglingsbeskrivning.'
where name = 'Kung Valdemars segelled';
