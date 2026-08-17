-- Torvalla by (Jämtland, nära Östersund/Brunflo) — teofor ortnamn ("guden Tors by/vall", TOLKNING)
-- med belagd kulturhistoria. Läggs i cult_sites (ger platssida /sv/plats/torvalla-by + sökbarhet).
-- KÄLLKRITISKT åtskilt: BELAGT (byggnadsminnesförklarade 1800-talsgårdar; Helge Hvass nämnd 1433;
-- odlingsrösen/fornlämningar → odling sedan sen vikingatid) vs TOLKNING (Torvalla = Tors-vall/by,
-- teofor härledning) vs TRADITION (Gräfsåsens "hittingskyrka"). Koord DB-verifierad (place_names
-- Torvalla by 63.1447,14.7275). Källa: hembygd.se/brunflo (fakta i egna ord; ingen verbatim/rehost).

insert into public.cult_sites (id, name, description, lat, lng, type, deity, region, place_slug, sources)
select
  'torvalla-by-jamtland', 'Torvalla by',
  'Torvalla by i Brunflo, Jämtland, kring Storsjön. Namnet tolkas som teofort — "guden Tors vall/by" '
  || '(TOLKNING av ortnamnsforskningen, inte fastställt). BELAGT: byn hör till den gamla kulturbygden '
  || 'kring Storsjön; odlingsrösen och fornlämningar i sydvästsluttningen visar att den bästa odlingsmarken '
  || 'brutits redan under slutet av vikingatiden. Torvallas förste kände bonde är Helge Hvass, nämnd 1433. '
  || 'Tre väl bevarade 1800-talsgårdar på rad är byggnadsminnesförklarade (f.d. Olle Perssons gård, '
  || 'f.d. Edholms, Kristianssons gård samt Wiiks gård), med smedja, bryggstuga, humlegård, ladugård, '
  || 'visthus, logе och härbre — en av Jämtlands bäst bevarade byar. TRADITION: vid Gräfsåsen längs '
  || 'pilgrimsvägen från Kyrkås ska en s.k. hittingskyrka ha funnits (sägen, obelagt). Källa: '
  || 'hembygd.se/brunflo (Brunflo hembygdsförening); fakta återgivet i egna ord.',
  63.1447, 14.7275,
  'teofort ortnamn (tolkning) · kulturby', 'Tor', 'Jämtland', 'torvalla-by',
  array['Brunflo hembygdsförening (hembygd.se/brunflo/page/17952)']
where not exists (select 1 from public.cult_sites c where c.id = 'torvalla-by-jamtland');

-- Indexera i söket (scopad rebuild per id → ingen full rebuild som nollställer signaler).
-- OBS: rebuild_search_document (UTAN _x) hanterar cult_site; entity_id = md5('cult_site:'||id)::uuid.
select public.rebuild_search_document('cult_site', md5('cult_site:torvalla-by-jamtland')::uuid);
