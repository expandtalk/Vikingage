import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, User, Scroll, Hash, CheckCircle, AlertTriangle } from "lucide-react";
import { useCarverData } from '../hooks/useCarverData';
import { CarversMap } from '../components/carvers/CarversMap';
import { CarverDetailPanel } from '../components/carvers/CarverDetailPanel';
import { useLanguage } from "@/contexts/LanguageContext";

const Carvers = () => {
  const { carvers, isLoading, totalCarvers } = useCarverData();
  const [selectedCarver, setSelectedCarver] = useState<string | null>(null);
  const [highlightedCarver, setHighlightedCarver] = useState<{ id: string } | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    loading: 'Laddar runristare...',
    title: 'Runristare',
    subtitle: 'Upptäck mästarna bakom runstenarna - runristare som signerat sina verk eller identifierats genom stilanalys.',
    tabCarvers: (n: number) => `Runristare (${n})`,
    tabStats: 'Statistik',
    statsTitle: 'Runristare statistik',
    identified: 'Identifierade runristare',
    stonesTotal: 'Stenar totalt',
    signedStones: 'Signerade stenar',
    knownLocation: 'Med känd plats',
    top10: 'Top 10 mest produktiva runristare',
    stones: 'stenar',
    badgeStones: (n: number) => `${n} stenar`,
    badgeSigned: (n: number) => `${n} signerade`,
    badgeUncertain: (n: number) => `${n} osäkra`,
    signed: 'Signerade',
    attributed: 'Tillskrivna',
    allCertain: 'Alla tillskrivningar säkra',
    certaintyMix: (certain: number, uncertain: number) => `${certain} säkra, ${uncertain} osäkra tillskrivningar`,
  } : {
    loading: 'Loading rune carvers...',
    title: 'Rune carvers',
    subtitle: 'Discover the masters behind the runestones - rune carvers who signed their work or were identified through stylistic analysis.',
    tabCarvers: (n: number) => `Rune carvers (${n})`,
    tabStats: 'Statistics',
    statsTitle: 'Rune carver statistics',
    identified: 'Identified rune carvers',
    stonesTotal: 'Total stones',
    signedStones: 'Signed stones',
    knownLocation: 'With known location',
    top10: 'Top 10 most productive rune carvers',
    stones: 'stones',
    badgeStones: (n: number) => `${n} stones`,
    badgeSigned: (n: number) => `${n} signed`,
    badgeUncertain: (n: number) => `${n} uncertain`,
    signed: 'Signed',
    attributed: 'Attributed',
    allCertain: 'All attributions certain',
    certaintyMix: (certain: number, uncertain: number) => `${certain} certain, ${uncertain} uncertain attributions`,
  };

  const formatPeriod = (start: number | null, end: number | null) => {
    if (!start && !end) return sv ? 'Okänd period' : 'Unknown period';
    if (start && end) return `${start}-${end}`;
    if (start) return sv ? `från ${start}` : `from ${start}`;
    if (end) return sv ? `till ${end}` : `until ${end}`;
    return sv ? 'Okänd period' : 'Unknown period';
  };

  // Map interaction handlers
  const handleCarverClick = (carver: any) => {
    setSelectedCarver(carver.id);
    setHighlightedCarver({ id: carver.id });
    setShowDetailPanel(true);
    
    // Scroll to corresponding card
    const element = document.getElementById(`carver-${carver.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardClick = (carver: any) => {
    setSelectedCarver(carver.id);
    setHighlightedCarver({ id: carver.id });
    setShowDetailPanel(true);
  };

  const handleCloseDetailPanel = () => {
    setSelectedCarver(null);
    setShowDetailPanel(false);
    setHighlightedCarver(null);
  };

  const handleCardHover = (carverId: string) => {
    setHighlightedCarver({ id: carverId });
  };

  const handleCardLeave = () => {
    setHighlightedCarver(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">{c.loading}</div>
        </main>
      </div>
    );
  }

  // Calculate statistics
  const totalInscriptions = carvers.reduce((sum, carver) => sum + carver.inscriptionCount, 0);
  const totalSigned = carvers.reduce((sum, carver) => sum + carver.signedCount, 0);
  const totalAttributed = carvers.reduce((sum, carver) => sum + carver.attributedCount, 0);
  const carversWithLocation = carvers.filter(carver => carver.region || carver.country).length;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Runristare"
        titleEn="Carvers"
        description="Utforska runristare och mästare från vikingatiden. Se deras inskrifter, verkstäder och geografiska spridning på interaktiva kartor."
        descriptionEn="Explore runic carvers and masters from the Viking Age. View their inscriptions, workshops and geographical distribution on interactive maps."
        keywords="runristare, mästare, vikingatid, runologi, inskrifter, verkstäder"
      />
      <Header />
      <Breadcrumbs />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <User className="h-8 w-8 text-accent" />
            {c.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {c.subtitle}
          </p>
        </div>


        {/* Detail Panel */}
        {showDetailPanel && selectedCarver && (
          <div className="mb-8">
            <CarverDetailPanel
              carverId={selectedCarver}
              onBack={handleCloseDetailPanel}
              onInscriptionClick={(inscription) => {
                console.log('Clicking inscription:', inscription);
                // TODO: Navigate to inscription detail or highlight on map
              }}
            />
          </div>
        )}

        <Tabs defaultValue="carvers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="carvers" className="flex items-center gap-2">
              <Scroll className="h-4 w-4" />
              {c.tabCarvers(totalCarvers)}
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {c.tabStats}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-6">
            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  {c.statsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{totalCarvers}</div>
                    <div className="text-sm text-muted-foreground">{c.identified}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{totalInscriptions}</div>
                    <div className="text-sm text-muted-foreground">{c.stonesTotal}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{totalSigned}</div>
                    <div className="text-sm text-muted-foreground">{c.signedStones}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{carversWithLocation}</div>
                    <div className="text-sm text-muted-foreground">{c.knownLocation}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground">{c.top10}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {carvers.slice(0, 10).map((carver, index) => (
                    <div key={carver.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-accent font-bold text-lg">#{index + 1}</div>
                        <div>
                          <div className="font-semibold text-foreground">{carver.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {carver.region && `${carver.region}, `}{formatPeriod(carver.period_active_start, carver.period_active_end)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-accent">{carver.inscriptionCount}</div>
                        <div className="text-xs text-muted-foreground">{c.stones}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carvers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carvers.map((carver) => (
                <Card 
                  key={carver.id}
                  id={`carver-${carver.id}`}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    highlightedCarver?.id === carver.id ? 'ring-2 ring-accent' : ''
                  }`}
                  onMouseEnter={() => handleCardHover(carver.id)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => handleCardClick(carver)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-accent" />
                      {carver.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {c.badgeStones(carver.inscriptionCount)}
                      </Badge>
                      {carver.signedCount > 0 && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {c.badgeSigned(carver.signedCount)}
                        </Badge>
                      )}
                      {carver.uncertainCount > 0 && (
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {c.badgeUncertain(carver.uncertainCount)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {carver.description && (
                      <p className="text-sm text-muted-foreground italic">
                        "{carver.description}"
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {(carver.period_active_start || carver.period_active_end) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatPeriod(carver.period_active_start, carver.period_active_end)}</span>
                        </div>
                      )}
                      
                      {carver.region && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{carver.region}{carver.country && `, ${carver.country}`}</span>
                        </div>
                      )}
                    </div>

                    {/* Statistics breakdown */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent">{carver.signedCount}</div>
                        <div className="text-xs text-muted-foreground">{c.signed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent">{carver.attributedCount}</div>
                        <div className="text-xs text-muted-foreground">{c.attributed}</div>
                      </div>
                    </div>

                    {/* Certainty indicator */}
                    <div className="pt-2 border-t border-border">
                      {carver.certainCount === carver.inscriptionCount ? (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {c.allCertain}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {c.certaintyMix(carver.certainCount, carver.uncertainCount)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Carvers;