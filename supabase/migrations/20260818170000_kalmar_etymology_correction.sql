-- Korrigering av Kalmar-etymologin i kalmar_place_names mot källa (Ludvig Papmehl-Dufay,
-- Kalmar läns museum; runsten Sö 333). Rättar tre fel i den tidigare seedade tolkningen:
--   1) kalm = naturlig/anlagd stenhög UNDER VATTEN (ett grund/rev), inte ett stenröse på land.
--   2) Standardläsningen knyter namnet till KALMARSUND (sundet fullt av grund) — inte specifikt
--      till Västra sjön. Den identifieringen är lokalkännedom och feltillskrevs SOL; märks nu som
--      lokal läsning, skild från standard-etymologin.
--   3) Namnet är belagt redan på vikingatiden via sundet: Sö 333 (Ärja ödekyrka, Åkers sn,
--      Södermanland, 1000-tal) omtalar en man som "blev dräpt ute i Kalmarsund" — sekler före
--      staden (1200-tal, möjl. sent 1100-tal). Belägg ≠ namnålder.
-- Källkritik: standardläsningen står som TOLKNING, inte dom; konkurrerande läsning kvar bredvid.

update public.kalmar_place_names set
  head_element   = 'kalm (naturligt/anlagt stenrev, grund under vatten) + mar (grund vik/sund)',
  element_reading = '"(platsen vid) sundet med grund/stenrev"',
  interpretation =
      'Kalmar förklaras vanligen som staden uppkallad efter Kalmarsund. Ledet kalm syftar enligt '
   || 'den mest vedertagna tolkningen på en naturlig eller anlagd stenhög under vatten — ett grund/'
   || 'rev — och Kalmarsund är rikt på sådana (Ludvig Papmehl-Dufay, Kalmar läns museum). Namnet är '
   || 'belagt redan på vikingatiden via sundet: runstenen Sö 333 (Ärja ödekyrka, Åkers socken, '
   || 'Södermanland, 1000-tal) omtalar en man som "blev dräpt ute i Kalmarsund" — sekler före '
   || 'staden, som går tillbaka till 1200-talet (möjligen sent 1100-tal). Belägg ≠ namnålder. Den '
   || 'lokala identifieringen av "mar" med Västra sjön väster om Stensö är lokalkännedom och hålls '
   || 'skild från sund-etymologin. Tolkning, ej dom.',
  period_stratum = 'vikingatid',
  source =
      'Ludvig Papmehl-Dufay (Kalmar läns museum); runsten Sö 333 (Rundata / Södermanlands '
   || 'runinskrifter); SOL 2003 (kalm/mar-leden); Västra sjön: lokalkännedom'
where name = 'Kalmar';

update public.kalmar_place_names set
  interpretation =
      'Grund vik väster om Stensö. En LOKAL läsning kopplar den till "mar"-ledet i Kalmar; den står '
   || 'dock inte i SOL och hålls skild från standard-etymologin, som knyter namnet till Kalmarsund '
   || '(sundet med grund). Lokalkännedom — tolkning, ej belagt.',
  source = 'Lokalkännedom (ej SOL)'
where name = 'Västra sjön';
