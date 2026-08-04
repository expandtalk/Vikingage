-- Config-rad för ortnamnsleden -inge (redan klassad på 541 place_names via element_key 'inge',
-- men saknade konfiguration med label/kategori/period_stratum).
--
-- Källkritik: -inge är en av de äldsta nordiska bebyggelsenamnstyperna, ofta hänförd till
-- äldre järnålder/folkvandringstid. Dateringen av ENSKILDA namn är dock omdiskuterad — typen
-- får inte likställas med bevisad ålder för en given plats. Källor: SOL 2003; Vikstrand.

INSERT INTO ortnamn_element_config
  (element_key, label, category, strength, include, forms, owner, note, period_stratum)
SELECT 'inge', '-inge (bebyggelsenamn)', 'settlement', 'probable', true,
       '-inge, -inga, -linge, -ninge',
       'system',
       'En av de äldsta nordiska bebyggelsenamnstyperna. Ofta hänförd till äldre järnålder/folkvandringstid, men dateringen av enskilda namn är omdiskuterad — typen ska inte likställas med bevisad ålder för en given plats. Källor: SOL 2003; Vikstrand. 541 place_names bär redan element_key ''inge''.',
       'äldre järnålder (omdiskuterat)'
WHERE NOT EXISTS (SELECT 1 FROM ortnamn_element_config WHERE element_key = 'inge');
