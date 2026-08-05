
import React, { useState } from 'react';
import { InteractiveMap } from "../InteractiveMap";
import { FloatingPanels } from "../overlay/FloatingPanels";
import { MapLegend } from "../MapLegend";
import { DraggablePanel } from "../panels/DraggablePanel";
import { usePanelManager } from "@/hooks/usePanelManager";
import { MapAndResultsSectionProps } from '@/types/map';
import { MapNavigationFunction } from '@/types/common';

export const MapAndResultsSection: React.FC<MapAndResultsSectionProps> = ({
  mapInscriptions,
  currentInscriptions,
  allInscriptions,
  enabledLegendItems,
  selectedTimePeriod,
  legendItems,
  expandedCards,
  currentPage,
  totalPages,
  itemsPerPage,
  isLoading,
  hasActiveSearch,
  totalInscriptions,
  showFilters,
  selectedLandscape,
  selectedCountry,
  selectedPeriod,
  selectedStatus,
  selectedObjectType,
  onMarkerClick,
  onMapNavigate,
  onLegendToggle,
  onToggleExpanded,
  onResultClick,
  onPageChange,
  onClearFilters,
  onToggleFilters,
  onLandscapeChange,
  onCountryChange,
  onPeriodChange,
  onStatusChange,
  onObjectTypeChange,
  activeFiltersCount
}) => {
  const [mapNavFunction, setMapNavFunction] = useState<MapNavigationFunction | null>(null);
  const [showLegend, setShowLegend] = useState(true); // ✅ Default to true so legend is visible
  const { panels, togglePanelMinimized, setPanelPosition, setPanelSize } = usePanelManager();

  const legendPanel = panels.legend;

  const handleToggleLegend = () => {
    setShowLegend(!showLegend);
  };

  return (
    <div className="w-screen relative left-1/2 -ml-[50vw]">
      {/* Full-bleed: kartan bryts ut ur container/max-w-7xl till full skärmbredd (margin-teknik,
          ej transform → Near me:s fixed-drag opåverkat). Resten av sidan förblir centrerad. */}
      <div className="relative w-full">
        <InteractiveMap 
          inscriptions={allInscriptions}
          enabledLegendItems={enabledLegendItems}
          selectedPeriod={selectedTimePeriod}
          selectedTimePeriod={selectedTimePeriod}
          onMarkerClick={onMarkerClick}
          onMapNavigate={setMapNavFunction}
          className="h-[100dvh] md:h-[75vh] w-full"
        />

        {/* Floating Panels - Filters and Legend */}
        <FloatingPanels
          showFilters={showFilters}
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
          onClearFilters={onClearFilters}
          activeFiltersCount={activeFiltersCount}
          showLegend={showLegend}
          onToggleLegend={handleToggleLegend}
          isVikingMode={selectedTimePeriod === 'viking_age'}
          legendItems={legendItems}
          onLegendToggle={onLegendToggle}
        />
      </div>
    </div>
  );
};
