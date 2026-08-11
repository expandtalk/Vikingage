import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ShieldCheck, Search, ScrollText, Landmark, Map, Bug, Database, Users, Cpu, Ship, Bone, Dna, Gavel, BookOpen, Compass, Clock, Languages, Accessibility, Stamp, Bike, Route } from 'lucide-react';

// /ai-agenter (+ /ai-agents) — transparenssida under Vetenskap: vilka typer av AI-agenter
// plattformen använder och HUR. Ärlig beskrivning — produkt-AI (live) skiljs från de
// specialistagenter som bygger/verifierar plattformen. Alla agenter lyder under grundregeln
// INGEN GISSNING (se /sv/vetenskapsmetodik). AI beskriver — människan verifierar och beslutar.

interface AgentCard { icon: React.ComponentType<{ className?: string }>; title: string; role: string; how: string }

// Produkt-AI — det användaren möter i plattformen.
const PRODUCT_AI: AgentCard[] = [
  {
    icon: ScrollText,
    title: 'Runinskrifts-analys',
    role: 'Föreslår datering, språklig analys, historisk kontext och tolkning av en runinskrift.',
    how: 'Server-side edge-funktion (analyze-runic) som anropar Claude (Sonnet) via OpenRouter. '
      + 'Svaret märks som AI-genererat och förses med en verifieringsväg — det är ett underlag att '
      + 'pröva mot källorna, inte ett facit. Nyckeln ligger server-side och exponeras aldrig i webbläsaren.',
  },
  {
    icon: Search,
    title: 'Sök & Lotsen (kunskapsgraf)',
    role: 'Hjälper dig hitta rätt entitet och navigera sambanden mellan runstenar, platser, personer och källor.',
    how: 'Hybrid sökning — lexikalt (fulltext) + semantiskt (vektorinbäddningar) — mot en kunskapsgraf '
      + 'med entitetstyper och relationer. Kandidater rankas på relevans, närhet och prominens; svaret '
      + 'länkar vidare i grafen så att du kan följa och kontrollera kedjan själv.',
  },
];

// Forsknings- och utvecklingsagenter — specialister som bygger, verifierar och underhåller
// plattformen. De UTREDER och FÖRESLÅR; en människa granskar och beslutar innan något publiceras.
const WORK_AGENTS: AgentCard[] = [
  {
    icon: Landmark,
    title: 'Arkeolog- & kulturmiljöagent',
    role: 'Skydda, bevara, inventera, undersöka och förmedla kunskap om kultur- och fornlämningar. '
      + 'Tar fram kunskapsunderlag, kulturmiljöutredningar och kulturmiljöavsnitt i MKB, beskriver '
      + 'arkeologiska utredningar / för- och slutundersökningar, samt producerar skyltar och '
      + 'populärvetenskaplig text.',
    how: 'Förankrad i svensk kulturmiljöpraktik (KML, länsstyrelsens process, fornlämningsbegreppet). '
      + 'Verifierar mot RAÄ Fornsök / K-samsök (öppen data) och skiljer lämning, observation och tolkning. '
      + 'Föreslår — skriver inte till databasen utan uppdrag.',
  },
  {
    icon: Database,
    title: 'Koordinat- & datakvalitetsagent',
    role: 'Skannar hela datat efter poster som saknar koordinat eller proveniens och föreslår hur de fylls.',
    how: 'Går igenom entitetstyperna, skiljer verkliga luckor från avsiktligt tomma fält (t.ex. '
      + 'overifierade lägeshypoteser eller skyddade fyndplatser) och pekar ut en verifierad källa per '
      + 'lucka (Wikidata P625, Fornsök-L-nummer, OSM). Koordinater tas aldrig ur minnet.',
  },
  {
    icon: Map,
    title: 'GIS-arkitekturagent',
    role: 'Granskar den geografiska datamodellen och kommer med förbättringsförslag.',
    how: 'Inventerar geometrikolumner och koordinatsystem (SRID), letar dubbellagring och driftrisk, '
      + 'saknade rumsliga index, ogiltiga geometrier och felaktig axelordning, och granskar de spatiala '
      + 'funktionernas korrekthet. Rapporterar prioriterat — korrekthet före prestanda före städning.',
  },
  {
    icon: Bug,
    title: 'Buggtest- & QA-agent',
    role: 'Reproducerar rapporterade fel, hittar rotorsaken och letar efter liknande fel som redan publicerats.',
    how: 'Återskapar felet, spårar exakt var det uppstår (data- eller gränssnittslager), förklarar hur '
      + 'det kunde nå produktion och föreslår minsta möjliga rättning. Skannar sedan efter fler fall av '
      + 'samma slag innan de hinner märkas.',
  },
];

