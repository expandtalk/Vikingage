import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, ShieldCheck, BookOpen, ExternalLink, Info, HelpCircle, Users, History, Fingerprint } from 'lucide-react';

// /vetenskapsmetodik — hur plattformen arbetar källkritiskt: (1) metoden att inte
// släppa in dålig data (garbage in → garbage out), (2) hur väl vi följer Marnie
// Hughes-Warringtons "History and Artificial Intelligence" (Cambridge 2026).
// OBS copyright: dokumentets idéer parafraseras med egna ord + länk till originalet;
// ingen verbatim återgivning (© Cambridge University Press).

interface Principle { title: string; body: string }

// Del 1 — den vetenskapliga metoden att inte få in dålig data.
const DATA_PRINCIPLES: Principle[] = [
  {
    title: '1. Ingen gissning — belagt eller markerat obelagt',
    body: 'Grundregeln. Vi fyller aldrig luckor med plausibla antaganden som om de vore fakta. '
      + 'Är något overifierat skrivs det ut: "osäkert", "obelagt", "kräver verifiering". Hellre en '
      + 'ärlig lucka än en snygg gissning.',
  },
  {
    title: '2. Källa före påstående',
    body: 'Varje uppgift verifieras mot källa innan den lagras: primärkälla, Wikidata (P625 för '
      + 'koordinater), RAÄ Fornsök, SOL 2003, Isof ortnamnsregister, publicerad forskning. Källan anges '
      + '(source_ref / source_uri) så att läsaren kan kontrollera själv.',
  },
  {
    title: '3. Koordinater aldrig ur minnet',
    body: 'Lägen tas alltid ur en verifierad källa (P625, Fornsök, DEM). Approximativa lägen märks '
      + '(coord_confidence / coord_source) — ett fel på några kilometer får aldrig se ut som exakt.',
  },
  {
    title: '4. Fakta skiljs från sägen',
    body: 'Sägner och folktro får redovisas — men tydligt märkta som sägen, ofta med källkritiken '
      + 'bredvid. En folketymologi blir aldrig en etymologi.',
  },
  {
    title: '5. Konfidensgradering, inte tvärsäkerhet',
    body: 'Dateringar, tolkningar och kopplingar bär ett konfidensvärde (certain / probable / possible / '
      + 'contested; evidensklass; dating_confidence). Osäkerhet är en egenskap hos datan, inte något som '
      + 'göms undan.',
  },
  {
    title: '6. Verifieringspass mot extraktionsbrus',
    body: 'Automatiskt utvunnen data granskas och rensas: namnled skiljs från titlar, homonymer fångas '
      + '(t.ex. runt "goði" som kolliderar med guð "Gud", eller ortnamnsledet -bo som inte betyder skydd). '
      + 'Rå extraktion märks "raw" tills den är verifierad.',
  },
  {
    title: '7. Null-modeller och motbevisning',
    body: 'Mönster prövas mot en slumpbakgrund innan de tros på (t.ex. sitter runstenar på åsvägar '
      + 'oftare än sin omgivning?), och kända skevheter korrigeras (många stenar är flyttade → vi mäter '
      + 'på ursprungsläget). En hypotes ska kunna falla.',
  },
  {
    title: '8. Källrättigheter — fakta fritt, uttryck skyddat',
    body: 'Fakta är fria att återge. Ordagrann text (fulltext, långa citat) lagras bara om den är fri '
      + '(public domain / CC). En databas-spärr blockerar verbatim upphovsrättsskyddat material.',
  },
  {
    title: '9. Spårbarhet & revisionsbarhet',
    body: 'All datahistorik ligger i migrationer; varje post bär källhänvisning. Ny evidens kan alltid '
      + 'uppdatera en uppgift — historia är inte statisk, och plattformen är byggd för att kunna rättas.',
  },
  {
    title: '10. Människan verifierar AI:n',
    body: 'AI (datering, analys, sök-svar) är assistent, inte auktoritet. AI beskriver — människan tolkar '
      + 'och beslutar. AI-genererat innehåll märks och förses med en verifieringsväg ("källfört — verifiera '
      + 'via länkarna").',
  },
];

