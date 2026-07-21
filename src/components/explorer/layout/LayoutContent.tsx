import React from 'react';
import { InteractiveMap } from '../../InteractiveMap';
import { SearchResultsPanel } from '../../search/SearchResultsPanel';
import { MapLegend } from '../../MapLegend';
import { FloatingPanels } from '../../overlay/FloatingPanels';

interface LayoutContentProps {
  shouldShowMap: boolean;
  mapInscriptions: any[];
  currentInscriptions: any[];
  allInscriptions: any[];
  enabledLegendItems: { [key: string]: boolean };
  legendItems: any[];
  expandedCards: Set<string>;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  isLoading: boolean;
  hasActiveSearch: boolean;
  totalInscriptions: number;
  showFiltersPanel: boolean;
  showLegend?: boolean;
  onToggleLegend?: () => void;
  selectedLandscape: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedStatus: string;
  selectedObjectType: string;
  activeFiltersCount: number;
  searchQuery: string;
  showSearchResults: boolean;
  isSearchResultsMinimized: boolean;
  onMarkerClick: (inscription: any) => void;
  onMapNavigate: (navFunction: (lat: number, lng: number, zoom: number) => void) => void;
  onLegendToggle: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onResultClick: (inscription: any) => void;
  onPageChange: (page: number) => void;
  handleClearFilters: () => void;
  onToggleFilters: () => void;
  onLandscapeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onObjectTypeChange: (value: string) => void;
  handleToggleSearchResults: () => void;
  selectedTimePeriod?: string;
  onInscriptionUpdate?: (updatedInscription: any) => void;
}

export const LayoutContent: React.FC<LayoutContentProps> = ({
  shouldShowMap,
  mapInscriptions,
  currentInscriptions,
  allInscriptions,
  enabledLegendItems,
  legendItems,
  expandedCards,
  currentPage,
  totalPages,
  itemsPerPage,
  isLoading,
  hasActiveSearch,
  totalInscriptions,
  showFiltersPanel,
  showLegend: showLegendProp,
  onToggleLegend: onToggleLegendProp,
  selectedLandscape,
  selectedCountry,
  selectedPeriod,
  selectedStatus,
  selectedObjectType,
  activeFiltersCount,
  searchQuery,
  showSearchResults,
  isSearchResultsMinimized,
  onMarkerClick,
  onMapNavigate,
  onLegendToggle,
  onToggleExpanded,
  onResultClick,
  onPageChange,
  handleClearFilters,
  onToggleFilters,
  onLandscapeChange,
  onCountryChange,
  onPeriodChange,
  onStatusChange,
  onObjectTypeChange,
  handleToggleSearchResults,
  selectedTimePeriod = 'all',
  onInscriptionUpdate
}) => {
  const [legendMinimized, setLegendMinimized] = React.useState(false);
  const [legendPosition, setLegendPosition] = React.useState({ x: 880, y: 60 });
  const [legendSize, setLegendSize] = React.useState({ width: 340, height: 520 });
  // Använd props för legend state, med fallback till lokal state
  const showLegend = showLegendProp ?? false;
  const handleToggleLegend = onToggleLegendProp ?? (() => {});

  return (
    <div className="flex gap-6 relative">
      {/* Map Section - Flexible width */}
      {shouldShowMap && (
        <div className="flex-1 relative">
          <InteractiveMap
            inscriptions={mapInscriptions}
            onMarkerClick={onMarkerClick}
            className="w-full h-[600px]"
            isVikingMode={false}
            enabledLegendItems={enabledLegendItems}
            selectedPeriod="all"
            selectedTimePeriod={selectedTimePeriod}
            onMapNavigate={onMapNavigate}
            legendItems={legendItems}
            onLegendToggle={onLegendToggle}
          />
        </div>
      )}


      {/* Filter Overlay - positioned absolutely */}
      <FloatingPanels
        showFilters={showFiltersPanel}
        onToggleFilters={onToggleFilters}
        selectedLandscape={selectedLandscape}
        selectedCountry={selectedCountry}
        selectedPeriod={selectedPeriod}
        selectedStatus={selectedStatus}
        selectedObjectType={selectedObjectType}
        onLandscapeChange={onLandscapeChange}
        onCountryChange={onCountryChange}
        onPeriodChange={onPeriodChange}
        onStatusChange={onStatusChange}
        onObjectTypeChange={onObjectTypeChange}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
        // Legend props
        showLegend={showLegend}
        onToggleLegend={handleToggleLegend}
        isVikingMode={false}
        legendItems={legendItems}
        onLegendToggle={onLegendToggle}
        // Draggable legend state
        legendMinimized={legendMinimized}
        legendPosition={legendPosition}
        legendSize={legendSize}
        onLegendMinimize={() => setLegendMinimized((v) => !v)}
        onLegendPositionChange={setLegendPosition}
        onLegendSizeChange={setLegendSize}
      />

      {/* Search Results Section - Takes remaining space - FIXAD z-index för att inte täckas av legend */}
      {showSearchResults && (
        <div className="w-80 relative z-50">
          <SearchResultsPanel
            currentInscriptions={currentInscriptions}
            allInscriptions={allInscriptions}
            expandedCards={expandedCards}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            hasActiveSearch={hasActiveSearch}
            totalInscriptions={totalInscriptions}
            onToggleExpanded={onToggleExpanded}
            onResultClick={onResultClick}
            onPageChange={onPageChange}
            searchQuery={searchQuery}
            isMinimized={isSearchResultsMinimized}
            onToggleMinimized={handleToggleSearchResults}
            onClearFilters={handleClearFilters}
            onInscriptionUpdate={onInscriptionUpdate}
          />
        </div>
      )}
    </div>
  );
};