// Under förberedelse — specialister vi bygger nu; enklare testfall körs under hösten 2026.
const PLANNED_AGENTS: { icon: React.ComponentType<{ className?: string }>; title: string; focus: string }[] = [
  { icon: ScrollText, title: 'Runolog', focus: 'Läsning, datering (stiltypologi) och ristarattribution av runinskrifter.' },
  { icon: Ship, title: 'Marinarkeolog', focus: 'Vrak, farleder och överfarter — med segelkronologin (rodd före segel, ~700).' },
  { icon: Bone, title: 'Osteolog', focus: 'Ben: ålder, kön, patologi och trauma — redovisat som skattningar med osäkerhet.' },
  { icon: Dna, title: 'Arkeogenetiker (aDNA)', focus: 'Släktskap och härkomst ur DNA — härkomst är inte etnicitet.' },
  { icon: Gavel, title: 'Forntida forensiker', focus: 'Våld och "brott" i forntiden: trauma- och händelserekonstruktion, källkritiskt.' },
  { icon: BookOpen, title: 'Historiker', focus: 'Skriftliga källor och kronologi med klassisk källkritik; saga skiljs från historia.' },
  { icon: Stamp, title: 'Diplomatiker', focus: 'Medeltidsbrev, stadsböcker och tänkeböcker: aktyp, diplomatikens formler, sigill och prosopografi. Läser latin, medellågtyska och fornsvenska; skiljer namn-som-skrivet från identifierad person.' },
  { icon: Compass, title: 'Kulturgeograf', focus: 'Landskap, ortnamn och centralplatser; mönster prövas mot slumpbakgrund.' },
  { icon: Languages, title: 'Filolog & ortnamnsforskare (språkvetare)', focus: 'Språkhistoria, etymologi och namnled per landskap; latin, tyska, nordiska, finska, baltiska, samiska. Skiljer äldsta belägg från namnets ålder — slår upp och citerar, gissar aldrig.' },
  { icon: Accessibility, title: 'UX- & tillgänglighetsdesigner (WCAG)', focus: 'Tillgänglig och tydlig design (WCAG 2.2 AA) + maskinläsbar markup — samma medel tjänar både människor och AI-sök. Kartsymboler, kontrast, tangentbord och skärmläsare. Mäter tillgänglighet, gissar inte.' },
  { icon: Route, title: 'Kommunikationsarkeolog (vägar)', focus: 'Fornvägar, hålvägar, broar, vadställen, knutpunkter och nätverk — least-cost-path-modellering av troliga rutter (RAÄ färdväg).' },
  { icon: Bike, title: 'Gravel-cyklist (fältväg)', focus: 'Fornvägar sett från sadeln — framkomlighet, least-cost-rutter, samt väg- och gatunamns betydelse. Kombinerar väg-arkeologi, geologi, biologi och kulturgeografi.' },
  { icon: ShieldCheck, title: 'Verifierare (drift-vakt)', focus: 'Prövar claims mot källa, befordrar staging → kanon och rekoncilierar kanon mot källorna. Maskinellt verifierbart (koordinat, DB-count) kan auto-befordras; tolkning kräver människa.' },
];

