import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ship } from 'lucide-react';

// /sv/ledung (en: /en/leidang) — begreppssida om ledung/leiðangr, den offentliga
// sjökrigs-/flottorganisationen i medeltida Skandinavien. KÄLLKRITISK begreppssida (ingen karta).
// Kärnpunkt: den utvecklade, reglerade ledungen är skriftligt belagd FÖRST i landskapslagarna
// (1200-tal); dess vikingatida förstadier är indirekt belagda och tolkningsberoende. Vikingatida
// institutionell ledung tas ALDRIG som given. Efterledets etymologi (*-angr*) är olöst. Hundare =
// ledungsdistrikt är hypotes. Snäck-namn = ledungshamnar är omtvistat (Gotland avviker, Olsson 1972).
// Underlag: scratch-ledung.md, AI-stött (Fabel/Opus), granskat/godkänt av Daniel Larsson (människa-i-loopen).

type StatusKind = 'belagt' | 'omtvistat' | 'hypotes';
const STAT: Record<StatusKind, { c: string; sv: string; en: string }> = {
  belagt: { c: '#22c55e', sv: 'Belagt', en: 'Established' },
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

const Ledung: React.FC = () => {
  const sv = !useLocation().pathname.toLowerCase().includes('leidang');

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Ledung (leiðangr) — Skandinaviens sjökrigsorganisation"
        titleEn="The leiðangr — Scandinavia's naval levy"
        description="Ledung / leiðangr: den offentliga sjökrigs- och flottorganisationen i medeltida Skandinavien — skeppslag, hamna, roddarlag, ledungslame. Källkritiskt granskad: vikingatida förhållanden (indirekt belagda) skilda från landskapslagarnas reglering (1200-tal)."
        descriptionEn="The leiðangr: the public naval levy of medieval Scandinavia — ship-districts, hamna, rowing crews, the ledungslame tax. Source-critically reviewed, separating Viking-Age evidence (indirect) from the 13th-century provincial laws."
        keywords="ledung, leidang, leiðangr, leding, sjökrig, flottorganisation, skeppslag, hamna, roddarlag, ledungslame, Roden, Roslagen, hundare, snäck, landskapslagar, Upplandslagen, þingalið"
        path={sv ? '/sv/ledung' : '/en/leidang'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Ship className="h-8 w-8 text-gold" aria-hidden="true" />
            {sv ? 'Ledung' : 'The leiðangr'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? 'leiðangr · leidang · leding · Skandinaviens sjökrigsorganisation' : 'leiðangr · leidang · leding · Scandinavia’s naval levy'}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {sv
              ? 'Ledung betecknar den offentliga sjökrigs- och flottorganisationen i medeltida Skandinavien — en ordnad utskrivning av fria bönder för att bemanna, utrusta och proviantera örlogsskepp. Den här sidan förklarar begreppet och skiljer noga vikingatida förhållanden (indirekt belagda) från landskapslagarnas skriftligt belagda reglering på 1200-talet.'
              : 'The leiðangr was the public naval levy of medieval Scandinavia — an organised conscription of free farmers to man, equip and provision warships. This page explains the concept, carefully separating Viking-Age conditions (indirectly attested) from the 13th-century provincial laws in which the developed system is first written down.'}
          </p>
        </div>

        {/* Källkritisk kärnvarning: vikingatid vs 1200-tal */}
        <div className="mb-6 rounded-lg border border-amber-600/40 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {sv ? 'Källkritisk kärnpunkt — datera varje påstående' : 'Source-critical core point — date every claim'}
          </p>
          <p className="text-sm text-muted-foreground">
            {sv
              ? 'Den detaljerade regleringen av ledung finns skriftligt först i landskapslagarna, nedskrivna på 1200-talet (för Sverige främst Upplandslagen, stadfäst ca 1296). Dessa är primärkällor för 1200-talets förhållanden, inte automatiskt för vikingatiden. Att sluta sig tillbaka från 1200-talslagarna till vikingatida praxis är metodiskt riskabelt (retrospektiv metod). En institutionaliserad, statligt organiserad ledung under vikingatid är därför inte belagd som given — den är den centrala vetenskapliga stridsfrågan. Vi daterar därför genomgående: "enligt Upplandslagen (1200-tal)" respektive "vikingatida, indirekt belagt" — och blandar dem aldrig ihop.'
              : 'The detailed regulation of the levy survives in writing only in the provincial laws, recorded in the 13th century (for Sweden chiefly Upplandslagen, confirmed c. 1296). These are primary evidence for the 1200s, not automatically for the Viking Age. Projecting the law back onto Viking-Age practice is methodologically contested (the retrospective method). An institutionalised, state-organised leiðangr in the Viking Age is therefore not taken as given — it is the central scholarly dispute. We date every claim: "per Upplandslagen (13th c.)" versus "Viking-Age, indirectly attested".'}
          </p>
        </div>

        <Part title={sv ? '1. Begreppet ledung/leiðangr' : '1. The concept'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Ledung (fornsv. leþunger, fornnord. leiðangr) betecknar den offentliga sjökrigs- och flottorganisation som är känd från medeltida Skandinavien: en ordnad utskrivning (utbud) av fria bönder till att bemanna, utrusta och proviantera örlogsskepp för kustförsvar och sjötåg. Termen återkommer regionalt: fornnord. leiðangr, norska leidang, danska leding, svenska ledung, och i latinska källor expeditio.'
            : 'The leiðangr (Old Norse; Norw. leidang, Dan. leding, Swed. ledung, Lat. expeditio) was the public naval levy of medieval Scandinavia: a system for conscripting, equipping and provisioning warships from among free farmers for coastal defence and seaborne expeditions.'}</p>
          <p>{sv
            ? 'När organisationen uppstod, och hur mycket av den som fanns redan under vikingatid, är den centrala vetenskapliga stridsfrågan. Själva den utvecklade, reglerade ledungen är skriftligt belagd först i de nordiska landskapslagarna (1200-tal); dess vikingatida förstadier är indirekt belagda och tolkningsberoende.'
            : 'When the organisation arose, and how much of it already existed in the Viking Age, is the central scholarly question. The developed, regulated levy is attested in writing only in the provincial laws (13th c.); its Viking-Age precursors are indirectly attested and interpretation-dependent.'}</p>
        </Part>

        <Part title={sv ? '2. Etymologi' : '2. Etymology'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Förledet är belagt: fornnord. leið f. "väg, led, färdväg (till sjöss)". Efterledet är däremot osäkert. Den vanligaste härledningen tar -angr som en ombildning av gangr m. "gång, färd" — alltså ungefär "väg-färd / färd längs leden"; en alternativ förklaring utgår från gagn n. Källorna anger uttryckligen att etymologin inte är slutgiltigt löst.'
            : 'The first element is established: ON leið "way, sea-route". The second element is uncertain — usually taken as a reshaping of gangr "going, course" (roughly "way-going / journey along the route"), alternatively gagn. The etymology is expressly not settled.'}</p>
          <p>{sv
            ? 'Slutsats: förleden leið "led/väg" är belagd; efterledets exakta ursprung är omtvistat — påstå aldrig en enda "säker" etymologi för hela ordet.'
            : 'Conclusion: the first element leið "way" is established; the exact origin of the second element is disputed — never assert a single "certain" etymology for the whole word.'}</p>
        </Part>

        <Part title={sv ? '3. Källäget: vikingatid (indirekt) kontra landskapslagar (1200-tal)' : '3. Sources and dating'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Den detaljerade regleringen av ledung finns skriftligt i landskapslagarna, nedskrivna på 1200-talet (för Sverige främst Upplandslagen, stadfäst ca 1296; för Norge Gulatings- och Frostatingslagen). Dessa är primärkällor för 1200-talets förhållanden, inte automatiskt för vikingatiden.'
            : 'The detailed regulation survives in the 13th-century provincial laws (Sweden: Upplandslagen, confirmed c. 1296; Norway: Gulating/Frostating laws) — primary evidence for the 1200s, not automatically for the Viking Age.'}</p>
          <p>{sv
            ? 'Att sluta sig tillbaka från 1200-talslagarna till vikingatida praxis är metodiskt riskabelt (retrospektiv metod). En "minimalistisk" skola (Niels Lund) menar att en verklig, statligt organiserad leding i Danmark inte fanns förrän ca 1170; en motståndarlinje (bl.a. Sverre Bagge) pekar på tidigare omnämnanden, skaldediktning och arkeologisk mobiliseringsförmåga.'
            : 'Projecting the laws back onto Viking-Age practice is methodologically contested. A "minimalist" school (Niels Lund) holds that a real, state-organised leding in Denmark existed only from c. 1170; a continuity line (e.g. Sverre Bagge) points to earlier mentions, skaldic verse and archaeological mobilisation capacity.'}</p>
          <p>{sv
            ? 'Vikingatidens sjökrigsförmåga (organiserade flottor, skeppsbygge, besättningsstruktur) är belagd via runstenar och arkeologi, men att kalla den "ledung" i lagarnas mening är en tolkning, inte ett samtida begrepp. Regel för sidan: datera varje påstående, och blanda aldrig ihop "enligt Upplandslagen (1200-tal)" med "vikingatida, indirekt belagt".'
            : 'The Viking Age’s naval capacity (organised fleets, shipbuilding, crew structure) is attested via runestones and archaeology, but calling it "leiðangr" in the sense of the laws is an interpretation, not a contemporary term.'}</p>
        </Part>

        <Part title={sv ? '4. Organisation enligt landskapslagarna: skeppslag, hamna, roddarlag' : '4. Organisation (per the laws)'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Belagt för 1200-talet: kustbygden var indelad i distrikt som skulle ställa upp och bemanna var sitt skepp. Grundenheterna var skeppslag — det territoriella distrikt som svarade för ett skepp (med besättning, vapen och proviant; i Norge motsvaras enheten av skipreiða) — och hamna (fornsv. hamna), den mindre indelnings-/bördsenhet som svarade för en roddare/en åra (och dennes utrustning och underhåll). Ett skeppslag bestod av ett bestämt antal hamnor. Roddarlaget var laget av roddare/besättningsmän knutet till ett skepp.'
            : 'Established for the 1200s: coastal land was divided into ship-districts (Swed. skeppslag; Norw. skipreiða), each responsible for one manned, armed and provisioned ship. The hamna was the smaller assessment unit answering for one oarsman / one oar (with equipment and upkeep); a ship-district comprised a set number of hamnor. The roddarlag was the rowing crew tied to a ship.'}</p>
          <p>{sv
            ? 'Systemet knöt alltså ihop landindelning ↔ manskap ↔ skepp: bördsenheter på land översattes till åror och besättning ombord. Exakta tal (antal hamnor per skeppslag, antal åror per snäcka) varierar mellan landskap och lagar och bör aldrig anges utan att den specifika lagtexten kontrolleras.'
            : 'The system tied land division ↔ crew ↔ ship: assessment units on land were translated into oars and crew aboard. Exact figures (hamnor per ship-district, oars per warship) vary by province and law and should never be cited without checking the specific law text.'}</p>
        </Part>

        <Part title={sv ? '5. Från utbudsledung till skatteledung — ledungslame' : '5. From levy to tax — ledungslame'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Belagt för hög-/senmedeltid: med tiden ersattes den faktiska utskrivningen (att verkligen ro ut med flottan, utbudsledung) i stora delar av en stående skatt som betalades i stället för personligt deltagande — övergången till skatteledung. Den kvarvarande/kommuterade avgiften kallas i svenska källor ledungslame (fornsv. leþungslami).'
            : 'Established, high/late medieval: over time actual mobilisation (utbudsledung) was largely commuted into a standing tax paid instead of personal service — the shift to skatteledung. The residual/commuted due is the Swedish ledungslame (ON leþungslami).'}</p>
          <p>{sv
            ? 'Tidpunkt och drivkrafter är omtvistade. Lindkvist (1988) ser övergången som en del av den tidiga statsmaktens framväxt (från plundrings-/utbudsekonomi till institutionaliserad beskattning); Lund (1996) gör en motsvarande poäng för Danmark. Datera alltid: ledungslame som skatt hör hemma i (hög)medeltida källor, inte i vikingatid. Att avgiften infördes betyder inte att flottan upphörde — i vissa kustbygder (Roden, se nästa avsnitt) behölls den faktiska sjöorganisationen längre; den regionala variationen kräver verifiering per lag.'
            : 'The timing and causes are disputed. Lindkvist (1988) sees the shift as part of early state formation (from a plunder/levy economy to institutionalised taxation); Lund (1996) makes a corresponding point for Denmark. Date every claim: the ledungslame as a tax belongs to (high) medieval sources, not the Viking Age. Its introduction did not mean the fleet ceased — in some coastal districts (Roden) the actual naval organisation persisted longer.'}</p>
        </Part>

        <Part title={sv ? '6. Förhållandet till hundare och Roden/Roslagen' : '6. Hundare and Roden/Roslagen'} k="hypotes" sv={sv}>
          <p>{sv
            ? 'Belagt: Roden (fornsv. roþer "rodd, rodedistrikt") är namnet på den uppländska kustbygd vars invånare (roþskarlar) hade roddar-/ledungsplikt; härav landskapsnamnet Roslagen.'
            : 'Established: Roden (ON roþer "rowing, rowing-district") is the name of the Uppland coastal region whose inhabitants (roþskarlar) had rowing/levy duty; hence the province name Roslagen.'}</p>
          <p>{sv
            ? 'Hypotes/omtvistat: att hundaret (det uppländska administrativa distriktet) ursprungligen var en ledungsindelning — dvs. ett distrikt som skulle ställa ett visst antal män/skepp — är en äldre och länge diskuterad hypotes. Kopplingen hundare ↔ skeppsutbud är rimlig men inte entydigt bevisad; den ska markeras som forskningshypotes, inte faktum. Även Rus-namnets härledning ur roþer/roþskarlar → finska Ruotsi → Rus ("rodd-teorin") är utbredd men omstridd och bör inte tas upp som avgjord.'
            : 'Hypothesis/disputed: that the hundare (the Uppland administrative district) was originally a levy division — a district required to furnish a set number of men/ships — is an old and long-debated hypothesis. The link hundare ↔ ship-levy is plausible but not unambiguously proven, and must be marked as a research hypothesis, not fact. The derivation of Rus from roþer/roþskarlar → Finnish Ruotsi → Rus is likewise widespread but contested.'}</p>
        </Part>

        <Part title={sv ? '7. Runstensbelägg — vad de visar och inte visar' : '7. Runic evidence'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Viktig distinktion: runstenarnas lið (skara, hird, krigarfölje) är inte samma sak som lagarnas ledung (kustens utbuds-/skatteorganisation). Håll isär orden.'
            : 'Key distinction: the runestones’ lið (a war-band/retinue) is not the same as the laws’ ledung (the coastal levy). Keep the words apart.'}</p>
          <p>{sv
            ? 'þingalið-stenar: flera stenar minns män som tjänat i þingaliðet — den nordiska elit-/hirdstyrka i England som knyts till Knut den store (verksam ca 1018–1066). U 668 Kålsta (Häggeby sn, Uppland) minns Geire "som satt i þingaliðet i väster". Sö 14 Gåsinge, Sm 76 Komstad och Sm 77 Sävsjö knyts likaså till Englandstjänst/þingalið (exakt lydelse per sten och ristarattribution bör kollationeras mot Rundata). Dessa stenar belägger krigarfölje/hird i England (lið), inte den svenska kustledungen — använd dem som vikingatida kontext för sjökrig och krigartjänst, inte som bevis för en institutionaliserad svensk ledung.'
            : 'þingalið stones: several commemorate men who served in the þingalið — Cnut the Great’s elite force in England (c. 1018–1066). U 668 Kålsta commemorates Geire "who sat in the þingalið in the west"; Sö 14, Sm 76 and Sm 77 are likewise linked to English service (per-stone wording needs verification against Rundata). These attest retinue service in England (lið), not the Swedish naval levy.'}</p>
          <p>{sv
            ? 'Skeppstermer och besättningsroller: runstenar visar ett sjökrig organiserat kring personligt ägda långskepp, med en tydlig skillnad ombord mellan styrimaðr (styresman/skeppschef) och skiparar (besättning). Skeppstypen skeið (snabbt örlogsskepp) nämns på flera stenar; Sö 164 Spånga prisar den döde för att ha "stått som en drengr i skeppets stäv". Huruvida denna skeppsägar-/styresmansstruktur ska ses som en parallell leiðing-organisation eller enbart privat krigarfölje är just det tolkningen forskningen tvistar om.'
            : 'Ship terms and crew roles: the stones show maritime warfare built on personally owned longships, distinguishing styrimaðr (steersman/commander) from skiparar (crew); the warship term skeið recurs (Sö 164 Spånga). Whether this reflects a parallel leiðing organisation or only private retinues is exactly what scholarship disputes.'}</p>
        </Part>

        <Part title={sv ? '8. Snäck-ortnamn och maritim organisation' : '8. Snäck- place-names'} k="hypotes" sv={sv}>
          <p>{sv
            ? 'Belagt: ortnamn på Snäck- (t.ex. Snäckstavik, Snäckviken, Snäckgärde) innehåller skeppsordet snækkja "snäcka" (en typ av örlogsskepp). Namntypen som sådan är belagd.'
            : 'Established: place-names in Snäck- (e.g. Snäckstavik, Snäckviken, Snäckgärde) contain the ship-word snækkja "warship". The name type as such is attested.'}</p>
          <p>{sv
            ? 'Omtvistat/hypotes: tolkningen att snäck-namnen markerar ledungens skeppshamnar/uppdragsplatser (naust) är en välkänd men omdiskuterad hypotes. För Gotland har Ingemar Olsson (1972) knutit snäck-hamnar snarare till tinget och menar att Gotland hade ett eget system — namntypen kan alltså inte automatiskt läsas som kunglig ledung överallt. Länken snäck-namn ↔ hundare/skeppslag får därför göras konceptuellt som hypotes, aldrig som en fastställd karta över ledungshamnar.'
            : 'Disputed/hypothesis: reading Snäck- names as the levy’s ship-harbours (naust) is a well-known but contested interpretation. For Gotland, Ingemar Olsson (1972) links snäck-harbours rather to the assembly (þing) and argues Gotland had its own system — so the name type cannot automatically be read as royal levy everywhere. The link snäck-names ↔ hundare/ship-district may be drawn conceptually as a hypothesis only, never as a settled map of levy harbours.'}</p>
        </Part>

        <Part title={sv ? '9. Sägen och litterär tradition' : '9. Saga tradition'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Redovisas som tradition, ej samtida källa: enligt Snorri Sturlusons Heimskringla (1200-tal) ska Håkon den gode ha organiserat den norska leiðangen (skeppsdistrikt, vårdkasar). Detta är en hög-medeltida saga-tradition nedtecknad ~200–300 år efter de påstådda händelserna och kan inte utan vidare tas som belägg för 900-talets faktiska organisation. Sägnen redovisas här som tradition, med källkritiken bredvid.'
            : 'Reported as tradition, not a contemporary source: per Snorri Sturluson’s Heimskringla (13th c.), Hákon the Good is said to have organised the Norwegian leiðangr (ship-districts, beacons). This is a high-medieval saga tradition recorded some 200–300 years after the alleged events and cannot be taken as evidence for the actual 10th-century organisation.'}</p>
        </Part>

        <Part title={sv ? '10. Den vetenskapliga debatten' : '10. The scholarly debate'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Minimalistisk linje: Niels Lund (1996) — en verklig, statligt organiserad leding i Danmark först ca 1170; vikingatidens flottor var lið (personliga följen/ledungståg), inte en institutionell ledung. Kontinuitetslinje: bl.a. Sverre Bagge har invänt och pekat på tidigare belägg, saga- och skaldematerial samt arkeologisk mobiliseringsförmåga (exakt Bagge-referens kräver verifiering).'
            : 'Minimalist line: Niels Lund (1996) — a real, state-organised leding in Denmark only from c. 1170; Viking-Age fleets were lið (personal retinues), not an institutional levy. Continuity line: Sverre Bagge and others point to earlier evidence, saga and skaldic material, and archaeological mobilisation capacity (exact Bagge reference needs verification).'}</p>
          <p>{sv
            ? 'Skaldediktningens källvärde: debatt mellan Lund och Rikke Malmros (2010) om hur långt fyrstediktningen kan bära som källa till militär organisation. Svensk statsbildning: Thomas Lindkvist (1988) och Erik Lönnroth (1940) — ledungens övergång från utbud till skatt som motor i den tidiga statens finansiering.'
            : 'Source-value of skaldic verse: a debate between Lund and Rikke Malmros (2010) on how far praise-poetry can serve as a source for military organisation. Swedish state formation: Thomas Lindkvist (1988) and Erik Lönnroth (1940) — the shift from levy to tax as an engine of early state finance.'}</p>
          <p>{sv
            ? 'Konfidens totalt: hög för termformer, för landskapslagarnas reglering (1200-tal) och för runstensbeläggen; låg/omtvistad för vikingatida institutionell ledung, för hundare-som-ledungsdistrikt, för snäck-namn-som-ledungshamnar och för efterledets etymologi.'
            : 'Overall confidence: high for the term forms, the 13th-century regulation and the runic evidence; low/disputed for Viking-Age institutional levy, hundare-as-levy-district, Snäck-names-as-levy-harbours and the second-element etymology.'}</p>
        </Part>

        {/* Engelsk sammanfattning */}
        <Card className="mb-6 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{sv ? 'In English — summary' : 'Summary'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>The <em>leiðangr</em> (ON; Norw. <em>leidang</em>, Dan. <em>leding</em>, Swed. <em>ledung</em>, Lat. <em>expeditio</em>) was the public naval levy of medieval Scandinavia: a system for conscripting, equipping and provisioning warships from among free farmers for coastal defence and seaborne expeditions. How much of it existed in the Viking Age is the central scholarly question.</p>
            <p>The first element is ON <em>leið</em> "way, sea-route"; the second element is uncertain (usually a reshaping of <em>gangr</em> "going/course", alternatively <em>gagn</em>) and the etymology is expressly not settled. The detailed regulation survives only in the 13th-century provincial laws (Sweden: Upplandslagen, c. 1296; Norway: Gulating/Frostating) — primary evidence for the 1200s, not automatically for the Viking Age; projecting the law back is methodologically contested (Lund’s minimalism vs. Bagge’s continuity).</p>
            <p>Per the laws, coastal land was divided into <em>skeppslag</em> (Norw. <em>skipreiða</em>), each furnishing one ship; the <em>hamna</em> answered for one oarsman/one oar, and the crew formed the <em>roddarlag</em> (exact figures vary by law). Actual mobilisation (<em>utbudsledung</em>) was largely commuted into a standing tax (<em>skatteledung</em>); the residual due is the Swedish <em>ledungslame</em>.</p>
            <p>Runic evidence distinguishes <em>lið</em> (a war-band/retinue — e.g. the <em>þingalið</em> stones U 668, Sö 14, Sm 76, Sm 77, attesting service in England) from <em>ledung</em> (the coastal levy). Stones show warfare built on personally owned longships (<em>styrimaðr</em> vs <em>skiparar</em>; the warship term <em>skeið</em>). <em>Snäck-</em> place-names contain <em>snækkja</em> "warship"; reading them as levy harbours is contested (for Gotland, Olsson 1972 links them to the assembly). Snorri’s attribution of the Norwegian leiðangr to Hákon the Good is a 13th-century saga tradition, not contemporary evidence.</p>
          </CardContent>
        </Card>

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            'Upplandslagen (Konungabalken m.fl.), ca 1296; ed. C. J. Schlyter, Corpus iuris Sueo-Gotorum antiqui (Sveriges gamla lagar) — primärkälla för landskapslagarnas ledungsreglering',
            'Sveriges runinskrifter, ser. Upplands runinskrifter (Wessén & Jansson) — U 668 m.fl.; kompletteras med Samnordisk runtextdatabas (Rundata) per signum',
            'Snorri Sturluson, Heimskringla (ca 1230) — litterär/traderad källa (Håkon den gode); redovisas som tradition',
            'Hafström, Gerhard. 1949. Ledung och marklandsindelning. Uppsala: Almqvist & Wiksell',
            'Lund, Niels. 1996. Lið, leding og landeværn: Hær og samfund i Danmark i ældre middelalder. Roskilde: Vikingeskibshallen',
            'Malmros, Rikke. 2010. Vikingernes syn på militær og samfund. Aarhus Universitetsforlag',
            'Bagge, Sverre — kontinuitetskritik av Lund (exakt titel/år kräver verifiering)',
            'Lindkvist, Thomas. 1988. Plundring, skatter och den feodala statens framväxt. Uppsala (Opuscula Historica Upsaliensia)',
            'Lönnroth, Erik. 1940. Statsmakt och statsfinans i det medeltida Sverige. Göteborg — ledungslame',
            'Sawyer, Peter. 1982. Kings and Vikings: Scandinavia and Europe AD 700–1100. London: Methuen',
            'Jansson, Sven B. F. 1987. Runes in Sweden. Stockholm: Gidlund — drengr, þingalið',
            'Olsson, Ingemar. 1972 — snäck-ortnamn på Gotland (snäck-hamnar ↔ ting); exakt titel/förlag kräver verifiering',
            'Svenskt ortnamnslexikon (SOL). 2003. Uppsala: Institutet för språk och folkminnen — Roden/Roslagen, Snäck-namn',
            'Cleasby, Richard & Gudbrand Vigfusson. 1874. An Icelandic–English Dictionary. Oxford — leiðangr, leið, skeið',
            'Ingångar/lokalisering av primärbelägg: Wiktionary (leiðangr); Wikipedia (Leidang, Thingmen, U 668 Kålsta); Vikingaskeppsmuseet Roskilde ("The longships on the rune stones")',
            'Sammanställningen är AI-stödd (Fabel/Opus) utifrån källkritiskt underlag och granskad/godkänd av Daniel Larsson (människa-i-loopen)',
          ]}
        />
        <p className="text-[12px] text-slate-500 mt-3 max-w-3xl">
          {sv
            ? 'Verifieringspunkter: efterledet i leiðangr (etymologin ej löst); exakta hamna-/åra-tal per landskapslag (varierar); exakt lydelse och ristarattribution för U 668, Sö 14, Sm 76 och Sm 77 mot Rundata; exakt bibliografisk referens för Sverre Bagges kritik och för Olsson 1972. Uppslagsverk används som ingångar, inte som slutgiltig auktoritet — runstensuppgifter bör kollationeras mot Rundata och lagreglering mot Schlyters edition före befästande.'
            : 'Verification points: the second element of leiðangr (etymology unsettled); exact hamna/oar figures per provincial law (varying); exact wording and carver attribution for U 668, Sö 14, Sm 76, Sm 77 against Rundata; exact references for Bagge’s critique and Olsson 1972. Reference works are used as entry points, not final authority.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Ledung;