// Del 2 — hur väl vi följer Hughes-Warrington (parafras av hennes principer).
const HW_ALIGNMENT: { principle: string; us: string }[] = [
  {
    principle: 'AI beskriver snarare än tolkar — tolkning kräver mänskligt omdöme.',
    us: 'Regeln "ingen gissning": AI daterar/analyserar, människan verifierar och tolkar. AI fyller aldrig luckor som fakta.',
  },
  {
    principle: 'Källbarhet — noter och referenser så läsaren kan kontrollera.',
    us: 'source_ref / source_uri / attribution på allt; AI-svaret uppmanar att verifiera via länkarna.',
  },
  {
    principle: 'Osäkerhet ska signaleras (historiker använder "kan", "möjligen").',
    us: 'Konfidensfält (certain/probable/possible/contested), evidensklass, "approximativ" på lägen.',
  },
  {
    principle: 'Tystnader och skevheter i källorna ska erkännas.',
    us: 'Vi lyfter dem aktivt: elit-biasen ("vem fick en sten"), att ~hälften av stenarna är flyttade, luckor i registren.',
  },
  {
    principle: 'Proveniens före användning — varifrån kommer datan, vem gjorde den.',
    us: 'Källrättighets-spärr (verbatim endast PD/CC), namnauktoritet, tydlig attribuering av öppna data.',
  },
  {
    principle: 'AI kan inte vara författare — människan är ansvarig och krediteras.',
    us: 'Vi krediterar människor (forskare, fältdokumentärer), märker AI-innehåll och håller människan ansvarig.',
  },
];

const HW_TODO = [
  'Flytta ut tystnaderna och osäkerheten från datan till gränssnittet — visa användaren vad vi inte vet.',
  'Visuell osäkerhet: t.ex. halo/suddiga markörer för approximativa lägen, streckat för omtvistade dateringar.',
  'Hålla AI-svarens ton konditional (kan, möjligen) och explicit skilja beskrivning från tolkning.',
];

// Del 3 — vanliga frågor. Svaren är verifierade mot databasen (i metodikens anda:
// belagt, inte antaget). Siffrorna nedan är kontrollerade 2026-08-03.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Använder ni öppen data från RAÄ, eller är den från Wikimedia?',
    a: (
      <>
        Båda — och fler. <strong>RAÄ:s öppna data</strong> (Fornsök / K-samsök, CC0/CC-BY) är en
        huvudkälla för fornlämningar, kyrkor, vårdkasar och runstensfoton. <strong>Wikidata/Wikimedia</strong>{' '}
        används för verifierade koordinater (P625) och identitets­koppling (QID-rekonciliering).
        Därutöver: OpenStreetMap (ortnamn, ODbL), SGU (jordarter och geologi, CC-BY), Isof/SOL (ortnamn),
        EU-DEM/Copernicus (höjd), samt publicerad forskning. Varje post bär sin källa (source_uri), och
        varje källa attribueras.{' '}
        <a href="https://www.raa.se/hitta-information/oppna-data/oppna-data-portal/" target="_blank"
          rel="noopener noreferrer" className="text-gold hover:underline">RAÄ:s öppna data-portal →</a>
      </>
    ),
  },
  {
    q: 'Varför visar Viking Age bara ~10 kyrkor när Ångermanland har 47 socknar? Är det de äldsta som är relevanta?',
    a: (
      <>
        Nej — och det här är faktiskt ett bra exempel på metodiken ovan. Databasen innehåller{' '}
        <strong>89 kyrkor i Ångermanland</strong> (alla med koordinat; 25 med tydlig medeltidsdatering,
        från 1100-tal och framåt). Fler kyrkor än socknar beror på gamla + nya kyrkor, kapell, ruiner och
        frikyrkor. Att en viss vy bara visar ett tiotal är en <strong>filter- eller visningsgräns i den
        vyn</strong> (t.ex. ett aktivt tidsfilter eller ett specifikt kartlager), inte hela innehållet — och
        alltså <em>inte</em> en kuratering av "de tio relevanta". Antagandet att de visade skulle vara de
        äldsta/relevanta är precis den sortens gissning metodiken varnar för: kontrollera datan i stället
        för att härleda en logik. Alla 89 kan visas.
      </>
    ),
  },
  {
    q: 'Kan man söka på de "dominerande orden" (ortnamnsleden), särskilt för sockenkyrkor?',
    a: (
      <>
        Delvis i dag, mer på sikt. Vi har ett ortnamnsled-ramverk med <strong>33 led</strong> (t.ex.
        <em> tor-, frö-, sal-, hov-, stav-, härn-</em>) märkta med tidsskikt, och{' '}
        <strong>8&nbsp;314 ortnamn</strong> taggade med led, samt en hypotes­testare för ortnamn. En
        dedikerad sökning som korsar dominerande led <em>specifikt mot sockenkyrkor</em> är delvis möjlig
        redan nu, men blir en riktig funktion när mer kyrk- och sockendata länkats samman i grafen.
        Grunddatan finns alltså — vyn är på väg.
      </>
    ),
  },
];

