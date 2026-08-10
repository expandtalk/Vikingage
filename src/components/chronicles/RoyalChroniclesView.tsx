
import React from 'react';
import { useHistoricalKings, useHistoricalSources, useRoyalDynasties, useKingSourceMentions } from '@/hooks/chronicles';
import { useRoyalChroniclesState } from './hooks/useRoyalChroniclesState';
import { useRoyalChroniclesLogic } from './hooks/useRoyalChroniclesLogic';
import { LoadingView } from './components/LoadingView';
import { TableModeView } from './components/TableModeView';
import { MainHeader } from './components/MainHeader';
import { TabsView } from './components/TabsView';
import { AdminPanel } from './admin/AdminPanel';
import { useIsAdmin } from '@/hooks/useAuth';
import { BirkaKungarnaSection } from './BirkaKungarnaSection';
import { FingerprintDialog } from '../forensics/FingerprintDialog';
import { useLanguage } from '@/contexts/LanguageContext';

export const RoyalChroniclesView: React.FC = () => {
  const { isAdmin } = useIsAdmin();
  const { language } = useLanguage();
  const sv = language !== 'en';
  const {
    selectedRegion,
    setSelectedRegion,
    selectedRulerType,
    setSelectedRulerType,
    selectedGender,
    setSelectedGender,
    selectedKing,
    setSelectedKing,
    viewMode,
    setViewMode,
  } = useRoyalChroniclesState();
  
  const { data: kings, isLoading: kingsLoading, error: kingsError } = useHistoricalKings(selectedRegion, selectedRulerType, selectedGender);
  const { data: sources, isLoading: sourcesLoading } = useHistoricalSources();
  const { data: dynasties, isLoading: dynastiesLoading } = useRoyalDynasties();
  const { data: sourceMentions } = useKingSourceMentions(selectedKing || undefined);

  const { regularKings, legendaryKings, getRulerTypeLabel } = useRoyalChroniclesLogic(kings, selectedRulerType, selectedGender);

  const handleKingSelect = (kingId: string) => {
    setSelectedKing(selectedKing === kingId ? null : kingId);
  };

  if (kingsLoading || sourcesLoading || dynastiesLoading) {
    return <LoadingView />;
  }

  if (kingsError) {
    console.error('Error loading kings:', kingsError);
  }

  // If card view is selected, show the main view
  if (viewMode === 'cards') {

    return (
      <div className="space-y-6 p-6">
        <MainHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedRegion={selectedRegion}
          selectedRulerType={selectedRulerType}
          selectedGender={selectedGender}
          onRegionChange={setSelectedRegion}
          onRulerTypeChange={setSelectedRulerType}
          onGenderChange={setSelectedGender}
          kings={regularKings}
          sources={sources}
          dynasties={dynasties}
        />

        {isAdmin && (
          <AdminPanel selectedRegion={selectedRegion} />
        )}

        <TabsView
          regularKings={regularKings}
          legendaryKings={legendaryKings}
          sources={sources}
          dynasties={dynasties}
          sourceMentions={sourceMentions}
          selectedKing={selectedKing}
          selectedRegion={selectedRegion}
          selectedRulerType={selectedRulerType}
          selectedGender={selectedGender}
          getRulerTypeLabel={getRulerTypeLabel}
          onKingSelect={handleKingSelect}
          birkaSlot={<BirkaKungarnaSection />}
          overviewSlot={(
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground space-y-2">
                <p>
                  {sv
                    ? 'Kungliga krönikor samlar Skandinaviens och Östeuropas härskare — kronologiska kungar, sagokungar, dynastier och de skriftliga källorna bakom dem. Använd flikarna ovan för att gå mellan dem.'
                    : 'Royal Chronicles gathers the rulers of Scandinavia and Eastern Europe — chronological kings, saga kings, dynasties and the written sources behind them. Use the tabs above to move between them.'}
                </p>
                <p className="text-xs opacity-80">
                  {sv
                    ? 'Källkritiskt: uppgifterna vilar på angivna källor (se fliken Källor). Attribueringar och dateringar av enskilda härskare är ofta osäkra — markerat där så är fallet.'
                    : 'Source-critical: entries rest on the cited sources (see the Sources tab). Attributions and dates for individual rulers are often uncertain — flagged where so.'}
                </p>
              </div>
              {/* Grav-fingerprint: identifiera en kunglig grav via plats/längd/gravutformning/symboler. */}
              <div>
                <FingerprintDialog kind="grave" />
                <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                  {sv
                    ? 'Beskriv en grav (kyrka/plats, kroppslängd, gravutformning, symboler som ring/heraldik) → forensiskt förslag på trolig identitet och status. Forskningsstöd — identifiering utan jämförande DNA är sällan säker.'
                    : 'Describe a grave (church/place, body length, grave form, symbols such as ring/heraldry) → a forensic suggestion of likely identity and status. A research aid — identification without comparative DNA is rarely certain.'}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  // Default to table view
  return (
    <div className="space-y-6 p-6">
      {isAdmin && (
        <AdminPanel selectedRegion={selectedRegion} />
      )}
      <TableModeView viewMode={viewMode} onViewModeChange={setViewMode} />
    </div>
  );
};
