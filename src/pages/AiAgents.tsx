import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ShieldCheck, Search, ScrollText, Landmark, Map, Bug, Database, Users, Cpu, Ship, Bone, Dna, Gavel, BookOpen, Compass, Languages, Accessibility, Stamp, Bike, Route, Coins, Scale } from 'lucide-react';
import { InstitutionValueProp } from '../components/InstitutionValueProp';

// /ai-agenter (svenska) + /ai-agents (engelska) — transparenssida under Vetenskap: vilka typer av
// AI-agenter plattformen använder och HUR. Ärlig beskrivning — produkt-AI (live) skiljs från de
// specialistagenter som bygger/verifierar plattformen. Alla agenter lyder under grundregeln INGEN
// GISSNING (se /sv/vetenskapsmetodik). AI beskriver — människan verifierar och beslutar.
// Språk styrs av ROUTEN via forceLang ('sv' | 'en'), inte bara av global språkkontext, så att
// /ai-agents alltid är engelska och /ai-agenter alltid svenska.

interface AgentCard {
  icon: React.ComponentType<{ className?: string }>;
  name?: string;               // personnamn som komplement till rollen (t.ex. "Diplomatiker Hemming")
  title: string; titleEn: string;
  role: string; roleEn: string;
  how: string; howEn: string;
}

// Namnbricka — rollen + ett personnamn (Daniel). Tidstypiska nordiska namn, jämn köns­fördelning.
const AgentName: React.FC<{ name?: string }> = ({ name }) =>
  name ? <span className="ml-1 font-normal text-gold/70">· {name}</span> : null;

// Produkt-AI — det användaren möter i plattformen.
const PRODUCT_AI: AgentCard[] = [
  {
    icon: ScrollText,
    name: 'Ragna',
    title: 'Runinskrifts-analys', titleEn: 'Runic inscription analysis',
    role: 'Föreslår datering, språklig analys, historisk kontext och tolkning av en runinskrift.',
    roleEn: 'Proposes dating, linguistic analysis, historical context and interpretation of a runic inscription.',
    how: 'Server-side edge-funktion (analyze-runic) som anropar Claude (Sonnet) via OpenRouter. '
      + 'Svaret märks som AI-genererat och förses med en verifieringsväg — det är ett underlag att '
      + 'pröva mot källorna, inte ett facit. Nyckeln ligger server-side och exponeras aldrig i webbläsaren.',
    howEn: 'A server-side edge function (analyze-runic) calling Claude (Sonnet) via OpenRouter. The '
      + 'answer is labelled AI-generated and comes with a verification path — it is material to test '
      + 'against the sources, not a verdict. The key is held server-side and never exposed in the browser.',
  },
  {
    icon: Search,
    name: 'Liv',
    title: 'Sök & Lotsen (kunskapsgraf)', titleEn: 'Search & the Pilot (knowledge graph)',
    role: 'Hjälper dig hitta rätt entitet och navigera sambanden mellan runstenar, platser, personer och källor.',
    roleEn: 'Helps you find the right entity and navigate the connections between runestones, places, people and sources.',
    how: 'Hybrid sökning — lexikalt (fulltext) + semantiskt (vektorinbäddningar) — mot en kunskapsgraf '
      + 'med entitetstyper och relationer. Kandidater rankas på relevans, närhet och prominens; svaret '
      + 'länkar vidare i grafen så att du kan följa och kontrollera kedjan själv.',
    howEn: 'Hybrid search — lexical (full text) + semantic (vector embeddings) — against a knowledge graph '
      + 'of entity types and relations. Candidates are ranked by relevance, proximity and prominence; the '
      + 'answer links onward through the graph so you can follow and check the chain yourself.',
  },
];

