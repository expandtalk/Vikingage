
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { RunicExplorerSimple } from '../components/RunicExplorerSimple';
import { ResearchNotes } from '../components/ResearchNotes';
import { RunicDatingAssistant } from '../components/RunicDatingAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, LogIn } from "lucide-react";
import { useDrivingMode } from "@/hooks/useDrivingMode";
import { NavigatorHud } from '@/components/navigator/NavigatorHud';

const Explore = () => {
  const { user, loading } = useAuth();
  const { loading: roleLoading } = useUserRole();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [aiOpen, setAiOpen] = useState(false);
  // Billäge (Near me "Kör"): strippa forsknings-chrome, maximera kartan.
  const driving = useDrivingMode();

  if (loading || roleLoading) {
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
      {!driving && <Breadcrumbs />}

      <main className={`container mx-auto px-4 ${driving ? 'py-2' : 'py-8'}`}>
        <NavigatorHud />
        {/* Main Explorer. `relative isolate` = eget stacking-context så kartans flytande
            paneler (absolute, z-[1100]) inte kan bläda ut och lägga sig över innehållet under
            (Daniel: AI-kortet/texten doldes av ett lager). Ingen overflow-hidden — skulle
            klippa Leaflet-popups. */}
        <div className={`${driving ? 'mb-0' : 'mb-8'} relative isolate`}>
          <RunicExplorerSimple />
        </div>

        {/* AI-analys/anteckningar = fotsektion. Döljs helt i billäget (Daniel: behöver ej visas). */}
        {driving ? null : isMobile && !aiOpen ? (
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

      {!driving && <Footer />}
    </div>
  );
};

export default Explore;
