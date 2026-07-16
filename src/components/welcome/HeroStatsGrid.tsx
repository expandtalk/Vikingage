import React from 'react';
import { useNavigate } from "react-router-dom";
import type { DbStats } from '@/hooks/useRunicData/types';
import type { FocusType } from '@/hooks/useFocusManager';
import { NORSE_GODS_EXPANDED } from '@/utils/godNameUtils';

// Number of Norse deities covered by the god name-matching dataset.
const GOD_COUNT = Object.keys(NORSE_GODS_EXPANDED).length;

interface HeroStatsGridProps {
  dbStats: DbStats;
  localizedText: {
    runicInscriptions: string;
    coordinates: string;
    carvers: string;
    artefacts: string;
    vikingFortresses: string;
    vikingCities: string;
    riverLocations: string;
    godNames: string;
    vikingNames: string;
    hundreds: string;
    parishes: string;
    folkGroups: string;
    geneticEvents: string;
    prices: string;
    language: string;
  };
}

interface StatItem {
  label: string;
  value: React.ReactNode;
  onClick: () => void;
}

/** Accessible, keyboard-focusable stat card (renders a real <button>). */
const StatCard: React.FC<StatItem> = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${label}: ${value}`}
    className="text-left bg-white/10 backdrop-blur-md border border-white/20 rounded-lg cursor-pointer hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
  >
    <div className="p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </button>
);

export const HeroStatsGrid: React.FC<HeroStatsGridProps> = ({
  dbStats,
  localizedText
}) => {
  const navigate = useNavigate();
  const numberLocale = localizedText.language === 'en' ? 'en-US' : 'sv-SE';
  const fmt = (n: number) => n.toLocaleString(numberLocale);

  const goFocus = (focus: FocusType) => () =>
    navigate(focus ? `/explore?focus=${focus}` : '/explore');
  const goTo = (path: string) => () => navigate(path);

  const items: StatItem[] = [
    { label: localizedText.runicInscriptions, value: fmt(dbStats.totalInscriptions), onClick: goFocus('inscriptions') },
    { label: localizedText.carvers, value: fmt(dbStats.totalCarvers || 0), onClick: goTo('/carvers') },
    { label: localizedText.artefacts, value: fmt(dbStats.totalArtefacts || 0), onClick: goTo('/artefacts') },
    { label: localizedText.vikingNames, value: fmt(dbStats.totalVikingNames || 0), onClick: goFocus('names') },
    { label: localizedText.hundreds, value: fmt(dbStats.totalHundreds || 0), onClick: goFocus('hundreds') },
    { label: localizedText.parishes, value: fmt(dbStats.totalParishes || 0), onClick: goFocus('parishes') },
    { label: localizedText.folkGroups, value: fmt(dbStats.totalFolkGroups || 0), onClick: goFocus('folkGroups') },
    { label: localizedText.riverLocations, value: fmt(dbStats.totalRivers || 0), onClick: goFocus('rivers') },
    { label: localizedText.godNames, value: GOD_COUNT, onClick: goFocus('gods') },
    { label: localizedText.geneticEvents, value: fmt(dbStats.totalGeneticEvents || 0), onClick: goFocus('geneticEvents') },
    { label: localizedText.language === 'en' ? 'Nordic Kings' : 'Nordiska kungar', value: fmt(dbStats.totalRoyalChronicles || 0), onClick: goTo('/royal-chronicles') },
    { label: localizedText.language === 'en' ? 'Fortresses' : 'Fornborgar', value: fmt(dbStats.totalFortresses || 0), onClick: goTo('/fortresses') },
    // Diocletian's Price Edict — a descriptive year label, not a DB count.
    { label: localizedText.prices, value: '301 e.Kr.', onClick: goTo('/prices') },
  ];

  if (dbStats.totalCities && dbStats.totalCities >= 30) {
    items.push({ label: localizedText.vikingCities, value: fmt(dbStats.totalCities), onClick: goTo('/fortresses') });
  }

  return (
    <div className="mb-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
};
