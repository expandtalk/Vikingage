-- 191 heritage_sites hade raa_type='dös' men bara 10 är äkta dösar; 181 var feltaggade
-- (en fritext-"dös"-ingest). RAÄ-namnet (name) bär den sanna typen → om-typa därefter.
-- Koordinaterna är korrekta (verifierat mot RAÄ). Detta flyttar dem till rätt kartlager
-- (stenkammargrav/gravfält/hällristning…) eller ut ur megalitlagret (boplats/hög/härd).
UPDATE public.heritage_sites SET raa_type = CASE
  WHEN name ILIKE '%stenkammargrav%' OR name ILIKE '%hällkista%' THEN 'stenkammargrav'
  WHEN name ILIKE '%gånggrift%'      THEN 'gånggrift'
  WHEN name ILIKE '%hällristning%'   THEN 'hällristning'
  WHEN name ILIKE '%skeppssättning%' THEN 'skeppssättning'
  WHEN name ILIKE '%gravfält%'       THEN 'gravfält'
  WHEN name ILIKE '%stenkrets%' OR name ILIKE '%stenrad%' OR name ILIKE '%domarring%' THEN 'domarring'
  WHEN name ILIKE '%stensättning%'   THEN 'stensättning'
  WHEN name ILIKE '%rest sten%' OR name ILIKE '%bautasten%' THEN 'rest sten'
  WHEN name ILIKE '%hög%'            THEN 'hög'
  WHEN name ILIKE '%naturföremål%' OR name ILIKE '%naturbildning%' OR name ILIKE '%trollstug%' THEN 'sten med tradition'
  WHEN name ILIKE '%boplats%'        THEN 'boplats'
  WHEN name ILIKE '%härd%'           THEN 'härd'
  ELSE 'fornlämning övrig'
END
WHERE raa_type='dös' AND name NOT ILIKE '%dös%';
