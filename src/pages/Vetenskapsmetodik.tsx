import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, ShieldCheck, BookOpen, ExternalLink, Info, HelpCircle, Users, History, Fingerprint, Scale, Bot } from 'lucide-react';

// /sv/vetenskapsmetodik (svenska) + /en/scientific-methodology (engelska) — hur plattformen arbetar
// källkritiskt. Tvåspråkig: språk styrs av ROUTEN via forceLang, annars global språkkontext.
// OBS copyright: Hughes-Warringtons idéer parafraseras + länk; ingen verbatim (© Cambridge UP).

interface Principle { title: string; titleEn: string; body: string; bodyEn: string }

const DATA_PRINCIPLES: Principle[] = [
  {
    title: '1. Ingen gissning — belagt eller markerat obelagt',
    titleEn: '1. No guessing — attested or flagged unattested',
    body: 'Grundregeln. Vi fyller aldrig luckor med plausibla antaganden som om de vore fakta. '
      + 'Är något overifierat skrivs det ut: "osäkert", "obelagt", "kräver verifiering". Hellre en '
      + 'ärlig lucka än en snygg gissning. Påståenden bär en synlig märkning — belagt, tolkning, '
      + 'hypotes eller obelagt — så läsaren ser skillnaden direkt i texten.',
    bodyEn: 'The ground rule. We never fill gaps with plausible assumptions as if they were facts. If '
      + 'something is unverified we write it out: "uncertain", "unattested", "needs verification". An '
      + 'honest gap beats a neat guess. Claims carry a visible label — attested, interpretation, '
      + 'hypothesis or unattested — so the reader sees the difference right in the text.',
  },
  {
    title: '2. Källa före påstående',
    titleEn: '2. Source before claim',
    body: 'Varje uppgift verifieras mot källa innan den lagras: primärkälla, Wikidata (P625 för '
      + 'koordinater), RAÄ Fornsök, SOL 2003, Isof ortnamnsregister, publicerad forskning. Källan anges '
      + '(source_ref / source_uri) så att läsaren kan kontrollera själv.',
    bodyEn: 'Every item is verified against a source before it is stored: primary source, Wikidata (P625 '
      + 'for coordinates), RAÄ Fornsök, SOL 2003, the Isof place-name register, published research. The '
      + 'source is stated (source_ref / source_uri) so the reader can check for themselves.',
  },
  {
    title: '3. Koordinater aldrig ur minnet',
    titleEn: '3. Coordinates never from memory',
    body: 'Lägen tas alltid ur en verifierad källa (P625, Fornsök, DEM). Approximativa lägen märks '
      + '(coord_confidence / coord_source) — ett fel på några kilometer får aldrig se ut som exakt.',
    bodyEn: 'Locations always come from a verified source (P625, Fornsök, DEM). Approximate locations are '
      + 'flagged (coord_confidence / coord_source) — an error of a few kilometres must never look exact.',
  },
  {
    title: '4. Fakta skiljs från sägen',
    titleEn: '4. Fact kept apart from legend',
    body: 'Sägner och folktro får redovisas — men tydligt märkta som sägen, ofta med källkritiken '
      + 'bredvid. En folketymologi blir aldrig en etymologi.',
    bodyEn: 'Legends and folklore may be reported — but clearly marked as legend, often with the source '
      + 'criticism alongside. A folk etymology never becomes an etymology.',
  },
  {
    title: '5. Konfidensgradering, inte tvärsäkerhet',
    titleEn: '5. Confidence grading, not false certainty',
    body: 'Dateringar, tolkningar och kopplingar bär ett konfidensvärde (certain / probable / possible / '
      + 'contested; evidensklass; dating_confidence). Osäkerhet är en egenskap hos datan, inte något som '
      + 'göms undan.',
    bodyEn: 'Datings, interpretations and links carry a confidence value (certain / probable / possible / '
      + 'contested; evidence class; dating_confidence). Uncertainty is a property of the data, not '
      + 'something hidden away.',
  },
  {
    title: '6. Verifieringspass mot extraktionsbrus',
    titleEn: '6. A verification pass against extraction noise',
    body: 'Automatiskt utvunnen data granskas och rensas: namnled skiljs från titlar, homonymer fångas '
      + '(t.ex. runt "goði" som kolliderar med guð "Gud", eller ortnamnsledet -bo som inte betyder skydd). '
      + 'Rå extraktion märks "raw" tills den är verifierad.',
    bodyEn: 'Automatically extracted data is reviewed and cleaned: name elements are separated from titles, '
      + 'homonyms are caught (e.g. around "goði" colliding with guð "God", or the place-name element -bo '
      + 'that does not mean shelter). Raw extraction is marked "raw" until verified.',
  },
  {
    title: '7. Null-modeller och motbevisning',
    titleEn: '7. Null models and refutation',
    body: 'Mönster prövas mot en slumpbakgrund innan de tros på (t.ex. sitter runstenar på åsvägar '
      + 'oftare än sin omgivning?), och kända skevheter korrigeras (många stenar är flyttade → vi mäter '
      + 'på ursprungsläget). En hypotes ska kunna falla.',
    bodyEn: 'Patterns are tested against a random background before they are believed (e.g. do runestones '
      + 'sit on esker roads more often than their surroundings?), and known biases are corrected (many '
      + 'stones have been moved → we measure the original location). A hypothesis must be able to fail.',
  },
  {
    title: '8. Källrättigheter — fakta fritt, uttryck skyddat',
    titleEn: '8. Source rights — facts free, expression protected',
    body: 'Fakta är fria att återge. Ordagrann text (fulltext, långa citat) lagras bara om den är fri '
      + '(public domain / CC). En databas-spärr blockerar verbatim upphovsrättsskyddat material.',
    bodyEn: 'Facts are free to restate. Verbatim text (full text, long quotations) is stored only if it is '
      + 'free (public domain / CC). A database guard blocks verbatim copyrighted material.',
  },
  {
    title: '9. Spårbarhet & revisionsbarhet',
    titleEn: '9. Traceability & revisability',
    body: 'All datahistorik ligger i migrationer; varje post bär källhänvisning. Ny evidens kan alltid '
      + 'uppdatera en uppgift — historia är inte statisk, och plattformen är byggd för att kunna rättas.',
    bodyEn: 'All data history lives in migrations; every record carries a source reference. New evidence '
      + 'can always update an item — history is not static, and the platform is built to be corrigible.',
  },
  {
    title: '10. Människan verifierar AI:n',
    titleEn: '10. The human verifies the AI',
    body: 'AI (datering, analys, sök-svar) är assistent, inte auktoritet. AI beskriver — människan tolkar '
      + 'och beslutar. AI-genererat innehåll märks och förses med en verifieringsväg ("källfört — verifiera '
      + 'via länkarna").',
    bodyEn: 'AI (dating, analysis, search answers) is an assistant, not an authority. AI describes — the '
      + 'human interprets and decides. AI-generated content is labelled and given a verification path '
      + '("sourced — verify via the links").',
  },
];

