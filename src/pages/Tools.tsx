import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wrench, ScanLine, Map, Search, Ruler, Waves, Fingerprint, Image as ImageIcon, Bot, ScrollText,
  Route, Compass, Network, BookOpen, Coins, Church, Dna, Landmark, ArrowRight, Boxes, Stamp, Users, Radar,
} from 'lucide-react';

// /verktyg (sv) + /tools (en) — samlad katalog över plattformens verktyg, presenterade som likvärdiga
// (ingen "flaggskepps"-hierarki). Live/beta/under utveckling märks ärligt. Gemensam grundregel:
// INGEN GISSNING — verktygen är byggda för att TESTA hypoteser mot källor, inte bekräfta dem.

type Status = 'live' | 'beta' | 'kommande';
interface Tool {
  icon: React.ComponentType<{ className?: string }>;
  titleSv: string; titleEn: string; descSv: string; descEn: string;
  to?: string; status: Status;
}
interface Group { titleSv: string; titleEn: string; icon: React.ComponentType<{ className?: string }>; tools: Tool[] }

const STATUS_META: Record<Status, { sv: string; en: string; cls: string }> = {
  live:     { sv: 'Live',              en: 'Live',           cls: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  beta:     { sv: 'Beta',              en: 'Beta',           cls: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
  kommande: { sv: 'Under utveckling',  en: 'In development', cls: 'border-slate-500/50 bg-slate-500/10 text-slate-300' },
};

const GROUPS: Group[] = [
  {
    titleSv: 'Kartor & landskap', titleEn: 'Maps & landscape', icon: Map,
    tools: [
      { icon: Compass, to: '/explore', status: 'live', titleSv: 'Utforska kartan', titleEn: 'Explore the map',
        descSv: 'Interaktiv karta med tänd-/släckbara lager: runstenar, fornlämningar, forten, vägar, kult- och maktplatser.',
        descEn: 'Interactive map with toggleable layers: runestones, ancient remains, fortresses, roads, cult and power sites.' },
      { icon: Landmark, to: '/sv/kalmar', status: 'live', titleSv: 'Regionsidor', titleEn: 'Region pages',
        descSv: 'Fördjupade landskaps- och ortnoder (Kalmar, Öland, Ångermanland, Göteborg, Birka) med egna kartor och källor.',
        descEn: 'In-depth province and place nodes (Kalmar, Öland, Ångermanland, Gothenburg, Birka) with their own maps and sources.' },
      { icon: Route, to: '/sv/led/gota-landsvag', status: 'live', titleSv: 'Färdvägar & leder', titleEn: 'Routes & roads',
        descSv: 'Historiska vägar, rullstensåsar, hålvägar, isvägar och båtdrag — sträckning, hållpunkter och landmärken.',
        descEn: 'Historic roads, eskers, hollow ways, ice roads and boat portages — route, waypoints and landmarks.' },
      { icon: Waves, to: '/sv/kalmar', status: 'beta', titleSv: 'Strandförskjutning & landhöjning', titleEn: 'Shoreline & land uplift',
        descSv: 'Höj havet till dåtida nivå (SGU/DEM) och se hur kusten låg — avfärdar "kultplats" som då låg under vatten.',
        descEn: 'Raise the sea to past levels (SGU/DEM) to see the former coast — debunks "cult sites" that were then underwater.' },
      { icon: ScanLine, to: '/3D-drive', status: 'beta', titleSv: '3D-förarperspektiv', titleEn: '3D drive view',
        descSv: 'Tiltat, course-up 3D-perspektiv genom landskapet (MapLibre). Live-GPS på mobil, demoläge på desktop.',
        descEn: 'Tilted, course-up 3D view through the landscape (MapLibre). Live GPS on mobile, demo mode on desktop.' },
    ],
  },
  {
    titleSv: 'Ortnamnsforskning', titleEn: 'Place-name research', icon: ScrollText,
    tools: [
      { icon: ScrollText, to: '/sv/ortnamn', status: 'live', titleSv: 'Ortnamn & namnled', titleEn: 'Place names & elements',
        descSv: 'Namnled med tidsskikt, äldsta belägg och tolkning — ställd bredvid SOL 2003 för granskning (du bestämmer).',
        descEn: 'Name elements with time strata, earliest attestations and interpretation — set beside SOL 2003 for review (you decide).' },
      { icon: Network, to: '/sv/ortnamn', status: 'beta', titleSv: 'Hypotestestare (rumsliga mönster)', titleEn: 'Hypothesis tester (spatial patterns)',
        descSv: 'Testa avstånd, räckvidd och kluster kring namnled mot bakgrundsbruset — anrikning, inte förekomst. Realismkoll: håller tolkningen?',
        descEn: 'Test distance, reach and clustering of name elements against the background — enrichment, not mere presence. Reality check: does the reading hold?' },
    ],
  },
  {
    titleSv: 'Runor & ristare', titleEn: 'Runes & carvers', icon: ScrollText,
    tools: [
      { icon: ScrollText, to: '/sv/runinskrifter', status: 'live', titleSv: 'Runinskrifts-bläddrare', titleEn: 'Runic inscription browser',
        descSv: 'Sök och filtrera runinskrifter på signum, ristare, formel, ornamentik och datering; rik detaljvy per sten.',
        descEn: 'Search and filter runic inscriptions by signum, carver, formula, ornament and dating; rich detail view per stone.' },
      { icon: Bot, to: '/sv/runinskrifter', status: 'live', titleSv: 'Runinskrifts-analys (AI)', titleEn: 'Runic analysis (AI)',
        descSv: 'Föreslår datering, språklig analys och tolkning av en inskrift (Claude, server-side). Märkt AI-genererat med verifieringsväg.',
        descEn: 'Proposes dating, linguistic analysis and interpretation of an inscription (Claude, server-side). Marked AI-generated with a verify path.' },
      { icon: Stamp, to: '/sv/ristare', status: 'live', titleSv: 'Ristarattribution — "samma hand"', titleEn: 'Carver attribution — "same hand"',
        descSv: 'Hitta digitala tvillingar bland stenarna: inskrifter som pekar mot samma ristare (ornamentik, formel, ristarsignatur).',
        descEn: 'Find digital twins among the stones: inscriptions pointing to the same carver (ornament, formula, carver signature).' },
    ],
  },
  {
    titleSv: 'Forensik & bild', titleEn: 'Forensics & imaging', icon: Fingerprint,
    tools: [
      { icon: Fingerprint, to: '/sv/runinskrifter', status: 'live', titleSv: 'Fingerprint (runsten/fornborg/grav)', titleEn: 'Fingerprint (runestone/hillfort/grave)',
        descSv: 'Beskriv ett objekt (+ valfri bild) → AI-forensik: datering, typologi, trolig identitet. Grav-läget bär osteologi (kroppslängd, ålder/kön, patologi/trauma, gravutformning). Underlag att pröva, ej facit.',
        descEn: 'Describe an object (+ optional image) → AI forensics: dating, typology, likely identity. Grave mode carries osteology (body length, age/sex, pathology/trauma, grave form). Material to test, not a verdict.' },
      { icon: ImageIcon, to: '/sv/runinskrifter', status: 'beta', titleSv: 'Bildförbättring (fält & natur)', titleEn: 'Image enhancement (field & nature)',
        descSv: 'Förbättra bilder tagna i fält/naturen: släpljus, kant-detektering och dekorrelationssträckning (DStretch) i webbläsaren — få fram svaga baslinjer före tolkning.',
        descEn: 'Enhance photos taken in the field/nature: raking light, edge detection and decorrelation stretch (DStretch) in the browser — surface faint lines before reading.' },
    ],
  },
  {
    titleSv: '3D & rekonstruktion', titleEn: '3D & reconstruction', icon: Boxes,
    tools: [
      { icon: Boxes, to: '/sv/3d', status: 'live', titleSv: '3D-modeller (CAD)', titleEn: '3D models (CAD)',
        descSv: 'Vrid och zooma 3D-modeller av föremål (hjälmar, vapen, kyrkokonst, osteologi) — SHM/SweDigArch, CC BY 4.0. Kopplade till plats och tema.',
        descEn: 'Rotate and zoom 3D models of objects (helmets, weapons, church art, osteology) — SHM/SweDigArch, CC BY 4.0. Linked to place and theme.' },
    ],
  },
  {
    titleSv: 'Sök & kunskapsgraf', titleEn: 'Search & knowledge graph', icon: Search,
    tools: [
      { icon: Search, to: '/', status: 'live', titleSv: 'Global sök & Lotsen', titleEn: 'Global search & the Guide',
        descSv: 'Hybrid sök (lexikalt + semantiskt) mot kunskapsgrafen. Svaret länkar vidare i grafen så du kan följa kedjan.',
        descEn: 'Hybrid search (lexical + semantic) over the knowledge graph. Answers link onward so you can follow the chain.' },
      { icon: Ruler, to: '/explore', status: 'live', titleSv: 'Räckviddssond & linjal', titleEn: 'Reach probe & ruler',
        descSv: 'Mät avstånd och rita räckvidds-/formzoner (t.ex. en dagsmarsch) kring valfritt objekt; exportera GeoJSON/CSV.',
        descEn: 'Measure distance and draw reach/shape zones (e.g. a day’s march) around any object; export GeoJSON/CSV.' },
      { icon: Radar, to: '/explore', status: 'live', titleSv: 'Nära mig / inom radie', titleEn: 'Near me / within radius',
        descSv: 'Hitta allt inom en vald radie kring en punkt eller din position — fornlämningar, bad, vägar, kyrkor m.m. — rankat på närhet och relevans.',
        descEn: 'Find everything within a chosen radius around a point or your position — ancient remains, bathing spots, roads, churches etc. — ranked by proximity and relevance.' },
    ],
  },
  {
    titleSv: 'AI & agenter', titleEn: 'AI & agents', icon: Bot,
    tools: [
      { icon: Bot, to: '/ai-agenter', status: 'live', titleSv: 'AI-agentflottan', titleEn: 'The AI agent fleet',
        descSv: 'Specialistagenter (arkeolog, runolog, filolog, marinarkeolog, kommunikationsarkeolog …) som utreder och föreslår. Människan verifierar och beslutar.',
        descEn: 'Specialist agents (archaeologist, runologist, philologist, marine archaeologist, communications archaeologist …) that investigate and propose. Humans verify and decide.' },
      { icon: ScanLine, status: 'kommande', titleSv: 'Historisk röntgen', titleEn: 'Historical X-ray',
        descSv: 'Samkör flera register vid EN punkt och stämmer av dem: topografi, vattendrag, strandlinjeålder (landhöjning), fornlämningar, ortnamn och källor. Byggs för att TESTA mönster, inte bekräfta dem — resultat märkt belagt/hypotes/obelagt.',
        descEn: 'Cross-runs several registers at ONE point and checks them: topography, watercourses, shoreline age (land uplift), ancient remains, place names and sources. Built to TEST patterns, not confirm them — results marked verified/hypothesis/unverified.' },
      { icon: Users, status: 'kommande', titleSv: 'Digital tvilling (forskare)', titleEn: 'Digital twin (researcher)',
        descSv: 'En agent byggd på en forskares material och metod (t.ex. Agneta Nyholm, Sofiainstitutet) — för att pröva slutsatserna hårt mot tillgänglig vetenskap, blint mot vad erfarna arkeologer redan vet. Inte för att bekräfta.',
        descEn: 'An agent built on a researcher’s material and method (e.g. Agneta Nyholm, Sofia Institute) — to test the conclusions hard against available science, blind against what experienced archaeologists already know. Not to confirm.' },
    ],
  },
  {
    titleSv: 'Bibliotek & samlingar', titleEn: 'Library & collections', icon: BookOpen,
    tools: [
      { icon: BookOpen, to: '/texter', status: 'live', titleSv: 'Bibliotek: texter & källor', titleEn: 'Library: texts & sources',
        descSv: 'Lagtexter, krönikor och urkunder i grundtext (PD) med egen översättning — märkt och granskad.',
        descEn: 'Law texts, chronicles and charters in original (public domain) with our own translation — marked and reviewed.' },
      { icon: ScrollText, to: '/sv/medeltidsbrev', status: 'live', titleSv: 'Medeltidsbrev (SDHK)', titleEn: 'Medieval charters (SDHK)',
        descSv: 'Sök och läs medeltida brev, kopplade till platser och personer i kunskapsgrafen.',
        descEn: 'Search and read medieval charters, linked to places and people in the knowledge graph.' },
      { icon: Coins, to: '/coins', status: 'live', titleSv: 'Mynt, skatter & stämpellänkar', titleEn: 'Coins, hoards & die-links',
        descSv: 'Myntfynd och skatter på fyndplats, med metall, datering och die-länkning (stämpel-tvillingar).',
        descEn: 'Coin finds and hoards at find spots, with metal, dating and die-linking (stamp twins).' },
      { icon: Church, to: '/sv/kyrkor', status: 'live', titleSv: 'Kyrkor & kyrkokonst', titleEn: 'Churches & church art',
        descSv: 'Medeltidskyrkor med byggår, stift och konst (t.ex. Albertus Pictor).',
        descEn: 'Medieval churches with build year, diocese and art (e.g. Albertus Pictor).' },
      { icon: Dna, to: '/explore', status: 'live', titleSv: 'Genetik & osteologi', titleEn: 'Genetics & osteology',
        descSv: 'aDNA-platser, härkomstkomponenter och skelettmaterial kopplat till individ och plats.',
        descEn: 'aDNA sites, ancestry components and skeletal material tied to individual and place.' },
    ],
  },
];

const ToolCard: React.FC<{ t: Tool; sv: boolean }> = ({ t, sv }) => {
  const s = STATUS_META[t.status];
  const inner = (
    <Card className={`viking-card h-full transition ${t.to ? 'hover:border-gold/50' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold">
          <t.icon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{sv ? t.titleSv : t.titleEn}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.cls}`}>
            {sv ? s.sv : s.en}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="leading-relaxed">{sv ? t.descSv : t.descEn}</p>
        {t.to && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300/90">
            {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </CardContent>
    </Card>
  );
  return t.to ? <Link to={t.to} className="block">{inner}</Link> : <div>{inner}</div>;
};

const Tools: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Verktyg"
        titleEn="Tools"
        description="Alla verktyg i forskningsplattformen Viking Age: interaktiva kartor, strandförskjutning och landhöjning, ortnamnsforskning, runstens- och ristarverktyg, forensik och bildförbättring, 3D-modeller (CAD), räckviddssond, sök och kunskapsgraf, AI-agenter samt kommande historisk röntgen och digitala tvillingar. Byggt på regeln ingen gissning — verktygen testar hypoteser, de bekräftar dem inte."
        descriptionEn="All tools in the Viking Age research platform: interactive maps, shoreline and land uplift, place-name research, runestone and carver tools, forensics and image enhancement, 3D models (CAD), reach probe, search and knowledge graph, AI agents plus the upcoming historical X-ray and digital twins. Built on the no-guessing rule — the tools test hypotheses, they do not confirm them."
        keywords="verktyg, tools, historisk röntgen, kartor, ortnamn, runstensverktyg, ristarattribution, strandförskjutning, landhöjning, forensik, DStretch, 3D, CAD, AI-agenter, digital tvilling, kunskapsgraf, Viking Age"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-gold" />
            {sv ? 'Verktyg' : 'Tools'}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {sv
              ? <>Plattformens verktyg samlade på ett ställe — kartor, ortnamnsforskning, runor, forensik, 3D, sök och AI. Gemensamt för alla är grundregeln <strong>ingen gissning</strong>: verktygen är byggda för att <em>testa</em> hypoteser mot källor och data, inte för att bekräfta dem.</>
              : <>The platform’s tools in one place — maps, place-name research, runes, forensics, 3D, search and AI. Common to all is the rule <strong>no guessing</strong>: the tools are built to <em>test</em> hypotheses against sources and data, not to confirm them.</>}
          </p>
        </div>

        {GROUPS.map((g) => (
          <section key={g.titleSv} className="mb-10">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <g.icon className="h-5 w-5 text-gold" />
              {sv ? g.titleSv : g.titleEn}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.tools.map((t) => <ToolCard key={t.titleSv} t={t} sv={sv} />)}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
