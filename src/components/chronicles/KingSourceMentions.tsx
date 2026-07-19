
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KingSourceMention } from '@/hooks/useRoyalChronicles';
import { useLanguage } from '@/contexts/LanguageContext';

interface KingSourceMentionsProps {
  sourceMentions: KingSourceMention[];
}

export const KingSourceMentions: React.FC<KingSourceMentionsProps> = ({ sourceMentions }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const T = sv
    ? { sources: 'Källor för denna kung', mentionedAs: 'Nämns som', context: 'Sammanhang', critique: 'Källkritik' }
    : { sources: 'Sources for this king', mentionedAs: 'Mentioned as', context: 'Context', critique: 'Source criticism' };
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
    <Card className="bg-slate-900/60 backdrop-blur-md border-slate-600/30">
      <CardHeader>
        <CardTitle className="text-white">{T.sources}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sourceMentions.map((mention) => (
            <div key={mention.id} className="bg-slate-800/40 p-3 rounded">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{mention.source?.title}</h4>
                {mention.source && getReliabilityBadge(mention.source.reliability)}
              </div>
              <p className="text-slate-300 text-sm mb-2">
                <strong>{T.mentionedAs}:</strong> {mention.mentioned_name}
              </p>
              {mention.context && (
                <p className="text-slate-400 text-sm mb-2">
                  <strong>{T.context}:</strong> {mention.context}
                </p>
              )}
              {mention.reliability_note && (
                <p className="text-slate-500 text-xs mb-2">
                  <strong>{T.critique}:</strong> {mention.reliability_note}
                </p>
              )}
              {mention.source && mention.source.bias_types.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getBiasLabels(mention.source.bias_types).map((bias, index) => (
                    <Badge key={index} variant="outline" className="border-orange-500 text-orange-300 text-xs">
                      {bias}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