const HW_ALIGNMENT: { principle: string; principleEn: string; us: string; usEn: string }[] = [
  {
    principle: 'AI beskriver snarare än tolkar — tolkning kräver mänskligt omdöme.',
    principleEn: 'AI describes rather than interprets — interpretation requires human judgement.',
    us: 'Regeln "ingen gissning": AI daterar/analyserar, människan verifierar och tolkar. AI fyller aldrig luckor som fakta.',
    usEn: 'The "no guessing" rule: AI dates/analyses, the human verifies and interprets. AI never fills gaps as fact.',
  },
  {
    principle: 'Källbarhet — noter och referenser så läsaren kan kontrollera.',
    principleEn: 'Sourceability — notes and references so the reader can check.',
    us: 'source_ref / source_uri / attribution på allt; AI-svaret uppmanar att verifiera via länkarna.',
    usEn: 'source_ref / source_uri / attribution on everything; the AI answer urges verification via the links.',
  },
  {
    principle: 'Osäkerhet ska signaleras (historiker använder "kan", "möjligen").',
    principleEn: 'Uncertainty must be signalled (historians use "may", "possibly").',
    us: 'Konfidensfält (certain/probable/possible/contested), evidensklass, "approximativ" på lägen.',
    usEn: 'Confidence fields (certain/probable/possible/contested), evidence class, "approximate" on locations.',
  },
  {
    principle: 'Tystnader och skevheter i källorna ska erkännas.',
    principleEn: 'Silences and biases in the sources must be acknowledged.',
    us: 'Vi lyfter dem aktivt: elit-biasen ("vem fick en sten"), att ~hälften av stenarna är flyttade, luckor i registren.',
    usEn: 'We raise them actively: the elite bias ("who got a stone"), that ~half the stones have been moved, gaps in the registers.',
  },
  {
    principle: 'Proveniens före användning — varifrån kommer datan, vem gjorde den.',
    principleEn: 'Provenance before use — where the data comes from, who made it.',
    us: 'Källrättighets-spärr (verbatim endast PD/CC), namnauktoritet, tydlig attribuering av öppna data.',
    usEn: 'Source-rights guard (verbatim only PD/CC), name authority, clear attribution of open data.',
  },
  {
    principle: 'AI kan inte vara författare — människan är ansvarig och krediteras.',
    principleEn: 'AI cannot be an author — the human is responsible and credited.',
    us: 'Vi krediterar människor (forskare, fältdokumentärer), märker AI-innehåll och håller människan ansvarig.',
    usEn: 'We credit people (researchers, field documentarians), label AI content and keep the human accountable.',
  },
];

const HW_TODO: { sv: string; en: string }[] = [
  { sv: 'Flytta ut tystnaderna och osäkerheten från datan till gränssnittet — visa användaren vad vi inte vet.',
    en: 'Move the silences and uncertainty out of the data and into the interface — show the user what we don\'t know.' },
  { sv: 'Visuell osäkerhet: t.ex. halo/suddiga markörer för approximativa lägen, streckat för omtvistade dateringar.',
    en: 'Visual uncertainty: e.g. halo/blurred markers for approximate locations, dashed for contested datings.' },
  { sv: 'Hålla AI-svarens ton konditional (kan, möjligen) och explicit skilja beskrivning från tolkning.',
    en: 'Keep the AI answers\' tone conditional (may, possibly) and explicitly separate description from interpretation.' },
];

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

const STATUS_LABELS = [
  { c: '#22c55e', t: 'Belagt', tEn: 'Attested', d: 'stöds direkt av en verifierad källa.', dEn: 'directly supported by a verified source.' },
  { c: '#38bdf8', t: 'Tolkning', tEn: 'Interpretation', d: 'en läsning av evidensen; rimlig men inte bevisad.', dEn: 'a reading of the evidence; plausible but not proven.' },
  { c: '#f59e0b', t: 'Hypotes', tEn: 'Hypothesis', d: 'ett testbart antagande som ännu inte prövats färdigt.', dEn: 'a testable assumption not yet fully examined.' },
  { c: '#94a3b8', t: 'Obelagt', tEn: 'Unattested', d: 'saknar stöd — sägs rakt ut, aldrig maskerat som fakta.', dEn: 'lacks support — stated plainly, never disguised as fact.' },
];

const FAQS: { q: string; qEn: string; a: React.ReactNode; aEn: React.ReactNode }[] = [
  {
    q: 'Använder ni öppen data från RAÄ, eller är den från Wikimedia?',
    qEn: 'Do you use open data from RAÄ, or is it from Wikimedia?',
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
    aEn: (
      <>
        Both — and more. <strong>RAÄ's open data</strong> (Fornsök / K-samsök, CC0/CC-BY) is a main source
        for ancient monuments, churches, beacons and runestone photos. <strong>Wikidata/Wikimedia</strong>{' '}
        is used for verified coordinates (P625) and identity linking (QID reconciliation). In addition:
        OpenStreetMap (place names, ODbL), SGU (soils and geology, CC-BY), Isof/SOL (place names),
        EU-DEM/Copernicus (elevation), and published research. Every record carries its source (source_uri),
        and every source is attributed.{' '}
        <a href="https://www.raa.se/hitta-information/oppna-data/oppna-data-portal/" target="_blank"
          rel="noopener noreferrer" className="text-gold hover:underline">RAÄ's open-data portal →</a>
      </>
    ),
  },
  {
    q: 'Varför visar Viking Age bara ~10 kyrkor när Ångermanland har 47 socknar? Är det de äldsta som är relevanta?',
    qEn: 'Why does Viking Age show only ~10 churches when Ångermanland has 47 parishes? Are the shown ones the relevant ones?',
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
    aEn: (
      <>
        No — and this is actually a good example of the methodology above. The database contains{' '}
        <strong>89 churches in Ångermanland</strong> (all with coordinates; 25 with a clear medieval dating,
        from the 12th century onward). More churches than parishes is due to old + new churches, chapels,
        ruins and free churches. That a given view shows only a dozen is a <strong>filter or display limit in
        that view</strong> (e.g. an active time filter or a specific map layer), not the whole content — and
        thus <em>not</em> a curation of "the ten relevant ones". The assumption that the shown ones are the
        oldest/relevant is exactly the kind of guess the methodology warns against: check the data instead of
        inferring a logic. All 89 can be shown.
      </>
    ),
  },
  {
    q: 'Kan man söka på de "dominerande orden" (ortnamnsleden), särskilt för sockenkyrkor?',
    qEn: 'Can you search the "dominant words" (place-name elements), especially for parish churches?',
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
    aEn: (
      <>
        Partly today, more over time. We have a place-name element framework with <strong>33 elements</strong>{' '}
        (e.g. <em>tor-, frö-, sal-, hov-, stav-, härn-</em>) marked with time strata, and{' '}
        <strong>8,314 place names</strong> tagged with elements, plus a hypothesis tester for place names. A
        dedicated search crossing dominant elements <em>specifically against parish churches</em> is partly
        possible already, but becomes a real feature once more church and parish data is linked together in
        the graph. The base data is there — the view is on its way.
      </>
    ),
  },
];

