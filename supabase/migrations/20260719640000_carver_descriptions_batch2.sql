-- Ristarbeskrivningar batch 2 — HÄRLEDDA ur grafen (samma metod som 20260719620000).
-- Varje uppgift ur carved_by-kanterna, parish-gazetteern, Gräslund-stilarnas TPQ/TAQ.
-- Efterfrågade men EJ funna i databasen (någon stavning): Ingulf, Högvid — rapporterat,
-- inte påhittat. Källström-berikning följer separat när PDF-genomgången är klar.

begin;

update public.carvers set description = d.descr,
  source_ref = coalesce(source_ref, 'härledd ur databasens graf (rundata 2020-11-29)')
from (values

  ('Olev',
   '8 stenar i databasen, varav 2 signerade — däribland Fällbrohällarna (U 162-området) och U 162 — koncentrerade till Sollentuna härad (5) och Danderyds skeppslag (2). Stilarna ger fönstret ca 1070–1100. Samarbetena placerar honom mitt i Fot-kretsen: Fot själv, Ärnfast och Torgöt Fotsarve — den sena Täby/Vallentuna-miljön där Fots verkstad gick i arv.'),

  ('Grim skald',
   'Den andra av endast två uppländska ristare som signerar med titeln skald (den förste är Torbjörn skald; Källström 2007, s. 243). 8 stenar i databasen, varav 2 signerade: U 916 och U 951, båda i Uppsalatrakten. Verksamheten ligger i Ulleråkers (3), Rasbo (2) och Vaksala (2) härader — ett tätt område kring Uppsala. Stilarna ger fönstret ca 1020–1050. Samarbete i materialet: Käti. Skald-titeln antyder, liksom hos Torbjörn, en man som behärskade både vers och runor.'),

  ('-björn',
   'Fragmentnamn: signaturens början är skadad och endast efterleden "-björn" kan läsas. 7 stenar i databasen, samtliga i Sotholms härad på Södertörn, stilfönster ca 1010–1050. Handen är intimt knuten till Björn 2 — de delar stenar i materialet — och kan vara identisk med denne; utan signaturens förled går det inte att avgöra. Ett exempel på hur rundata redovisar skadade signaturer hellre än att gissa.'),

  ('Björn 2',
   '7 stenar i databasen, varav 1 signerad (Sö 241, Grödinge-trakten), samtliga i Sotholms härad på Södertörn — samma snäva område som fragmenthanden "-björn", som han delar stenar med och möjligen är identisk med. Stilfönster ca 1010–1050. En lokal Södertörnsverkstad, samtida med Halvdans men söder om dennes område.'),

  ('Litle',
   'Västmanlands mest gripbara ristarhand: 6 stenar i databasen, varav 2 signerade (Vs 20 och Vs 27), spridda över Norrbo, Vangsbro och Övertjurbo härader. Stilspannet ger det breda fönstret ca 1020–1130. Inga samarbeten belagda — i det stenfattigare Västmanland arbetade han ensam. Namnet (Litli, "den lille") är ett binamn.'),

  ('Harald',
   'Västgötsk ristare med ovanlig profil: samtliga 6 stenar i databasen är SIGNERADE (Vg 88, Vg 95, Vg 96, Vg 146, Vg 165) — ingen enda attribution. Verksamhet i Gudhems (3), Vartofta (2) och Ås (1) härader, kring Falbygden. Att hela korpusen är signerad skiljer honom från de uppländska mästarnas stora attribuerade produktioner och speglar Västergötlands annorlunda runstenskultur, där stilattribution sällan är möjlig (stenarna saknar Gräslund-ornamentikens dateringsgrund).'),

  ('Östen 1',
   'Sörmländsk hand med hög signaturandel: 7 stenar i databasen, varav 5 signerade — däribland sviten Sö 311, Sö 312 och Sö 313, hällristningarna vid den forna vägen genom Södertälje-trakten, samt Sö 344. Verksamhet i Öknebo härad med utlöpare mot Färentuna. Stilarna ger fönstret ca 1050–1100. Vägmonumenten ("gjorde bron") gör honom till ett exempel på ristare knutna till brobyggen och vägförbättringar — fromhetsgärningar under mission­stiden.'),

  ('Östen 2',
   '4 stenar i databasen, varav 1 signerad (U 590). Spridd verksamhet över Lyhundra, Närdinghundra och Sotholms härader — ovanligt utspritt för en liten korpus, över både Uppland och Södermanland. Stilfönster ca 1020–1080. Rundata skiljer denna hand från den sörmländske Östen 1 (Södertälje-hällarna).')

) as d(name, descr)
where carvers.name = d.name
  and (carvers.description is null or carvers.description = '');

commit;
