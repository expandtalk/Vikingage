import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, ShieldCheck, BookOpen, ExternalLink, Info, HelpCircle, Users, History, Fingerprint, Scale, Bot } from 'lucide-react';

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
      + 'ärlig lucka än en snygg gissning. Påståenden bär en synlig märkning — belagt, tolkning, '
      + 'hypotes eller obelagt — så läsaren ser skillnaden direkt i texten.',
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

// Icke-destruktiv metod vs. destruktiv extraktion ("Project Panama"). Tvåspråkigt — svensk brödtext
// med engelsk spegel för internationell spridning. Fakta: Papmehl-Dufay (Kalmar läns museum); Sö 333
// (Rundata, "dräpt ute i Kalmarsund", 1000-tal); Peringskiöld 1680 (förkastad rudbeckiansk läsning).
const PANAMA_CONTRAST: { bad: string; badEn: string; good: string; goodEn: string }[] = [
  {
    bad: 'Slukar hela verket — dess ordval och röst — in i modellens vikter',
    badEn: 'Ingests the whole work — its wording and voice — into model weights',
    good: 'Extraherar fakta (ett årtal, en koordinat, en etymologi — inte upphovsrättsligt) och citerar källan',
    goodEn: 'Extracts facts (a date, a coordinate, an etymology — not copyrightable) and cites the source',
  },
  {
    bad: 'Den fysiska boken förstörs efter skanning',
    badEn: 'The physical copy is destroyed after scanning',
    good: 'Källan lämnas hel; vi länkar till den och lyfter dess synlighet',
    goodEn: 'The source is left whole; we link to it and raise its visibility',
  },
  {
    bad: 'Proveniensen döljs ("we don’t want it to be known")',
    badEn: 'Provenance is hidden ("we don’t want it to be known")',
    good: 'Proveniens är obligatorisk — varje påstående bär källa, konfidens och statusmärkning',
    goodEn: 'Provenance is mandatory — every claim carries source, confidence and a status label',
  },
  {
    bad: '"Skanna allt, klart"',
    badEn: '"Scan everything, done"',
    good: 'Människa-i-loopen: agenter föreslår, en människa befordrar, en drift-vakt rekoncilierar',
    goodEn: 'Human-in-the-loop: agents propose, a person promotes, a drift-guard reconciles',
  },
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
      title="Vetenskapsmetodik och AI"
      titleEn="Scientific Methodology and AI"
      description="Vetenskapsmetodik och AI på forskningsplattformen Viking Age: en icke-destruktiv, källbevarande metod — vi extraherar fakta och citerar källan i stället för att sluka och strimla original (jfr Project Panama). Belagt eller markerat obelagt, källa före påstående, koordinater ur verifierad källa, konfidensgradering, människa-i-loopen — mätt mot Marnie Hughes-Warringtons ramverk för historia och AI."
      descriptionEn="Scientific methodology and AI at the Viking Age research platform: a non-destructive, source-preserving method — we extract facts and cite the source instead of ingesting and shredding originals (cf. Project Panama). Attested or flagged unattested, source before claim, verified coordinates, confidence grading, human-in-the-loop — measured against Marnie Hughes-Warrington's framework for history and AI."
      keywords="vetenskapsmetodik, källkritik, datakvalitet, non-destructive AI, Project Panama, historia och AI, Hughes-Warrington, artificiell intelligens, forskningsetik"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-gold" />
          Vetenskapsmetodik och AI
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

      {/* Märkningen + claim-liggaren */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Scale className="h-6 w-6 text-gold" />
          Belagt, tolkning, hypotes — och konkurrerande läsningar
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Ett påstående på plattformen är sällan bara "sant" eller "falskt" — det har en <em>status</em>.
          Grundvokabulären är fyra steg, som visas som en färgmärkt etikett i texten:
        </p>
        <div className="grid gap-2 sm:grid-cols-2 mb-5">
          {[
            { c: '#22c55e', t: 'Belagt', d: 'stöds direkt av en verifierad källa.' },
            { c: '#38bdf8', t: 'Tolkning', d: 'en läsning av evidensen; rimlig men inte bevisad.' },
            { c: '#f59e0b', t: 'Hypotes', d: 'ett testbart antagande som ännu inte prövats färdigt.' },
            { c: '#94a3b8', t: 'Obelagt', d: 'saknar stöd — sägs rakt ut, aldrig maskerat som fakta.' },
          ].map((s) => (
            <div key={s.t} className="viking-card rounded-lg p-3 flex items-start gap-2.5">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.c }} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{s.t}.</strong> {s.d}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Vissa fält har en mer finkornig vokabulär — runläsningar märks t.ex. <em>transkription</em> (vad
          som står), <em>etablerad</em> (fackgranskad huvudläsning), <em>omstridd</em>, <em>oberoende</em>{' '}
          (icke fackgranskad) och <em>förkastad</em> — men principen är densamma.
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Framför allt tvingas inte olika forskare till en enda "sanning". Konkurrerande tolkningar ligger
          bredvid varandra i en <strong>claim-liggare</strong>, var och en med sin källa, sin förespråkare
          (med fullständigt namn) och sitt konfidensvärde:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-4">
          <li><code className="text-gold/90">place_claim</code> — attribut-nycklade påståenden om platser
            (t.ex. datering, funktion), med källa, konfidens och verifieringsstatus.</li>
          <li><code className="text-gold/90">interpretation_claim</code> — konkurrerande läsningar av
            runinskrifter, per textparti och attribuerade till respektive forskare.</li>
          <li><code className="text-gold/90">place_name_relation</code> — namn-relationer över tid
            (t.ex. föregångsnamn) som hypoteser med förespråkare och belägg, inte som fast sanning.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mätlagret (observationen) hålls rent och avdubblat; <em>tolkningarna</em> hålls plurala och
          tidsstämplade — de skiftar med generationer och forskningsströmningar och konsolideras aldrig till
          "sanningen". Motstridiga påståenden kan dessutom länkas explicit som konflikt, så att en oenighet
          syns i stället för att döljas. Ett konkret exempel är de{' '}
          <Link to="/sv/vikingatid" className="text-gold hover:underline">konkurrerande läsningarna av
          Rökstenen (Ög 136)</Link>.
        </p>
      </section>

      {/* Människa-i-loopen: AI-agentflottan + adversariell verifiering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Bot className="h-6 w-6 text-gold" />
          Människa i loopen — och en motståndare mot datan
        </h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Bakom materialet arbetar en flotta av källkritiska <strong>specialistagenter</strong> (arkeologi,
          runologi, ortnamn/filologi, GIS, datakvalitet, QA). De <em>utreder och föreslår</em> — de skriver
          aldrig till kanon på egen hand. Varje förslag landar först som ett <em>claim</em> med källa,
          konfidens och märkning (belagt / tolkning / hypotes / obelagt). En människa granskar och beslutar
          innan något blir bestående. Ingen AI-utdata går rakt in i databasen.
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Maskinellt verifierbara fynd (t.ex. en koordinat via Wikidata P625, en RAÄ-URI, en databasräkning)
          kan befordras automatiskt <em>med proveniens</em>. Tolkning, etymologi och attribuering kräver
          alltid en människa eller en verifierar-agent.
        </p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          <strong className="text-foreground">Adversariell verifiering.</strong> Att bygga in en uppgift
          räcker inte — den ska också gå att rasera. En verifierar-agent fungerar som en drift-vakt: den läser
          om kanon mot källorna, prövar påståendena och flaggar avvikelser (en källa som ändrats, en koordinat
          som glidit, en hypotes som aldrig prövades klart). Så fångas tyst förfall i stället för att sätta sig
          i datan.
        </p>
        <Link to="/ai-agenter"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline">
          <Bot className="h-4 w-4" /> Så arbetar AI-agenterna →
        </Link>
      </section>

      {/* Icke-destruktiv metod vs. destruktiv extraktion — tvåspråkigt (sv + en) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          Icke-destruktiv metod — vår metodik mot destruktiv extraktion
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Under 2026 avslöjades att AI-bolag köpt sällsynta och utgångna böcker i miljontal, skurit av
          ryggarna, kört sidorna genom höghastighetsskannrar och strimlat originalen — en satsning som
          enligt interna dokument kallades <em>Project Panama</em>, med det uttalade målet att
          "destructively scan all the books in the world" och hålla det tyst. Viking Age bygger på den
          motsatta principen. Skillnaden är <strong>arkitektonisk, inte kosmetisk</strong>:
        </p>
        <div className="overflow-x-auto mb-5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border-b border-border/60 pb-2 pr-3 font-medium text-slate-400">Destruktiv extraktion</th>
                <th className="border-b border-border/60 pb-2 pl-3 font-medium text-gold">Viking Age</th>
              </tr>
            </thead>
            <tbody>
              {PANAMA_CONTRAST.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="border-b border-border/30 py-2 pr-3 text-muted-foreground">{r.bad}</td>
                  <td className="border-b border-border/30 py-2 pl-3 text-muted-foreground">{r.good}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 mb-5">
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">1. Fakta, inte uttryck.</strong> Fakta är fria att
              återge; formuleringar är det inte. Ordagrann text lagras bara om den är public domain eller
              öppet licensierad — en databas-spärr blockerar upphovsrättsskyddad fulltext. En forskares bok
              blir en <em>hänvisning som leder läsaren till hen</em>, inte en tyst donator till en modell.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">2. En hänvisningsmotor, inte en dränering.</strong>{' '}
              Destruktiv skanning avslutar originalets liv och skär bort upphovsmannen. Vår pipeline gör
              tvärtom: den gör källan <em>mer</em> synlig och driver trafik till antikvariat, arkiv och
              levande forskare — som krediteras med fullständigt namn.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">3. Där det fungerar — AI-agent-pipelinen.</strong>{' '}
              Källkritiska specialistagenter <em>utreder och föreslår</em> — de skriver aldrig till kanon
              själva. Maskinellt verifierbara fynd (koordinat via Wikidata&nbsp;P625, RAÄ-URI, DB-räkning)
              kan befordras automatiskt <em>med proveniens</em>; tolkning och etymologi kräver alltid en
              människa eller en adversariell verifierar-agent. LLM:en är ett <em>resonemangsverktyg ovanpå
              citerad data med en verifieringsväg</em> — inte ett kunskapslager byggt av strimlade böcker.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2">Exempel: hur metoden fångar övertolkning</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Staden <Link to="/sv/kalmar" className="text-gold hover:underline">Kalmar</Link> är belagd först
          från 1200-talet (vårt tidigaste brevbelägg: 1266). Men <em>namnet</em> är äldre: 1000-talsstenen
          <Link to="/inscription/S%C3%B6%20333" className="text-gold hover:underline"> Sö 333</Link> vid Ärja i Södermanland omtalar en man som "blev dräpt ute i
          <strong> Kalmarsund</strong>". Namnet är alltså belagt på vikingatiden fast staden är medeltida —
          <em> belägg är inte namnets ålder</em>, och vi håller de två på skilda axlar.
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Den källkritiska poängen visar samtidigt varför vi skiljer <strong>observation från tolkning</strong>.
          Johan Peringskiöld (1654–1720) var riksantikvarie och en av tidens främsta runstenstecknare — en
          nykter och exakt fältiakttagare vars teckningar i dag är <em>primärkällor för många stenar som sedan
          har försvunnit</em>. Men som runtolkare var han ett barn av sin tid och rudbeckian: i runföljden
          <em> kalmarna · sutuma</em> på Sö 333 läste han på 1680-talet in både "det galileiska havet" och
          "Sodom" — ett tänkt bevis för att forntida svenskar format den bibliska historien. I verkligheten är
          det en udda skrivning för <strong>Kalmarsund</strong> (Magnus Källström, RAÄ). Samma person:
          pålitlig som iakttagare, ideologisk som uttolkare — den förmoderna föregångaren till en
          AI-hallucination. Därför hålls hans teckning (en datakälla vi litar på och vill använda) skild från
          hans Sodom-läsning (förkastad, men bevarad som forskningshistoria). Metoden gör båda felslagen
          omöjliga att smyga in som fakta:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-4">
          <li>den etablerade läsningen (<em>Kalmarsund</em>) lagras som <strong>tolkning</strong>, inte som
            oomtvistad sanning — och bär en noterad osäkerhet, eftersom ristaren Eskils omkastade och
            utelämnade runor gör vissa namnformer instabila (Wessén);</li>
          <li>1680-läsningen bevaras som <strong>forskningshistoria</strong>, tydligt märkt som förkastad och
            källkritiskt vederlagd — synlig, inte raderad;</li>
          <li>etymologin (<em>kalm</em> "ett grund/stenrev under vatten" + <em>mar</em> "grund vik") är märkt
            som standardläsning med sin källa (Ludvig Papmehl-Dufay, Kalmar läns museum), inte påstådd som
            avgjord;</li>
          <li>och eftersom homonymer skiljs åt (Ärja socken, där stenen står, är inte Ärla socken, först
            belagt 1278) är påståendet förankrat i rätt plats.</li>
        </ul>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          En destruktiv modell slukar allt detta — den rätta läsningen, 1680-fantasin och osäkerheten — och
          medelvärdesbildar till ett slätt svar utan väg tillbaka till stenen. Vi behåller stenen, källorna
          och oenigheten i öppen dager. <em>Ärlig reservation: vi använder också en generativ modell (Claude,
          server-side). Skillnaden är rollen — den resonerar över citerad, människo-verifierad data och pekar
          alltid tillbaka till källan; den är aldrig auktoriteten, och ingen modell-utdata går in i databasen
          på egen hand.</em>
        </p>

        {/* Engelsk spegel för internationell spridning */}
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/30 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-3 font-medium">In English</p>
          <h3 className="text-base font-semibold text-foreground mb-2">Non-destructive by design: our method vs. destructive extraction</h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            In 2026, reporting revealed that AI labs were buying rare and out-of-print books by the million,
            slicing off their spines, running the pages through high-speed scanners and shredding the
            originals — an effort reportedly named <em>Project Panama</em>, whose stated goal was to
            "destructively scan all the books in the world", and to keep it quiet. Viking Age is built on the
            opposite principle. The difference is <strong>architectural, not cosmetic</strong>:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-border/60 pb-2 pr-3 font-medium text-slate-400">Destructive extraction</th>
                  <th className="border-b border-border/60 pb-2 pl-3 font-medium text-gold">Viking Age</th>
                </tr>
              </thead>
              <tbody>
                {PANAMA_CONTRAST.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="border-b border-border/30 py-2 pr-3 text-muted-foreground">{r.badEn}</td>
                    <td className="border-b border-border/30 py-2 pl-3 text-muted-foreground">{r.goodEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground mb-4">
            <li><strong className="text-foreground">Facts, not expression.</strong> Facts are free to
              restate; wording is not. Verbatim text is stored only when public domain or openly licensed — a
              database guard blocks copyrighted full text. A scholar’s book becomes a citation that sends
              readers to them, not a silent donor to a model.</li>
            <li><strong className="text-foreground">A referral engine, not a drain.</strong> Destructive
              scanning ends the original’s life and cuts the author out. Our pipeline does the reverse: it
              makes the source more findable and drives traffic to antiquarian sellers, archives and living
              researchers — credited by full name.</li>
            <li><strong className="text-foreground">Where it works — the AI-agent pipeline.</strong>{' '}
              Source-critical specialist agents investigate and propose — they never write to canon on their
              own. Machine-verifiable findings (a coordinate via Wikidata&nbsp;P625, a heritage URI, a
              database count) can be promoted automatically with provenance; interpretation and etymology
              always require a human or an adversarial verifier-agent. The LLM is a reasoning tool over cited
              data with a verify path — not a knowledge store built from shredded books.</li>
          </ol>
          <p className="text-xs font-medium text-foreground mb-1">Worked example: how the method catches over-interpretation</p>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            The town of Kalmar is documented only from the 13th century (our earliest charter attestation:
            1266). But the <em>name</em> is older: the 11th-century runestone <Link to="/inscription/S%C3%B6%20333" className="text-gold hover:underline">Sö 333</Link> at Ärja,
            Södermanland, records a man "slain out in <strong>Kalmarsund</strong>". The name is attested in
            the Viking Age even though the town is medieval — attestation is not the age of the name, and we
            keep the two on separate axes.
          </p>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            The source-critical point also shows why we separate <strong>observation from interpretation</strong>.
            Johan Peringskiöld (1654–1720) was Sweden’s antiquary-royal and one of the finest runestone
            illustrators of his age — a sober, exact field observer whose drawings are today <em>primary sources
            for many stones since lost</em>. But as a rune-interpreter he was a child of his time, a follower of
            Rudbeck: in the sequence <em>kalmarna · sutuma</em> on Sö 333 he read, in the 1680s, both "the
            Galilean sea" and "Sodom" — supposed proof that ancient Swedes shaped biblical history. In reality it
            is an odd spelling of <strong>Kalmarsund</strong> (Magnus Källström, Swedish National Heritage
            Board). The same man: reliable as an observer, ideological as an interpreter — the pre-modern
            ancestor of an AI hallucination. So we keep his drawing (a data source we trust and want to use)
            apart from his Sodom reading (rejected, but preserved as history of scholarship). Our method makes
            both failure modes impossible to pass off as fact:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-3">
            <li>the established reading (<em>Kalmarsund</em>) is stored as an <strong>interpretation</strong>,
              not an unquestioned truth — and carries a noted uncertainty, because the carver Eskil’s
              transposed and omitted runes make some name-forms genuinely unstable (Wessén);</li>
            <li>the 1680 reading is preserved as <strong>history of scholarship</strong>, clearly labelled as
              a rejected, source-critically discredited interpretation — visible, not deleted;</li>
            <li>the etymology (<em>kalm</em> "an underwater stone shoal" + <em>mar</em> "shallow bay") is
              tagged as the standard reading with its source (Ludvig Papmehl-Dufay, Kalmar County Museum), not
              asserted as settled fact;</li>
            <li>and because homonyms are disambiguated (Ärja parish, where the stone stands, is not Ärla
              parish, first attested 1278), the claim is anchored to the right place.</li>
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A destructive model swallows all of this — the correct reading, the 1680 fantasy and the
            uncertainty — and averages them into one smooth answer with no way back to the stone. We keep the
            stone, the sources and the disagreement in plain sight. <em>Honest caveat: we use a generative
            model too (Claude, server-side). The difference is its role — it reasons over cited,
            human-verified data and always points back to the source; it is never the authority, and no model
            output enters the database on its own.</em>
          </p>
        </div>
      </section>

      {/* Oberoende, icke fackgranskade läsningar */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          Oberoende, icke fackgranskade läsningar
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Delar av den folkliga debatten driver egna läsningar av vikingatiden och av enskilda inskrifter — ett
          exempel är Fredrik Ousbäck / YouTube-kanalen FORMAT HISTORIA. Sådana bidrag kan redovisas, men de
          märks då tydligt <em>oberoende</em> (icke fackgranskade) och hålls åtskilda från den fackgranskade
          runologin — aldrig jämställda med den, aldrig som "fakta". De bär ett lågt konfidensvärde och en
          källkritisk not, och de förs bara in när upphovsmannen anger en kontrollerbar källhänvisning som en
          runolog kan pröva. Det är samma spärr som gäller allt annat: en läsning utan belägg blir inte kanon.
        </p>
      </section>

      {/* Proveniensnot per artikel */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          Proveniensnot på källbelagda artiklar
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Längre artiklar avslutas med en <strong>proveniensnot</strong> som redovisar tre saker öppet: vilka
          källor texten vilar på, att materialet sammanställts och analyserats <em>med AI-stöd</em>, och att
          det därefter kontrollerats och godkänts av en människa (Daniel Larsson). Noten upprepar också att
          påståenden är märkta belagt, tolkning eller hypotes, och att obelagt anges som sådant. Så här ser
          den ut:
        </p>
        <section className="rounded-lg border border-slate-700/70 bg-slate-900/30 p-4 text-[12px] leading-relaxed text-slate-400">
          <p className="mb-1 font-medium text-slate-300">Källor</p>
          <p className="mb-3">Källa A · Källa B · Källa C</p>
          <p className="border-t border-slate-700/70 pt-3 text-slate-400">
            <span className="font-medium text-slate-300">Metod &amp; granskning: </span>
            Materialet har sammanställts och analyserats med AI-stöd och därefter kontrollerats och godkänts av
            Daniel Larsson. Påståenden är märkta belagt, tolkning eller hypotes; obelagt anges som sådant.
          </p>
        </section>
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

      {/* AI-transparens (EU AI Act art. 50) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          AI-transparens (EU AI Act art. 50)
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Vi använder AI som ett hjälpmedel, öppet och märkt. Här är exakt hur, i förhållande till EU:s
          AI-förordnings transparenskrav (tillämpliga sedan 2 augusti 2026).
        </p>
        <div className="space-y-3">
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Vilket innehåll som är AI-genererat</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Datering och analys av runinskrifter, forensiskt fingerprint, källförda sök-svar, samt
              AI-översättningar av public domain-grundtext. Allt sådant är <strong>märkt "AI-genererat"</strong>{' '}
              med en verifieringsväg ("källfört — verifiera via länkarna"). Övrig text på plattformen är
              källbelagd och människoskriven.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">AI-runolog — identifiering &amp; dokumentation av runor</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              En <strong>AI-runolog</strong> (specialistagent) hjälper till att identifiera och dokumentera
              runinskrifter: läsa transkription, föreslå datering (Gräslund-stil), formler och ristarhand,
              samt göra källkritiska bedömningar. Den <em>föreslår</em> — en människa verifierar och beslutar
              innan något blir bestående. Att läsa slitna eller lavtäckta ristningar ur ett foto kräver
              dessutom bildförbättring (släpljus/RTI/DStretch) och en mänsklig runolog; en pixel-gissning
              görs aldrig.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Människan bär det redaktionella ansvaret</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI beskriver — en människa granskar, verifierar och beslutar innan något blir kanon
              (människa-i-loopen). Ingen AI-utdata skrivs till databasen på egen hand. Det uppfyller art.
              50.4 (avslöja AI-genererat innehåll avsett att informera allmänheten) och dess undantag för
              mänsklig redaktionell granskning.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Interaktion &amp; inga deepfakes</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-ytorna är tydligt märkta som AI (art. 50.1); ingen chatbot utger sig för att vara människa.
              Vi genererar <strong>inga syntetiska bilder eller deepfakes</strong> — alla foton är riktiga
              (RAÄ/SHM/Wikimedia Commons) och attribuerade.
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">Vår roll: användare, inte modell-leverantör</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vi <em>använder</em> en generativ modell (via OpenRouter) server-side — vi tillhandahåller ingen
              egen generativ modell. Den maskinläsbara märkningen av modell-output (art. 50.2, vattenstämpel/
              C2PA) åligger modell-leverantören. Detta är information, inte juridisk rådgivning.
            </p>
          </div>
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
