
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, Book, Sparkles } from 'lucide-react';
import { CenturyKingsFlow } from '../CenturyKingsFlow';
import { SourceCard } from '../SourceCard';
import { DynastyCard } from '../DynastyCard';
import { KingDetailPanel } from '../KingDetailPanel';
import { SagaKingsView } from '../SagaKingsView';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HistoricalKing, HistoricalSource, RoyalDynasty, KingSourceMention } from '@/hooks/useRoyalChronicles';

interface TabsViewProps {
  regularKings: HistoricalKing[];
  legendaryKings: HistoricalKing[];
  sources?: HistoricalSource[];
  dynasties?: RoyalDynasty[];
  sourceMentions?: KingSourceMention[];
  selectedKing: string | null;
  selectedRegion: string;
  selectedRulerType: string;
  selectedGender: string;
  getRulerTypeLabel: () => string;
  onKingSelect: (kingId: string) => void;
}

export const TabsView: React.FC<TabsViewProps> = ({
  regularKings,
  legendaryKings,
  sources,
  dynasties,
  sourceMentions,
  selectedKing,
  selectedRegion,
  selectedRulerType,
  selectedGender,
  getRulerTypeLabel,
  onKingSelect,
}) => {
  const { language } = useLanguage();
  const selectedKingObj = selectedKing
    ? [...(regularKings ?? []), ...(legendaryKings ?? [])].find((k) => k.id === selectedKing)
    : undefined;

  const getNoResultsMessage = () => {
    const genderText = selectedGender === 'female' ? (language === 'en' ? 'queens' : 'drottningar') :
                      selectedGender === 'male' ? (language === 'en' ? 'kings' : 'kungar') :
                      (language === 'en' ? 'rulers' : 'härskare');
    
    const rulerTypeText = selectedRulerType === 'kings' ? (language === 'en' ? 'kings' : 'kungar') :
                          selectedRulerType === 'jarls' ? (language === 'en' ? 'jarls' : 'jarlar') :
                          genderText;

    const typeToShow = selectedGender !== 'all' ? genderText : rulerTypeText;

    if (selectedRegion === 'all') {
      return language === 'en' ? `No ${typeToShow} found` : `Inga ${typeToShow} hittades`;
    } else {
      return language === 'en' ? `No ${typeToShow} found for ${selectedRegion}` : `Inga ${typeToShow} hittades för ${selectedRegion}`;
    }
  };

  return (
    <Tabs defaultValue="kings" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 bg-slate-800/60">
        <TabsTrigger value="kings">
          {getRulerTypeLabel()}
        </TabsTrigger>
        <TabsTrigger value="saga-kings">
          {language === 'en' ? `Saga Kings (${legendaryKings?.length || 0})` : `Sagokungar (${legendaryKings?.length || 0})`}
        </TabsTrigger>
        <TabsTrigger value="sources">
          {language === 'en' ? `Sources (${sources?.length || 0})` : `Källor (${sources?.length || 0})`}
        </TabsTrigger>
        <TabsTrigger value="dynasties">
          {language === 'en' ? `Dynasties (${dynasties?.length || 0})` : `Dynastier (${dynasties?.length || 0})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="kings" className="space-y-4">
        {regularKings && regularKings.length > 0 ? (
          <CenturyKingsFlow kings={regularKings} onKingSelect={onKingSelect} />
        ) : (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {getNoResultsMessage()}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              {language === 'en' ? 'Try changing filters or select "All regions"' : 'Prova att ändra filter eller välja "Alla regioner"'}
            </p>
          </div>
        )}
        
        {selectedKingObj && (
          <KingDetailPanel king={selectedKingObj} sourceMentions={sourceMentions} />
        )}
      </TabsContent>

      <TabsContent value="saga-kings" className="space-y-4">
        <SagaKingsView 
          sagaKings={legendaryKings}
          onKingSelect={(kingId) => onKingSelect(kingId)}
          selectedKing={selectedKing}
          sourceMentions={sourceMentions}
        />
      </TabsContent>

      <TabsContent value="sources" className="space-y-4">
        {sources && sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Book className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {language === 'en' ? 'No historical sources found' : 'Inga historiska källor hittades'}
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="dynasties" className="space-y-4">
        {dynasties && dynasties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynasties.map((dynasty) => (
              <DynastyCard key={dynasty.id} dynasty={dynasty} onMemberSelect={onKingSelect} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {language === 'en' ? 'No dynasties found' : 'Inga dynastier hittades'}
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
