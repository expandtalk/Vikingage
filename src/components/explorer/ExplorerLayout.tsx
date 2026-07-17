
import React, { useState } from 'react';
import { StatsSection } from './StatsSection';
import { FiltersStatusSection } from './FiltersStatusSection';
import { ExplorerPanels } from './ExplorerPanels';
import { TimelineModule } from '../modules/TimelineModule';
import { GodCardsGrid } from '../gods/GodCardsGrid';
import { usePanelManager } from '@/hooks/usePanelManager';
import { useFocusManager } from '@/hooks/useFocusManager';
import { LayoutHeader } from './layout/LayoutHeader';
import { LayoutContent } from './layout/LayoutContent';
import { HundredsView } from '../hundreds/HundredsView';
import { ParishesView } from '../parishes/ParishesView';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Filter, Map, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExplorerLayoutProps {
  // Layout state
  shouldShowControls: boolean;
  shouldShowMap: boolean;
  shouldShowFilters: boolean;
  shouldShowTimeline: boolean;
  
  // Controls props
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  totalInscriptions: number;
  
  // Stats props
  inscriptionsCount: number;
  activeFiltersCount: number;
  handleClearFilters: () => void;
  selectedLandscape: string;
  selectedCountry: string;
  selectedPeriod: string;
  
  // Map and results props
  mapInscriptions: any[];
  currentInscriptions: any[];
  allInscriptions: any[];
  enabledLegendItems: { [key: string]: boolean };
  legendItems: any[];
  expandedCards: Set<string>;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasActiveSearch: boolean;
  onMarkerClick: (inscription: any) => void;
  onMapNavigate: (navFunction: (lat: number, lng: number, zoom: number) => void) => void;
  onLegendToggle: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onResultClick: (inscription: any) => void;
  onPageChange: (page: number) => void;
  
  // Filter props
  selectedStatus: string;
  selectedObjectType: string;
  onLandscapeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onObjectTypeChange: (value: string) => void;
  
  // Timeline props
  mapNavigate: ((lat: number, lng: number, zoom: number) => void) | null;
  
  // God name search props
  onGodNameSearch?: (godName: string) => void;
  
  // Time period for rivers focus
  selectedTimePeriod?: string;
  setSelectedTimePeriod?: (value: string) => void;

  // Update handling
  onInscriptionUpdate?: (updatedInscription: any) => void;
}

