
import React, { useState, Suspense, lazy } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/welcome/HeroSection';
import { ViewLauncherGrid } from '../components/welcome/ViewLauncherGrid';
import { GlobalSearch } from '../components/search/GlobalSearch';
import { PageMeta } from '../components/PageMeta';
import { useQuery } from '@tanstack/react-query';
import { loadDatabaseStats } from '@/hooks/useRunicData/statsLoader';
import { useWelcomeLocalizedText } from '@/hooks/useWelcomeLocalizedText';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy load components that are not immediately visible
const PodcastPromotion = lazy(() => import('../components/welcome/PodcastPromotion').then(module => ({ default: module.PodcastPromotion })));
const WelcomeFooter = lazy(() => import('../components/welcome/WelcomeFooter').then(module => ({ default: module.WelcomeFooter })));

const Welcome = () => {
  const [showIntroduction, setShowIntroduction] = useState(true);
  
  const { data: dbStats, isLoading: statsLoading } = useQuery({
    queryKey: ['database-stats-v2'],
    queryFn: loadDatabaseStats,
    staleTime: 5 * 60 * 1000,
  });

  const localizedText = useWelcomeLocalizedText();
  const { language } = useLanguage();

  const defaultStats = {
    totalInscriptions: 0,
    totalCoordinates: 0,
    totalCarvers: 0,
    totalArtefacts: 0,
    totalCities: 0,
    totalFortresses: 0,
    totalVikingNames: 0,
    totalHundreds: 0,
    totalParishes: 0,
    totalFolkGroups: 0,
    totalGeneticEvents: 0,
    totalRoyalChronicles: 0,
    totalRivers: 0,
  };

  const displayStats = dbStats || defaultStats;

  const handleSkipIntro = () => {
    setShowIntroduction(false);
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-white">
            <p>{language === 'sv' ? 'Laddar statistik…' : 'Loading statistics…'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Utforska det Nordiska Arvet"
        titleEn="Explore the Nordic Heritage"
        description="Upptäck tusentals runstenar, vikingatida platser och fornnordisk historia genom vår interaktiva karta och databas."
        descriptionEn="Discover thousands of runestones, Viking Age sites and Old Norse history through our interactive map and database."
        keywords="runstenar, vikingatid, runologi, skandinavisk historia, arkeologi, fornnordisk kultur"
      />
      <Header />
      
      <HeroSection
        dbStats={displayStats}
        localizedText={localizedText}
        onSkipIntro={handleSkipIntro}
      />

      {/* Stor Google-lik sökruta, direkt före korten */}
      <section className="container mx-auto px-4 pt-8">
        <GlobalSearch variant="hero" />
      </section>

      <ViewLauncherGrid dbStats={displayStats} />

      <Suspense fallback={<div className="h-16 animate-pulse bg-white/10 rounded-lg mx-4" />}>
        <WelcomeFooter />
      </Suspense>
    </div>
  );
};

export default Welcome;
