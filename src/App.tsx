
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccountSync } from "@/components/AccountSync";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { SkipLink } from "@/components/SkipLink";
import { RequireRole } from "@/components/auth/RequireRole";
import Welcome from "./pages/Welcome";

// Route-level code splitting: each page becomes its own chunk, loaded on demand.
// Keep the landing page (Index) eager so first paint has no extra round-trip.
const Explore = lazy(() => import("./pages/Explore"));
const Inscriptions = lazy(() => import("./pages/Inscriptions"));
const Artefacts = lazy(() => import("./pages/Artefacts"));
const Fortresses = lazy(() => import("./pages/Fortresses"));
const FortressDetail = lazy(() => import("./pages/FortressDetail"));
const Carvers = lazy(() => import("./pages/Carvers"));
const RoyalChronicles = lazy(() => import("./pages/RoyalChronicles"));
const Researchers = lazy(() => import("./pages/Researchers"));

// These datasets are canonically the Explore focus views; the old standalone
// routes redirect there (decision 2026-07-16: Explore is the single destination).
const Prices = lazy(() => import("./pages/Prices"));
const Excursions = lazy(() => import("./pages/Excursions"));
const Coins = lazy(() => import("./pages/Coins"));
const CoinDetail = lazy(() => import("./pages/CoinDetail"));
const Kungstavla = lazy(() => import("./pages/Kungstavla"));
const ExcursionDetail = lazy(() => import("./pages/ExcursionDetail"));
const ResearchArea = lazy(() => import("./pages/ResearchArea"));
const DiscussionFeed = lazy(() => import("./pages/DiscussionFeed"));
const KalmarWall = lazy(() => import("./pages/KalmarWall"));
const SourceDetail = lazy(() => import("./pages/SourceDetail"));
const SourceLibrary = lazy(() => import("./pages/SourceLibrary"));
const ThemePage = lazy(() => import("./pages/ThemePage"));
const InscriptionPage = lazy(() => import("./pages/InscriptionPage"));
const Statistics = lazy(() => import("./pages/Statistics"));
const PlaceNames = lazy(() => import("./pages/PlaceNames"));
const TunaNames = lazy(() => import("./pages/TunaNames"));
const PlacePage = lazy(() => import("./pages/PlacePage"));
const GlossaryTerm = lazy(() => import("./pages/GlossaryTerm"));
const PlaceIndex = lazy(() => import("./pages/PlaceIndex"));
const RoadPage = lazy(() => import("./pages/RoadPage"));
const Vendelhjalmar = lazy(() => import("./pages/Vendelhjalmar"));
const Models3D = lazy(() => import("./pages/Models3D"));
const Bildarkiv = lazy(() => import("./pages/Bildarkiv"));
const Nyheter = lazy(() => import("./pages/Nyheter"));
const Ontology = lazy(() => import("./pages/Ontology"));
const AiAgents = lazy(() => import("./pages/AiAgents"));
const DeLaudibus = lazy(() => import("./pages/DeLaudibus"));
const Tools = lazy(() => import("./pages/Tools"));
const Fingerprint = lazy(() => import("./pages/Fingerprint"));
const Bildforbattring = lazy(() => import("./pages/Bildforbattring"));
const KalmarMedeltid = lazy(() => import("./pages/KalmarMedeltid"));
const KartsymbolerPreview = lazy(() => import("./pages/KartsymbolerPreview"));
const HistoricalEvents = lazy(() => import("./pages/HistoricalEvents"));
const EconomicHistory = lazy(() => import("./pages/EconomicHistory"));
const Angermanland = lazy(() => import("./pages/Angermanland"));
const HogaKusten = lazy(() => import("./pages/HogaKusten"));
const HaxprocessTorsaker = lazy(() => import("./pages/HaxprocessTorsaker"));
const Fornvannen = lazy(() => import("./pages/Fornvannen"));
const Ledung = lazy(() => import("./pages/Ledung"));
const Snacknamn = lazy(() => import("./pages/Snacknamn"));
const Hundare = lazy(() => import("./pages/Hundare"));
const Kalmar = lazy(() => import("./pages/Kalmar"));
const Staket = lazy(() => import("./pages/Staket"));
const Birka = lazy(() => import("./pages/Birka"));
const Stenalder = lazy(() => import("./pages/Stenalder"));
const GotaLandsvag = lazy(() => import("./pages/GotaLandsvag"));
const SandbyBorg = lazy(() => import("./pages/SandbyBorg"));
const DanskaRunstenar = lazy(() => import("./pages/DanskaRunstenar"));
const Kyrkor = lazy(() => import("./pages/Kyrkor"));
const Medeltidsborgar = lazy(() => import("./pages/Medeltidsborgar"));
const DriveView = lazy(() => import("./pages/DriveView"));
const Grottor = lazy(() => import("./pages/Grottor"));
const SvampGuide = lazy(() => import("./pages/SvampGuide"));
const Vikingatid = lazy(() => import("./pages/Vikingatid"));
const SanktOlof = lazy(() => import("./pages/SanktOlof"));
const Podcast = lazy(() => import("./pages/Podcast"));
const Helgon = lazy(() => import("./pages/Helgon"));
const Vetenskapsmetodik = lazy(() => import("./pages/Vetenskapsmetodik"));
const RiksdagCv = lazy(() => import("./pages/RiksdagCv"));
const ForsvunnaRunstenar = lazy(() => import("./pages/ForsvunnaRunstenar"));
const LegendStones = lazy(() => import("./pages/LegendStones"));
const Runes = lazy(() => import("./pages/Runes"));
const Oland = lazy(() => import("./pages/Oland"));
const Eriksgatan = lazy(() => import("./pages/Eriksgatan"));
const Goteborg = lazy(() => import("./pages/Goteborg"));
const RegisterPlace = lazy(() => import("./pages/RegisterPlace"));
const CentralPlaces = lazy(() => import("./pages/CentralPlaces"));
const SiteIndex = lazy(() => import("./pages/SiteIndex"));
const Maktsfarer = lazy(() => import("./pages/Maktsfarer"));
const Greklandsfarare = lazy(() => import("./pages/Greklandsfarare"));
const Langbardaland = lazy(() => import("./pages/Langbardaland"));
const Titlar = lazy(() => import("./pages/Titlar"));
const Kungshogar = lazy(() => import("./pages/Kungshogar"));
const Heraldry = lazy(() => import("./pages/Heraldry"));
const Bronsalder = lazy(() => import("./pages/Bronsalder"));
const ExecutionSites = lazy(() => import("./pages/ExecutionSites"));
const Genealogy = lazy(() => import("./pages/Genealogy"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const ResearcherProfile = lazy(() => import("./pages/ResearcherProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MedievalCharters = lazy(() => import("./pages/MedievalCharters"));
const MedievalCharterDetail = lazy(() => import("./pages/MedievalCharterDetail"));

// Global cache-policy: utan detta får varje query default staleTime 0 + refetch vid
// fönsterfokus → onödiga refetch-round-trips (särskilt söksvaret). 5 min färskt räcker
// gott för forskningsdata som ändras sällan; enskilda queries kan överstyra vid behov.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen viking-bg flex items-center justify-center">
    <div className="text-foreground">Loading…</div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AccountSync />
          <LanguageProvider>
            <AccessibilityProvider>
            <TooltipProvider>
              <SkipLink />
              <Toaster />
              <Sonner />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Startsidan renderas DIREKT på roten (tidigare Index → navigate('/welcome')
                      + /welcome → / gav en oändlig redirect-loop). */}
                  <Route path="/" element={<Welcome />} />
                  {/* /welcome var en dublett av startsidan — 301 i .htaccess + client-redirect här */}
                  <Route path="/welcome" element={<Navigate to="/" replace />} />
                  <Route path="/explore" element={<Explore />} />

                  {/* Dedicated pages */}
                  <Route path="/inscriptions" element={<Inscriptions />} />
                  <Route path="/carvers" element={<Carvers />} />
                  <Route path="/artefacts" element={<Artefacts />} />
                  <Route path="/royal-chronicles" element={<RoyalChronicles />} />
                  <Route path="/fortresses" element={<Fortresses />} />
                  <Route path="/fortresses/:id" element={<FortressDetail />} />
                  {/* Vänliga rutter → fornborgs-detaljsidan (claim-liggaren). */}
                  <Route path="/sv/ismantorp" element={<Navigate to="/fortresses/6660de5b-9d2e-4fa4-b58e-f327fd256ae3" replace />} />
                  <Route path="/sv/ismanstorp" element={<Navigate to="/fortresses/6660de5b-9d2e-4fa4-b58e-f327fd256ae3" replace />} />
                  {/* Normalisering: Ismantorp har en kanonisk sida (fortsidan). Utfluktsslugarna 301:as dit. */}
                  <Route path="/excursions/ismantorps-borg" element={<Navigate to="/fortresses/6660de5b-9d2e-4fa4-b58e-f327fd256ae3" replace />} />
                  <Route path="/utflykter/ismantorps-borg" element={<Navigate to="/fortresses/6660de5b-9d2e-4fa4-b58e-f327fd256ae3" replace />} />
                  <Route path="/sv/graborg" element={<Navigate to="/fortresses/f82c3020-f03d-4e5c-b578-af3881cdf4f2" replace />} />
                  <Route path="/sv/gråborg" element={<Navigate to="/fortresses/f82c3020-f03d-4e5c-b578-af3881cdf4f2" replace />} />
                  <Route path="/sv/runinskrifter" element={<Inscriptions />} />
                  <Route path="/sv/ristare" element={<Carvers />} />
                  <Route path="/sv/artefakter" element={<Artefacts />} />
                  <Route path="/sv/kungakronikor" element={<RoyalChronicles />} />
                  <Route path="/sv/borgar" element={<Fortresses />} />
                  <Route path="/forskare" element={<Researchers />} />
                  <Route path="/researchers" element={<Researchers />} />
                  <Route path="/forskare/:handle" element={<ResearcherProfile />} />

                  {/* Consolidated to Explore focus views (EN + SV old paths redirect) */}
                  <Route path="/viking-names" element={<Navigate to="/explore?focus=names" replace />} />
                  <Route path="/sv/vikinganamn" element={<Navigate to="/explore?focus=names" replace />} />
                  <Route path="/hundreds" element={<Navigate to="/explore?focus=hundreds" replace />} />
                  <Route path="/sv/harader" element={<Navigate to="/explore?focus=hundreds" replace />} />
                  <Route path="/parishes" element={<Navigate to="/explore?focus=parishes" replace />} />
                  <Route path="/sv/socknar" element={<Navigate to="/explore?focus=parishes" replace />} />
                  <Route path="/folk-groups" element={<Navigate to="/explore?focus=folkGroups" replace />} />
                  <Route path="/sv/folkgrupper" element={<Navigate to="/explore?focus=folkGroups" replace />} />
                  <Route path="/rivers" element={<Navigate to="/explore?focus=rivers" replace />} />
                  <Route path="/sv/floder" element={<Navigate to="/explore?focus=rivers" replace />} />
                  <Route path="/gods" element={<Navigate to="/explore?focus=gods" replace />} />
                  <Route path="/sv/gudar" element={<Navigate to="/explore?focus=gods" replace />} />
                  {/* Interim: dedikerade kyrk-routes tills riktig /kyrkor-sida byggs (följdplan) */}
                  <Route path="/churches" element={<Navigate to="/explore?focus=churches" replace />} />
                  <Route path="/kyrkor" element={<Navigate to="/explore?focus=churches" replace />} />
                  <Route path="/genetic-events" element={<Navigate to="/explore?focus=geneticEvents" replace />} />
                  <Route path="/sv/genetiska-handelser" element={<Navigate to="/explore?focus=geneticEvents" replace />} />

                  {/* Other routes */}
                  <Route path="/place-names" element={<PlaceNames />} />
                  <Route path="/sv/ortnamn" element={<PlaceNames />} />
                  <Route path="/sv/ortnamn/tuna" element={<TunaNames />} />
                  <Route path="/place-names/tuna" element={<TunaNames />} />
                  <Route path="/sv/plats" element={<PlaceIndex />} />
                  <Route path="/en/place" element={<PlaceIndex />} />
                  <Route path="/sv/plats/:slug" element={<PlacePage />} />
                  <Route path="/en/place/:slug" element={<PlacePage />} />
                  <Route path="/sv/ordlista/:slug" element={<GlossaryTerm forceLang="sv" />} />
                  <Route path="/en/glossary/:slug" element={<GlossaryTerm forceLang="en" />} />
                  <Route path="/sv/led/:slug" element={<RoadPage />} />
                  <Route path="/en/road/:slug" element={<RoadPage />} />
                  <Route path="/sv/vendelhjalmar" element={<Vendelhjalmar />} />
                  <Route path="/en/vendel-helmets" element={<Vendelhjalmar />} />
                  <Route path="/sv/3d" element={<Models3D />} />
                  <Route path="/en/3d" element={<Models3D />} />
                  <Route path="/3d" element={<Models3D />} />
                  <Route path="/sv/bildarkiv" element={<Bildarkiv />} />
                  <Route path="/en/image-archive" element={<Bildarkiv />} />
                  <Route path="/bildarkiv" element={<Bildarkiv />} />
                  <Route path="/ontology" element={<Ontology />} />
                  <Route path="/ontologi" element={<Ontology />} />
                  <Route path="/ai-agents" element={<AiAgents forceLang="en" />} />
                  <Route path="/ai-agenter" element={<AiAgents forceLang="sv" />} />
                  <Route path="/sv/de-laudibus" element={<DeLaudibus forceLang="sv" />} />
                  <Route path="/en/de-laudibus" element={<DeLaudibus forceLang="en" />} />
                  <Route path="/sv/nyheter" element={<Nyheter forceLang="sv" />} />
                  <Route path="/en/news" element={<Nyheter forceLang="en" />} />
                  <Route path="/nyheter" element={<Nyheter forceLang="sv" />} />
                  <Route path="/verktyg" element={<Tools />} />
                  <Route path="/sv/verktyg" element={<Tools />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/en/tools" element={<Tools />} />
                  <Route path="/sv/fingerprint" element={<Fingerprint />} />
                  <Route path="/en/fingerprint" element={<Fingerprint />} />
                  <Route path="/fingerprint" element={<Fingerprint />} />
                  <Route path="/sv/bildforbattring" element={<Bildforbattring />} />
                  <Route path="/en/image-enhancement" element={<Bildforbattring />} />
                  <Route path="/bildforbattring" element={<Bildforbattring />} />
                  <Route path="/sv/kalmar/medeltid" element={<KalmarMedeltid />} />
                  <Route path="/sv/kalmar-medeltid" element={<KalmarMedeltid />} />
                  <Route path="/kalmar-medeltid" element={<KalmarMedeltid />} />
                  <Route path="/sv/kartsymboler" element={<KartsymbolerPreview />} />
                  <Route path="/kartsymboler" element={<KartsymbolerPreview />} />
                  <Route path="/historical-events" element={<HistoricalEvents />} />
                  <Route path="/sv/historiska-handelser" element={<HistoricalEvents />} />
                  <Route path="/economic-history" element={<EconomicHistory />} />
                  <Route path="/sv/ekonomisk-historia" element={<EconomicHistory />} />
                  <Route path="/sv/angermanland" element={<Angermanland />} />
                  <Route path="/angermanland" element={<Angermanland />} />
                  <Route path="/sv/hoga-kusten" element={<HogaKusten />} />
                  <Route path="/en/high-coast" element={<HogaKusten />} />
                  <Route path="/hoga-kusten" element={<HogaKusten />} />
                  <Route path="/sv/haxprocesserna-angermanland" element={<HaxprocessTorsaker />} />
                  <Route path="/en/witch-trials-angermanland" element={<HaxprocessTorsaker />} />
                  <Route path="/sv/fornvannen" element={<Fornvannen />} />
                  <Route path="/en/fornvannen" element={<Fornvannen />} />
                  <Route path="/sv/ledung" element={<Ledung />} />
                  <Route path="/en/leidang" element={<Ledung />} />
                  <Route path="/sv/snacknamn" element={<Snacknamn />} />
                  <Route path="/en/snack-names" element={<Snacknamn />} />
                  <Route path="/sv/hundare" element={<Hundare />} />
                  <Route path="/en/hundred" element={<Hundare />} />
                  <Route path="/sv/oland" element={<Oland />} />
                  <Route path="/oland" element={<Oland />} />
                  <Route path="/sv/eriksgatan" element={<Eriksgatan />} />
                  <Route path="/en/eriksgata" element={<Eriksgatan />} />
                  <Route path="/eriksgatan" element={<Eriksgatan />} />
                  <Route path="/sv/goteborg" element={<Goteborg />} />
                  <Route path="/en/gothenburg" element={<Goteborg />} />
                  <Route path="/goteborg" element={<Goteborg />} />
                  <Route path="/registrera-plats" element={<RegisterPlace />} />
                  <Route path="/en/register-place" element={<RegisterPlace />} />
                  <Route path="/sv/centralplatser" element={<CentralPlaces />} />
                  <Route path="/central-places" element={<CentralPlaces />} />
                  <Route path="/sidor" element={<SiteIndex />} />
                  <Route path="/pages" element={<SiteIndex />} />
                  <Route path="/sv/maktsfarer" element={<Maktsfarer />} />
                  <Route path="/en/power-spheres" element={<Maktsfarer />} />
                  {/* Forskningssidor under /forskning/<namn> (konvention, Daniel 2026-07-28). /sv/-varianter kvar som alias. */}
                  <Route path="/forskning/kalmar" element={<Kalmar />} />
                  <Route path="/forskning/greklandsfarare" element={<Greklandsfarare />} />
                  <Route path="/forskning/langbardaland" element={<Langbardaland />} />
                  <Route path="/forskning/titlar" element={<Titlar />} />
                  <Route path="/forskning/kungshogar" element={<Kungshogar />} />
                  <Route path="/forskning/bronsalder" element={<Bronsalder />} />
                  <Route path="/forskning/heraldik" element={<Heraldry />} />
                  <Route path="/forskning/avrattningsplatser" element={<ExecutionSites />} />
                  <Route path="/sv/avrattningsplatser" element={<ExecutionSites />} />
                  <Route path="/en/execution-sites" element={<ExecutionSites />} />
                  <Route path="/forskning/slaktforskning" element={<Genealogy />} />
                  <Route path="/sv/slaktforskning" element={<Genealogy />} />
                  <Route path="/en/genealogy" element={<Genealogy />} />
                  <Route path="/sv/heraldik" element={<Heraldry />} />
                  <Route path="/en/heraldry" element={<Heraldry />} />
                  <Route path="/sv/kalmar" element={<Kalmar />} />
                  <Route path="/kalmar" element={<Kalmar />} />
                  <Route path="/sv/medeltidsbrev/:sdhk" element={<MedievalCharterDetail />} />
                  <Route path="/en/medieval-charters/:sdhk" element={<MedievalCharterDetail />} />
                  <Route path="/sv/medeltidsbrev" element={<MedievalCharters />} />
                  <Route path="/en/medieval-charters" element={<MedievalCharters />} />
                  <Route path="/sv/staket" element={<Staket />} />
                  <Route path="/en/staket" element={<Staket />} />
                  <Route path="/sv/birka" element={<Birka />} />
                  <Route path="/en/birka" element={<Birka />} />
                  <Route path="/birka" element={<Birka />} />
                  <Route path="/sv/stenalder" element={<Stenalder />} />
                  <Route path="/en/stone-age" element={<Stenalder />} />
                  <Route path="/stenalder" element={<Stenalder />} />
                  <Route path="/sv/gota-landsvag" element={<GotaLandsvag />} />
                  <Route path="/en/gota-landsvag" element={<GotaLandsvag />} />
                  <Route path="/sv/sandby-borg" element={<SandbyBorg />} />
                  <Route path="/en/sandby-borg" element={<SandbyBorg />} />
                  <Route path="/sv/danska-runstenar" element={<DanskaRunstenar />} />
                  <Route path="/en/danish-runestones" element={<DanskaRunstenar />} />
                  <Route path="/sv/kyrkor" element={<Kyrkor />} />
                  <Route path="/en/churches" element={<Kyrkor />} />
                  <Route path="/sv/medeltidsborgar" element={<Medeltidsborgar />} />
                  <Route path="/en/medieval-castles" element={<Medeltidsborgar />} />
                  <Route path="/3D-bil" element={<DriveView />} />
                  <Route path="/3D-drive" element={<DriveView />} />
                  <Route path="/grottor" element={<Grottor />} />
                  <Route path="/caves" element={<Grottor />} />
                  <Route path="/grotta" element={<Navigate to="/grottor" replace />} />
                  <Route path="/cave" element={<Navigate to="/caves" replace />} />
                  <Route path="/sv/svamp" element={<SvampGuide />} />
                  <Route path="/en/mushrooms" element={<SvampGuide />} />
                  <Route path="/sv/vikingatid" element={<Vikingatid />} />
                  <Route path="/en/viking-age" element={<Vikingatid />} />
                  <Route path="/vikingatid" element={<Vikingatid />} />
                  <Route path="/staket" element={<Staket />} />
                  <Route path="/sv/sankt-olof" element={<SanktOlof />} />
                  <Route path="/en/saint-olav" element={<SanktOlof />} />
                  <Route path="/sankt-olof" element={<SanktOlof />} />
                  <Route path="/podcast" element={<Podcast />} />
                  <Route path="/sv/helgon" element={<Helgon />} />
                  <Route path="/en/saints" element={<Helgon />} />
                  <Route path="/helgon" element={<Helgon />} />
                  <Route path="/vetenskapsmetodik" element={<Vetenskapsmetodik />} />
                  <Route path="/sv/vetenskapsmetodik" element={<Vetenskapsmetodik forceLang="sv" />} />
                  <Route path="/en/scientific-methodology" element={<Vetenskapsmetodik forceLang="en" />} />
                  <Route path="/methodology" element={<Vetenskapsmetodik forceLang="en" />} />
                  <Route path="/sv/riksdag-cv" element={<RiksdagCv forceLang="sv" />} />
                  <Route path="/en/riksdag-cv" element={<RiksdagCv forceLang="en" />} />
                  <Route path="/riksdag-cv" element={<RiksdagCv forceLang="sv" />} />
                  <Route path="/sv/forsvunna-runstenar" element={<ForsvunnaRunstenar forceLang="sv" />} />
                  <Route path="/en/lost-runestones" element={<ForsvunnaRunstenar forceLang="en" />} />
                  <Route path="/sv/runor" element={<Runes />} />
                  <Route path="/en/runes" element={<Runes />} />
                  <Route path="/runor" element={<Runes />} />
                  <Route path="/runes" element={<Runes />} />
                  <Route path="/sv/legendstenar" element={<LegendStones />} />
                  <Route path="/en/legend-stones" element={<LegendStones />} />
                  <Route path="/legendstenar" element={<LegendStones />} />
                  <Route path="/prices" element={<Prices />} />
                  <Route path="/excursions" element={<Excursions forceLang="en" />} />
                  <Route path="/utflykter" element={<Excursions forceLang="sv" />} />
                  <Route path="/sv/utflykter" element={<Navigate to="/utflykter" replace />} />
                  <Route path="/excursions/:id" element={<ExcursionDetail forceLang="en" />} />
                  <Route path="/sv/kalmar-stadsmur" element={<KalmarWall />} />
                  <Route path="/en/kalmar-city-wall" element={<KalmarWall />} />
                  <Route path="/kalmar-stadsmur" element={<KalmarWall />} />
                  <Route path="/texts" element={<SourceLibrary />} />
                  <Route path="/texter" element={<SourceLibrary />} />
                  <Route path="/tema/:slug" element={<ThemePage />} />
                  <Route path="/themes/:slug" element={<ThemePage />} />
                  <Route path="/sources/text/:textId" element={<SourceDetail />} />
                  <Route path="/sources/:id" element={<SourceDetail />} />
                  <Route path="/sources" element={<Navigate to="/texter" replace />} />
                  <Route path="/inscription/:signum" element={<InscriptionPage />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/sv/statistik" element={<Statistics />} />
                  <Route path="/utflykter/:id" element={<ExcursionDetail forceLang="sv" />} />
                  <Route path="/omraden/:slug" element={<ResearchArea />} />
                  <Route path="/diskussioner" element={<DiscussionFeed />} />
                  <Route path="/coins" element={<Coins />} />
                  <Route path="/coins/:id" element={<CoinDetail />} />
                  <Route path="/sv/mynt" element={<Coins />} />
                  <Route path="/sv/mynt/:id" element={<CoinDetail />} />
                  <Route path="/kungsnave" element={<Kungstavla />} />
                  <Route path="/kungstavla" element={<Navigate to="/kungsnave" replace />} />
                  <Route path="/kings-board" element={<Navigate to="/kungsnave" replace />} />
                  <Route path="/sv/integritetspolicy" element={<Privacy />} />
                  <Route path="/en/privacy" element={<Privacy />} />
                  <Route path="/integritetspolicy" element={<Privacy />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireRole roles={['admin']}>
                        <Admin />
                      </RequireRole>
                    }
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TooltipProvider>
            </AccessibilityProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