// Forsknings- och utvecklingsagenter — specialister som bygger, verifierar och underhåller
// plattformen. De UTREDER och FÖRESLÅR; en människa granskar och beslutar innan något publiceras.
const WORK_AGENTS: AgentCard[] = [
  {
    icon: Landmark,
    name: 'Alva',
    title: 'Arkeolog- & kulturmiljöagent', titleEn: 'Archaeology & heritage agent',
    role: 'Skydda, bevara, inventera, undersöka och förmedla kunskap om kultur- och fornlämningar. '
      + 'Tar fram kunskapsunderlag, kulturmiljöutredningar och kulturmiljöavsnitt i MKB, beskriver '
      + 'arkeologiska utredningar / för- och slutundersökningar, samt producerar skyltar och '
      + 'populärvetenskaplig text.',
    roleEn: 'Protects, preserves, surveys, investigates and communicates knowledge of cultural and '
      + 'ancient monuments. Produces knowledge bases, cultural-environment assessments and heritage '
      + 'sections of EIAs, describes archaeological surveys / preliminary and final excavations, and '
      + 'produces signage and popular-science text.',
    how: 'Förankrad i svensk kulturmiljöpraktik (KML, länsstyrelsens process, fornlämningsbegreppet). '
      + 'Verifierar mot RAÄ Fornsök / K-samsök (öppen data) och skiljer lämning, observation och tolkning. '
      + 'Föreslår — skriver inte till databasen utan uppdrag.',
    howEn: 'Grounded in Swedish heritage practice (the Heritage Act, the county board process, the '
      + 'ancient-monument concept). Verifies against RAÄ Fornsök / K-samsök (open data) and separates '
      + 'monument, observation and interpretation. Proposes — does not write to the database without a task.',
  },
  {
    icon: Database,
    name: 'Kåre',
    title: 'Koordinat- & datakvalitetsagent', titleEn: 'Coordinate & data-quality agent',
    role: 'Skannar hela datat efter poster som saknar koordinat eller proveniens och föreslår hur de fylls.',
    roleEn: 'Scans all data for records lacking a coordinate or provenance and proposes how to fill them.',
    how: 'Går igenom entitetstyperna, skiljer verkliga luckor från avsiktligt tomma fält (t.ex. '
      + 'overifierade lägeshypoteser eller skyddade fyndplatser) och pekar ut en verifierad källa per '
      + 'lucka (Wikidata P625, Fornsök-L-nummer, OSM). Koordinater tas aldrig ur minnet.',
    howEn: 'Goes through the entity types, separates real gaps from deliberately empty fields (e.g. '
      + 'unverified location hypotheses or protected find spots) and points to a verified source per gap '
      + '(Wikidata P625, Fornsök L-number, OSM). Coordinates are never taken from memory.',
  },
  {
    icon: Map,
    name: 'Gerd',
    title: 'GIS-arkitekturagent', titleEn: 'GIS architecture agent',
    role: 'Granskar den geografiska datamodellen och kommer med förbättringsförslag.',
    roleEn: 'Reviews the geographic data model and proposes improvements.',
    how: 'Inventerar geometrikolumner och koordinatsystem (SRID), letar dubbellagring och driftrisk, '
      + 'saknade rumsliga index, ogiltiga geometrier och felaktig axelordning, och granskar de spatiala '
      + 'funktionernas korrekthet. Rapporterar prioriterat — korrekthet före prestanda före städning.',
    howEn: 'Inventories geometry columns and coordinate systems (SRID), looks for duplicate storage and '
      + 'drift risk, missing spatial indexes, invalid geometries and wrong axis order, and reviews the '
      + 'spatial functions for correctness. Reports by priority — correctness before performance before cleanup.',
  },
  {
    icon: Bug,
    name: 'Birger',
    title: 'Buggtest- & QA-agent', titleEn: 'Bug-test & QA agent',
    role: 'Reproducerar rapporterade fel, hittar rotorsaken och letar efter liknande fel som redan publicerats.',
    roleEn: 'Reproduces reported errors, finds the root cause and looks for similar errors already shipped.',
    how: 'Återskapar felet, spårar exakt var det uppstår (data- eller gränssnittslager), förklarar hur '
      + 'det kunde nå produktion och föreslår minsta möjliga rättning. Skannar sedan efter fler fall av '
      + 'samma slag innan de hinner märkas.',
    howEn: 'Recreates the error, traces exactly where it arises (data or interface layer), explains how it '
      + 'reached production and proposes the smallest possible fix. Then scans for more cases of the same '
      + 'kind before they get noticed.',
  },
];

