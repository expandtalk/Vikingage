
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RulerBar } from '../components/overlay/RulerBar';
import { Footer } from '../components/Footer';
import { RunicExplorerSimple } from '../components/RunicExplorerSimple';
import { ResearchNotes } from '../components/ResearchNotes';
import { RunicDatingAssistant } from '../components/RunicDatingAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, LogIn } from "lucide-react";
import { useDrivingMode } from "@/hooks/useDrivingMode";
import { useRoadtrip } from '@/hooks/useRoadtrip';
import { NavigatorHud } from '@/components/navigator/NavigatorHud';

const Explore = () => {
  const { user, loading } = useAuth();
  const { loading: roleLoading } = useUserRole();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [aiOpen, setAiOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const focus = searchParams.get('focus');
  // AI-analys/login-sektionen ska INTE ligga på explore-sidorna (Daniel, upprepat). Dölj alltid.
  const hideAiSection = true;
  const redirectChurches = focus === 'churches';
  // Billäge (Near me "Kör"): strippa forsknings-chrome, maximera kartan.
  const driving = useDrivingMode();
  // Dölj footern under HELA navigeringen (rutt aktiv), inte bara billäge/mobil — annars kan den
  // växa in över HUD:ens nedre rad (ETA/km) om isMobile mis-detekteras (Daniels fältprov).
  const { route } = useRoadtrip();

  // Per-användare hemposition (user_preferences): centrera kartan på användarens hemvy vid FÖRSTA
  // /explore-besöket per session om ingen vy-param angetts. null = laddar, 'skip' = ej tillämpligt.
  const [homePrefs, setHomePrefs] = useState<{ lat: number; lng: number } | 'skip' | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!user) { setHomePrefs('skip'); return; }
    let applied = false;
    try { applied = sessionStorage.getItem('explore_home_applied') === '1'; } catch { /* private mode */ }
    if (applied) { setHomePrefs('skip'); return; }
    (async () => {
      const { data } = await (supabase as any).from('user_preferences')
        .select('home_lat, home_lng').eq('user_id', user.id).maybeSingle();
      if (cancelled) return;
      setHomePrefs(data?.home_lat != null && data?.home_lng != null
        ? { lat: data.home_lat, lng: data.home_lng } : 'skip');
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (redirectChurches) return <Navigate to="/sv/kyrkor" replace />;

  // focus=oland utan center → centrera på Öland (annars öppnas Sverige-vyn med Öland-lagren på
  // men utanför bild). Öland-öns ungefärliga mitt; zoom 9 ramar in hela ön.
  if (focus === 'oland' && !searchParams.get('center')) {
    const p = new URLSearchParams(searchParams);
    p.set('center', '56.75,16.65');
    p.set('zoom', '9');
    return <Navigate to={`/explore?${p.toString()}`} replace />;
  }

  // region=<ortnamn> (t.ex. ?focus=parishes&region=Selånger) var en föräldralös param — kartan
  // öppnades på hela Sverige och de viewport-laddade lagren (kyrkor tänds vid zoom ≥8) blev tomma.
  // Kanalisera den genom den befintliga searchQuery-pipelinen (ExplorerMain centrerar på ortnamnet
  // via place_names) så vyn faktiskt zoomar in på orten och dess kyrkor/lämningar syns.
  const region = searchParams.get('region');
  if (region && !searchParams.get('searchQuery')) {
    const p = new URLSearchParams(searchParams);
    p.delete('region');
    p.set('searchQuery', region);
    return <Navigate to={`/explore?${p.toString()}`} replace />;
  }

  // Hemposition: centrera på användarens hemvy vid första /explore-besöket (ingen vy-param angiven).
  const hasViewParam = !!(searchParams.get('center') || focus || region || searchParams.get('searchQuery'));
  if (!hasViewParam && homePrefs && homePrefs !== 'skip') {
    try { sessionStorage.setItem('explore_home_applied', '1'); } catch { /* private mode */ }
    const p = new URLSearchParams(searchParams);
    p.set('center', `${homePrefs.lat},${homePrefs.lng}`);
    p.set('zoom', '11');
    return <Navigate to={`/explore?${p.toString()}`} replace />;
  }

  if (loading || roleLoading || (!!user && homePrefs === null && !hasViewParam)) {
    return (
      <div className="min-h-screen viking-bg flex items-center justify-center">
        <div className="text-foreground">{language === 'sv' ? 'Laddar…' : 'Loading…'}</div>
      </div>
    );
  }

  const t = language === 'sv'
    ? { ai: 'AI-analys', notes: 'Forskningsanteckningar', signInTitle: 'Logga in för AI-analys',
        signInBody: 'AI-driven datering av runinskrifter är tillgänglig för inloggade användare.', signIn: 'Logga in' }
    : { ai: 'AI Analysis', notes: 'Research Notes', signInTitle: 'Sign in for AI analysis',
        signInBody: 'AI-powered dating of runic inscriptions is available to signed-in users.', signIn: 'Sign in' };

  return (
    <div className="min-h-screen viking-bg">
      {!driving && <Header />}
      {/* Breadcrumb + linjal på SAMMA rad (Daniel: linjalen upp i linje med breadcrumb, chrome-typografi). */}
      {!driving && !isMobile && (
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Breadcrumbs bare />
          <RulerBar />
        </div>
      )}

      <main className={`container mx-auto px-4 ${driving ? 'py-2' : 'py-8'}`}>
        <NavigatorHud />
        {/* Main Explorer. `relative isolate` = eget stacking-context så kartans flytande
            paneler (absolute, z-[1100]) inte kan bläda ut och lägga sig över innehållet under
            (Daniel: AI-kortet/texten doldes av ett lager). Ingen overflow-hidden — skulle
            klippa Leaflet-popups. */}
        <div className={`${driving ? 'mb-0' : 'mb-8'} relative isolate`}>
          <RunicExplorerSimple />
        </div>

        {/* AI-analys/anteckningar = fotsektion. Döljs i billäget och på kyrkofokus (Daniel). */}
        {(driving || hideAiSection) ? null : isMobile && !aiOpen ? (
          <div className="mt-12 pt-8 border-t border-border/60">
            <button
              onClick={() => setAiOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
            >
              <Brain className="h-4 w-4 text-gold" /> {t.ai} <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : (
        <Tabs defaultValue="ai-analysis" className="w-full relative isolate mt-12 pt-8 border-t border-border/60">
          <TabsList className={`grid w-full ${user ? 'grid-cols-2' : 'grid-cols-1'} mb-6 bg-card border border-border`}>
            <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t.ai}</TabsTrigger>
            {user && (
              <TabsTrigger value="research-notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t.notes}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ai-analysis">
            {user ? (
              <RunicDatingAssistant />
            ) : (
              <Card className="viking-card max-w-4xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-foreground flex items-center justify-center gap-2">
                    <Brain className="h-5 w-5 text-gold" />
                    {t.signInTitle}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t.signInBody}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild>
                    <Link to="/auth">
                      <LogIn className="h-4 w-4 mr-2" />
                      {t.signIn}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="research-notes">
              <ResearchNotes />
            </TabsContent>
          )}
        </Tabs>
        )}
      </main>

      {/* Footern döljs på mobil + under aktiv navigering (rutt/billäge). Full footer på desktop utan rutt. */}
      {!driving && !route && !isMobile && <Footer />}
    </div>
  );
};

export default Explore;
