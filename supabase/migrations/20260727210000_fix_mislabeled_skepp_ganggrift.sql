-- Samma fritext-förorening som dösarna: 'skeppssättning' (862/864) och 'gånggrift'
-- (426/426) var mest feltaggade (egentligen stenkrets/gravfält/stensättning/röse resp.
-- stenkammargrav/hällristning/hög). Om-typa från RAÄ-namnet. Behåll äkta (namn=typ).
-- 'domarring' rörs EJ (RAÄ:s "Stenkrets/stenrad" ÄR domarring — inget fel).
UPDATE public.heritage_sites SET raa_type = CASE
  WHEN name ILIKE '%stenkammargrav%' OR name ILIKE '%hällkista%' THEN 'stenkammargrav'
  WHEN name ILIKE '%gånggrift%'      THEN 'gånggrift'
  WHEN name ILIKE '%skeppssättning%' THEN 'skeppssättning'
  WHEN name ILIKE '%hällristning%'   THEN 'hällristning'
  WHEN name ILIKE '%stenkrets%' OR name ILIKE '%stenrad%' THEN 'domarring'
  WHEN name ILIKE '%gravfält%'       THEN 'gravfält'
  WHEN name ILIKE '%stensättning%'   THEN 'stensättning'
  WHEN name ILIKE '%röse%'           THEN 'röse'
  WHEN name ILIKE '%rest sten%' OR name ILIKE '%bautasten%' THEN 'rest sten'
  WHEN name ILIKE '%hög%'            THEN 'hög'
  WHEN name ILIKE '%naturföremål%' OR name ILIKE '%naturbildning%' OR name ILIKE '%trollstug%' THEN 'sten med tradition'
  WHEN name ILIKE '%boplats%'        THEN 'boplats'
  WHEN name ILIKE '%härd%'           THEN 'härd'
  ELSE 'fornlämning övrig'
END
WHERE (raa_type='skeppssättning' AND (name IS NULL OR name NOT ILIKE '%skeppssättning%'))
   OR (raa_type='gånggrift'      AND (name IS NULL OR name NOT ILIKE '%gånggrift%'));
