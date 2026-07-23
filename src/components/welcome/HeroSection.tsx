
import React from 'react';
import type { DbStats } from '@/hooks/useRunicData/types';
import { GlobalSearch } from '../search/GlobalSearch';

interface HeroSectionProps {
  dbStats: DbStats;
  localizedText: {
    heroTitle: string;
    heroDescription: string;
    skipIntro: string;
    runicInscriptions: string;
    coordinates: string;
    carvers: string;
    artefacts: string;
    vikingFortresses: string;
    vikingCities: string;
    riverLocations: string;
    godNames: string;
    hundreds: string;
    parishes: string;
    vikingNames: string;
    folkGroups: string;
    geneticEvents: string;
    prices: string;
    language: string;
  };
  onSkipIntro: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  dbStats,
  localizedText,
  onSkipIntro
}) => {
  return (
    <section className="relative overflow-hidden min-h-[calc(70vh-50px)] lg:min-h-[calc(80vh-50px)]">
      <div className="absolute inset-0">
        <img 
          src="/images/viking-hero.png"
          alt="Three Viking warriors with traditional armor, helmets and shields"
          className="w-full h-full object-cover object-center"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-24 lg:py-32 text-center min-h-[calc(70vh-50px)] lg:min-h-[calc(80vh-50px)] flex flex-col justify-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg font-norse">
          {localizedText.heroTitle}
        </h1>
        <p className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
          {localizedText.heroDescription}
        </p>

        {/* Google-lik sökruta direkt efter beskrivningen */}
        <GlobalSearch variant="hero" />
      </div>
    </section>
  );
};