// Specialistagenter som körs på begäran. `status` (valfri) = ärlig märkning för dem som ännu är
// under utveckling (t.ex. produkt-AI:t Segel-AI och AI-författaren, flyttade hit från egen sektion).
const PLANNED_AGENTS: {
  icon: React.ComponentType<{ className?: string }>;
  name?: string;
  title: string; titleEn: string; focus: string; focusEn: string;
  status?: string; statusEn?: string;
}[] = [
  { icon: Scale, name: 'Caligula', title: 'Epistemisk granskningsmotor', titleEn: 'Epistemic review engine', focus: 'Bedömer trovärdigheten i ett dokument, en sajt eller ett enskilt påstående. Bryter ned till prövbara påståenden (skiljer observation från tolkning), knyter varje till källa och bevislinje, söker aktivt motbevis och mäter oberoende som antal distinkta rötter — inte antal källor (Högom-fällan: tre texter som ärver ett antagande är ett belägg, inte tre). Levererar en dekomponerad trovärdighetsrubrik 0–100, aldrig en naken siffra.', focusEn: 'Assesses the credibility of a document, a site or a single claim. Breaks it into testable claims (separating observation from interpretation), ties each to source and evidence line, actively seeks refutation and measures independence as the number of distinct roots — not the number of sources (the Högom trap: three texts inheriting one assumption are one piece of evidence, not three). Delivers a decomposed credibility rubric 0–100, never a bare number.', status: 'Schema live (epistemic_claim / epistemic_evidence / evidence_dependency + epistemic_independence(), verifierad: Högom = 1 rot, triangulering = 3). Agentlogiken (påstående-extraktion, motbevis-sökning, bias-detektering) och dokument-/sajtingången är ännu EJ byggda.', statusEn: 'Schema live (epistemic_claim / epistemic_evidence / evidence_dependency + epistemic_independence(), verified: Högom = 1 root, triangulation = 3). The agent logic (claim extraction, refutation search, bias detection) and the document/site intake are NOT yet built.' },
  { icon: Coins, name: 'Kent', title: 'Ekonomisk historiker', titleEn: 'Economic historian', focus: 'Monetarisering och silverekonomi (mynt, hacksilver, viktsystem), handel och emporier, jordägande och gods, urbanisering (stadsprivilegier, Hansan), kyrklig ekonomi samt diplom som ekonomiska transaktioner (köp, pant, gåva). Svarar gärna som diagram.', focusEn: 'Monetisation and the silver economy (coins, hacksilver, weight systems), trade and emporia, landholding and estates, urbanisation (town privileges, the Hansa), church economy and charters as economic transactions (sale, pledge, gift). Answers preferably as a diagram.' },
  { icon: ScrollText, name: 'Rune', title: 'Runolog', titleEn: 'Runologist', focus: 'Läsning, datering (stiltypologi) och ristarattribution av runinskrifter.', focusEn: 'Reading, dating (style typology) and carver attribution of runic inscriptions.' },
  { icon: Ship, name: 'Sigrid', title: 'Marinarkeolog', titleEn: 'Marine archaeologist', focus: 'Vrak, farleder och överfarter — med segelkronologin (rodd före segel, ~700).', focusEn: 'Wrecks, fairways and crossings — with the sail chronology (rowing before sail, ~700).' },
  { icon: Bone, name: 'Beata', title: 'Osteolog', titleEn: 'Osteologist', focus: 'Ben: ålder, kön, patologi och trauma — redovisat som skattningar med osäkerhet.', focusEn: 'Bones: age, sex, pathology and trauma — reported as estimates with uncertainty.' },
  { icon: Dna, name: 'Dag', title: 'Arkeogenetiker (aDNA)', titleEn: 'Archaeogeneticist (aDNA)', focus: 'Släktskap och härkomst ur DNA — härkomst är inte etnicitet.', focusEn: 'Kinship and ancestry from DNA — ancestry is not ethnicity.' },
  { icon: Gavel, name: 'Frode', title: 'Forntida forensiker', titleEn: 'Ancient forensics', focus: 'Våld och "brott" i forntiden: trauma- och händelserekonstruktion, källkritiskt.', focusEn: 'Violence and "crime" in antiquity: trauma and event reconstruction, source-critical.' },
  { icon: BookOpen, name: 'Hedvig', title: 'Historiker', titleEn: 'Historian', focus: 'Skriftliga källor och kronologi med klassisk källkritik; saga skiljs från historia.', focusEn: 'Written sources and chronology with classical source criticism; saga separated from history.' },
  { icon: Stamp, name: 'Hemming', title: 'Diplomatiker', titleEn: 'Diplomatics scholar', focus: 'Medeltidsbrev, stadsböcker och tänkeböcker: aktyp, diplomatikens formler, sigill och prosopografi. Läser latin, medellågtyska och fornsvenska; skiljer namn-som-skrivet från identifierad person.', focusEn: 'Medieval charters, town books and court books: document type, the formulae of diplomatics, seals and prosopography. Reads Latin, Middle Low German and Old Swedish; separates name-as-written from identified person.' },
  { icon: Compass, name: 'Gudrun', title: 'Kulturgeograf', titleEn: 'Human geographer', focus: 'Landskap, ortnamn och centralplatser; mönster prövas mot slumpbakgrund.', focusEn: 'Landscape, place names and central places; patterns tested against a random background.' },
  { icon: Languages, name: 'Folke', title: 'Filolog & ortnamnsforskare (språkvetare)', titleEn: 'Philologist & onomastician (linguist)', focus: 'Språkhistoria, etymologi och namnled per landskap; latin, tyska, nordiska, finska, baltiska, samiska. Skiljer äldsta belägg från namnets ålder — slår upp och citerar, gissar aldrig.', focusEn: 'Language history, etymology and name elements by province; Latin, German, Nordic, Finnic, Baltic, Sámi. Separates earliest attestation from the age of the name — looks up and cites, never guesses.' },
  { icon: Accessibility, name: 'Unn', title: 'UX- & tillgänglighetsdesigner (WCAG)', titleEn: 'UX & accessibility designer (WCAG)', focus: 'Tillgänglig och tydlig design (WCAG 2.2 AA) + maskinläsbar markup — samma medel tjänar både människor och AI-sök. Kartsymboler, kontrast, tangentbord och skärmläsare. Mäter tillgänglighet, gissar inte.', focusEn: 'Accessible, clear design (WCAG 2.2 AA) + machine-readable markup — the same means serve both people and AI search. Map symbols, contrast, keyboard and screen reader. Measures accessibility, does not guess.' },
  { icon: Route, name: 'Vera', title: 'Kommunikationsarkeolog (vägar)', titleEn: 'Communications archaeologist (roads)', focus: 'Fornvägar, hålvägar, broar, vadställen, knutpunkter och nätverk — least-cost-path-modellering av troliga rutter (RAÄ färdväg).', focusEn: 'Ancient roads, hollow ways, bridges, fords, junctions and networks — least-cost-path modelling of likely routes (RAÄ travel routes).' },
  { icon: Bike, name: 'Gösta', title: 'Gravel-cyklist (fältväg)', titleEn: 'Gravel cyclist (field roads)', focus: 'Fornvägar sett från sadeln — framkomlighet, least-cost-rutter, samt väg- och gatunamns betydelse. Kombinerar väg-arkeologi, geologi, biologi och kulturgeografi.', focusEn: 'Ancient roads seen from the saddle — passability, least-cost routes, and the meaning of road and street names. Combines road archaeology, geology, biology and human geography.' },
  { icon: ShieldCheck, name: 'Vidar', title: 'Verifierare (drift-vakt)', titleEn: 'Verifier (drift guard)', focus: 'Prövar claims mot källa, befordrar staging → kanon och rekoncilierar kanon mot källorna. Maskinellt verifierbart (koordinat, DB-count) kan auto-befordras; tolkning kräver människa.', focusEn: 'Tests claims against sources, promotes staging → canon and reconciles canon against the sources. Machine-verifiable items (coordinate, DB count) can auto-promote; interpretation requires a human.' },
  { icon: Ship, name: 'Lars-Erik', title: 'Segel-AI (ruttmotor)', titleEn: 'Sailing AI (routing engine)', focus: 'Historiska sjörutter — vatten-bara mellan waypoints, tre skrovlägen (rodd/vikingaskepp/kogg), vind ur SMHI-klimatologin och drag över ed. Rutten är en hypotes, inte den historiska leden.', focusEn: 'Historical sea routes — water-only between waypoints, three hull modes (rowing/Viking ship/cog), wind from SMHI climatology and portage across necks. The route is a hypothesis, not the historical itinerary.', status: 'Under utveckling — kartan visar ledens punkter; A*-sjögraf, skrovlägen och vindkostnad är ännu EJ byggda (kräver routbar sjögraf + hav/land-mask + batymetri).', statusEn: 'Under development — the map shows the route’s points; the A* sea-graph, hull modes and wind cost are NOT yet built (needs a routable sea graph + land/sea mask + bathymetry).' },
  { icon: BookOpen, name: 'Saga', title: 'AI-författare (släktplats)', titleEn: 'AI author (ancestral place)', focus: 'Källgrundad berättelse om din släktplats i valbar stilarketyp (sagastil, släktkrönika, popvet-reporter). Fakta hålls skilt från prosan; texten är märkt som AI-tolkning.', focusEn: 'A source-grounded story about your ancestral place in a chosen style archetype (saga style, family chronicle, popular-science reporter). Facts kept separate from the prose; the text is labelled AI interpretation.', status: 'Datamodell live; generatorn under utveckling.', statusEn: 'Data model live; generator under development.' },
];

