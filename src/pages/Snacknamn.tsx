import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ship } from 'lucide-react';

// /sv/snacknamn (en: /en/snack-names) — begreppssida om SNÄCK-ortnamn (snäckhamnar).
// KÄLLKRITISK: varje sektion märks belagt/omtvistat/hypotes; sägen skiljs från fakta.
// Kärnvarning: helhetstesen "snäck = vikingatidens ledungskarta" är OMTVISTAD/OBELAGD;
// belagt endast för enskilda, väl underbyggda namn. Rätt författare: INGEMAR Olsson 1972
// (ej Gunnar). Ingrid Sanness Johnsen kunde EJ beläggas för snäck-namn. Av 38 snäck-namn
// i plattformens DB är flera inlandsnamn utan hamnkoppling och saknar attesteringsår.
// INGEN KARTA: en karta som utger sig för ledungskarta vore missvisande (se texten).
// Underlag: filolog-agent 2026-08-16 (scratch-snackor.md), människa-i-loopen.

type StatusKind = 'belagt' | 'omtvistat' | 'hypotes';
const STAT: Record<StatusKind, { c: string; sv: string; en: string }> = {
  belagt: { c: '#22c55e', sv: 'Belagt', en: 'Attested' },
  omtvistat: { c: '#f59e0b', sv: 'Omtvistat', en: 'Disputed' },
  hypotes: { c: '#a855f7', sv: 'Hypotes', en: 'Hypothesis' },
};
const Stat: React.FC<{ k: StatusKind; sv: boolean }> = ({ k, sv }) => {
  const m = STAT[k];
  return (
    <Badge variant="secondary" className="text-[10px] align-middle"
      style={{ backgroundColor: m.c + '22', color: m.c, borderColor: m.c + '55' }}>
      {sv ? m.sv : m.en}
    </Badge>
  );
};

// En begreppssektion med statusmärkning.
const Part: React.FC<{ title: string; k?: StatusKind; sv: boolean; children: React.ReactNode }> = ({ title, k, sv, children }) => (
  <section className="mb-5">
    <h2 className="text-lg font-semibold text-foreground mb-1.5 flex flex-wrap items-center gap-2">
      {title}{k && <Stat k={k} sv={sv} />}
    </h2>
    <div className="text-sm leading-relaxed text-muted-foreground space-y-2">{children}</div>
  </section>
);

