
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";

// Route-level code splitting: each page becomes its own chunk, loaded on demand.
// Keep the landing page (Index) eager so first paint has no extra round-trip.
const Welcome = lazy(() => import("./pages/Welcome"));
const Explore = lazy(() => import("./pages/Explore"));
const Inscriptions = lazy(() => import("./pages/Inscriptions"));
const Artefacts = lazy(() => import("./pages/Artefacts"));
const Fortresses = lazy(() => import("./pages/Fortresses"));
const Carvers = lazy(() => import("./pages/Carvers"));
const VikingNames = lazy(() => import("./pages/VikingNames"));
const Hundreds = lazy(() => import("./pages/Hundreds"));
const Parishes = lazy(() => import("./pages/Parishes"));
const FolkGroups = lazy(() => import("./pages/FolkGroups"));
const Rivers = lazy(() => import("./pages/Rivers"));
const Gods = lazy(() => import("./pages/Gods"));
const GeneticEvents = lazy(() => import("./pages/GeneticEvents"));
const RoyalChronicles = lazy(() => import("./pages/RoyalChronicles"));
const Prices = lazy(() => import("./pages/Prices"));
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
                  <Route path="/" element={<Index />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/explore" element={<Explore />} />

                  {/* English routes */}
                  <Route path="/inscriptions" element={<Inscriptions />} />
                  <Route path="/carvers" element={<Carvers />} />
                  <Route path="/artefacts" element={<Artefacts />} />
                  <Route path="/viking-names" element={<VikingNames />} />
                  <Route path="/hundreds" element={<Hundreds />} />
                  <Route path="/parishes" element={<Parishes />} />
                  <Route path="/folk-groups" element={<FolkGroups />} />
                  <Route path="/rivers" element={<Rivers />} />
                  <Route path="/gods" element={<Gods />} />
                  <Route path="/genetic-events" element={<GeneticEvents />} />
                  <Route path="/royal-chronicles" element={<RoyalChronicles />} />
                  <Route path="/fortresses" element={<Fortresses />} />

                  {/* Swedish routes */}
                  <Route path="/sv/runinskrifter" element={<Inscriptions />} />
                  <Route path="/sv/ristare" element={<Carvers />} />
                  <Route path="/sv/artefakter" element={<Artefacts />} />
                  <Route path="/sv/vikinganamn" element={<VikingNames />} />
                  <Route path="/sv/harader" element={<Hundreds />} />
                  <Route path="/sv/socknar" element={<Parishes />} />
                  <Route path="/sv/folkgrupper" element={<FolkGroups />} />
                  <Route path="/sv/floder" element={<Rivers />} />
                  <Route path="/sv/gudar" element={<Gods />} />
                  <Route path="/sv/genetiska-handelser" element={<GeneticEvents />} />
                  <Route path="/sv/kungakronikor" element={<RoyalChronicles />} />
                  <Route path="/sv/borgar" element={<Fortresses />} />

                  {/* Other routes */}
                  <Route path="/prices" element={<Prices />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
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
