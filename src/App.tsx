
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

// These datasets are canonically the Explore focus views; the old standalone
// routes redirect there (decision 2026-07-16: Explore is the single destination).
const Prices = lazy(() => import("./pages/Prices"));
const Excursions = lazy(() => import("./pages/Excursions"));
const Coins = lazy(() => import("./pages/Coins"));
const Kungstavla = lazy(() => import("./pages/Kungstavla"));
const ExcursionDetail = lazy(() => import("./pages/ExcursionDetail"));
const KalmarWall = lazy(() => import("./pages/KalmarWall"));
const SourceDetail = lazy(() => import("./pages/SourceDetail"));
const SourceLibrary = lazy(() => import("./pages/SourceLibrary"));
const ThemePage = lazy(() => import("./pages/ThemePage"));
const InscriptionPage = lazy(() => import("./pages/InscriptionPage"));
const Statistics = lazy(() => import("./pages/Statistics"));
const PlaceNames = lazy(() => import("./pages/PlaceNames"));
const Ontology = lazy(() => import("./pages/Ontology"));
const HistoricalEvents = lazy(() => import("./pages/HistoricalEvents"));
const EconomicHistory = lazy(() => import("./pages/EconomicHistory"));
const Angermanland = lazy(() => import("./pages/Angermanland"));
const Kalmar = lazy(() => import("./pages/Kalmar"));
const Staket = lazy(() => import("./pages/Staket"));
const LegendStones = lazy(() => import("./pages/LegendStones"));
const Oland = lazy(() => import("./pages/Oland"));
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
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

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
          <LanguageProvider>
            <TooltipProvider>
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
                  <Route path="/sv/runinskrifter" element={<Inscriptions />} />
                  <Route path="/sv/ristare" element={<Carvers />} />
                  <Route path="/sv/artefakter" element={<Artefacts />} />
                  <Route path="/sv/kungakronikor" element={<RoyalChronicles />} />
                  <Route path="/sv/borgar" element={<Fortresses />} />

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
                  <Route path="/ontology" element={<Ontology />} />
                  <Route path="/ontologi" element={<Ontology />} />
                  <Route path="/historical-events" element={<HistoricalEvents />} />
                  <Route path="/sv/historiska-handelser" element={<HistoricalEvents />} />
                  <Route path="/economic-history" element={<EconomicHistory />} />
                  <Route path="/sv/ekonomisk-historia" element={<EconomicHistory />} />
                  <Route path="/sv/angermanland" element={<Angermanland />} />
                  <Route path="/angermanland" element={<Angermanland />} />
                  <Route path="/sv/oland" element={<Oland />} />
                  <Route path="/oland" element={<Oland />} />
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
                  <Route path="/sv/staket" element={<Staket />} />
                  <Route path="/en/staket" element={<Staket />} />
                  <Route path="/staket" element={<Staket />} />
                  <Route path="/sv/legendstenar" element={<LegendStones />} />
                  <Route path="/en/legend-stones" element={<LegendStones />} />
                  <Route path="/legendstenar" element={<LegendStones />} />
                  <Route path="/prices" element={<Prices />} />
                  <Route path="/excursions" element={<Excursions />} />
                  <Route path="/sv/utflykter" element={<Excursions />} />
                  <Route path="/excursions/:id" element={<ExcursionDetail />} />
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
                  <Route path="/utflykter/:id" element={<ExcursionDetail />} />
                  <Route path="/coins" element={<Coins />} />
                  <Route path="/sv/mynt" element={<Coins />} />
                  <Route path="/kungsnave" element={<Kungstavla />} />
                  <Route path="/kungstavla" element={<Navigate to="/kungsnave" replace />} />
                  <Route path="/kings-board" element={<Navigate to="/kungsnave" replace />} />
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
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
