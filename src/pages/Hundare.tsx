import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Landmark } from 'lucide-react';

// /sv/hundare (·/en/hundred) — begreppssida om HUNDARE, den äldre territoriella
// indelningsenheten i Svealand (fvn. hundari). KÄLLKRITISK: varje sektion märks
// belagt/omtvistat/hypotes. Kärnreservationer bevarade ORDAGRANT i sak:
//  · etymologins innebörd ("hundra vad?") är OLÖST — hypoteser redovisas, ingen väljs
//  · "fyra snäckor per hundare enligt Upplandslagen" är EJ verifierat mot lagtext
//  · vikingatida ursprung = endast INDIREKT belagt; direkt skriftbelägg först 1296 (Upplandslagen)
// INGEN karta (begreppssida). Underlag: scratch-hundare.md, människa-i-loopen.

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

const Hundare: React.FC = () => {
  const sv = !useLocation().pathname.toLowerCase().includes('/hundred');

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Hundare — den äldre indelningsenheten i Svealand"
        titleEn="Hundare — the older territorial unit of Svealand"
        description="Hundaret (fornsvenska hundari) var den territoriella och administrativa grundenheten i medeltidens Svealand — ting, ledung och skatt. Källkritiskt granskad: etymologins innebörd är olöst och vikingatida ursprung endast indirekt belagt."
        descriptionEn="The hundare (Old Swedish hundari) was the basic territorial and administrative unit of medieval Svealand — assembly, naval levy and tax. Source-critically reviewed: the meaning of the etymology is unresolved and a Viking-Age origin is only indirectly attested."
        keywords="hundare, hundari, härad, Svealand, Uppland, Upplandslagen, ledung, leidangr, folkland, Tiundaland, Attundaland, Fjädrundaland, hundaresting, snäcka"
        path={sv ? '/sv/hundare' : '/en/hundred'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Landmark className="h-8 w-8 text-gold" aria-hidden="true" />
            {sv ? 'Hundare' : 'Hundare'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv
              ? 'Den äldre territoriella indelningsenheten i Svealand · fornsvenska hundari'
              : 'The older territorial unit of Svealand · Old Swedish hundari'}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {sv
              ? 'Hundaret var grundenheten för ting, ledung och skatt i det medeltida Svealand — främst Uppland, med Västmanland och delar av Södermanland. Den svenska motsvarigheten till det angelsaxiska hundred. Den här sidan sammanfattar vad som är belagt, vad som är omtvistat och vad som bara är hypotes — och håller isär det direkta skriftbelägget (från 1200-talet) från det rekonstruerade vikingatida ursprunget.'
              : 'The hundare was the base unit for assembly, naval levy and tax in medieval Svealand — chiefly Uppland, with Västmanland and parts of Södermanland; the Swedish counterpart of the Anglo-Saxon hundred. This page summarises what is attested, what is disputed and what is merely hypothesis — keeping the direct written attestation (13th century) apart from the reconstructed Viking-Age origin.'}
          </p>
        </div>

        {/* Källkritisk kärnvarning: etymologins innebörd är olöst */}
        <div className="mb-6 rounded-lg border border-amber-600/40 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {sv ? 'Källkritisk kärnpunkt: "hundra vad?"' : 'Core source-critical point: "a hundred of what?"'}
          </p>
          <p className="text-sm text-muted-foreground">
            {sv
              ? 'Att namnet hundare bygger på räkneordet hundra är belagt och okontroversiellt. Vad de hundra syftade på är däremot omtvistat och olöst — hundra man, hundra gårdar eller ett tal knutet till ledungens skepp/roddare. Forskningen har inte enats. Denna sida redovisar hypoteserna men väljer aldrig en av dem och presenterar den som fastställd etymologi. Härledningar som knyter hundare till hund (djuret) saknar stöd och avvisas.'
              : 'That the name hundare derives from the numeral "hundred" is attested and uncontroversial. What the hundred counted is disputed and unresolved — a hundred men, a hundred farms, or a figure tied to the ships/oarsmen of the naval levy. Scholarship has not agreed. This page presents the hypotheses but never selects one as a settled etymology. Derivations linking hundare to hund ("dog") have no support and are rejected.'}
          </p>
        </div>

        <Part title={sv ? '1. Begreppet hundare' : '1. The concept of the hundare'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Hundare (fornsvenska hundari, äldre hundare) var den territoriella och administrativa grundenheten i det medeltida Svealand, framför allt i Uppland. Termen är belagd i skriftliga källor från 1200-talet, tydligast i Upplandslagen (stadfäst 1296), där hundaret är en central enhet för ting, ledung och beskattning. Ordet är en substantivering byggd på det gamla räkneordet hund ("hundra") och motsvarar funktionellt det angelsaxiska hundred och kontinentala germanska Hundert-distrikt.'
            : 'The hundare (Old Swedish hundari) was the basic territorial and administrative unit of medieval Svealand, chiefly in Uppland. It is attested in writing from the 13th century, most clearly in the Law of Uppland (ratified 1296), where the hundare is a central unit for assembly, levy and taxation. The word is a nominalisation of the old numeral hund ("hundred") and is the functional counterpart of the Anglo-Saxon hundred and the continental Germanic Hundert-district.'}</p>
          <p>{sv
            ? 'Terminologisk avgränsning: hundari är den svealändska termen. I Götaland och i danskt område användes i stället härad (fvn. hæraþ). Hundaret är alltså inte en synonym utan en regionalt specifik äldre enhet som senare ersattes av häradsbegreppet.'
            : 'Terminological note: hundari is the Svealand term. In Götaland and the Danish sphere the term was instead härad (Old Norse hæraþ). The hundare is thus not a synonym but a regionally specific older unit later replaced by the härad concept.'}</p>
        </Part>

        <Part title={sv ? '2. Utbredning och övergången hundare → härad' : '2. Extent and the shift hundare → härad'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Hundaresindelningen hörde hemma i Svealand: Uppland, Västmanland och (delvis) Södermanland — kärnområdet för folklanden kring Mälaren. I Götaland och i det danska Skåneland var härad den ursprungliga termen.'
            : 'The hundare division belonged to Svealand: Uppland, Västmanland and (partly) Södermanland — the core of the folklands around lake Mälaren. In Götaland and the Danish Skåneland, härad was the original term.'}</p>
          <p>{sv
            ? 'Under senmedeltiden trängde termen härad undan hundare även i Svealand, så att de gamla hundarena efter hand kom att kallas härader. Att övergången skedde är belagt; den exakta tidpunkten och drivkrafterna är omtvistade. '
            : 'During the late Middle Ages härad displaced hundare even in Svealand, so that the old hundaren came to be called härader. That the shift happened is attested; the exact timing and drivers are disputed. '}
            <Stat k="omtvistat" sv={sv} /> {sv
            ? 'Övergången brukar förläggas till 1300–1400-talet, och Magnus Erikssons landslag (ca 1350) ses ofta som en faktor i standardiseringen av härad som riksterm. Ange tidpunkten som ungefärlig, ej exakt.'
            : 'It is usually dated to the 14th–15th centuries, with Magnus Eriksson’s national law (c. 1350) often cited as a standardising factor. The date should be given as approximate, not exact.'}</p>
          <p>{sv
            ? 'Namnspår lever kvar: t.ex. Långhundra, Sjuhundra och Åkerbo hundare i Uppland bär ännu hundare-ledet, liksom Långhundraleden (vattenleden genom Långhundra). Enskilda enhetsnamn och deras avgränsning bör dock verifieras mot Isof/SOL och lantmäterikällor innan de anges för en specifik plats.'
            : 'Name traces survive: e.g. Långhundra, Sjuhundra and Åkerbo hundare in Uppland still carry the hundare element, as does Långhundraleden (the waterway through Långhundra). Individual unit names and their boundaries should nonetheless be verified against Isof/SOL and cadastral sources before being tied to a specific place.'}</p>
        </Part>

        <Part title={sv ? '3. Den omtvistade etymologin — "hundra vad?"' : '3. The disputed etymology — "a hundred of what?"'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Att hundare bygger på räkneordet hundra är belagt; vad de hundra räknar är omtvistat. Huvudhypoteserna i forskningen:'
            : 'That hundare derives from the numeral "hundred" is attested; what the hundred counts is disputed. The main hypotheses:'}</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{sv
              ? 'Hundra man/krigare — hundaret som ett distrikt som skulle ställa upp ca hundra beväpnade män, analogt med det militärt-territoriella hundred i germansk-angelsaxisk tradition. '
              : 'A hundred men/warriors — the hundare as a district owing c. one hundred armed men, analogous to the military-territorial hundred in the Germanic/Anglo-Saxon tradition. '}
              <Stat k="hypotes" sv={sv} /></li>
            <li>{sv
              ? 'Hundra (bönder/gårdar/bosättningar) — en enhet om ungefär hundra skattebärande enheter. '
              : 'A hundred (farmers/farms/settlements) — a unit of roughly one hundred taxable units. '}
              <Stat k="hypotes" sv={sv} /></li>
            <li>{sv
              ? 'Koppling till ledungens skepps- och roddarorganisation — att talet hänger samman med antal roddare/hamnor/skepp som hundaret skulle prestera (se avsnitt 4). '
              : 'A link to the ship/oarsman organisation of the levy — that the figure relates to the number of oarsmen/hamnor/ships the hundare had to provide (see section 4). '}
              <Stat k="hypotes" sv={sv} /></li>
          </ul>
          <p>{sv
            ? 'Forskningen har inte enats. En komplicerande faktor: det fornnordiska hund kunde avse både "storhundra" (120) och "hundra" (100), vilket gör en exakt numerisk härledning vansklig. Sidan redovisar hypoteserna men får inte välja en av dem och presentera den som fastställd etymologi. Folketymologier som knyter hundare till hund (djuret) saknar stöd och ska avvisas (belagt att det är felaktigt).'
            : 'Scholarship has not agreed. A complicating factor: Old Norse hund could mean both the "long hundred" (120) and 100, making an exact numerical derivation difficult. The page presents the hypotheses but may not select one as a settled etymology. Folk-etymologies linking hundare to hund ("dog") have no support and must be rejected (attested as wrong).'}</p>
        </Part>

        <Part title={sv ? '4. Hundarets roll i ledungen' : '4. The hundare in the leiðangr (naval levy)'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Hundaret var en bärande enhet i ledungen (fvn. leiðangr) — det organiserade sjöförsvaret/sjöuppbådet. Svealändska landskapslagar reglerar hur ledungen bröts ner i mindre enheter. Enligt Södermannalagens konungabalk löper kedjan attung → hamna → fjärding → skiplagh med styræman, varsel och graderade böter vid uteblivande. Hamnan är grundenheten som skulle hålla en man/en åra.'
            : 'The hundare was a load-bearing unit of the leiðangr — the organised naval levy. Svealand laws regulate how the levy was broken down. According to the king’s section of the Law of Södermanland the chain runs attung → hamna → fjärding → skiplagh, with a steersman, summons and graded fines for default. The hamna is the base unit owing one man/one oar.'}</p>
          <p>{sv
            ? 'Reservation: uppgiften att varje hundare skulle ställa upp ett bestämt antal skepp (t.ex. fyra snäckor per hundare enligt Upplandslagen) förekommer i sekundärlitteratur, men är EJ verifierad mot lagtext i detta underlag. Den exakta siffran och dess lagrum bör kontrolleras direkt mot Upplandslagens konungabalk (Schlyter SSGL III / Fornsvenska textbanken) innan den publiceras som faktapåstående. Att snäcka betecknar ett krigsfartyg som ett distrikt (härad/hundare) ålades att bygga och utrusta är däremot belagt (Söderwalls fornsvenska ordbok) — belagt för definitionen, ej för siffran. '
            : 'Reservation: the claim that each hundare owed a fixed number of ships (e.g. four snäckor per hundare under the Law of Uppland) appears in secondary literature but is NOT verified against the law text in this material. The exact figure and its passage should be checked directly against the king’s section of the Law of Uppland (Schlyter SSGL III / the Old Swedish text bank) before being stated as fact. That a snäcka denotes a warship a district (härad/hundare) was obliged to build and equip is, however, attested (Söderwall) — attested for the definition, not for the figure. '}
            <Stat k="omtvistat" sv={sv} /></p>
          <p>{sv
            ? 'Ledungssystemet genomgick en välkänd fiskal förvandling: den ursprungliga uppbådsskyldigheten (att faktiskt ställa skepp och manskap) omvandlades under hög- och senmedeltid till en stående skatt (skeppsvist/ledungslame). Denna övergång från naturaprestation till skatt är etablerad i forskningen (Lindkvist 1990).'
            : 'The levy underwent a well-known fiscal transformation: the original obligation to actually provide ships and men was converted during the high and late Middle Ages into a standing tax. This shift from levy-in-kind to tax is established in the literature (Lindkvist 1990).'}</p>
        </Part>

        <Part title={sv ? '5. Ting och folkland' : '5. Assembly and folkland'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Varje hundare hade sitt hundaresting — den lokala tings- och rättsförsamlingen. Hundarestinget var underordnat en högre nivå: folklandstinget. Uppland var sammansatt av folkland vars namn direkt räknar antalet ingående hundaren:'
            : 'Each hundare had its own hundaresting — the local assembly and court. It was subordinate to a higher level: the folkland assembly. Uppland was composed of folklands whose names directly count their constituent hundaren:'}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{sv ? 'Tiundaland = tíu hundari — "tio hundarens land"' : 'Tiundaland = tíu hundari — "the land of ten hundaren"'} <Stat k="belagt" sv={sv} /></li>
            <li>{sv ? 'Attundaland = átta hundari — "åtta hundarens land"' : 'Attundaland = átta hundari — "the land of eight hundaren"'} <Stat k="belagt" sv={sv} /></li>
            <li>{sv ? 'Fjädrundaland = "fyra hundarens land" (av räkneord för fyra)' : 'Fjädrundaland = "the land of four hundaren"'} <Stat k="belagt" sv={sv} /></li>
          </ul>
          <p>{sv
            ? 'Att folklandsnamnen bygger på räkneord + hundari är ett av de starkaste beläggen för hundaret som räknebar grundenhet. Roden (Roslagen) räknas ibland som ett fjärde folklandsområde med delvis annan organisation — hur Roden ska klassificeras är omtvistat. '
            : 'That the folkland names are built on numeral + hundari is among the strongest evidence for the hundare as a countable base unit. Roden (Roslagen) is sometimes counted as a fourth folkland area with a partly different organisation — how Roden should be classified is disputed. '}
            <Stat k="omtvistat" sv={sv} /></p>
          <p>{sv
            ? 'Över folklanden stod ett gemensamt uppländskt/svealändskt ting. Mora äng/Mora stenar (nära Uppsala) är i källor och tradition platsen för kungaval ("att tas till kung vid Mora sten"). Kungavalets koppling till Mora är belagt i medeltida källor; den exakta platsen för Mora stenar är dock förlorad/osäker och behandlas på plattformen som lägeshypotes. '
            : 'Above the folklands stood a common Uppland/Svealand assembly. Mora meadow/Mora stones (near Uppsala) is, in sources and tradition, the site of royal election ("to be taken as king at the Mora stone"). The election link to Mora is attested in medieval sources; the exact location of the Mora stones is, however, lost/uncertain and is treated on the platform as a location hypothesis. '}
            <Stat k="omtvistat" sv={sv} /></p>
        </Part>

        <Part title={sv ? '6. Skriftbelägg och datering — vikingatida ursprung endast indirekt' : '6. Attestation and dating — Viking-Age origin only indirect'} k="omtvistat" sv={sv}>
          <p>{sv
            ? 'Tydligaste lagbelägget är Upplandslagen (1296), som använder hundare genomgående och reglerar ting, ledung och skatt på hundaresnivå. Även Södermannalagen och Hälsingelagen hör till det svealändska lagkomplexet där ledungs-/indelningsterminologin framträder.'
            : 'The clearest legal attestation is the Law of Uppland (1296), which uses hundare throughout and regulates assembly, levy and tax at the hundare level. The Laws of Södermanland and Hälsingland also belong to the Svealand law complex in which the levy/division terminology appears.'}</p>
          <p>{sv
            ? 'Ursprunget till hundaresindelningen är äldre än de bevarade lagarna och antas ofta ha vikingatida eller tidigmedeltida rötter, men detta vilar på indirekta argument (folklandsnamnens ålder, ledungens förmodade vikingatida funktion, ortnamnsskikt) — inte på direkt samtida vikingatida skriftbelägg. Den skarpa källkritiska skiljelinjen: vikingatida ursprung = indirekt/omtvistat (rekonstruktion); landskapslagarnas reglering = direkt belagt, men först i skrift på 1200-talet (1296 för Upplandslagen).'
            : 'The origin of the hundare division is older than the surviving laws and is often assumed to have Viking-Age or early-medieval roots, but this rests on indirect arguments (the age of the folkland names, the presumed Viking-Age function of the levy, place-name strata) — not on contemporary Viking-Age written sources. The sharp source-critical line: Viking-Age origin = indirect/reconstructed; the legal regulation = directly attested, but only in 13th-century writing (1296 for the Law of Uppland).'}</p>
          <p>{sv
            ? 'Runstenar: enstaka runstenar tolkas som knutna till ledung/skeppsorganisation, men ett säkert runbelägg för själva ordet hundari är inte bekräftat i detta underlag och bör verifieras i Rundata med signum innan det påstås.'
            : 'Runestones: individual runestones are interpreted as tied to the levy/ship organisation, but a secure runic attestation of the word hundari itself is not confirmed in this material and should be verified in Rundata with a signum before being asserted.'}</p>
        </Part>

        <Part title={sv ? '7. Koppling: ledung och snäck-ortnamn' : '7. Link: the levy and snäck place-names'} k="belagt" sv={sv}>
          <p>{sv
            ? 'På fastlandet tillhör hundare/härad, ledung och snäck-ortnamn samma militär-territoriella system: distriktet (hundaret/häradet) skulle prestera skepp och manskap, och snäck-namn (Snäckhamn, Snäckvik m.fl.) markerar platser knutna till ledungsskepp.'
            : 'On the mainland, hundare/härad, the levy and snäck place-names belong to one military-territorial system: the district (hundare/härad) had to provide ships and men, and snäck-names (Snäckhamn, Snäckvik, etc.) mark places tied to levy ships.'}</p>
          <p>{sv
            ? 'Viktig källkritisk nyansering: Gotland följde INTE fastlandets hundare-ledung. Gotlands ledung byggde på öns egen ting-/sjättingsindelning (Gutasagan: gutarna följer sveakungen med sju snäckor, kopplat till sex sjättingar + Visby). Snäck-namn finns alltså i båda systemen, men organisationen skiljer sig — hundare-ledungen får inte tvingas på Gotland (Olsson 1972; Gutasagan).'
            : 'An important source-critical qualification: Gotland did NOT follow the mainland hundare-levy. Gotland’s levy was based on the island’s own ting/sjätting division (Gutasaga: the Gotlanders follow the Svea king with seven snäckor, tied to six sjättings + Visby). Snäck-names occur in both systems, but the organisation differs — the mainland model must not be imposed on Gotland (Olsson 1972; Gutasaga).'}</p>
        </Part>

        {/* Kort engelsk sammanfattning sist (visas alltid) */}
        <section className="mb-6 rounded-lg border border-slate-700/70 bg-slate-900/30 p-4">
          <h2 className="text-base font-semibold text-foreground mb-1.5">In brief (English)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The <em>hundare</em> (Old Swedish <em>hundari</em>) was the basic territorial and administrative unit of
            medieval Svealand — chiefly Uppland, with Västmanland and parts of Södermanland — the Swedish counterpart
            of the Anglo-Saxon <em>hundred</em>. It carried the assembly (<em>hundaresting</em>), the naval levy
            (<em>leiðangr</em>) and taxation, and was later displaced by the term <em>härad</em> (timing disputed,
            roughly the 14th–15th c.). The name derives from the numeral &ldquo;hundred&rdquo;, but <strong>what the
            hundred counted is unresolved</strong> (men, farms, or a levy-ship figure) and no single reading is
            promoted here. The specific claim of <em>four snäckor per hundare</em> is <strong>not verified against the
            law text</strong>. Direct written attestation begins in the 13th century (Law of Uppland, 1296); a
            <strong> Viking-Age origin is only indirectly attested</strong> (reconstruction). The folkland names
            Tiundaland, Attundaland and Fjädrundaland count their constituent hundaren. On the mainland the hundare,
            the levy and <em>snäck</em> place-names form one system — but Gotland followed its own <em>sjätting</em>
            organisation, not the mainland model.
          </p>
        </section>

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            'Schlyter, C. J., Corpus iuris Sueo-Gotorum antiqui / Samling af Sweriges gamla lagar (SSGL), bl.a. band III (Upplandslagen) — fornsvensk originaltext, public domain',
            'Fornsvenska textbanken (Delsing m.fl.) — digital utgåva av landskapslagarna (PD)',
            'Holmbäck, Åke & Wessén, Elias (1933), Svenska landskapslagar ser. 1 (Upplandslagen) — modern kommentar, ej citerad verbatim',
            'Wessén, Elias, Upplands ortnamn m.fl. — folklandsnamn och hundaresetymologins problem',
            'Hafström, Gerhard, art. "Hundare" & "Ledung" i KLNM; Hafström, Gustaf, Ledung och marklandsindelning (1949) — exakt band/sida kräver verifiering',
            'Lindkvist, Thomas (1990), Plundring, skatter och den feodala statens framväxt — ledungens omvandling till skatt',
            'Andersson, Thorsten (indelningsterminologi härad/hundare) — exakt titel/år kräver verifiering per påstående',
            'Brink, Stefan (territoriell organisation och centralplatser)',
            'Söderwall, K. F., Ordbok öfver svenska medeltids-språket — definition av snäcka och hamna',
            'Olsson, Ingemar (1972), "Snäck-namn på Gotland", Fornvännen 1972:180–208 (öppen fulltext)',
            'Gutasagan (forngutnisk text, PD) — Gotlands ledung (sju snäckor)',
            'Rundata (Samnordisk runtextdatabas) — kontroll av ev. runbelägg; inget säkert hundari-runbelägg bekräftat',
          ]}
        />
        <p className="text-[12px] text-slate-500 mt-3 max-w-3xl">
          {sv
            ? 'AI-stöd: underlaget sammanställdes med AI (Fabel/Opus) och har granskats och godkänts av Daniel Larsson. Öppna kontroller före publicering som fakta: (1) siffran skepp/snäckor per hundare mot Upplandslagens konungabalk (Schlyter SSGL III), (2) ev. runbelägg för hundari i Rundata med signum, (3) exakta band-/sidhänvisningar i KLNM samt titlar/år för Andersson och Wessén.'
            : 'AI assistance: the material was compiled with AI (Fabel/Opus) and checked and approved by Daniel Larsson. Open checks before stating as fact: (1) the ships/snäckor-per-hundare figure against the king’s section of the Law of Uppland (Schlyter SSGL III), (2) any runic attestation of hundari in Rundata with a signum, (3) exact KLNM volume/page references and the titles/years for Andersson and Wessén.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Hundare;