export const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({
  shouldShowControls,
  shouldShowMap,
  shouldShowFilters,
  shouldShowTimeline,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isLoading,
  totalInscriptions,
  inscriptionsCount,
  activeFiltersCount,
  handleClearFilters,
  selectedLandscape,
  selectedCountry,
  selectedPeriod,
  mapInscriptions,
  currentInscriptions,
  allInscriptions,
  enabledLegendItems,
  legendItems,
  expandedCards,
  currentPage,
  totalPages,
  itemsPerPage,
  hasActiveSearch,
  onMarkerClick,
  onMapNavigate,
  onLegendToggle,
  onToggleExpanded,
  onResultClick,
  onPageChange,
  selectedStatus,
  selectedObjectType,
  onLandscapeChange,
  onCountryChange,
  onPeriodChange,
  onStatusChange,
  onObjectTypeChange,
  mapNavigate,
  onGodNameSearch,
  selectedTimePeriod = 'all',
  setSelectedTimePeriod,
  onInscriptionUpdate
}) => {
  const { activePreset } = usePanelManager();
  const { currentFocus, clearFocus } = useFocusManager();
  const isExplorerMode = activePreset === 'explore';
  const isMobile = useIsMobile();
  
  // Module state management
  const [selectedCarverId, setSelectedCarverId] = useState<string | null>(null);
  const [isSearchMinimized, setIsSearchMinimized] = useState(false);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showLegendPanel, setShowLegendPanel] = useState(true); // Legend visas som standard
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchResultsMinimized, setIsSearchResultsMinimized] = useState(false);
  
  // Mobile-specific state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);

  // Carver state management
  const handleCarverSelect = (carverId: string) => {
    setSelectedCarverId(carverId);
  };

  const handleCarverBack = () => {
    setSelectedCarverId(null);
  };

  const handleCarverInscriptionClick = (inscription: any) => {
    if (onResultClick) {
      onResultClick(inscription);
    }
  };

  // Enhanced god name search that syncs with legend
  const handleGodNameSearchWithLegend = (godName: string) => {
    if (onGodNameSearch) {
      onGodNameSearch(godName);
    }
    // Show search results when there's a search
    setShowSearchResults(true);
  };

  // Enhanced search handling
  const handleSearchWithResults = () => {
    handleSearch();
    setShowSearchResults(true);
    setIsSearchResultsMinimized(false);
  };

  // Handlers for focus views
  const handleParishSelect = (parishName: string) => {
    setSearchQuery(parishName);
    handleSearchWithResults();
    clearFocus();
  };

  const handleHundredSelect = (hundredName: string) => {
    setSearchQuery(hundredName);
    handleSearchWithResults();
    clearFocus();
  };

  const handleNameSelect = (name: string) => {
    setSearchQuery(name);
    handleSearchWithResults();
    clearFocus();
  };

  // Toggle functions
  const handleToggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  const handleToggleSearchResults = () => {
    setIsSearchResultsMinimized(!isSearchResultsMinimized);
  };

  // Show specific content for focused views
  if (
    currentFocus === 'names' ||
    currentFocus === 'hundreds' ||
    currentFocus === 'parishes' ||
    currentFocus === 'carvers' ||
    currentFocus === 'folkGroups' ||
    currentFocus === 'geneticEvents'
  ) {
    const renderFocusContent = () => {
      switch (currentFocus) {
        case 'names':
        case 'carvers':
        case 'folkGroups':
        case 'geneticEvents': // ExplorerPanels renders the right dedicated view
          return (
            <ExplorerPanels
              currentFocus={currentFocus}
              selectedCarverId={selectedCarverId}
              handleCarverSelect={handleCarverSelect}
              handleCarverBack={handleCarverBack}
              handleCarverInscriptionClick={handleCarverInscriptionClick}
              onNameSelect={handleNameSelect}
            />
          );
        case 'hundreds':
          return <HundredsView onHundredSelect={handleHundredSelect} />;
        case 'parishes':
          return <ParishesView onParishSelect={handleParishSelect} />;
        default:
          return null;
      }
    };

    return (
      <div className="max-w-7xl mx-auto space-y-3">
        <LayoutHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearchWithResults}
          isLoading={isLoading}
          totalInscriptions={totalInscriptions}
          isExplorerMode={isExplorerMode}
          onGodNameSearchWithLegend={handleGodNameSearchWithLegend}
          onLegendToggle={onLegendToggle}
          isSearchMinimized={isSearchMinimized}
          setIsSearchMinimized={setIsSearchMinimized}
          shouldShowTimeline={false}
          mapNavigate={mapNavigate}
          isTimelineMinimized={isTimelineMinimized}
          setIsTimelineMinimized={setIsTimelineMinimized}
        />
        {renderFocusContent()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      <LayoutHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearchWithResults}
        isLoading={isLoading}
        totalInscriptions={totalInscriptions}
        isExplorerMode={isExplorerMode}
        onGodNameSearchWithLegend={handleGodNameSearchWithLegend}
        onLegendToggle={onLegendToggle}
        isSearchMinimized={isSearchMinimized}
        setIsSearchMinimized={setIsSearchMinimized}
        shouldShowTimeline={shouldShowTimeline}
        mapNavigate={mapNavigate}
        isTimelineMinimized={isTimelineMinimized}
        setIsTimelineMinimized={setIsTimelineMinimized}
      />

      {/* Mobile Quick Actions */}
      {isMobile && (
        <div className="flex gap-2 justify-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileStatsOpen(true)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMapOpen(true)}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      )}

      {/* Stats and Filters Status - Desktop */}
      {!isMobile && (
        <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatsSection
              inscriptionsCount={inscriptionsCount}
              totalInscriptions={totalInscriptions}
              isVikingMode={false}
              selectedTimePeriod="all"
            />

            <FiltersStatusSection
              activeFiltersCount={activeFiltersCount}
              handleClearFilters={handleClearFilters}
              searchQuery={searchQuery}
              selectedLandscape={selectedLandscape}
              selectedCountry={selectedCountry}
              selectedPeriod={selectedPeriod}
            />
          </div>
        </div>
      )}

      {/* Mobile Drawers */}
      <MobileDrawer
        isOpen={mobileStatsOpen}
        onClose={() => setMobileStatsOpen(false)}
        title="Database Statistics"
      >
        <StatsSection
          inscriptionsCount={inscriptionsCount}
          totalInscriptions={totalInscriptions}
          isVikingMode={false}
          selectedTimePeriod="all"
        />
      </MobileDrawer>

      <MobileDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
      >
        <FiltersStatusSection
          activeFiltersCount={activeFiltersCount}
          handleClearFilters={handleClearFilters}
          searchQuery={searchQuery}
          selectedLandscape={selectedLandscape}
          selectedCountry={selectedCountry}
          selectedPeriod={selectedPeriod}
        />
      </MobileDrawer>

      {/* Carver Focus Panel */}
      <ExplorerPanels
        currentFocus={currentFocus}
        selectedCarverId={selectedCarverId}
        handleCarverSelect={handleCarverSelect}
        handleCarverBack={handleCarverBack}
        handleCarverInscriptionClick={handleCarverInscriptionClick}
      />

      {/* Main content with Map and Search Results */}
      <LayoutContent
        shouldShowMap={shouldShowMap}
        mapInscriptions={mapInscriptions}
        currentInscriptions={currentInscriptions}
        allInscriptions={allInscriptions}
        enabledLegendItems={enabledLegendItems}
        legendItems={legendItems}
        expandedCards={expandedCards}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        hasActiveSearch={hasActiveSearch}
        totalInscriptions={totalInscriptions}
        showFiltersPanel={showFiltersPanel}
        showLegend={showLegendPanel}
        onToggleLegend={() => setShowLegendPanel(!showLegendPanel)}
        selectedLandscape={selectedLandscape}
        selectedCountry={selectedCountry}
        selectedPeriod={selectedPeriod}
        selectedStatus={selectedStatus}
        selectedObjectType={selectedObjectType}
        activeFiltersCount={activeFiltersCount}
        searchQuery={searchQuery}
        showSearchResults={showSearchResults}
        isSearchResultsMinimized={isSearchResultsMinimized}
        onMarkerClick={onMarkerClick}
        onMapNavigate={onMapNavigate}
        onLegendToggle={onLegendToggle}
        onToggleExpanded={onToggleExpanded}
        onResultClick={onResultClick}
        onPageChange={onPageChange}
        handleClearFilters={handleClearFilters}
        onToggleFilters={handleToggleFilters}
        onLandscapeChange={onLandscapeChange}
        onCountryChange={onCountryChange}
        onPeriodChange={onPeriodChange}
        onStatusChange={onStatusChange}
        onObjectTypeChange={onObjectTypeChange}
        handleToggleSearchResults={handleToggleSearchResults}
        selectedTimePeriod={selectedTimePeriod}
        onInscriptionUpdate={onInscriptionUpdate}
      />
      
      {/* Timeline Module */}
      {shouldShowTimeline && (
        <div className="mt-6">
          <TimelineModule
            selectedPeriod="all"
            onPeriodChange={(value: string) => setSelectedTimePeriod?.(value)}
            mapNavigate={mapNavigate}
            isMinimized={isTimelineMinimized}
            onToggleMinimized={() => setIsTimelineMinimized(!isTimelineMinimized)}
          />
        </div>
      )}

      {/* Gods Cards Grid - only show when in gods focus */}
      {currentFocus === 'gods' && (
        <div className="mt-6">
          <GodCardsGrid onGodSelect={onGodNameSearch} />
        </div>
      )}
    </div>
  );
};
