
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { DatabasePeriod } from '@/hooks/useGeneticData';
import { useLanguage } from "@/contexts/LanguageContext";

interface HistoricalPeriodsTabProps {
  filteredPeriods: DatabasePeriod[];
}

export const HistoricalPeriodsTab: React.FC<HistoricalPeriodsTabProps> = ({ filteredPeriods }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    geneticCharacteristics: 'Genetiska kännetecken:',
    noResults: 'Inga historiska perioder hittades som matchar sökkriterier.',
  } : {
    geneticCharacteristics: 'Genetic characteristics:',
    noResults: 'No historical periods found matching your search criteria.',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPeriods.map((period) => (
        <Card key={period.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {period.name}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {period.name_en} • {period.time_range}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {period.description && (
              <p className="text-slate-200 text-sm">
                {period.description}
              </p>
            )}

            {period.genetic_characteristics && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-slate-200 text-sm">
                  <strong>{c.geneticCharacteristics}</strong> {period.genetic_characteristics}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {filteredPeriods.length === 0 && (
        <div className="col-span-full text-center text-slate-300 py-8">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{c.noResults}</p>
        </div>
      )}
    </div>
  );
};
