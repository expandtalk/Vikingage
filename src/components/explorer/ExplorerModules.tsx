import React from 'react';
import { SearchModule } from '../modules/SearchModule';
import { TimelineModule } from '../modules/TimelineModule';

interface ExplorerModulesProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  totalInscriptions: number;
  isExplorerMode: boolean;
  onGodNameSearchWithLegend: (godName: string) => void;
  onLegendToggle: (id: string) => void;
  isSearchMinimized: boolean;
  setIsSearchMinimized: (minimized: boolean) => void;
  shouldShowTimeline: boolean;
  mapNavigate: ((lat: number, lng: number, zoom: number) => void) | null;
  isTimelineMinimized: boolean;
  setIsTimelineMinimized: (minimized: boolean) => void;
}

export const ExplorerModules: React.FC<ExplorerModulesProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isLoading,
  totalInscriptions,
  isExplorerMode,
  onGodNameSearchWithLegend,
  onLegendToggle,
  isSearchMinimized,
  setIsSearchMinimized,
  shouldShowTimeline,
  mapNavigate,
  isTimelineMinimized,
  setIsTimelineMinimized
}) => {
  return (
    <>
      {/* Compact Search Module */}
      <SearchModule
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isLoading={isLoading}
        totalInscriptions={totalInscriptions}
        isVikingMode={false}
        showGodNameSearch={isExplorerMode}
        onGodNameSearch={onGodNameSearchWithLegend}
        onLegendToggle={onLegendToggle}
        isMinimized={isSearchMinimized}
        onToggleMinimized={() => setIsSearchMinimized(!isSearchMinimized)}
      />

      {/* Tidslinjen renderas (wired) i ExplorerLayout under kartan — INTE här.
          Denna hade selectedPeriod="all" + onPeriodChange={()=>{}} (no-op), var en
          dubblett och gjorde att periodval inte påverkade kartan. Borttagen. */}
    </>
  );
});

ExplorerModules.displayName = 'ExplorerModules';
