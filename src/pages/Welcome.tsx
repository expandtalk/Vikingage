
import React, { useState, Suspense, lazy } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/welcome/HeroSection';
import { WelcomeNearMe } from '../components/welcome/WelcomeNearMe';
import { CategoryOverview } from '../components/welcome/CategoryOverview';
import { PageMeta } from '../components/PageMeta';
import { useQuery } from '@tanstack/react-query';
import { loadDatabaseStats } from '@/hooks/useRunicData/statsLoader';
import { useWelcomeLocalizedText } from '@/hooks/useWelcomeLocalizedText';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy load components that are not immediately visible
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

      {/* Mobil = fältverktyg: Near me som primär handling direkt på startsidan (dold på desktop). */}
      <WelcomeNearMe />

      <main id="main-content">
      <HeroSection
        dbStats={displayStats}
        localizedText={localizedText}
        onSkipIntro={handleSkipIntro}
      />

      {/* Korten stannar kvar under sökning — träfflistan lägger sig ovanpå som overlay
          (ingen mörkblå tomhet, footern förblir smal längst ned). */}
      <div>
        {/* Kvantifierad kategoriöversikt: plattformens bredd som 16 gyllene sifferkort med
            live-räkning per kategori. Detta är det ENDA kortrutnätet på startsidan — den
            tidigare sifferlösa ViewLauncherGrid är hopslagen hit så kategorierna inte
            dubbleras. Egen datahämtning — påverkar inte den delade dbStats/HeroStatsGrid. */}
        <CategoryOverview />

        {/* Podcasten näst sist — precis före footern */}

        <Suspense fallback={<div className="h-16 animate-pulse bg-white/10 rounded-lg mx-4" />}>
          <WelcomeFooter />
        </Suspense>
      </div>
      </main>
    </div>
  );
};

export default Welcome;
