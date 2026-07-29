-- Evidensklass på heritage_sites: skiljer belagt från tradition/namn. Löser "galgbacke-namnet
-- kan vilseleda" (Skåne-uppsatsen/Fornvännen). Härleds ur RAÄ-beskrivningen.
--   belagd   = historisk karta, arkeologi, skelett, daterad avrättning
--   tradition = "enligt tradition / gängse uppfattning / i folkmun"
--   namn      = annan lämningstyp (röse/hög) som bara BÄR galgbacke-namn, ingen belagd avrättning
alter table heritage_sites add column if not exists evidence_class text;
comment on column heritage_sites.evidence_class is 'belagd | tradition | namn (källkritisk gradering, härledd ur beskrivning)';
