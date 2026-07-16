
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
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <h3 className="text-white font-medium text-sm mb-2">{c.results}</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">{c.found}</span>
          <span className="text-white font-semibold">{inscriptionsCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">{c.total}</span>
          <span className="text-slate-400 text-sm">{totalInscriptions}</span>
        </div>
        {totalCoordinates && totalCoordinates >= 30 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">{c.coordinates}</span>
            <span className="text-green-400 text-sm">{totalCoordinates}</span>
          </div>
        )}
        {isVikingMode && (
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">{c.period}</span>
            <span className="text-amber-300 text-sm capitalize">{selectedTimePeriod.replace('_', ' ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
