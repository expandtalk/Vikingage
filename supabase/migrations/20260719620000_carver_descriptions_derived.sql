-- Ristarbeskrivningar HÄRLEDDA ur plattformens egen graf (P1 gazetteer + P2 kanter +
-- P3 stilvokabulär). Inga påhittade uppgifter: varje siffra kommer ur carved_by-kanterna
-- (rundata 2020-11-29 + kurering), häradsfördelningen ur parish_id-FK:n, dateringsfönstren
-- ur Gräslund-stilarnas TPQ/TAQ. Uppdaterar ENDAST rader som saknar beskrivning.
-- Rundatas numrering (Fot 2, Äskil 1...) skiljer olika HÄNDER med samma namn — bevaras.

begin;

update public.carvers set description = d.descr,
  source_ref = coalesce(source_ref, 'härledd ur databasens graf (rundata 2020-11-29)')
from (values

  ('Fot 2',
   'En av Upplands mest produktiva runmästare: 79 stenar i databasen, varav 9 signerade (bl.a. U 167, U 177, U 267, U 268, U 464, U 605) och 70 attribuerade. Verksamheten är starkt koncentrerad till sydöstra Uppland — Vallentuna härad (18 stenar), Ärlinghundra (12) och Danderyds skeppslag (9). Stilspannet Rak till Pr 4 ger ett dateringsfönster ca 980–1100, med tyngdpunkt i Pr 2–Pr 3 (ca 1020–1080). Databasen knyter honom till fler samarbeten än någon annan i materialet: 14 medristare, däribland Visäte, Olev, Önjut och Torgöt Fotsarve — vars tillnamn ("Fots arvinge") antyder att verkstaden gick i arv. "Fot 2" är rundatas numrering; posten "Fot" med en likhets-attribution avser sannolikt samma hand.'),

  ('Gunnar',
   '43 stenar i databasen, varav 2 signerade (U 225 och U 226 — de båda stenarna vid Arkils tingstad i Vallentuna) och 41 attribuerade. Verksamheten ligger i Seminghundra härad (13), Vallentuna härad (12) och Långhundra härad (4) — ett sammanhängande arbetsområde längs Långhundraledens omland. Stilarna Rak–Pr 2 ger fönstret ca 980–1050, dvs. en av de tidigare uppländska mästarna. Samarbeten i materialet: Fot 2, Torbjörn 2 och Ulv i Borresta.'),

  ('Traen',
   'Sörmländsk runmästare med 22 stenar i databasen, samtliga attribuerade — ingen bevarad signatur. Verksamheten är tydligt koncentrerad till Rönö härad (12 stenar) med utlöpare i Öknebo (4) och Daga (2). Stilspannet Rak/Fp–Pr 2 ger fönstret ca 980–1050. Att en så sammanhållen produktion saknar signatur gör Traen till ett skolexempel på attribution genom stil- och ortografijämförelse.'),

  ('Torbjörn 2',
   '21 stenar i databasen, varav 3 signerade (U 379, U 391, U 467) och 18 attribuerade. Tyngdpunkt i Ärlinghundra härad (6) och Åsunda härad (4). Det ovanligt breda stilspannet Rak–Pr 3 (ca 980–1080) och samarbetena med Gunnar och Torbjörn skald antyder lång verksamhet. Obs: rundata skiljer fyra händer med namnet Torbjörn; U 379 förekommer även i Torbjörn skalds signerade material — gränsdragningen mellan händerna är omdiskuterad.'),

  ('Halvdan',
   'Sörmländsk mästare med 18 stenar i databasen, varav 1 signerad (Sö 270, Tyresta) och 17 attribuerade. Verksamheten ligger så gott som helt på Södertörn: Sotholms härad (12) och Svartlösa härad (5). Stilspannet Pr 1–Pr 4 ger fönstret ca 1010–1100. Inga samarbeten med andra namngivna ristare är belagda i materialet — en självständig lokal verkstad.'),

  ('Arbjörn',
   '18 stenar i databasen, varav 3 signerade (U 652, U 682, U 688) och 15 attribuerade. Verksamheten är koncentrerad till Håbo härad (11 stenar) med utlöpare i Hagunda (3) och Lagunda (2) — sydvästra Uppland kring Mälarens vikar. Stilspannet Pr 1–Pr 3 ger fönstret ca 1010–1080. Inga belagda samarbeten i materialet.'),

  ('Torfast',
   '16 stenar i databasen, varav 3 signerade (U 599, U 629 samt Uppsala 1158) och 13 attribuerade. Spridd verksamhet i Ärlinghundra (4), Lyhundra (2) och Seminghundra (2) härader. Stilarna Pr 2–Pr 4 ger fönstret ca 1020–1100. Samarbetena i databasen är anmärkningsvärda: Åsmund (Kåresson), Livsten och Torbjörn skald — Torfast rörde sig alltså i kretsen kring 1000-talets främsta uppländska mästare.'),

  ('Önjut',
   '16 stenar i databasen, varav 1 signerad — Gs 1 i Gästrikland — och 15 attribuerade. Verksamheten spänner ovanligt nog över två landskap: norra Uppland (Rasbo 3, Frösåkers 2, Bälinge 2 härader) och Gästrikland. Stilarna Pr 4–Pr 5 ger fönstret ca 1070–1130 — en av de sena mästarna, verksam in i tidig medeltid. Samarbeten i materialet: bl.a. Öpir och Fot 2, vilket placerar honom i den sena Uppsala-kretsen.'),

  ('Äskil 1',
   'Sörmländsk hand med 4 stenar i databasen, varav 1 signerad (Sö 333, Ärja ödekyrka) i Selebo/Åkers härader. Fp-stil, fönster ca 1010–1050. Samarbeten: Äsger och Fot 1. Rundata skiljer denna hand från den uppländske Äskil 2.'),

  ('Äskil 2',
   'Uppländsk hand med 12 stenar i databasen, varav 1 signerad (U 778, Svinnegarns kyrka — en av Ingvarstågets stenar: "Han for österut med Ingvar") och 11 attribuerade. Verksamhet i Lagunda (4), Håbo (2) och Rasbo (2) härader. Stilarna Fp–Pr 1 ger fönstret ca 1010–1050 — samtida med Ingvarståget. Samarbeten: Alrik och Erik.'),

  ('Jakob Rød',
   'Dansk medeltida stenmästare med 12 verk i databasen, samtliga attribuerade och samtliga på Fyn: Sallinge herred (4), Sunds herred (3) och Gudme herred (2). Att verken bär DR-signum och saknar vikingatida stilattribution markerar att detta är en romansk/medeltida verkstad — en påminnelse om att runbruket levde vidare efter vikingatiden. (Namnformen "Jakob Rød" följer rundata.)')

) as d(name, descr)
where carvers.name = d.name
  and (carvers.description is null or carvers.description = '');

commit;
