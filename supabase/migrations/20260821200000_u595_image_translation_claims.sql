-- U 595 (Harg 114:1 / L1943:914) — fyll bild- + översättningsluckan och lägg konkurrerande
-- bildtolkningar som interpretation_claims. Underlag: runolog "Rybe" + kulturgeograf "Gudrun"
-- (session 637e88f1), falsifiering-först. Belagt/hypotes/obelagt märkt per claim.
--   Bild: Wikimedia Commons "Upplands runinskrifter 595.png" = CC0 (Iwar Anderson, via RAÄ Runor). Får rehostas/länkas.
--   Översättning: sv. återgivning efter normaliseringen (grundtext = PD). Ambiguiteten (arfaʀ; "hans moder") bevarad.
--   Claims: huvuddebatten är rökelsekar vs klockgjutning (båda kristna); larm/måltid = svaga, obelagda.

update public.runic_inscriptions
set rundata_image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/34/Upplands_runinskrifter_595.png',
    translation_sv    = 'Gudlev och Sigvid, Aldulvs arvingar(?), lät hugga stenen efter sin fader och Sigborg, hans moder.'
where signum = 'U 595';

-- idempotent: rensa ev. tidigare U 595-claims från denna befordran innan ny insert
delete from public.interpretation_claim
where inscription_id = 'ed654f4a-9d7a-45e5-920f-0edc612c4638'
  and proposed_by_agent like 'runolog Rybe%';

insert into public.interpretation_claim
  (inscription_id, part_key, translation, scholar_name, year, source, status, confidence, note, proposed_by_agent, machine_verifiable)
values
  -- Övergripande tolkningsram (starkast)
  ('ed654f4a-9d7a-45e5-920f-0edc612c4638', 'tolkningsram',
   'Scenen är kristen/kyrklig: klockstapel med klockringning.',
   null, null,
   'sv. Wikipedia U 595; runinskrifter.net (von Friesen 1928/1933; H. Williams 1996)',
   'etablerad', 0.80,
   'Kristen ram stöds av datering 1100–1150, Gräslund-stil Pr3, två kors och minnesformel efter avlidna föräldrar. U 595 räknas som en av Sveriges äldsta avbildningar av klockhus/kyrkobyggnad. Huvuddebatten gäller det burna föremålet: rökelsekar vs klockgjutning.',
   'runolog Rybe + kulturgeograf Gudrun (session 637e88f1)', false),

  -- (A) Rökelsekar
  ('ed654f4a-9d7a-45e5-920f-0edc612c4638', 'burna_föremålet',
   'Det ovala föremålet buret på stång är ett rökelsekar (censer).',
   null, null,
   'sv. Wikipedia U 595; runinskrifter.net',
   'omstridd', 0.40,
   'En av de två tolkningar som faktiskt cirkulerar i litteraturen. Inom kristen ram. Exakt upphovsperson obelagd (kräver Wessén–Jansson SRI Bd 7 s. 493 ff. i original).',
   'runolog Rybe + kulturgeograf Gudrun (session 637e88f1)', false),

  -- (B) Klockgjutning
  ('ed654f4a-9d7a-45e5-920f-0edc612c4638', 'burna_föremålet',
   'Scenen visar gjutning av en kyrkklocka (klockgjutning).',
   null, null,
   'sv. Wikipedia U 595; runinskrifter.net',
   'omstridd', 0.40,
   'Den andra etablerade tolkningen. Inom kristen ram. Föremålet beskrivs som ovalt och buret över eld — passar gjutform. Exakt upphovsperson obelagd.',
   'runolog Rybe + kulturgeograf Gudrun (session 637e88f1)', false),

  -- (D) Måltid / gravöl (arvöl) — svag
  ('ed654f4a-9d7a-45e5-920f-0edc612c4638', 'burna_föremålet',
   'Kärlet över eld är matlagning/ölbryggning till gravöl (arvöl).',
   null, null,
   'Frågehypotes (Daniel L.); ingen forskningskälla läser scenen så',
   'forkastad', 0.15,
   'Textkrok: sönerna kallas arfaʀ ("arvingar") och arvöl var belagd sed. Men det ovala buret-över-eld-föremålet passar rökelsekar/klocka bättre än kokkittel, och ett hedniskt gravölsmotiv skaver mot en korsförsedd kristen minnessten. Låg konfidens.',
   'runolog Rybe + kulturgeograf Gudrun (session 637e88f1)', false),

  -- (C) Larm / vådakase — förkastad
  ('ed654f4a-9d7a-45e5-920f-0edc612c4638', 'burna_föremålet',
   'Scenen avbildar larm/vådakase (signalering av fara).',
   null, null,
   'Frågehypotes (Daniel L.); inget forskningsstöd',
   'forkastad', 0.10,
   'Förkastas som primär läsning. Ikonografi: en vårdkase är en eldstapel/båk, inte ett föremål man håller ÖVER eld; klocka-i-byggnad läses som kyrkklocka, ej larmklocka; ingen koppling till föräldraminnet. Landskapet (Roslagens skeppslags-/vårdkasegeografi, RAÄ-vårdkase 4 km NÖ) är förenligt men bekräftar inte: vårdkasarna är odaterade/tidigmoderna och kan ej föras till 1100. CIRKULARITETSVARNING (Gudrun): traditionsnamnet "Truppmöte/Kråkmötet" 560 m bort kan ha uppstått i sen tid just för att man såg stenens bild — då är traditionen en effekt av bilden, ej oberoende evidens.',
   'runolog Rybe + kulturgeograf Gudrun (session 637e88f1)', false);