// "Så arbetar agenterna" — fyra principkort.
const HOW_CARDS: { title: string; titleEn: string; body: string; bodyEn: string }[] = [
  {
    title: 'Källkritiska', titleEn: 'Source-critical',
    body: 'varje uppgift verifieras mot källa (primärkälla, Wikidata P625, RAÄ Fornsök/K-samsök, '
      + 'publicerad forskning) och får sin proveniens. Är något obelagt skrivs det ut, inte gissas.',
    bodyEn: 'every item is verified against a source (primary source, Wikidata P625, RAÄ Fornsök/K-samsök, '
      + 'published research) and given its provenance. If something is unattested it is stated, not guessed.',
  },
  {
    title: 'Falsifierar, inte bekräftar', titleEn: 'Refutes, not confirms',
    body: 'en agents uppgift är att försöka MOTBEVISA en hypotes, inte bekräfta den (Popper; Wasons '
      + '2-4-6). Den redovisar vilken sökning som skulle kullkasta påståendet och letar efter motexempel '
      + 'och en nollhypotes. Överlever hypotesen blir den starkare.',
    bodyEn: 'an agent’s job is to try to REFUTE a hypothesis, not confirm it (Popper; Wason’s 2-4-6). It '
      + 'states which search would overturn the claim and looks for counter-examples and a null hypothesis. '
      + 'If the hypothesis survives, it is the stronger for it.',
  },
  {
    title: 'Föreslår, inte publicerar', titleEn: 'Propose, not publish',
    body: 'agenterna utreder och lämnar förslag (ofta med färdig kod eller koordinater). En människa '
      + 'granskar och applicerar. All ändring är spårbar i migrationer.',
    bodyEn: 'the agents investigate and submit proposals (often with ready code or coordinates). A human '
      + 'reviews and applies. Every change is traceable in migrations.',
  },
  {
    title: 'Specialiserade & parallella', titleEn: 'Specialised & parallel',
    body: 'en agent per väl avgränsad uppgift (arkeologi, GIS, datakvalitet, QA). Oberoende uppgifter '
      + 'körs samtidigt och rapporterar var för sig.',
    bodyEn: 'one agent per well-scoped task (archaeology, GIS, data quality, QA). Independent tasks run '
      + 'concurrently and report separately.',
  },
  {
    title: 'Redovisar osäkerhet', titleEn: 'Reports uncertainty',
    body: 'förslag bär konfidens och skiljer belagt från tolkning. Approximativa lägen märks; känsliga '
      + 'fyndplatser skyddas.',
    bodyEn: 'proposals carry confidence and separate attested from interpretation. Approximate locations '
      + 'are flagged; sensitive find spots are protected.',
  },
];

