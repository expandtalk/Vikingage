
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
      className={`relative transition-[min-height] duration-300 ${
        searching ? 'min-h-[42vh]' : 'overflow-hidden min-h-[calc(70vh-50px)] lg:min-h-[calc(80vh-50px)]'
      }`}
    >
      <div className="absolute inset-0">
        {/* LCP-bild: WebP (mobil 800px ~137 KB, desktop 1400px) med jpg-fallback; fetchPriority högt
            + eager så webbläsaren prioriterar den framför sid-datan. Mörkas av overlayn nedan. */}
        <picture className="block h-full w-full">
          <source
            type="image/webp"
            srcSet="/excursion-photos/karlevistenen/karlevistenen-oland-800.webp 800w, /excursion-photos/karlevistenen/karlevistenen-oland-1400.webp 1400w"
            sizes="100vw"
          />
          <img
            src="/excursion-photos/karlevistenen/karlevistenen-oland.jpg"
            alt="Runsten med rödmålade runor i öländskt landskap"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 58%' }}
            fetchPriority="high"
            decoding="async"
            width={1500}
            height={2000}
          />
        </picture>
        {/* Tema-medveten scrim: mörk i mörkt läge; ljus i white mode så den (då mörka) texten läses. */}
        <div className="absolute inset-0 hero-scrim"></div>
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
