-- Grindastenarna (Sö 165/166, Spelviks sn, Södermanland) — fyll historical_context källbelagt.
-- Sö 166: attesterad inskrift (Gudvi i England, danagäld, borgar i Saxland) + TOLKNING (Otto von Friesen:
-- norska sonnamn, Lade-jarl-koppling, storsläkt-parallell) tydligt skild. Sö 165: österledsfärd (Grekland).
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.runic_inscriptions set historical_context =
  'Grindastenen 2, rest av sönerna Grytgård och Enride (Endride) efter fadern Gudvi (Gudve). '
  'Inskriften: Gudvi var i västerled i England och "tog del i gälden" (danagälden), och stormade '
  'skickligt borgar i Saxland (Sachsen). TOLKNING (Otto von Friesen): sonnamnen Grytgård och Enride '
  'är typiskt norska och förekommer i Lade-jarlarnas ätt; v. Friesen såg stenarna som exempel på en '
  'storsläkt med förbindelser utöver Sveriges gränser — en motsvarighet till unionstidens svensk-danska/'
  'svensk-norska högadel. Källa: inskriften (Sö 166); tolkning efter O. von Friesen.'
where signum = 'Sö 166' and historical_context is null;

update public.runic_inscriptions set historical_context =
  'Grindastenen 1, rest av Gudrun efter Heden (Sven brorson/systerson), som var i Grekland '
  '(Grikkland — Bysans/Miklagård). En av de sörmländska österledsstenarna; jämför Sö 166 om '
  'västerledsfärder i samma monumentgrupp vid Grinda, Spelviks socken. Källa: inskriften (Sö 165).'
where signum = 'Sö 165' and historical_context is null;