const AiAgents = ({ forceLang }: { forceLang?: 'sv' | 'en' }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  return (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="AI-agenter"
      titleEn="AI agents"
      description="Vilka typer av AI-agenter forskningsplattformen Viking Age använder och hur: produkt-AI (runinskrifts-analys via Claude, hybrid sök och kunskapsgraf) samt källkritiska specialistagenter för arkeologi/kulturmiljö, datakvalitet, GIS och QA. Alla lyder under regeln ingen gissning — AI beskriver, människan verifierar och beslutar."
      descriptionEn="Which AI agents the Viking Age research platform uses and how: product AI (runic analysis via Claude, hybrid search and knowledge graph) plus source-critical specialist agents for archaeology/heritage, data quality, GIS and QA. All follow the no-guessing rule — AI describes, humans verify and decide."
      keywords="AI-agenter, AI agents, artificiell intelligens, arkeologi, kulturmiljö, källkritik, kunskapsgraf, GIS, datakvalitet, Viking Age"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <Bot className="h-8 w-8 text-gold" />
          {sv ? 'AI-agenter' : 'AI agents'}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
          {sv ? (
            <>Viking Age använder AI på två sätt: som <strong>funktioner i plattformen</strong> som du möter direkt,
            och som <strong>specialistagenter</strong> som hjälper till att bygga, verifiera och underhålla materialet.
            Gemensamt för alla är grundregeln: <strong>ingen gissning</strong>. AI <em>beskriver och föreslår</em> —
            en människa <em>verifierar och beslutar</em>. Ingen AI-agent publicerar fakta på egen hand.</>
          ) : (
            <>Viking Age uses AI in two ways: as <strong>features in the platform</strong> you meet directly, and as
            <strong> specialist agents</strong> that help build, verify and maintain the material. Common to all is
            the ground rule: <strong>no guessing</strong>. AI <em>describes and proposes</em> — a human
            <em> verifies and decides</em>. No AI agent publishes facts on its own.</>
          )}
        </p>
      </div>

      {/* Värdeförslag för offentlig sektor — "what's in it for me?" (kommun/region/museum). */}
      <InstitutionValueProp sv={sv} />

      {/* Så arbetar agenterna */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          {sv ? 'Så arbetar agenterna' : 'How the agents work'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
          {HOW_CARDS.map((c) => (
            <div key={c.title} className="viking-card rounded-lg border border-border p-4">
              <strong className="text-foreground">{sv ? c.title : c.titleEn}</strong> — {sv ? c.body : c.bodyEn}
            </div>
          ))}
        </div>
      </section>

      {/* Produkt-AI */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-gold" />
          {sv ? 'AI i plattformen' : 'AI in the platform'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-3xl">
          {sv
            ? 'Funktioner du möter direkt. AI-genererat innehåll är märkt och länkar vidare till källorna så att du kan kontrollera det.'
            : 'Features you meet directly. AI-generated content is labelled and links onward to the sources so you can check it.'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCT_AI.map((a) => (
            <Card key={a.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold">
                  <a.icon className="h-5 w-5" /> {sv ? a.title : a.titleEn}<AgentName name={a.name} />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">{sv ? 'Uppgift:' : 'Task:'}</strong> {sv ? a.role : a.roleEn}</p>
                <p><strong className="text-foreground">{sv ? 'Hur:' : 'How:'}</strong> {sv ? a.how : a.howEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Forsknings- och utvecklingsagenter */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          {sv ? 'Forsknings- och utvecklingsagenter' : 'Research & development agents'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-3xl">
          {sv
            ? 'Specialister som används i arbetet med att bygga och hålla materialet rent. De utreder och föreslår; besluten fattas av en människa.'
            : 'Specialists used in the work of building and keeping the material clean. They investigate and propose; the decisions are made by a human.'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WORK_AGENTS.map((a) => (
            <Card key={a.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold">
                  <a.icon className="h-5 w-5" /> {sv ? a.title : a.titleEn}<AgentName name={a.name} />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">{sv ? 'Uppgift:' : 'Task:'}</strong> {sv ? a.role : a.roleEn}</p>
                <p><strong className="text-foreground">{sv ? 'Hur:' : 'How:'}</strong> {sv ? a.how : a.howEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Specialistagenter — körs på begäran */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          {sv ? 'Specialistagenter — körs på begäran' : 'Specialist agents — run on demand'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-3xl">
          {sv ? (
            <>Ett lag av disciplin-specialister som vi <strong>kör på begäran</strong> när ett uppdrag rör deras
            område. Samma regler som allt annat: källkritik, konfidens och <strong>människa-i-loopen</strong> —
            varje agent utreder och föreslår, en människa granskar och beslutar. Varje agent-körning är i sig
            <strong> tillståndslös</strong>, men fynden landar i ett <strong>beständigt minneslager</strong>: en
            claim-liggare i databasen där varje påstående bär källa och konfidens, granskas (människa eller
            verifierar-agenten) och befordras till kanon. En <strong>drift-vakt kör automatiskt varje dag</strong>
            och stämmer av kanon mot källorna. Kunskapen bor alltså i ett självunderhållande, dagligen granskat
            minne — inte i den enskilda körningen.</>
          ) : (
            <>A team of discipline specialists we <strong>run on demand</strong> when a task touches their area.
            Same rules as everything else: source criticism, confidence and <strong>human-in-the-loop</strong> —
            each agent investigates and proposes, a human reviews and decides. Each agent run is itself
            <strong> stateless</strong>, but the findings land in a <strong>persistent memory layer</strong>: a
            claim ledger in the database where every statement carries source and confidence, is reviewed (by a
            human or the verifier agent) and promoted to canon. A <strong>drift guard runs automatically every
            day</strong> and reconciles canon against the sources. The knowledge therefore lives in a
            self-maintaining, daily-reviewed memory — not in the single run.</>
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PLANNED_AGENTS.map((a) => (
            <div key={a.title} className="viking-card rounded-lg border border-border p-4 text-sm">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                <a.icon className="h-4 w-4 text-gold" /> {sv ? a.title : a.titleEn}<AgentName name={a.name} />
              </div>
              <p className="text-muted-foreground">{sv ? a.focus : a.focusEn}</p>
              {a.status && (
                <p className="mt-2 text-xs rounded-md border border-gold/30 bg-gold/5 px-2 py-1 text-foreground/90">
                  <strong>{sv ? 'Status:' : 'Status:'}</strong> {sv ? a.status : a.statusEn}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground opacity-80 border-t border-border/40 pt-4">
        {sv ? (
          <>Hur källkritiken fungerar i detalj — de tio principerna, proveniens och hur väl vi följer forskningen
          om historia och AI — beskrivs på{' '}
          <Link to="/sv/vetenskapsmetodik" className="text-gold hover:underline">Vetenskapsmetodik och AI</Link>.</>
        ) : (
          <>How the source criticism works in detail — the ten principles, provenance and how well we follow the
          research on history and AI — is described on{' '}
          <Link to="/sv/vetenskapsmetodik" className="text-gold hover:underline">Scientific Methodology and AI</Link>.</>
        )}
      </p>
    </main>
    <Footer />
  </div>
  );
};

export default AiAgents;