const Snacknamn: React.FC = () => {
  const sv = !useLocation().pathname.toLowerCase().includes('snack-names');

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Snäck-ortnamn och snäckhamnar — källkritiskt granskade"
        titleEn="Snäck- place-names and ship harbours — source-critically reviewed"
        description="Snäck-namn som spår av skepp och sjöförsvar i landskapet: ledet snækkia 'krigsskepp', Ingemar Olssons Gotlandsstudie 1972, hundare/härad och ledung — och varför helhetstesen 'vikingatidens ledungskarta' är omtvistad."
        descriptionEn="Snäck- place-names as traces of ships and naval defence: the element snækkia 'warship', Ingemar Olsson's 1972 Gotland study, the levy (ledung) and hundare/härad — and why the sweeping 'Viking-Age levy map' reading is disputed."
        keywords="snäck-namn, snäckhamn, snækkia, ledung, hundare, härad, Ingemar Olsson, Gotland, ortnamn, snäckstavik, snäckevarp, ledungsflotta"
        path={sv ? '/sv/snacknamn' : '/en/snack-names'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Ship className="h-8 w-8 text-gold" aria-hidden="true" />
            {sv ? 'Snäck-ortnamn och snäckhamnar' : 'Snäck- place-names and ship harbours'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv
              ? 'Ledet snäck- · skepp och sjöförsvar i landskapet'
              : "The element snäck- · ships and naval defence in the landscape"}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {sv
              ? 'Snäck-namn hör till de mest lockande — och mest överansträngda — spåren i svensk ortnamnstolkning. Namnen kan spegla platser där ledungsskepp (snäckor) drogs upp och samlades. Men den lockande berättelsen om en färdig "ledungskarta" vilar på flera led som var för sig måste beläggas. Den här sidan håller isär belägg, tolkning och hypotes — och skiljer noga fakta från folketymologi.'
              : 'Snäck- place-names are among the most attractive — and most over-read — traces in Swedish onomastics. They can mark places where levy ships (snäckor) were hauled up and mustered. But the appealing story of a ready-made "levy map" rests on several links that must each be proven separately. This page keeps evidence, interpretation and hypothesis apart — and carefully separates fact from folk etymology.'}
          </p>
        </div>

        {/* Källkritisk kärnvarning */}
        <div className="mb-6 rounded-lg border border-amber-600/40 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {sv ? 'Varför den här sidan inte har någon karta' : 'Why this page has no map'}
          </p>
          <p className="text-sm text-muted-foreground">
            {sv
              ? 'En karta över alla snäck-namn skulle lätt läsas som en "karta över vikingatidens sjöförsvar". Det vore missvisande. Att snäck-namn i allmänhet skulle utgöra en karta över en centraliserad, kunglig ledungsorganisation är omtvistat och som helhet obelagt — dels på grund av homonymi (ledet kan betyda djuret, terräng, ett personnamn eller ett skeppsliknande monument), dels för att attesteringsåren i regel är högmedeltida även när namnet är äldre. Sidan är därför en begreppssida, inte en karta. Enskilda, väl underbyggda platser (topografi + hamn-pekande efterled + helst arkeologi) kan visas på karta var för sig — men aldrig ledet ensamt.'
              : 'A map of every snäck- name would easily be read as a "map of Viking-Age naval defence". That would be misleading. The claim that snäck- names in general form a map of a centralised royal levy organisation is disputed and, as a whole, unproven — partly because of homonymy (the element can mean the mollusc, terrain, a personal name or a ship-shaped monument), partly because first attestations are usually high-medieval even when the name is older. This is therefore a concept page, not a map. Individual, well-supported sites (topography + a harbour-pointing final element + preferably archaeology) may each be mapped on their own — but never the element alone.'}
          </p>
        </div>

        <Part title={sv ? '1. Källkritisk ram (läs först)' : '1. Source-critical frame (read first)'} sv={sv}>
          <p>{sv
            ? 'Den attraktiva berättelsen (snäck-namn = karta över vikingatidens sjöförsvar) bygger på tre led som var för sig måste beläggas och som inte följer automatiskt av varandra:'
            : 'The appealing story (snäck- names = a map of Viking-Age naval defence) rests on three links that must each be proven and do not follow automatically from one another:'}</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>{sv
              ? "att ledet verkligen är fornsvenska snækkia 'krigsskepp' (och inte djuret snäcka, terräng eller ett personnamn),"
              : "that the element really is Old Swedish snækkia 'warship' (and not the mollusc, terrain or a personal name),"}</li>
            <li>{sv
              ? 'att platsen faktiskt var en skeppshamn/uppläggningsplats,'
              : 'that the site really was a ship harbour / haul-up place,'}</li>
            <li>{sv
              ? 'att hamnen ingick i en organiserad ledung knuten till centralmakt.'
              : 'that the harbour belonged to an organised levy (ledung) tied to central power.'}</li>
          </ol>
          <p>{sv
            ? 'Var och en är en separat prövning. Att kedjan är plausibel gör den inte belagd. Läs mer om ledungen och distriktsindelningen hundare/härad i anslutning till denna sida.'
            : 'Each is a separate test. That the chain is plausible does not make it attested. See the related notes on the levy (ledung) and the hundare/härad district division.'}</p>
        </Part>

        <Part title={sv ? '2. Ledet snäck- — ord och etymologi' : '2. The element snäck- — word and etymology'} k="belagt" sv={sv}>
          <p>{sv
            ? "Fornsvenska snækkia (fem.) = 'långskepp, krigsfartyg'; i lagspråket specifikt \"krigsfartyg som det åligger ett härad att bygga och utrusta\" (Söderwall). Fornvästnordiska (isländska) snekkja = ett slags krigsskepp av långskeppstyp (Fritzner). Forndanska snekke är först skriftligt belagt 1224, där man skiljer snekke från kogge (lex.dk); ordet är dock äldre i talspråket. Grundbetydelsen 'smalt, snabbt roddar-/segelfartyg i ledungsflottan' är gemensam nordisk."
            : "Old Swedish snækkia (fem.) = 'longship, warship'; in legal usage specifically \"a warship a härad is obliged to build and equip\" (Söderwall). Old West Norse (Icelandic) snekkja = a warship of longship type (Fritzner). Old Danish snekke is first attested in writing in 1224, distinguished from kogge (lex.dk); the word is older in speech. The core sense 'slim, fast oar-/sail vessel in the levy fleet' is common Nordic."}</p>
          <p>{sv
            ? "Viktig avgränsning: ordet snäcka 'mollusk/snäckskal' och ledet snäck- 'krigsskepp' är i modern form homografa. Vid varje enskilt namn måste betydelsen avgöras — inte antas (se §7)."
            : "Important caveat: the word snäcka 'mollusc/shell' and the element snäck- 'warship' are homographic in modern form. For each individual name the meaning must be decided, not assumed (see §7)."}</p>
        </Part>

        <Part title={sv ? '3. Tolkningen "snäckhamn" = uppläggningsplats' : '3. The "snäck harbour" = haul-up place reading'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Grundtolkningen: ett snäck-namn vid vatten kan markera en plats där snäckor (ledungsskepp) drogs upp, förvarades eller samlades — en naturlig, skyddad vik lämplig för att lägga upp fartyg. Detta är en etablerad tolkning inom nordisk namn- och ledungsforskning, men inte automatisk. Den är starkast där tre kriterier sammanfaller:'
            : 'The basic reading: a snäck- name by water may mark a place where snäckor (levy ships) were hauled up, stored or mustered — a natural, sheltered bay suited to laying up vessels. This is an established reading in Nordic name and levy research, but it is not automatic. It is strongest where three criteria coincide:'}</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>{sv ? 'läge vid segelbart vatten / skyddad vik (topografi), och' : 'a location by navigable water / a sheltered bay (topography), and'}</li>
            <li>{sv ? 'ett efterled som pekar mot hamn/uppdragning (t.ex. -vik, -varp, -sta(d), -sund, -hus, -läge), och' : 'a final element pointing to a harbour/haul-up (e.g. -vik, -varp, -sta(d), -sund, -hus, -läge), and'}</li>
            <li>{sv ? 'helst arkeologiskt eller organisatoriskt stöd (husgrund/båtlämning, koppling till ledungsdistrikt).' : 'preferably archaeological or organisational support (a house foundation/boat remains, a link to a levy district).'}</li>
          </ul>
          <p>{sv
            ? 'Där bara ledet snäck- finns, utan vatten och utan efterled som pekar mot hamn, är hamntolkningen svag.'
            : 'Where only the element snäck- is present, without water and without a harbour-pointing final element, the harbour reading is weak.'}</p>
        </Part>

        <Part title={sv ? '4. Gotland — Ingemar Olsson 1972' : '4. Gotland — Ingemar Olsson 1972'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Referens (verifierad fulltext): Ingemar Olsson, "Snäck-namn på Gotland", Fornvännen 67 (1972), s. 180–208 (DiVA diva2:1225094). OBS: författaren är Ingemar Olsson — inte "Gunnar Olsson".'
            : 'Reference (verified full text): Ingemar Olsson, "Snäck-namn på Gotland", Fornvännen 67 (1972), pp. 180–208 (DiVA diva2:1225094). Note: the author is Ingemar Olsson — not "Gunnar Olsson".'}</p>
          <p>{sv
            ? 'Kärnfynd hos Olsson: 13 kust-snäck-platser på Gotland, fördelade över öns forna ting (Gotland var indelat i 20 ting). Olssons slutsats är att det finns ett samband mellan snäck-platserna och de forna tingen — snäckhamnarna var en angelägenhet som åvilade tingen; 10–12 av de 13 tolkas som landningsplatser för snäckor. Starkaste enskilda beviset är Snäckhus i Burs socken (Bandlundviken): en vikingatida husgrund ca 30×8 m med 12 par stolphål, utgrävd av John Nihlén (Nihlén & Boéthius 1933), med nitfynd av samma slag som i vikingatidsskepp; tolkat som möjligt båthus.'
            : "Olsson's core findings: 13 coastal snäck sites on Gotland, distributed across the island's old ting (assemblies; Gotland was divided into 20 ting). Olsson concludes there is a link between the snäck sites and the old ting — the snäck harbours were a matter incumbent on the ting; 10–12 of the 13 are read as landing places for snäckor. The strongest single case is Snäckhus in Burs parish (Bandlundviken): a Viking-Age house foundation c. 30×8 m with 12 pairs of post-holes, excavated by John Nihlén (Nihlén & Boéthius 1933), with rivet finds of the same kind as in Viking-Age ships; interpreted as a possible boathouse."}</p>
          <p>{sv
            ? 'Varning mot övertolkning inbyggd i materialet: Snäckhagen i Grötlingbo är uppkallad efter en skeppssättning (stensättning ~18 m i skeppsform), inte efter en skeppshamn. Ett snäck-namn kan alltså syfta på ett monument som liknar ett skepp — ett skolexempel på varför ledet inte får automatöversättas till "hamn".'
            : 'A caution against over-reading is built into the material: Snäckhagen in Grötlingbo is named after a ship-setting (a ~18 m ship-shaped stone monument), not after a ship harbour. A snäck- name can thus refer to a monument that resembles a ship — a textbook example of why the element must not be auto-translated to "harbour".'}</p>
        </Part>

        <Part title={sv ? '5. Fastlandet — hundare/härad och snäckja' : '5. The mainland — hundare/härad and snäckja'} k="belagt" sv={sv}>
          <p>{sv
            ? 'På fastlandet var hundare (Svealand) / härad ledungsdistriktet. Enligt Upplandslagen (Konungabalken) skulle varje hundare hålla ledungsskepp; talet 4 snäckor per hundare förekommer i regelverket kring utrustning (Upplandslagen, utg. Schlyter). Detaljerna om roddartal och utrustning varierar mellan landskapslagarna — ange lag och balk vid citat.'
            : 'On the mainland the levy district was the hundare (in Svealand) / härad. According to the Uppland Law (Konungabalken) each hundare had to maintain levy ships; the figure of 4 snäckor per hundare appears in the equipment rules (Uppland Law, ed. Schlyter). Details of oarsmen and equipment vary between the provincial laws — cite the law and section.'}</p>
          <p>{sv
            ? 'Ledet snäck- i fastlandsnamn tolkas i denna ram som spår av uppläggnings-/samlingsplatser för distriktets ledungsskepp (tolkning; förekommer i standardverk om ledungsorganisation och i SOL 2003 under enskilda namn). Attribution med försiktighet: Lars Hellberg (Uppsala) är den namnforskare som mest ingående knutit organisatoriska/ledungsrelaterade ortnamn till samhällsindelningen i Mälarlandskapen. Enskilda påståenden får inte tillskrivas Hellberg utan verifierat sidcitat.'
            : "In this frame the element snäck- in mainland names is read as a trace of laying-up/mustering places for the district's levy ships (interpretation; found in standard works on levy organisation and in SOL 2003 under individual names). Attribution with caution: Lars Hellberg (Uppsala) is the name scholar who most thoroughly tied organisational/levy-related place-names to the social division of the Mälar provinces. Individual claims must not be attributed to Hellberg without a verified page citation."}</p>
        </Part>

        <Part title={sv ? '6. Regionala mönster + plattformens egna data' : "6. Regional patterns + the platform's own data"} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Plattformens place_names (per 2026-08-16) innehåller 38 namn med initialt snäck-. Täckningen är tunn och saknar attesteringsår (alla earliest_attestation_year = NULL) — merparten importerad från OSM eller Lantmäteriets ortnamn utan normaliserad socken/härad. Vår DB kan alltså inte ge äldsta belägg för dessa namn; oldest forms måste hämtas ur SOL 2003 / Isof Ortnamnsregistret / DMS.'
            : "The platform's place_names table (as of 2026-08-16) holds 38 names with an initial snäck-. Coverage is thin and lacks attestation years (all earliest_attestation_year = NULL) — most imported from OSM or the national mapping agency's place-names without a normalised parish/härad. Our DB therefore cannot give the oldest attestation for these names; oldest forms must come from SOL 2003 / Isof's place-name register / DMS."}</p>
          <p>{sv
            ? 'Maritima kandidater i vår DB (läge vid vatten, hamn-pekande efterled): Snäckstavik, Grödinge sn, Södermanland (klassiskt diskuterat fastlands-snäcknamn); Snäckstaviken vid Färjestaden, Öland (läge approximativt); Snäckevarp, Gryt sn, Östergötland (kusten; efterled -varp \'uppdragnings-/kastplats\'); samt vidare Snäcksund-, Snäcknäset- och Snäckviken-typer. Gotländska gårdsnamn på -arve (t.ex. Snäckarve) hör till öns egna namnsystem.'
            : "Maritime candidates in our DB (by water, harbour-pointing final element): Snäckstavik, Grödinge parish, Södermanland (a classically discussed mainland snäck name); Snäckstaviken near Färjestaden, Öland (location approximate); Snäckevarp, Gryt parish, Östergötland (coast; final element -varp 'haul-up/launching place'); plus further Snäcksund-, Snäcknäset- and Snäckviken- types. Gotlandic farm names in -arve (e.g. Snäckarve) belong to the island's own naming system."}</p>
          <p>{sv
            ? 'Källkritisk poäng ur egen data: en stor andel av de 38 är inlandsnamn som inte kan vara skeppshamnar — Snäckdal, Snäckhult, Snäckmor (mor = mosse/kärr), Snäckebacken, Snäckebäcken, Snäckenäs, Snäckerud. Dessa illustrerar homonymproblemet konkret (§7): ledet är där knappast \'krigsskepp\' utan djuret, terräng eller ett person-/gårdsnamn. Slutsats: presentera snäck-hamnstesen bara för namn som klarar topografi + efterled + (helst) arkeologi/organisation — aldrig för ledet ensamt.'
            : "A source-critical point from our own data: a large share of the 38 are inland names that cannot be ship harbours — Snäckdal, Snäckhult, Snäckmor (mor = bog/fen), Snäckebacken, Snäckebäcken, Snäckenäs, Snäckerud. These illustrate the homonym problem concretely (§7): there the element is hardly 'warship' but the mollusc, terrain or a personal/farm name. Conclusion: present the snäck-harbour thesis only for names that pass topography + final element + (preferably) archaeology/organisation — never for the element alone."}</p>
        </Part>

        <Part title={sv ? '7. Homonymer — en metodregel' : '7. Homonyms — a method rule'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Ledet snäck- kan i ett givet namn stå för:'
            : 'In any given name the element snäck- may stand for:'}</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>{sv ? "fornsvenska snækkia 'krigsskepp' (hamn-/ledungstolkning) — kräver vatten + stödjande efterled/arkeologi;" : "Old Swedish snækkia 'warship' (the harbour/levy reading) — requires water + a supporting final element/archaeology;"}</li>
            <li>{sv ? 'djuret snäcka (mollusk) — vanligt i terräng-/naturnamn;' : 'the mollusc snäcka — common in terrain/nature names;'}</li>
            <li>{sv ? 'terräng/appellativ eller dialektord (jfr sammansättningar med -mor, -backe, -dal);' : 'a terrain appellative or dialect word (cf. compounds with -mor, -backe, -dal);'}</li>
            <li>{sv ? 'person-/gårdsnamn eller sekundär, yngre namngivning (t.ex. torp uppkallade efter en äldre plats);' : 'a personal/farm name or secondary, later naming (e.g. crofts named after an older place);'}</li>
            <li>{sv ? 'ett monument som liknar ett skepp (skeppssättning — jfr Snäckhagen, Grötlingbo, §4).' : 'a monument that resembles a ship (a ship-setting — cf. Snäckhagen, Grötlingbo, §4).'}</li>
          </ol>
          <p>{sv
            ? 'En folketymologi blir aldrig en etymologi. Varje namn prövas mot äldsta belägg (SOL/Isof/DMS) och läge.'
            : 'A folk etymology is never an etymology. Test each name against its oldest attestation (SOL/Isof/DMS) and its topography.'}</p>
        </Part>

        <Part title={sv ? '8. Gotland hade ett eget system' : '8. Gotland had its own system'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Gotland ingick inte i hundare-ledungen. Enligt Gutasagan följde gutarna sveakungen med 7 snäckor, och endast mot hedniska länder (ej kristna), med 1 månads varsel, ledungsstämma före midsommar och 8 veckors skeppsvist; annars 40 mark per snäcka i avlösen ("ledungslame"). De 7 snäckorna tolkas (Björkander) som 6 sjättingar + Visby (var sin snäcka) — Gotlands ledung vilade alltså på ting-/sjättingsindelningen, inte på hundare.'
            : 'Gotland was not part of the hundare levy. According to the Guta saga the Gotlanders followed the Swedish king with 7 snäckor, and only against heathen lands (not Christian ones), with one month\'s notice, a levy assembly before midsummer and eight weeks\' ship-service; otherwise 40 marks per ship in commutation. The 7 snäckor are read (Björkander) as 6 sjättingar + Visby (one each) — Gotland\'s levy thus rested on the ting/sjätting division, not on the hundare.'}</p>
          <p>{sv
            ? 'Därför: Olssons ting-koppling på Gotland och fastlandets hundare-koppling är två skilda system som råkar dela ledet snäck-. Att överföra fastlandsmodellen till Gotland (eller tvärtom) vore metodfel.'
            : "So: Olsson's ting link on Gotland and the mainland's hundare link are two separate systems that happen to share the element snäck-. Transferring the mainland model to Gotland (or vice versa) would be a methodological error."}</p>
        </Part>

        <Part title={sv ? '9. Den omtvistade kopplingen snäck ↔ ledung ↔ centralmakt' : '9. The disputed link snäck ↔ levy ↔ central power'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Att snäck-namn kan spegla ledungsorganisation är väletablerat för utvalda, väl underbyggda namn (Olsson för Gotland; enskilda fastlandsnamn i SOL) — belagt för enskilda fall. Att snäck-namn generellt utgör en karta över en centraliserad, kunglig sjöförsvarsorganisation är däremot omtvistat.'
            : 'That snäck- names can reflect levy organisation is well established for selected, well-supported names (Olsson for Gotland; individual mainland names in SOL) — attested for individual cases. That snäck- names in general form a map of a centralised royal naval organisation is, by contrast, disputed.'}</p>
          <p>{sv
            ? 'Problemen: (a) homonymi (§7); (b) datering — ledungssystemets ålder och grad av centralisering är själv omdiskuterad, och ett namns belägg är oftast högmedeltida även när namnet är äldre; (c) kronologin snäck-namn → organisation → kungamakt går inte att fastställa ur namnen ensamma. Formulering vi håller oss till: "spår av skepp och sjöförsvar i landskapet" (belagt för enskilda namn) — inte "vikingatidens ledungskarta" (obelagt som helhet).'
            : "The problems: (a) homonymy (§7); (b) dating — the age and degree of centralisation of the levy system is itself debated, and a name's attestation is usually high-medieval even when the name is older; (c) the chronology snäck-name → organisation → royal power cannot be established from the names alone. The wording we keep to: \"traces of ships and naval defence in the landscape\" (attested for individual names) — not \"the Viking-Age levy map\" (unproven as a whole)."}</p>
        </Part>

        {/* Kort engelsk sammanfattning sist (visas alltid, som i underlagets Del B) */}
        <Part title="In brief (English)" sv={sv}>
          <p>Snäck- place-names may mark places where levy ships (Old Swedish snækkia 'warship') were hauled up and mustered. The reading is best supported where topography, a harbour-pointing final element and archaeology coincide. Ingemar Olsson (1972, Fornvännen 67) linked 13 coastal snäck sites on Gotland to the island's old ting; the strongest case is the excavated Snäckhus boathouse in Burs. On the mainland the levy district was the hundare/härad, and the Uppland Law prescribes levy ships. But the element is homographic with the mollusc word snäcka and can also denote terrain, a personal name or a ship-shaped monument — so each name must be tested against its oldest attestation and topography. The sweeping claim that snäck- names map a centralised royal levy is disputed and unproven as a whole; this is a concept page, not a map, precisely to avoid presenting that unproven reading as fact.</p>
        </Part>

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            "Olsson, Ingemar. 1972. \"Snäck-namn på Gotland.\" Fornvännen 67, s. 180–208 (DiVA diva2:1225094, verifierad fulltext) — primärkälla",
            'Nihlén, John & Boéthius, Gerda. 1933. Gotländska gårdar och byar under äldre järnåldern — utgrävning Snäckhus, Burs (via Olsson 1972)',
            'Gutasagan (fornguntisk text) — Gotlands 7 snäckor, ledungsvillkor',
            'Upplandslagen, Konungabalken. Utg. C. J. Schlyter, Sveriges gamla lagar — hundare/ledung, snäckor per hundare (fornsv. PD)',
            'Söderwall, K. F. Ordbok öfver svenska medeltids-språket — uppslag snækkia',
            'Fritzner, Johan. Ordbog over Det gamle norske Sprog — snekkja',
            'Wahlberg, Mats (red.). 2003. Svenskt ortnamnslexikon (SOL) — enskilda snäck-uppslag ej ännu kontrollerade i detta underlag',
            'Strandberg, Svante (red.). 2004. Ortnamn i språk och samhälle (hyllningsskrift till Lars Hellberg) — kräver sidcitat per påstående',
            'Den Store Danske / lex.dk, uppslag "snekke" — skeppstyp, dansk jämförelse, äldsta belägg 1224',
            'place_names (Viking Age-DB), uttag 2026-08-16: 38 namn på snäck-; attesteringsår saknas (NULL); källor OSM/Lantmäteriet',
          ]}
        />
        <p className="text-[12px] text-slate-500 mt-3 max-w-3xl">
          {sv
            ? 'Analys och sammanställning gjord med AI-stöd (Fabel/Opus) och därefter granskad och godkänd av Daniel Larsson. Obelagt/ej verifierat i detta underlag: "Gunnar Olsson" är fel författare (rätt: Ingemar Olsson); Ingrid Sanness Johnsen kunde inte beläggas som snäck-namnsforskare (känd som runolog) och ska inte attribueras utan verifierat citat; specifika SOL-uppslag för snäck-namn är ännu inte kontrollerade; äldsta belägg för enskilda namn (t.ex. Snäckstavik, Snäckevarp) måste hämtas ur SOL 2003 / Isof / DMS, inte ur OSM/Lantmäteri-importen; den exakta författaren/årtalet för den danska KU-publikationen om snekke-namn är ej fastställt här; koordinater aldrig ur minnet.'
            : 'Analysis and compilation done with AI assistance (Fabel/Opus), then reviewed and approved by Daniel Larsson. Unproven/unverified in this material: "Gunnar Olsson" is the wrong author (correct: Ingemar Olsson); Ingrid Sanness Johnsen could not be attested as a snäck-name scholar (known as a runologist) and must not be attributed without a verified citation; specific SOL entries for snäck- names are not yet checked; oldest attestations for individual names (e.g. Snäckstavik, Snäckevarp) must come from SOL 2003 / Isof / DMS, not the OSM/mapping-agency import; the exact author/year of the Danish (KU) publication on snekke names is not fixed here; coordinates never from memory.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Snacknamn;