const Vetenskapsmetodik = ({ forceLang }: { forceLang?: 'sv' | 'en' }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  return (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Vetenskapsmetodik och AI"
      titleEn="Scientific Methodology and AI"
      path={sv ? '/sv/vetenskapsmetodik' : '/en/scientific-methodology'}
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
          {sv ? 'Vetenskapsmetodik och AI' : 'Scientific Methodology and AI'}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {sv ? (
            <>Viking Age är en forskningsplattform. Trovärdigheten är hela produkten. Därför är metoden
            — hur vi samlar, verifierar och redovisar data, och hur vi använder AI — inte en detalj utan
            själva grunden. Två saker beskrivs här: <strong>hur vi håller dålig data ute</strong>, och
            <strong> hur väl vi följer</strong> den forskning som finns om historia och artificiell intelligens.</>
          ) : (
            <>Viking Age is a research platform. Credibility is the whole product. So the method — how we
            gather, verify and present data, and how we use AI — is not a detail but the foundation itself.
            Two things are described here: <strong>how we keep bad data out</strong>, and <strong>how well we
            follow</strong> the research that exists on history and artificial intelligence.</>
          )}
        </p>
      </div>

      {/* DEL 1 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          {sv ? 'Att inte släppa in dålig data' : 'Keeping bad data out'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {sv ? (
            <>Principen <em>garbage in, garbage out</em> gäller dubbelt för en historisk databas: en enda
            påhittad koordinat eller folketymologi förorenar allt som byggs ovanpå. Datakvalitet är därför
            ingen efterhandskontroll utan en spärr <em>vid inflödet</em>. Så här ser spärren ut:</>
          ) : (
            <>The principle <em>garbage in, garbage out</em> holds doubly for a historical database: a single
            invented coordinate or folk etymology pollutes everything built on top. Data quality is therefore
            not an after-the-fact check but a guard <em>at the inflow</em>. Here is the guard:</>
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DATA_PRINCIPLES.map((p) => (
            <Card key={p.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gold">{sv ? p.title : p.titleEn}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">{sv ? p.body : p.bodyEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Attribution, ägande & medskapande */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          {sv ? 'Attribution, ägande & medskapande' : 'Attribution, ownership & co-creation'}
        </h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv
            ? 'Varje uppgift bär sin källa, och varje källa krediteras — dataset, arkiv, fältdokumentärer och forskare. De namngivna forskarna och källorna samlas på en egen sida.'
            : 'Every item carries its source, and every source is credited — datasets, archives, field documentarians and researchers. The named researchers and sources are gathered on their own page.'}
        </p>
        <Link to="/forskare"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline mb-4">
          <Users className="h-4 w-4" /> {sv ? 'Forskare & källor →' : 'Researchers & sources →'}
        </Link>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {sv ? (
            <><strong className="text-foreground">Du äger din egen data.</strong> Tar du med eget material —
            t.ex. ett släktträd — stannar det hos dig (släktforskningen körs i din webbläsare, inget laddas
            upp, ingen GDPR-fråga). Vi gör inte anspråk på det du bidrar med. Vår roll är den motsatta: att
            <em> hjälpa</em> till så att felaktig data inte kommer in — samma källkritiska spärr gäller allt —
            och att berika med källbelagd kontext, inte att ta över.</>
          ) : (
            <><strong className="text-foreground">You own your own data.</strong> If you bring your own
            material — e.g. a family tree — it stays with you (the genealogy runs in your browser, nothing is
            uploaded, no GDPR question). We make no claim on what you contribute. Our role is the opposite: to
            <em> help</em> keep incorrect data out — the same source-critical guard applies to everything — and
            to enrich with sourced context, not to take over.</>
          )}
        </p>
      </section>

      {/* Att följa objekten över tid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <History className="h-6 w-6 text-gold" />
          {sv ? 'Att följa objekten över tid' : 'Following objects over time'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv
            ? 'Föremål och platser står sällan stilla. En trovärdig databas måste kunna följa dem — varifrån de kom, hur de förändrats, och vilka de liknar.'
            : 'Objects and places rarely stand still. A credible database must be able to follow them — where they came from, how they changed, and which others they resemble.'}
        </p>
        <div className="space-y-3">
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Kyrkornas tidslinje' : 'The churches\' timeline'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv
                ? 'För de äldsta kyrkorna följer vi byggnadsfaserna — när kyrkan uppförts och byggts om — och vad de arkeologiska undersökningarna faktiskt hittat (dendrodateringar, äldre grundmurar, mynt i kyrkorummet, begravningar). En kyrka är sällan från ett enda år; tidslinjen visar lagren.'
                : 'For the oldest churches we follow the building phases — when the church was raised and rebuilt — and what the archaeological investigations actually found (dendro datings, older foundation walls, coins in the church floor, burials). A church is rarely from a single year; the timeline shows the layers.'}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Runstenarnas proveniens' : 'The runestones\' provenance'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>Runstenar har ofta flyttats under århundradena — inmurade i kyrkor, flyttade till gårdar,
                museer eller vägkanter. Vi skiljer <em>ursprungligt</em> från <em>nuvarande</em> läge och
                följer stenen genom historien. Det är också en förutsättning för korrekt analys: en flyttad
                sten mäter fel omgivning — nästan hälften av de stenar vi har lägeshistorik för är flyttade
                mer än hundra meter.</>
              ) : (
                <>Runestones have often been moved over the centuries — built into churches, moved to farms,
                museums or roadsides. We separate the <em>original</em> from the <em>current</em> location and
                follow the stone through history. It is also a precondition for correct analysis: a moved
                stone measures the wrong surroundings — nearly half of the stones for which we have location
                history have moved more than a hundred metres.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1 flex items-center gap-1.5">
              <Fingerprint className="h-4 w-4" /> {sv ? 'Forensik & digital fingerprint' : 'Forensics & digital fingerprint'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>För olika objekt finns forensiska verktyg — datering, attribuering (ristarhand), diakron
                språkanalys, samt proveniensanalys av hällristningar och metaller. Och vi beskriver objekt som
                <em> särdragsvektorer</em> — en digital fingerprint — för att hitta likvärdiga: en djupgående
                naturhamn, en centralplats, en fornborg. Så jämförs lika med lika i landskapet i stället för
                att gissa.</>
              ) : (
                <>For different objects there are forensic tools — dating, attribution (carver's hand),
                diachronic language analysis, and provenance analysis of rock carvings and metals. And we
                describe objects as <em>feature vectors</em> — a digital fingerprint — to find comparable ones:
                a deep natural harbour, a central place, a hillfort. So like is compared with like in the
                landscape instead of guessing.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Märkningen + claim-liggaren */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Scale className="h-6 w-6 text-gold" />
          {sv ? 'Belagt, tolkning, hypotes — och konkurrerande läsningar' : 'Attested, interpretation, hypothesis — and competing readings'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <>Ett påstående på plattformen är sällan bara "sant" eller "falskt" — det har en <em>status</em>.
            Grundvokabulären är fyra steg, som visas som en färgmärkt etikett i texten:</>
          ) : (
            <>A claim on the platform is rarely just "true" or "false" — it has a <em>status</em>. The base
            vocabulary is four steps, shown as a colour-coded label in the text:</>
          )}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 mb-5">
          {STATUS_LABELS.map((s) => (
            <div key={s.t} className="viking-card rounded-lg p-3 flex items-start gap-2.5">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.c }} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{sv ? s.t : s.tEn}.</strong> {sv ? s.d : s.dEn}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Vissa fält har en mer finkornig vokabulär — runläsningar märks t.ex. <em>transkription</em> (vad
            som står), <em>etablerad</em> (fackgranskad huvudläsning), <em>omstridd</em>, <em>oberoende</em>{' '}
            (icke fackgranskad) och <em>förkastad</em> — men principen är densamma.</>
          ) : (
            <>Some fields have a finer-grained vocabulary — rune readings are marked e.g. <em>transcription</em>{' '}
            (what is written), <em>established</em> (peer-reviewed main reading), <em>contested</em>,{' '}
            <em>independent</em> (not peer-reviewed) and <em>rejected</em> — but the principle is the same.</>
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Framför allt tvingas inte olika forskare till en enda "sanning". Konkurrerande tolkningar ligger
            bredvid varandra i en <strong>claim-liggare</strong>, var och en med sin källa, sin förespråkare
            (med fullständigt namn) och sitt konfidensvärde:</>
          ) : (
            <>Above all, different researchers are not forced into a single "truth". Competing interpretations
            sit side by side in a <strong>claim ledger</strong>, each with its source, its proponent (with full
            name) and its confidence value:</>
          )}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-4">
          <li><code className="text-gold/90">place_claim</code> — {sv
            ? 'attribut-nycklade påståenden om platser (t.ex. datering, funktion), med källa, konfidens och verifieringsstatus.'
            : 'attribute-keyed claims about places (e.g. dating, function), with source, confidence and verification status.'}</li>
          <li><code className="text-gold/90">interpretation_claim</code> — {sv
            ? 'konkurrerande läsningar av runinskrifter, per textparti och attribuerade till respektive forskare.'
            : 'competing readings of runic inscriptions, per text part and attributed to each researcher.'}</li>
          <li><code className="text-gold/90">place_name_relation</code> — {sv
            ? 'namn-relationer över tid (t.ex. föregångsnamn) som hypoteser med förespråkare och belägg, inte som fast sanning.'
            : 'name relations over time (e.g. predecessor names) as hypotheses with proponent and attestation, not as fixed truth.'}</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {sv ? (
            <>Mätlagret (observationen) hålls rent och avdubblat; <em>tolkningarna</em> hålls plurala och
            tidsstämplade — de skiftar med generationer och forskningsströmningar och konsolideras aldrig till
            "sanningen". Motstridiga påståenden kan dessutom länkas explicit som konflikt, så att en oenighet
            syns i stället för att döljas. Ett konkret exempel är de{' '}
            <Link to="/sv/vikingatid" className="text-gold hover:underline">konkurrerande läsningarna av
            Rökstenen (Ög 136)</Link>.</>
          ) : (
            <>The measurement layer (the observation) is kept clean and de-duplicated; the <em>interpretations</em>{' '}
            are kept plural and time-stamped — they shift with generations and research currents and are never
            consolidated into "the truth". Conflicting claims can also be linked explicitly as a conflict, so a
            disagreement is shown rather than hidden. A concrete example is the{' '}
            <Link to="/sv/vikingatid" className="text-gold hover:underline">competing readings of the Rök stone
            (Ög 136)</Link>.</>
          )}
        </p>
      </section>

      {/* Människa-i-loopen: AI-agentflottan + adversariell verifiering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Bot className="h-6 w-6 text-gold" />
          {sv ? 'Människa i loopen — och en motståndare mot datan' : 'Human in the loop — and an adversary against the data'}
        </h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Bakom materialet arbetar en flotta av källkritiska <strong>specialistagenter</strong> (arkeologi,
            runologi, ortnamn/filologi, GIS, datakvalitet, QA). De <em>utreder och föreslår</em> — de skriver
            aldrig till kanon på egen hand. Varje förslag landar först som ett <em>claim</em> med källa,
            konfidens och märkning (belagt / tolkning / hypotes / obelagt). En människa granskar och beslutar
            innan något blir bestående. Ingen AI-utdata går rakt in i databasen.</>
          ) : (
            <>Behind the material works a fleet of source-critical <strong>specialist agents</strong>
            (archaeology, runology, place names/philology, GIS, data quality, QA). They <em>investigate and
            propose</em> — they never write to canon on their own. Every proposal lands first as a <em>claim</em>
            with source, confidence and label (attested / interpretation / hypothesis / unattested). A human
            reviews and decides before anything becomes permanent. No AI output goes straight into the database.</>
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Maskinellt verifierbara fynd (t.ex. en koordinat via Wikidata P625, en RAÄ-URI, en databasräkning)
            kan befordras automatiskt <em>med proveniens</em>. Tolkning, etymologi och attribuering kräver
            alltid en människa eller en verifierar-agent.</>
          ) : (
            <>Machine-verifiable findings (e.g. a coordinate via Wikidata P625, a RAÄ URI, a database count) can
            be promoted automatically <em>with provenance</em>. Interpretation, etymology and attribution always
            require a human or a verifier agent.</>
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <><strong className="text-foreground">Adversariell verifiering.</strong> Att bygga in en uppgift
            räcker inte — den ska också gå att rasera. En verifierar-agent fungerar som en drift-vakt: den läser
            om kanon mot källorna, prövar påståendena och flaggar avvikelser (en källa som ändrats, en koordinat
            som glidit, en hypotes som aldrig prövades klart). Så fångas tyst förfall i stället för att sätta sig
            i datan.</>
          ) : (
            <><strong className="text-foreground">Adversarial verification.</strong> Building in an item is not
            enough — it must also be possible to tear down. A verifier agent acts as a drift guard: it re-reads
            canon against the sources, tests the claims and flags deviations (a source that changed, a coordinate
            that drifted, a hypothesis never fully examined). So quiet decay is caught instead of settling into
            the data.</>
          )}
        </p>
        <Link to={sv ? '/ai-agenter' : '/ai-agents'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline">
          <Bot className="h-4 w-4" /> {sv ? 'Så arbetar AI-agenterna →' : 'How the AI agents work →'}
        </Link>
      </section>

      {/* Bias & motåtgärder */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Scale className="h-6 w-6 text-gold" />
          {sv ? 'Bias och motåtgärder' : 'Bias and countermeasures'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <>En sammanhängande AI-berättelse kan vara helt fel <em>just för att</em> den är sammanhängande.
            Karl Poppers regel gäller därför även maskinen: lägg mer kraft på att försöka <strong>motbevisa</strong>
            {' '}ett påstående än på att bekräfta det. Wasons 2-4-6-experiment visade hur lätt vi bara prövar
            det som stödjer vår hypotes och aldrig det som skulle bryta den. Här är de bias som mest hotar
            vårt material — och vad systemet gör åt dem.</>
          ) : (
            <>A coherent AI narrative can be completely wrong <em>precisely because</em> it is coherent. Karl
            Popper's rule therefore applies to the machine too: spend more effort trying to <strong>refute</strong>
            {' '}a claim than to confirm it. Wason's 2-4-6 experiment showed how readily we only test what
            supports our hypothesis and never what would break it. Here are the biases that most threaten our
            material — and what the system does about them.</>
          )}
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-foreground border-b border-border">
                <th className="py-2 pr-3 font-semibold">{sv ? 'Bias' : 'Bias'}</th>
                <th className="py-2 pr-3 font-semibold">{sv ? 'Så slår den i vårt material' : 'How it hits our material'}</th>
                <th className="py-2 font-semibold">{sv ? 'Motåtgärd i systemet' : 'Countermeasure in the system'}</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground align-top">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground/90">{sv ? 'Överlevnads-/bevaringsbias' : 'Survivorship / preservation bias'}</td>
                <td className="py-2 pr-3">{sv ? 'Vi ser bara det som bevarats och återfunnits — runstenar återanvända i kyrkor överrepresenteras, medan organiskt, plundrat och vittrat försvinner. Utbredningen på kartan är inte den ursprungliga.' : 'We only see what survived and was recovered — runestones reused in churches are over-represented, while organic, looted and weathered material vanishes. The distribution on the map is not the original one.'}</td>
                <td className="py-2">{sv ? 'Skilj belagd förekomst från uppskattad utbredning; densitetspåståenden märks med ett bevaringsfilter.' : 'Separate attested occurrence from estimated distribution; density claims are flagged with a preservation filter.'}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground/90">{sv ? 'Konfirmeringsbias' : 'Confirmation bias'}</td>
                <td className="py-2 pr-3">{sv ? 'Man letar bara efter platser som passar mönstret man redan tror på (Wason 2-4-6).' : 'One only looks for places that fit the pattern already believed (Wason 2-4-6).'}</td>
                <td className="py-2">{sv ? 'Agenten måste redovisa vilken sökning som skulle MOTBEVISA hypotesen — och söka motexempel och en nollhypotes innan ett claim får konfidens.' : 'The agent must state which search would REFUTE the hypothesis — and look for counter-examples and a null hypothesis before a claim gains confidence.'}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground/90">{sv ? 'Delat rot-antagande' : 'Shared root assumption'}</td>
                <td className="py-2 pr-3">{sv ? 'Tre discipliner "bekräftar" varandra fast de ärvt samma äldre antagande — då är det inte tre belägg utan ett, upprepat.' : 'Three disciplines "confirm" each other though they inherited the same older assumption — then it is not three pieces of evidence but one, repeated.'}</td>
                <td className="py-2">{sv ? 'Oberoendegrad: konvergens räknas bara mellan fristående beviskedjor — vi kallar det oberoende evidenskonvergens, inte disciplinär konvergens.' : 'Independence grade: convergence counts only between free-standing chains of evidence — we call it independent evidence convergence, not disciplinary convergence.'}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-foreground/90">{sv ? 'Publikationsbias' : 'Publication bias'}</td>
                <td className="py-2 pr-3">{sv ? 'Publicerade tolkningar överlever; motbevis och negativa resultat publiceras sällan, så en etablerad tolkning ser starkare ut än den är.' : 'Published interpretations survive; refutations and negative results are rarely published, so an established interpretation looks stronger than it is.'}</td>
                <td className="py-2">{sv ? 'En etablerad tolkning bär hur många oberoende belägg den vilar på — inte bara att den är etablerad.' : 'An established interpretation carries how many independent attestations it rests on — not merely that it is established.'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/40 p-4 text-sm">
            <h3 className="font-semibold text-foreground mb-1">{sv ? 'Exempel: negativ evidens (Njord)' : 'Example: negative evidence (Njord)'}</h3>
            <p className="text-muted-foreground leading-relaxed">{sv ? 'Att inte hitta teofora Njord-spår i Sverige (utom Närtuna) betyder inte att kulten var svag — teofora orter bevaras och identifieras ojämnt. Frånvaro av fynd är negativ evidens med lågt bevisvärde, inte ett motbevis. I claim-liggaren märks påståendet därför som negativ evidens.' : 'Failing to find theophoric Njord traces in Sweden (except Närtuna) does not mean the cult was weak — theophoric places are preserved and identified unevenly. Absence of finds is negative evidence with low weight, not a refutation. In the claim ledger the statement is therefore marked as negative evidence.'}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/40 p-4 text-sm">
            <h3 className="font-semibold text-foreground mb-1">{sv ? 'Exempel: delat rot-antagande (metod)' : 'Example: shared root assumption (method)'}</h3>
            <p className="text-muted-foreground leading-relaxed">{sv ? 'Om en könsbestämning bara vilar på gravgods (vapen) och sedan upprepas litteratur → populärvetenskap → museinamn, är det ett antagande reproducerat tre gånger — inte tre oberoende belägg. Oberoende linjer vore osteologi, aDNA och gravinventarium bedömda var för sig. (Exemplet illustrerar mönstret att vakta mot; det påstår inget om en enskild grav.)' : 'If a sex determination rests only on grave goods (weapons) and is then repeated literature → popular science → museum name, that is one assumption reproduced three times — not three independent attestations. Independent lines would be osteology, aDNA and grave inventory assessed separately. (The example illustrates the pattern to guard against; it asserts nothing about any single grave.)'}</p>
          </div>
        </div>
      </section>

      {/* Icke-destruktiv metod vs. destruktiv extraktion */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          {sv ? 'Icke-destruktiv metod — vår metodik mot destruktiv extraktion' : 'Non-destructive by design — our method vs. destructive extraction'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <>Under 2026 avslöjades att AI-bolag köpt sällsynta och utgångna böcker i miljontal, skurit av
            ryggarna, kört sidorna genom höghastighetsskannrar och strimlat originalen — en satsning som
            enligt interna dokument kallades <em>Project Panama</em>, med det uttalade målet att "destructively
            scan all the books in the world" och hålla det tyst. Viking Age bygger på den motsatta principen.
            Skillnaden är <strong>arkitektonisk, inte kosmetisk</strong>:</>
          ) : (
            <>In 2026, reporting revealed that AI labs were buying rare and out-of-print books by the million,
            slicing off their spines, running the pages through high-speed scanners and shredding the originals
            — an effort reportedly named <em>Project Panama</em>, whose stated goal was to "destructively scan
            all the books in the world", and to keep it quiet. Viking Age is built on the opposite principle.
            The difference is <strong>architectural, not cosmetic</strong>:</>
          )}
        </p>
        <div className="overflow-x-auto mb-5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border-b border-border/60 pb-2 pr-3 font-medium text-slate-400">{sv ? 'Destruktiv extraktion' : 'Destructive extraction'}</th>
                <th className="border-b border-border/60 pb-2 pl-3 font-medium text-gold">Viking Age</th>
              </tr>
            </thead>
            <tbody>
              {PANAMA_CONTRAST.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="border-b border-border/30 py-2 pr-3 text-muted-foreground">{sv ? r.bad : r.badEn}</td>
                  <td className="border-b border-border/30 py-2 pl-3 text-muted-foreground">{sv ? r.good : r.goodEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 mb-5">
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <><strong className="text-foreground">1. Fakta, inte uttryck.</strong> Fakta är fria att
                återge; formuleringar är det inte. Ordagrann text lagras bara om den är public domain eller
                öppet licensierad — en databas-spärr blockerar upphovsrättsskyddad fulltext. En forskares bok
                blir en <em>hänvisning som leder läsaren till hen</em>, inte en tyst donator till en modell.</>
              ) : (
                <><strong className="text-foreground">1. Facts, not expression.</strong> Facts are free to
                restate; wording is not. Verbatim text is stored only when public domain or openly licensed — a
                database guard blocks copyrighted full text. A scholar's book becomes a citation that sends
                readers to them, not a silent donor to a model.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <><strong className="text-foreground">2. En hänvisningsmotor, inte en dränering.</strong>{' '}
                Destruktiv skanning avslutar originalets liv och skär bort upphovsmannen. Vår pipeline gör
                tvärtom: den gör källan <em>mer</em> synlig och driver trafik till antikvariat, arkiv och
                levande forskare — som krediteras med fullständigt namn.</>
              ) : (
                <><strong className="text-foreground">2. A referral engine, not a drain.</strong> Destructive
                scanning ends the original's life and cuts the author out. Our pipeline does the reverse: it
                makes the source <em>more</em> findable and drives traffic to antiquarian sellers, archives and
                living researchers — credited by full name.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <><strong className="text-foreground">3. Där det fungerar — AI-agent-pipelinen.</strong>{' '}
                Källkritiska specialistagenter <em>utreder och föreslår</em> — de skriver aldrig till kanon
                själva. Maskinellt verifierbara fynd (koordinat via Wikidata&nbsp;P625, RAÄ-URI, DB-räkning)
                kan befordras automatiskt <em>med proveniens</em>; tolkning och etymologi kräver alltid en
                människa eller en adversariell verifierar-agent. LLM:en är ett <em>resonemangsverktyg ovanpå
                citerad data med en verifieringsväg</em> — inte ett kunskapslager byggt av strimlade böcker.</>
              ) : (
                <><strong className="text-foreground">3. Where it works — the AI-agent pipeline.</strong>{' '}
                Source-critical specialist agents <em>investigate and propose</em> — they never write to canon
                on their own. Machine-verifiable findings (a coordinate via Wikidata&nbsp;P625, a heritage URI,
                a database count) can be promoted automatically <em>with provenance</em>; interpretation and
                etymology always require a human or an adversarial verifier agent. The LLM is a <em>reasoning
                tool over cited data with a verify path</em> — not a knowledge store built from shredded books.</>
              )}
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2">
          {sv ? 'Exempel: hur metoden fångar övertolkning' : 'Worked example: how the method catches over-interpretation'}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Staden <Link to="/sv/kalmar" className="text-gold hover:underline">Kalmar</Link> är belagd först
            från 1200-talet (vårt tidigaste brevbelägg: 1266). Men <em>namnet</em> är äldre: 1000-talsstenen
            <Link to="/inscription/S%C3%B6%20333" className="text-gold hover:underline"> Sö 333</Link> vid Ärja
            i Södermanland omtalar en man som "blev dräpt ute i <strong>Kalmarsund</strong>". Namnet är alltså
            belagt på vikingatiden fast staden är medeltida — <em>belägg är inte namnets ålder</em>, och vi
            håller de två på skilda axlar.</>
          ) : (
            <>The town of <Link to="/sv/kalmar" className="text-gold hover:underline">Kalmar</Link> is documented
            only from the 13th century (our earliest charter attestation: 1266). But the <em>name</em> is older:
            the 11th-century runestone <Link to="/inscription/S%C3%B6%20333" className="text-gold hover:underline">Sö 333</Link>{' '}
            at Ärja, Södermanland, records a man "slain out in <strong>Kalmarsund</strong>". The name is attested
            in the Viking Age even though the town is medieval — <em>attestation is not the age of the name</em>,
            and we keep the two on separate axes.</>
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {sv ? (
            <>Den källkritiska poängen visar samtidigt varför vi skiljer <strong>observation från tolkning</strong>.
            Johan Peringskiöld (1654–1720) var riksantikvarie och en av tidens främsta runstenstecknare — en
            nykter och exakt fältiakttagare vars teckningar i dag är <em>primärkällor för många stenar som sedan
            har försvunnit</em>. Men som runtolkare var han ett barn av sin tid och rudbeckian: i runföljden
            <em> kalmarna · sutuma</em> på Sö 333 läste han på 1680-talet in både "det galileiska havet" och
            "Sodom" — ett tänkt bevis för att forntida svenskar format den bibliska historien. I verkligheten är
            det en udda skrivning för <strong>Kalmarsund</strong> (Magnus Källström, RAÄ). Samma person: pålitlig
            som iakttagare, ideologisk som uttolkare — den förmoderna föregångaren till en AI-hallucination.
            Därför hålls hans teckning (en datakälla vi litar på och vill använda) skild från hans Sodom-läsning
            (förkastad, men bevarad som forskningshistoria). Metoden gör båda felslagen omöjliga att smyga in som
            fakta:</>
          ) : (
            <>The source-critical point also shows why we separate <strong>observation from interpretation</strong>.
            Johan Peringskiöld (1654–1720) was Sweden's antiquary-royal and one of the finest runestone
            illustrators of his age — a sober, exact field observer whose drawings are today <em>primary sources
            for many stones since lost</em>. But as a rune-interpreter he was a child of his time, a follower of
            Rudbeck: in the sequence <em>kalmarna · sutuma</em> on Sö 333 he read, in the 1680s, both "the
            Galilean sea" and "Sodom" — supposed proof that ancient Swedes shaped biblical history. In reality it
            is an odd spelling of <strong>Kalmarsund</strong> (Magnus Källström, Swedish National Heritage Board).
            The same man: reliable as an observer, ideological as an interpreter — the pre-modern ancestor of an
            AI hallucination. So we keep his drawing (a data source we trust and want to use) apart from his Sodom
            reading (rejected, but preserved as history of scholarship). Our method makes both failure modes
            impossible to pass off as fact:</>
          )}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-4">
          {sv ? (
            <>
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
            </>
          ) : (
            <>
              <li>the established reading (<em>Kalmarsund</em>) is stored as an <strong>interpretation</strong>,
                not an unquestioned truth — and carries a noted uncertainty, because the carver Eskil's transposed
                and omitted runes make some name-forms genuinely unstable (Wessén);</li>
              <li>the 1680 reading is preserved as <strong>history of scholarship</strong>, clearly labelled as a
                rejected, source-critically discredited interpretation — visible, not deleted;</li>
              <li>the etymology (<em>kalm</em> "an underwater stone shoal" + <em>mar</em> "shallow bay") is tagged
                as the standard reading with its source (Ludvig Papmehl-Dufay, Kalmar County Museum), not asserted
                as settled fact;</li>
              <li>and because homonyms are disambiguated (Ärja parish, where the stone stands, is not Ärla parish,
                first attested 1278), the claim is anchored to the right place.</li>
            </>
          )}
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {sv ? (
            <>En destruktiv modell slukar allt detta — den rätta läsningen, 1680-fantasin och osäkerheten — och
            medelvärdesbildar till ett slätt svar utan väg tillbaka till stenen. Vi behåller stenen, källorna och
            oenigheten i öppen dager. <em>Ärlig reservation: vi använder också en generativ modell (Claude,
            server-side). Skillnaden är rollen — den resonerar över citerad, människo-verifierad data och pekar
            alltid tillbaka till källan; den är aldrig auktoriteten, och ingen modell-utdata går in i databasen på
            egen hand.</em></>
          ) : (
            <>A destructive model swallows all of this — the correct reading, the 1680 fantasy and the uncertainty
            — and averages them into one smooth answer with no way back to the stone. We keep the stone, the
            sources and the disagreement in plain sight. <em>Honest caveat: we use a generative model too (Claude,
            server-side). The difference is its role — it reasons over cited, human-verified data and always points
            back to the source; it is never the authority, and no model output enters the database on its own.</em></>
          )}
        </p>
      </section>

      {/* Oberoende, icke fackgranskade läsningar */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          {sv ? 'Oberoende, icke fackgranskade läsningar' : 'Independent, non-peer-reviewed readings'}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {sv ? (
            <>Delar av den folkliga debatten driver egna läsningar av vikingatiden och av enskilda inskrifter — ett
            exempel är Fredrik Ousbäck / YouTube-kanalen FORMAT HISTORIA. Sådana bidrag kan redovisas, men de
            märks då tydligt <em>oberoende</em> (icke fackgranskade) och hålls åtskilda från den fackgranskade
            runologin — aldrig jämställda med den, aldrig som "fakta". De bär ett lågt konfidensvärde och en
            källkritisk not, och de förs bara in när upphovsmannen anger en kontrollerbar källhänvisning som en
            runolog kan pröva. Det är samma spärr som gäller allt annat: en läsning utan belägg blir inte kanon.</>
          ) : (
            <>Part of the popular debate drives its own readings of the Viking Age and of individual inscriptions —
            one example is Fredrik Ousbäck / the YouTube channel FORMAT HISTORIA. Such contributions may be
            reported, but they are then clearly marked <em>independent</em> (not peer-reviewed) and kept apart
            from peer-reviewed runology — never placed on a par with it, never as "fact". They carry a low
            confidence value and a source-critical note, and are only entered when the author gives a checkable
            source reference a runologist can test. It is the same guard as for everything else: a reading without
            attestation does not become canon.</>
          )}
        </p>
      </section>

      {/* Proveniensnot per artikel */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          {sv ? 'Proveniensnot på källbelagda artiklar' : 'Provenance note on sourced articles'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <>Längre artiklar avslutas med en <strong>proveniensnot</strong> som redovisar tre saker öppet: vilka
            källor texten vilar på, att materialet sammanställts och analyserats <em>med AI-stöd</em>, och att
            det därefter kontrollerats och godkänts av en människa (Daniel Larsson). Noten upprepar också att
            påståenden är märkta belagt, tolkning eller hypotes, och att obelagt anges som sådant. Så här ser
            den ut:</>
          ) : (
            <>Longer articles end with a <strong>provenance note</strong> that openly states three things: which
            sources the text rests on, that the material was compiled and analysed <em>with AI support</em>, and
            that it was then checked and approved by a human (Daniel Larsson). The note also repeats that claims
            are marked attested, interpretation or hypothesis, and that unattested is stated as such. Here is how
            it looks:</>
          )}
        </p>
        <section className="rounded-lg border border-slate-700/70 bg-slate-900/30 p-4 text-[12px] leading-relaxed text-slate-400">
          <p className="mb-1 font-medium text-slate-300">{sv ? 'Källor' : 'Sources'}</p>
          <p className="mb-3">{sv ? 'Källa A · Källa B · Källa C' : 'Source A · Source B · Source C'}</p>
          <p className="border-t border-slate-700/70 pt-3 text-slate-400">
            <span className="font-medium text-slate-300">{sv ? 'Metod & granskning: ' : 'Method & review: '}</span>
            {sv
              ? 'Materialet har sammanställts och analyserats med AI-stöd och därefter kontrollerats och godkänts av Daniel Larsson. Påståenden är märkta belagt, tolkning eller hypotes; obelagt anges som sådant.'
              : 'The material was compiled and analysed with AI support and then checked and approved by Daniel Larsson. Claims are marked attested, interpretation or hypothesis; unattested is stated as such.'}
          </p>
        </section>
      </section>

      {/* DEL 2 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gold" />
          {sv ? 'Hur väl följer vi forskningen om historia & AI?' : 'How well do we follow the research on history & AI?'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv ? (
            <>Marnie Hughes-Warrington beskriver i <em>History and Artificial Intelligence</em> (Cambridge
            University Press, 2026) hur historia görs <em>om</em> AI, <em>med</em> AI och <em>av</em> AI, och
            vilka principer som bör styra "artificiella historiker". Vi har prövat plattformen mot hennes
            ramverk. Kortfattat: vi ligger nära — flera av hennes principer är inbyggda i våra arbetsregler.</>
          ) : (
            <>In <em>History and Artificial Intelligence</em> (Cambridge University Press, 2026) Marnie
            Hughes-Warrington describes how history is done <em>about</em> AI, <em>with</em> AI and <em>by</em> AI,
            and which principles should govern "artificial historians". We have tested the platform against her
            framework. In short: we are close — several of her principles are built into our working rules.</>
          )}
        </p>

        <div className="space-y-2 mb-6">
          {HW_ALIGNMENT.map((row, i) => (
            <div key={i} className="viking-card rounded-lg p-3">
              <p className="text-xs text-gold/90 font-medium mb-0.5">{sv ? 'Princip: ' : 'Principle: '}{sv ? row.principle : row.principleEn}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{sv ? 'Hos oss: ' : 'With us: '}{sv ? row.us : row.usEn}</p>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2">{sv ? 'Vad vi kan göra bättre' : 'What we can do better'}</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground mb-6">
          {HW_TODO.map((t, i) => <li key={i} className="leading-relaxed">{sv ? t.sv : t.en}</li>)}
        </ul>

        <div className="viking-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-gold">{sv ? 'Källa:' : 'Source:'}</strong> Hughes-Warrington, Marnie (2026).
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
            {sv ? 'Läs dokumentet hos Cambridge Core' : 'Read the document at Cambridge Core'}
          </a>
        </div>
      </section>

      {/* AI-transparens (EU AI Act art. 50) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          {sv ? 'AI-transparens (EU AI Act art. 50)' : 'AI transparency (EU AI Act art. 50)'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {sv
            ? 'Vi använder AI som ett hjälpmedel, öppet och märkt. Här är exakt hur, i förhållande till EU:s AI-förordnings transparenskrav (tillämpliga sedan 2 augusti 2026).'
            : 'We use AI as a tool, openly and labelled. Here is exactly how, in relation to the transparency requirements of the EU AI Act (applicable since 2 August 2026).'}
        </p>
        <div className="space-y-3">
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Vilket innehåll som är AI-genererat' : 'Which content is AI-generated'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>Datering och analys av runinskrifter, forensiskt fingerprint, källförda sök-svar, samt
                AI-översättningar av public domain-grundtext. Allt sådant är <strong>märkt "AI-genererat"</strong>{' '}
                med en verifieringsväg ("källfört — verifiera via länkarna"). Övrig text på plattformen är
                källbelagd och människoskriven.</>
              ) : (
                <>Dating and analysis of runic inscriptions, forensic fingerprinting, sourced search answers, and
                AI translations of public-domain base text. All such content is <strong>labelled "AI-generated"</strong>{' '}
                with a verification path ("sourced — verify via the links"). Other text on the platform is sourced
                and human-written.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'AI-runolog — identifiering & dokumentation av runor' : 'AI runologist — identifying & documenting runes'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>En <strong>AI-runolog</strong> (specialistagent) hjälper till att identifiera och dokumentera
                runinskrifter: läsa transkription, föreslå datering (Gräslund-stil), formler och ristarhand,
                samt göra källkritiska bedömningar. Den <em>föreslår</em> — en människa verifierar och beslutar
                innan något blir bestående. Att läsa slitna eller lavtäckta ristningar ur ett foto kräver
                dessutom bildförbättring (släpljus/RTI/DStretch) och en mänsklig runolog; en pixel-gissning görs
                aldrig.</>
              ) : (
                <>An <strong>AI runologist</strong> (specialist agent) helps identify and document runic
                inscriptions: read the transcription, propose a dating (Gräslund style), formulae and carver's
                hand, and make source-critical assessments. It <em>proposes</em> — a human verifies and decides
                before anything becomes permanent. Reading worn or lichen-covered carvings from a photo also
                requires image enhancement (raking light/RTI/DStretch) and a human runologist; a pixel guess is
                never made.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Människan bär det redaktionella ansvaret' : 'The human carries editorial responsibility'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>AI beskriver — en människa granskar, verifierar och beslutar innan något blir kanon
                (människa-i-loopen). Ingen AI-utdata skrivs till databasen på egen hand. Det uppfyller art. 50.4
                (avslöja AI-genererat innehåll avsett att informera allmänheten) och dess undantag för mänsklig
                redaktionell granskning.</>
              ) : (
                <>AI describes — a human reviews, verifies and decides before anything becomes canon
                (human-in-the-loop). No AI output is written to the database on its own. This satisfies art. 50.4
                (disclosing AI-generated content intended to inform the public) and its exemption for human
                editorial review.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Interaktion & inga deepfakes' : 'Interaction & no deepfakes'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>AI-ytorna är tydligt märkta som AI (art. 50.1); ingen chatbot utger sig för att vara människa.
                Vi genererar <strong>inga syntetiska bilder eller deepfakes</strong> — alla foton är riktiga
                (RAÄ/SHM/Wikimedia Commons) och attribuerade.</>
              ) : (
                <>The AI surfaces are clearly marked as AI (art. 50.1); no chatbot pretends to be human. We
                generate <strong>no synthetic images or deepfakes</strong> — all photos are real (RAÄ/SHM/Wikimedia
                Commons) and attributed.</>
              )}
            </p>
          </div>
          <div className="viking-card rounded-lg p-3">
            <p className="text-sm text-gold font-medium mb-1">{sv ? 'Vår roll: användare, inte modell-leverantör' : 'Our role: user, not model provider'}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sv ? (
                <>Vi <em>använder</em> en generativ modell (via OpenRouter) server-side — vi tillhandahåller ingen
                egen generativ modell. Den maskinläsbara märkningen av modell-output (art. 50.2, vattenstämpel/
                C2PA) åligger modell-leverantören. Detta är information, inte juridisk rådgivning.</>
              ) : (
                <>We <em>use</em> a generative model (via OpenRouter) server-side — we provide no generative model
                of our own. The machine-readable marking of model output (art. 50.2, watermark/C2PA) is the model
                provider's responsibility. This is information, not legal advice.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* DEL 3 — FAQ */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-gold" />
          {sv ? 'Vanliga frågor' : 'Frequently asked questions'}
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Card key={i} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gold">{sv ? f.q : f.qEn}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground leading-relaxed">{sv ? f.a : f.aEn}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground opacity-75 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          {sv
            ? 'Hughes-Warringtons idéer återges här med egna ord och länk till originalet — ingen ordagrann återgivning, eftersom verket är upphovsrättsskyddat (© Cambridge University Press). Fakta och idéer är fria att sammanfatta; själva texten är det inte.'
            : 'Hughes-Warrington\'s ideas are rendered here in our own words with a link to the original — no verbatim reproduction, since the work is copyrighted (© Cambridge University Press). Facts and ideas are free to summarise; the text itself is not.'}
        </span>
      </p>
    </main>
    <Footer />
  </div>
  );
};

export default Vetenskapsmetodik;
