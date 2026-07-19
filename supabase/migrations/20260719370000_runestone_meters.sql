-- ============================================================================
-- Versform (meter) på versbärande vikingatida runstenar.
--
-- Syfte: sätta `runic_inscriptions.meter` på den VÄLETABLERADE korpusen av
-- runstenar vars text bär vers, så att distinktionen skaldiskt (dróttkvätt) /
-- eddiskt (fornyrðislag m.fl.) / prosa blir sökbar. Migrationen är IDEMPOTENT:
-- varje UPDATE har `and meter is null`, så redan satta stenar rörs inte.
--
-- REDAN SATTA (rörs EJ av denna migration):
--   Öl 1  Karlevi  = 'dróttkvätt'   (enda fullständiga dróttkvätt-strofen på runsten)
--   Ög 136 Rök     = 'fornyrðislag' (eddisk hjältemetrik)
--   — se 20260719360000_inscription_meter_field.sql
--
-- METODPRINCIP (forskningsplattform): meter sätts ENDAST där versformen är
-- väletablerad i publicerad forskning. Alla satta stenar nedan har ett explicit
-- metriskt påstående ("in fornyrðislag") i Rundata-baserad litteratur; tveksamma
-- och omdiskuterade fall är UTELÄMNADE (se lista längst ned). Samtliga satta
-- stenar är verifierade att finnas i DB (signum-match mot runic_inscriptions).
--
-- ----------------------------------------------------------------------------
-- KORPUS SOM SÄTTS  (samtliga = fornyrðislag, eddisk metrik)
-- ----------------------------------------------------------------------------
--  signum | namn        | meter        | källa
-- --------+-------------+--------------+-----------------------------------------
--  Ög 81  | Högby       | fornyrðislag | Rundata / Wikipedia "Runestones of Högby":
--         |             |              |   femsonaepitafiet är i fornyrðislag.
--  Sö 56  | Fyrby       | fornyrðislag | Rundata / Wikipedia "Fyrby Runestone":
--         |             |              |   "can be read as an alliterative verse,
--         |             |              |   specifically in fornyrðislag metre".
--  Sö 106 | Kjula       | fornyrðislag | Rundata / Wikipedia "Viking runestones":
--         |             |              |   Spjóts krigarstrof "in the metre fornyrðislag".
--  Sö 130 | Fagerlöt    | fornyrðislag | Rundata / Wikipedia "Varangian runestones":
--         |             |              |   "composed in fornyrðislag" (folksgrimmʀ).
--  Sö 131 | Lundby      | fornyrðislag | Rundata / Wikipedia "Ingvar runestones":
--         |             |              |   sista partiet "an alliterative poem …
--         |             |              |   well known from Old West Norse poetry".
--  Sö 171 | Esta        | fornyrðislag | Rundata / Wikipedia "Varangian runestones":
--         |             |              |   "The second half … is in the fornyrðislag meter".
--  Sö 179 | Gripsholm   | fornyrðislag | Rundata / Wikipedia "Ingvar runestones":
--         |             |              |   "in alliterative verse of the form fornyrðislag"
--         |             |              |   ("Fóru drengila / fjarri at gulli …").
--  Sö 338 | Turinge     | fornyrðislag | Rundata / Wikipedia "Varangian runestones":
--         |             |              |   andra satsen "in the meter fornyrðislag".
--  U 225  | Bällsta     | fornyrðislag | RAÄ (raa.se) / Rundata: merparten av de två
--         |             |              |   Bällstastenarnas text "är i versform,
--         |             |              |   närmare bestämt fornyrðislag".
--  U 226  | Bällsta     | fornyrðislag | Samma monument — versen löper från U 225
--         |             |              |   in på U 226 ("Æ mun standa / meðan …").
--  DR 295 | Hällestad 1 | fornyrðislag | Wikipedia "Old Norse poetry": "Part of the
--         |             |              |   Hällestad inscription is in the traditional
--         |             |              |   Old Norse poetic metre fornyrðislag"
--         |             |              |   ("saʀ flo æigi at Upsalum").
--  DR 279 | Sjörup      | fornyrðislag | Bär samma versformel som DR 295 ("han flo æigi
--         |             |              |   at Upsalum, æn wa maþ han wapn hafði");
--         |             |              |   behandlas som fornyrðislag-vers i Hällestad–
--         |             |              |   Sjörup-gruppen (Jesch 2001; Marold).
--
-- Inga NYA dróttkvätt-stenar sätts: Öl 1 Karlevi förblir det enda entydiga
-- skaldiska (dróttkvätt) exemplet i korpusen.
--
-- ----------------------------------------------------------------------------
-- ÖVERGRIPANDE KÄLLOR
-- ----------------------------------------------------------------------------
--   - Rundata (Samnordisk runtextdatabas) — grundläggande signum + metrikbedömning.
--   - Judith Jesch, "Ships and Men in the Late Viking Age: The Vocabulary of Runic
--     Inscriptions and Skaldic Verse" (2001).
--   - Frank Hübler, "Schwedische Runendichtung der Wikingerzeit" (Runrön 10, 1996)
--     — korpuseditionen av svensk runvers.
--   - Edith Marold, "Runeninschriften als Quellen zur Geschichte der Skaldendichtung"
--     (1998), "Formen runischer Dichtung" (2010).
--   - American Association for Runic Studies, "Verse on Runestones"
--     (runicstudies.org/verse-on-runestones/).
--   - Skaldic Project / Skaldic Poetry of the Scandinavian Middle Ages (skaldic.org),
--     avd. Runic Poetry.
--
-- ----------------------------------------------------------------------------
-- POLITISK KONTEXT (varför vers?)
-- ----------------------------------------------------------------------------
-- Vers på sten är dyr, sällsynt och elitär — den är maktens och stormannaättens
-- självframställning, inte vardagsminne. Mönstret i korpusen är talande:
--   - Hällestad (DR 295) & Sjörup (DR 279): Toke Gormssons hird; versformeln
--     "flydde icke vid Uppsala" hyllar stupade i slaget på Fýrisvellir — en
--     krigararistokratis heroiska minneskultur.
--   - Bällsta (U 225–226): uppländska stormän reser vers + rest stav vid en
--     tingsplats (þing) — versen inramar politisk-juridisk makt över platsen.
--   - Ingvarståget (Sö 179 Gripsholm, Sö 131, Sö 130 Fagerlöt m.fl.): vers
--     monumentaliserar en misslyckad men prestigefylld österledsexpedition.
--   - Jelling (DR 41/42) är kungligt men UTELÄMNAD (se nedan): dess text räknas
--     oftast som retorisk formelprosa, inte strikt strofisk vers.
--
-- ----------------------------------------------------------------------------
-- UTELÄMNADE (meter sätts EJ) — och varför
-- ----------------------------------------------------------------------------
--   - DR 42 (stora Jellingstenen) & DR 41 (lilla): kungligt monument, men texten
--     räknas i allmänhet som retorisk/formelprosa — ej strikt vers. OMDISKUTERAD.
--   - DR 296, DR 297 (Hällestad 2–3): bär hemþægi-formelprosa ("N, Tokes hemþegi");
--     själva versen sitter enbart på DR 295.
--   - Sö 173 (Tystberga): endast "skulle kunna tolkas som" fornyrðislag — för tentativ.
--   - Sö 254, Sö 281 (Ingvar): inget etablerat metriskt påstående.
--   - Sö 126: metrikuppgift ej säkert verifierbar i genomgången — utelämnad.
--   - N 68 (Dynna), N 61 (Alstad): versstatus ej bekräftad i konsulterade källor.
--   - Övriga kandidater utan belagd versform i denna genomgång (ej satta):
--     Vg 4, Vg 61, DR 40, DR 66, Sö 55, Sö 65, Sö 163, U 29, U 344, U 439,
--     U 654, U 240, U 793, Vs 19, Ög 8, Sm 42.
--   - Br Olsen;215: FANNS EJ i databasen (ingen rad att uppdatera).
--
-- Alla ovan kan sättas i en framtida migration om explicit metrisk källa säkras.
-- ============================================================================

begin;

-- Östergötland
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Ög 81'  and meter is null;  -- Högby

-- Södermanland
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 56'  and meter is null;  -- Fyrby
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 106' and meter is null;  -- Kjula
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 130' and meter is null;  -- Fagerlöt
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 131' and meter is null;  -- Lundby
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 171' and meter is null;  -- Esta
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 179' and meter is null;  -- Gripsholm
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'Sö 338' and meter is null;  -- Turinge

-- Uppland (Bällsta-monumentet, U 225 + U 226)
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'U 225'  and meter is null;  -- Bällsta
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'U 226'  and meter is null;  -- Bällsta

-- Skåne / Danmark (Fýrisvellir-gruppen)
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'DR 295' and meter is null;  -- Hällestad 1
update public.runic_inscriptions set meter = 'fornyrðislag' where signum = 'DR 279' and meter is null;  -- Sjörup

commit;