const AiAgents = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="AI-agenter"
      titleEn="AI agents"
      description="Vilka typer av AI-agenter forskningsplattformen Viking Age använder och hur: produkt-AI (runinskrifts-analys via Claude, hybrid sök och kunskapsgraf) samt källkritiska specialistagenter för arkeologi/kulturmiljö, datakvalitet, GIS och QA. Alla lyder under regeln ingen gissning — AI beskriver, människan verifierar och beslutar."
      descriptionEn="Which AI agents the Viking Age research platform uses and how: product AI (runic analysis via Claude, hybrid search and knowledge graph) plus source-critical specialist agents for archaeology/heritage, data quality, GIS and QA. All follow the no-guessing rule — AI describes, humans verify and decide."
      keywords="AI-agenter, artificiell intelligens, arkeologi, kulturmiljö, källkritik, kunskapsgraf, GIS, datakvalitet, Viking Age"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <Bot className="h-8 w-8 text-gold" />
          AI-agenter
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Viking Age använder AI på två sätt: som <strong>funktioner i plattformen</strong> som du möter direkt,
          och som <strong>specialistagenter</strong> som hjälper till att bygga, verifiera och underhålla materialet.
          Gemensamt för alla är grundregeln: <strong>ingen gissning</strong>. AI <em>beskriver och föreslår</em> —
          en människa <em>verifierar och beslutar</em>. Ingen AI-agent publicerar fakta på egen hand.
        </p>
      </div>

      {/* Så arbetar agenterna */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-gold" />
          Så arbetar agenterna
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="viking-card rounded-lg border border-border p-4">
            <strong className="text-foreground">Källkritiska</strong> — varje uppgift verifieras mot källa
            (primärkälla, Wikidata P625, RAÄ Fornsök/K-samsök, publicerad forskning) och får sin proveniens.
            Är något obelagt skrivs det ut, inte gissas.
          </div>
          <div className="viking-card rounded-lg border border-border p-4">
            <strong className="text-foreground">Föreslår, inte publicerar</strong> — agenterna utreder och
            lämnar förslag (ofta med färdig kod eller koordinater). En människa granskar och applicerar. All
            ändring är spårbar i migrationer.
          </div>
          <div className="viking-card rounded-lg border border-border p-4">
            <strong className="text-foreground">Specialiserade & parallella</strong> — en agent per väl
            avgränsad uppgift (arkeologi, GIS, datakvalitet, QA). Oberoende uppgifter körs samtidigt och
            rapporterar var för sig.
          </div>
          <div className="viking-card rounded-lg border border-border p-4">
            <strong className="text-foreground">Redovisar osäkerhet</strong> — förslag bär konfidens och
            skiljer belagt från tolkning. Approximativa lägen märks; känsliga fyndplatser skyddas.
          </div>
        </div>
      </section>

      {/* Produkt-AI */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-gold" />
          AI i plattformen
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Funktioner du möter direkt. AI-genererat innehåll är märkt och länkar vidare till källorna så att
          du kan kontrollera det.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCT_AI.map((a) => (
            <Card key={a.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold">
                  <a.icon className="h-5 w-5" /> {a.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Uppgift:</strong> {a.role}</p>
                <p><strong className="text-foreground">Hur:</strong> {a.how}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Forsknings- och utvecklingsagenter */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          Forsknings- och utvecklingsagenter
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Specialister som används i arbetet med att bygga och hålla materialet rent. De utreder och föreslår;
          besluten fattas av en människa.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {WORK_AGENTS.map((a) => (
            <Card key={a.title} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold">
                  <a.icon className="h-5 w-5" /> {a.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Uppgift:</strong> {a.role}</p>
                <p><strong className="text-foreground">Hur:</strong> {a.how}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Specialistagenter — körs på begäran */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-gold" />
          Specialistagenter — körs på begäran
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Ett lag av disciplin-specialister som vi <strong>kör på begäran</strong> när ett uppdrag rör deras
          område. Samma regler som allt annat: källkritik, konfidens och <strong>människa-i-loopen</strong> —
          varje agent utreder och föreslår, en människa granskar och beslutar. Agenterna är
          <strong> tillståndslösa</strong> och har <strong>inget eget minne</strong>: det de kommer fram till
          befordras (efter granskning) till plattformens beständiga lager — databasen och projektminnet — så
          att kunskapen bor i kanon, inte i en flyktig körning.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANNED_AGENTS.map((a) => (
            <div key={a.title} className="viking-card rounded-lg border border-border p-4 text-sm">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                <a.icon className="h-4 w-4 text-gold" /> {a.title}
              </div>
              <p className="text-muted-foreground">{a.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground opacity-80 border-t border-border/40 pt-4">
        Hur källkritiken fungerar i detalj — de tio principerna, proveniens och hur väl vi följer forskningen
        om historia och AI — beskrivs på{' '}
        <Link to="/sv/vetenskapsmetodik" className="text-gold hover:underline">Vetenskapsmetodik och AI</Link>.
      </p>
    </main>
    <Footer />
  </div>
);

export default AiAgents;
