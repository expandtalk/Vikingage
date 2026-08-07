
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

interface StatsSectionProps {
  inscriptionsCount: number;
  totalInscriptions: number;
  totalCoordinates?: number;
  isVikingMode: boolean;
  selectedTimePeriod: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  inscriptionsCount,
  totalInscriptions,
  totalCoordinates,
  isVikingMode,
  selectedTimePeriod
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv
    ? { results: 'Resultat', found: 'Hittade platser:', total: 'Totalt i databas:', coordinates: 'Koordinater:', period: 'Tidsperiod:' }
    : { results: 'Results', found: 'Places found:', total: 'Total in database:', coordinates: 'Coordinates:', period: 'Time period:' };
  // Diskret rad (Daniel: "behöver inte se så prominent ut") — inte längre ett prominent kort.
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
      <span><span className="font-medium text-slate-200">{inscriptionsCount}</span> {sv ? 'platser' : 'places'}</span>
      <span className="text-slate-600">·</span>
      <span>{totalInscriptions} {sv ? 'totalt' : 'total'}</span>
      {totalCoordinates && totalCoordinates >= 30 && (
        <>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400/80">{totalCoordinates} {sv ? 'koordinater' : 'coordinates'}</span>
        </>
      )}
      {isVikingMode && (
        <>
          <span className="text-slate-600">·</span>
          <span className="capitalize text-amber-300/80">{selectedTimePeriod.replace('_', ' ')}</span>
        </>
      )}
    </div>
  );
};
