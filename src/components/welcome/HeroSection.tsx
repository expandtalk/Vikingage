
import React, { useState } from 'react';
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
  // Signaleras uppåt (Welcome) så kort-sektionen under kan kollapsa och ge sökträffarna hela skärmen.
  onSearchingChange?: (v: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  dbStats,
  localizedText,
  onSkipIntro,
  onSearchingChange
}) => {
  const [searching, setSearching] = useState(false);
  const handleActive = (v: boolean) => { setSearching(v); onSearchingChange?.(v); };
  return (
    <section
      className={`relative overflow-hidden transition-[min-height] duration-300 ${
        searching ? 'min-h-[42vh]' : 'min-h-[calc(70vh-50px)] lg:min-h-[calc(80vh-50px)]'
      }`}
    >
      <div className="absolute inset-0">
        <img
          src="/excursion-photos/karlevistenen/karlevistenen-oland.jpg"
          alt="Runsten med rödmålade runor i öländskt landskap"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 58%' }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div
        className={`relative container mx-auto px-4 text-center flex flex-col ${
          searching
            ? 'justify-start pt-10 pb-4 min-h-[42vh]'
            : 'justify-center py-16 lg:py-24 min-h-[calc(70vh-50px)] lg:min-h-[calc(80vh-50px)]'
        }`}
      >
        {!searching && (
          <>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg font-norse">
              {localizedText.heroTitle}
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              {localizedText.heroDescription}
            </p>
          </>
        )}

        {/* Google-lik sökruta — vid sökning kollapsar intro-texten och rutan får hela ytan. */}
        <GlobalSearch variant="hero" onActiveChange={handleActive} />
      </div>
    </section>
  );
};
