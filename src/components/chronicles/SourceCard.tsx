
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HistoricalSource } from '@/hooks/useRoyalChronicles';
import { useLanguage } from '@/contexts/LanguageContext';

interface SourceCardProps {
  source: HistoricalSource;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const T = sv
    ? { author: 'Författare', written: 'Skriven', covers: 'Täcker period', lang: 'Språk', bias: 'Identifierat bias' }
    : { author: 'Author', written: 'Written', covers: 'Covers period', lang: 'Language', bias: 'Identified bias' };
  const getReliabilityBadge = (reliability: string) => {
    const colors = {
      'primary': 'bg-green-600',
      'secondary': 'bg-blue-600',
      'tertiary': 'bg-orange-600',
      'legendary': 'bg-red-600'
    };

    const labels = sv ? {
      'primary': 'Primärkälla',
      'secondary': 'Sekundärkälla',
      'tertiary': 'Tertiärkälla',
      'legendary': 'Legendarisk'
    } : {
      'primary': 'Primary source',
      'secondary': 'Secondary source',
      'tertiary': 'Tertiary source',
      'legendary': 'Legendary'
    };
    
    return (
      <Badge className={`${colors[reliability as keyof typeof colors]} text-white`}>
        {labels[reliability as keyof typeof labels]}
      </Badge>
    );
  };

  const getBiasLabels = (biasTypes: string[]) => {
    const labels: Record<string, string> = sv ? {
      'christian_anti_pagan': 'Kristet anti-hedniskt bias',
      'nationalist_danish': 'Danskt nationellt bias',
      'nationalist_swedish': 'Svenskt nationellt bias',
      'temporal_distance': 'Tidsmässigt avstånd',
      'political_legitimacy': 'Politisk legitimitet',
      'none': 'Inget känt bias'
    } : {
      'christian_anti_pagan': 'Christian anti-pagan bias',
      'nationalist_danish': 'Danish nationalist bias',
      'nationalist_swedish': 'Swedish nationalist bias',
      'temporal_distance': 'Temporal distance',
      'political_legitimacy': 'Political legitimacy',
      'none': 'No known bias'
    };
    
    return biasTypes.map(bias => labels[bias] || bias);
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg">{source.title}</h3>
          {getReliabilityBadge(source.reliability)}
        </div>
        
        <div className="text-slate-300 text-sm space-y-1 mb-3">
          <div><strong>{T.author}:</strong> {source.author}</div>
          {source.written_year && (
            <div><strong>{T.written}:</strong> {source.written_year}</div>
          )}
          {source.covers_period_start && source.covers_period_end && (
            <div><strong>{T.covers}:</strong> {source.covers_period_start}–{source.covers_period_end}</div>
          )}
          <div><strong>{T.lang}:</strong> {source.language}</div>
        </div>
        
        {source.description && (
          <p className="text-slate-300 text-sm mb-3">
            {source.description}
          </p>
        )}
        
        {source.bias_types.length > 0 && (
          <div className="space-y-2">
            <div className="text-slate-400 text-sm font-medium">{T.bias}:</div>
            <div className="flex flex-wrap gap-1">
              {getBiasLabels(source.bias_types).map((bias, index) => (
                <Badge key={index} variant="outline" className="border-orange-500 text-orange-300 text-xs">
                  {bias}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
