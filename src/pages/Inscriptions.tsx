import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { RunicExplorerSimple } from '../components/RunicExplorerSimple';
import { NamedStonesSection } from '../components/inscriptions/NamedStonesSection';
import { useLanguage } from '@/contexts/LanguageContext';

const Inscriptions = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Runinskrifter"
        titleEn="Runic Inscriptions"
        description="Utforska tusentals runinskrifter från vikingatiden. Sök, filtrera och analysera runstenar med interaktiva kartor."
        descriptionEn="Explore thousands of runic inscriptions from the Viking Age. Search, filter and analyze runestones with interactive maps."
        keywords="runinskrifter, runstenar, vikingatid, runologi, skandinavisk historia"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-3xl">ᚱ</span>
            <span>{language === 'sv' ? 'Runinskrifter' : 'Runic Inscriptions'}</span>
          </h1>
          <p className="text-slate-300 text-lg">
            {language === 'sv' 
              ? 'Utforska och analysera runinskrifter från vikingatiden med avancerade sök- och filterverktyg.'
              : 'Explore and analyze runic inscriptions from the Viking Age with advanced search and filter tools.'}
          </p>
        </div>
        {/* Nivå 1: namngivna stenar som ingång (landskaps-grupperade) */}
        <NamedStonesSection />

        {/* Nivå 2: hela materialet med sök/filter */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {language === 'sv' ? 'Alla inskrifter' : 'All inscriptions'}
        </h2>
        <RunicExplorerSimple />
      </main>
      <Footer />
    </div>
  );
};

export default Inscriptions;

