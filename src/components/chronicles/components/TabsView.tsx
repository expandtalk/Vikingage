
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, Book, Sparkles, Landmark, ScrollText } from 'lucide-react';
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
  // Toppnivå-flikar utöver kungar/källor/dynastier: Birka-kungarna (kurerad sektion) och
  // Kungakrönikor (ingång/översikt + grav-fingerprint). Skickas som slots så TabsView förblir
  // presentationell (Daniel: ett enda strukturerat fliksystem, inget innehåll borttaget).
  birkaSlot?: React.ReactNode;
  overviewSlot?: React.ReactNode;
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
  birkaSlot,
  overviewSlot,
}) => {
  const { language } = useLanguage();
  const en = language === 'en';
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
    <Tabs defaultValue={birkaSlot ? 'birka' : 'kings'} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto bg-slate-800/60">
        {birkaSlot && (
          <TabsTrigger value="birka" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
            <Landmark className="h-4 w-4" /> {en ? 'Birka kings' : 'Birka-kungarna'}
          </TabsTrigger>
        )}
        {overviewSlot && (
          <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
            <ScrollText className="h-4 w-4" /> {en ? 'Chronicles' : 'Kungakrönikor'}
          </TabsTrigger>
        )}
        <TabsTrigger value="kings" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
          <Crown className="h-4 w-4" /> {getRulerTypeLabel()}
        </TabsTrigger>
        <TabsTrigger value="saga-kings" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
          <Sparkles className="h-4 w-4" /> {en ? `Saga kings (${legendaryKings?.length || 0})` : `Sagokungar (${legendaryKings?.length || 0})`}
        </TabsTrigger>
        <TabsTrigger value="dynasties" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
          <Users className="h-4 w-4" /> {en ? `Dynasties (${dynasties?.length || 0})` : `Dynastier (${dynasties?.length || 0})`}
        </TabsTrigger>
        <TabsTrigger value="sources" className="flex-col sm:flex-row gap-1 py-2 text-xs sm:text-sm">
          <Book className="h-4 w-4" /> {en ? `Sources (${sources?.length || 0})` : `Källor (${sources?.length || 0})`}
        </TabsTrigger>
      </TabsList>

      {birkaSlot && (
        <TabsContent value="birka" className="space-y-4">
          {birkaSlot}
        </TabsContent>
      )}

      {overviewSlot && (
        <TabsContent value="overview" className="space-y-4">
          {overviewSlot}
        </TabsContent>
      )}

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