const Vetenskapsmetodik = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Vetenskapsmetodik — källkritik och datakvalitet"
      titleEn="Scientific methodology — source criticism and data quality"
      description="Hur Viking Age arbetar källkritiskt: metoden att inte släppa in dålig data (belagt eller markerat obelagt), och hur väl plattformen följer Marnie Hughes-Warringtons ramverk för historia och artificiell intelligens."
      descriptionEn="How Viking Age works with source criticism: the method for keeping bad data out, and how the platform aligns with Marnie Hughes-Warrington's framework for history and artificial intelligence."
      keywords="vetenskapsmetodik, källkritik, datakvalitet, historia och AI, Hughes-Warrington, artificiell intelligens, forskningsetik"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-gold" />
          Vetenskapsmetodik
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Viking Age är en forskningsplattform. Trovärdigheten är hela produkten. Därför är metoden
          — hur vi samlar, verifierar och redovisar data, och hur vi använder AI — inte en detalj utan
          själva grunden. Två saker beskrivs här: <strong>hur vi håller dålig data ute</strong>, och
          <strong> hur väl vi följer</strong> den forskning som finns om historia och artificiell intelligens.
        </p>
      </div>

      {/* DEL 1 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          Att inte släppa in dålig data
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Principen <em>garbage in, garbage out</em> gäller dubbelt för en historisk databas: en enda
          påhittad koordinat eller folketymologi förorenar allt som byggs ovanpå. Datakvalitet är därför
          ingen efterhandskontroll utan en spärr <em>vid inflödet</em>. Så här ser spärren ut:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DATA_PRINCIPLES.map((p) => (
            <Card key={p.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gold">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Attribution, ägande & medskapande */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          Attribution, ägande &amp; medskapande
        </h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Varje uppgift bär sin källa, och varje källa krediteras — dataset, arkiv, fältdokumentärer och
          forskare. De namngivna forskarna och källorna samlas på en egen sida.
        </p>
        <Link to="/forskare"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline mb-4">
          <Users className="h-4 w-4" /> Forskare &amp; källor →
        </Link>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Du äger din egen data.</strong> Tar du med eget material —
          t.ex. ett släktträd — stannar det hos dig (släktforskningen körs i din webbläsare, inget laddas
          upp, ingen GDPR-fråga). Vi gör inte anspråk på det du bidrar med. Vår roll är den motsatta: att
          <em> hjälpa</em> till så att felaktig data inte kommer in — samma källkritiska spärr gäller allt —
          och att berika med källbelagd kontext, inte att ta över.
        </p>
      </section>

      {/* Att följa objekten över tid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <History className="h-6 w-6 text-gold" />
          Att följa objekten över tid
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Föremål och platser står sällan stilla. En trovärdig databas måste kunna följa dem — varifrån de
          kom, hur de förändrats, och vilka de liknar.
        </p>
        <div className="space-y-3">
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Kyrkornas tidslinje</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              För de äldsta kyrkorna följer vi byggnadsfaserna — när kyrkan uppförts och byggts om — och vad
              de arkeologiska undersökningarna faktiskt hittat (dendrodateringar, äldre grundmurar, mynt i
              kyrkorummet, begravningar). En kyrka är sällan från ett enda år; tidslinjen visar lagren.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Runstenarnas proveniens</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Runstenar har ofta flyttats under århundradena — inmurade i kyrkor, flyttade till gårdar,
              museer eller vägkanter. Vi skiljer <em>ursprungligt</em> från <em>nuvarande</em> läge och
              följer stenen genom historien. Det är också en förutsättning för korrekt analys: en flyttad
              sten mäter fel omgivning — nästan hälften av de stenar vi har lägeshistorik för är flyttade
              mer än hundra meter.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1 flex items-center gap-1.5">
              <Fingerprint className="h-4 w-4" /> Forensik &amp; digital fingerprint
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              För olika objekt finns forensiska verktyg — datering, attribuering (ristarhand), diakron
              språkanalys, samt proveniensanalys av hällristningar och metaller. Och vi beskriver objekt som
              <em> särdragsvektorer</em> — en digital fingerprint — för att hitta likvärdiga: en djupgående
              naturhamn, en centralplats, en fornborg. Så jämförs lika med lika i landskapet i stället för
              att gissa.
            </p>
          </div>
        </div>
      </section>

      {/* DEL 2 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          Hur väl följer vi forskningen om historia &amp; AI?
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Marnie Hughes-Warrington beskriver i <em>History and Artificial Intelligence</em> (Cambridge
          University Press, 2026) hur historia görs <em>om</em> AI, <em>med</em> AI och <em>av</em> AI, och
          vilka principer som bör styra "artificiella historiker". Vi har prövat plattformen mot hennes
          ramverk. Kortfattat: vi ligger nära — flera av hennes principer är inbyggda i våra arbetsregler.
        </p>

        <div className="space-y-2 mb-6">
          {HW_ALIGNMENT.map((row, i) => (
            <div key={i} className="viking-card rounded-lg p-3">
              <p className="text-xs text-gold/90 font-medium mb-0.5">Princip: {row.principle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Hos oss: {row.us}</p>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2">Vad vi kan göra bättre</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground mb-6">
          {HW_TODO.map((t, i) => <li key={i} className="leading-relaxed">{t}</li>)}
        </ul>

        <div className="viking-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-gold">Källa:</strong> Hughes-Warrington, Marnie (2026).
            <em> History and Artificial Intelligence</em>. Elements in Historical Theory and Practice,
            Cambridge University Press. DOI 10.1017/9781009572187.
          </p>
          <a
            href="https://doi.org/10.1017/9781009572187"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Läs dokumentet hos Cambridge Core
          </a>
        </div>
      </section>

      {/* DEL 3 — FAQ (svaren verifierade mot databasen) */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-gold" />
          Vanliga frågor
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Card key={i} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gold">{f.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.a}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground opacity-75 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Hughes-Warringtons idéer återges här med egna ord och länk till originalet — ingen ordagrann
          återgivning, eftersom verket är upphovsrättsskyddat (© Cambridge University Press). Fakta och
          idéer är fria att sammanfatta; själva texten är det inte.
        </span>
      </p>
    </main>
    <Footer />
  </div>
);

export default Vetenskapsmetodik;
