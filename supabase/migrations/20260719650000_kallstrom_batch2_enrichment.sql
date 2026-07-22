-- Källström-berikning batch 2 (PDF-genomgång 2026-07-19, sidref per uppgift).
-- Ersätter dagens databas-härledda texter med versioner som även bär Källströms rön;
-- Ingulv + Hägvid (fanns i DB under dessa stavningar — "Ingulf"/"Högvid" i förfrågan)
-- får nya beskrivningar. Harald behandlas EJ av Källström (tidigmedeltida Vg,
-- utanför korpus) — noteras ärligt.

begin;

update public.carvers set description = d.descr,
  source_ref = 'databasens graf (rundata 2020-11-29) + Källström 2007 med sidref'
from (values

  ('Ingulv',
   'Etablerad uppländsk ristare i gruppen strax norr om Uppsala (med Gudfast, Kjule och Likbjörn; Källström 2007, s. 213 not 225). Signerade: U 929 vid Uppsala domkyrka (Pr 4?), U 1041 Golvasta (Pr 3–4 — omtalar flera stenar, följs av "Hagbarðr gærði bró", och signaturens objekt är ristat med vändrunor, s. 176), U 1052 Axlunda (Pr 4) och den förkortade signaturen U 1075† (typ D, ett av de säkra exemplen på ensamstående ristarnamn, s. 126). U 1052 bär dubbelsignaturen "IngulfR hiogg stæin. Þialfi hiogg stæin" i en slinga som följer skeppsbildens skrov — Tjälve bär samma namn som en av resarna, och Källström ser här ett möjligt belägg för att en beställare kunnat bistå ristaren i själva huggningen (s. 249, 301). U 1097 förs "snarare" till Ingulv än till Gudfast (s. 273 not 292). Verbväxlare: rísta och haggva om vartannat (s. 151).'),

  ('Hägvid',
   'Ristaren av Blista-hällen i Sorunda (Sotholms härad): Sö 219, "Hægviðr gærði stæin" (Pr 3) — Källströms nyckelexempel på att gær(v)a + stæin är en otvetydig ristarsignatur: i fast berghäll kan "gjorde stenen" inte avse annat än inhuggningen, och detta är den enda vikingatida ristarformeln med objektet stæin i fast häll (2007, s. 54, 89, 156). I samma häll finns Sö 220 och Sö 221, enligt Wessén utförda av samme man (s. 89, 364) — databasens tre signerade kanter speglar exakt detta. Samma härad som Björn (Sö 241) och Amunde.'),

  ('Grim skald',
   'Den andra av rikets två skald-ristare (fyra belägg av titeln, två bärare: Torbjörn skald och Grim; skald är det bäst styrkta sysselsättningsattributet bland ristarnamn — men ingen av texterna innehåller versifierat parti; Källström 2007, s. 236, 243). Säker signatur: U 951 Säby, "GrímR skald hió" (Kb/Pr 2) — en av endast tre uppländska korsbandsstenar (s. 67 not 35), vilket gör honom till en tidig generation. U 916 Ängeby förs till samma hand på Wesséns ornamentikbedömning; Källströms egen granskning 2006 öppnar för en PLURAL ristarformel — "Gialli(?) ... [och Grim?] skald höggo" (s. 393–394; jfr Brates "Käti och Grim skald höggo ock båda" — databasens Käti-samarbete). Spridningshistoriskt viktig: hör till gruppen kring Sigtuna-Torbjörn och Ulvkell (med Äsbjörn 2 och Brand) som talar för att runstenstraditionen nådde centrala Uppland från TVÅ håll — Sigtuna söderifrån, Åsmund norrifrån (s. 296–297, fig. 26). Verksamhet i Ulleråkers, Rasbo och Vaksala härader, fönster ca 1020–1050.'),

  ('Olev',
   'Täby/Danderyds-ristare. Källström räknar två signaturer: U 145 Hagby-hällen ("ÓlæifR hiogg", Pr 4) och den försvunna U 162† Skogberga — båda med verbet haggva, konsekvent oavsett monumenttyp (2007, s. 151–152, 372–373). U 145 hör till de nio inskrifterna med formeln haggva + hælli, vars uppländska belägg koncentreras kring Sollentuna–Danderyd (s. 142 not 134, 248). Den äldre attributionen av U 11 Hovgården till "Torgöt Fotsarve eller Olev" avfärdar Källström som "av allt att döma felaktig" (s. 251 not 272). Databasen bär därutöver rundatas attributioner (8 stenar totalt, Sollentuna härad 5) och samarbetskanter i Fot-kretsen (Fot, Ärnfast, Torgöt Fotsarve) — stilfönster ca 1070–1100.'),

  ('Björn 2',
   '7 stenar i databasen, samtliga i Sotholms härad på Södertörn, varav Sö 241 Skogs-Ekeby signerad: "...biôrn hiogg stæin" (Fp). Länge lästes signaturen som skadad ("-björn"), men släpljusundersökning 2007 (Wikell) visade inga spår av runor före namnet — "fullt möjligt att namnet har varit det enkla Biôrn" (Källström 2007, s. 365). Källströms säkra Björn-händer är annars Nolinge-Björn (Sö Fv1954;20, Grödinge — där resaren själv ristade, s. 249) och den Björn som möjligen var Öpirs medristare på U 993 (s. 186, 427). Stilfönster ca 1010–1050; en lokal Södertörnsverkstad, delar stenar med fragmenthanden "-björn" och är möjligen identisk med den.'),

  ('-björn',
   'Fragmentnamn: rundata redovisar en hand vars signaturförled inte kunnat läsas — 7 stenar i databasen, samtliga i Sotholms härad, stilfönster ca 1010–1050, med delade stenar med Björn 2. Notera att förlusten kan vara skenbar: på huvudstenen Sö 241 visade släpljusundersökning 2007 att inga runor saknas före "biarn" — namnet kan ha varit det enkla Biôrn (Källström 2007, s. 365). Händerna "-björn" och Björn 2 är därmed möjligen en och samma; rundatas försiktiga uppdelning bevaras här i väntan på säkrare grund.'),

  ('Litle',
   'Västmanlands mest gripbara ristarhand — en av få lokala ristare utanför Uppland med mer än en signerad sten (Källström 2007, s. 150). Signerade Vs 20 Romfartuna ("Litli rísti rúniR" — Källströms typexempel på ristarformel B, med signaturen placerad I KORSET, ett av endast tio vikingatida exempel; s. 115, 173 not 182) och Vs 27 Grällsta. Stilbestämningarna spretar anmärkningsvärt: Vs 20 Pr 2(?), Vs 27 Pr 5(?) med närmast romansk prägel på rundjurshuvudet — "det rimligaste är väl att någon av dessa är felaktig", och parallellen till Livstens U 1171 gör det "troligt att Litle är en relativt sen ristare" (s. 73–74). Namnet Litli, "den lille", är ett binamn (s. 240). Inga samarbeten belagda.'),

  ('Harald',
   'Västgötsk ristare med ovanlig profil: samtliga 6 stenar i databasen är SIGNERADE (Vg 88, Vg 95, Vg 96, Vg 146, Vg 165) — ingen enda attribution. Verksamhet i Gudhems (3), Vartofta (2) och Ås (1) härader kring Falbygden. Behandlas inte av Källström 2007, vars korpus är de vikingatida ristarformlerna — Haralds tidigmedeltida västgötska produktion (liljestenarnas tid) faller utanför. Att hela korpusen är signerad speglar Västergötlands annorlunda runstenskultur, där Gräslund-ornamentikens dateringsgrund saknas.'),

  ('Östen 1',
   'Södertälje-hällarnas ristare. På Sö 312 vid gamla Turingevägen står Holmfasts väg- och broformel följd av det ensamma namnet "Øystæinn" — Källströms definitionsexempel på formeltyp D, den förkortade ristarsignaturen: avståndet till resarformeln (relativsats + böneformel emellan) "borde snarare tyda på att namnet motsvarar en förkortad ristarsignatur" (2007, s. 55–56, 126–127). Sö 311 och Sö 313 i samma häll är "sannolikt utförda av samme ristare" (s. 366). Databasen: 7 stenar, 5 signerade, Öknebo härad med utlöpare mot Färentuna, stil Pr 4 (ca 1050–1100). Vägmonumenten ("ryddade brott och gjorde bro") knyter handen till missionstidens fromhetsgärningar. (Sö 344 bär rundatas attribution; den behandlas inte av Källström.)'),

  ('Östen 2',
   'Hand känd genom U 590 Burvik (Knutby): det ensamma "* ustain *" läser Källström som förkortad ristarsignatur, typ D — Stilles alternativ (ackusativobjekt eller beställare) avvisas på frånvaron av preposition respektive konjunktion (2007, s. 128). Stil Pr 3?, databasens fönster ca 1020–1080; 4 stenar över Lyhundra, Närdinghundra och Sotholms härader. Om denne Östen är samma person som Södertälje-hällarnas (Östen 1) diskuteras inte av Källström; rundata skiljer händerna och databasen följer det.')

) as d(name, descr)
where carvers.name = d.name;

commit;
