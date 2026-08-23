
import React, { useState } from 'react';
import { StatsSection } from './StatsSection';
import { FiltersStatusSection } from './FiltersStatusSection';
import { ExplorerPanels } from './ExplorerPanels';
import { TimelineModule } from '../modules/TimelineModule';
import { GodCardsGrid } from '../gods/GodCardsGrid';
import { WindRoses } from './WindRose';
import { SmhiWarnings } from './SmhiWarnings';
import { CultSitesView } from '../gods/CultSitesView';
import { PanelLayoutSelector } from '../panels/PanelLayoutSelector';
import { usePanelManager } from '@/hooks/usePanelManager';
import { useFocusManager } from '@/hooks/useFocusManager';
import { LayoutHeader } from './layout/LayoutHeader';
import { LayoutContent } from './layout/LayoutContent';
import { MobileProfileSheet } from '../overlay/MobileProfileSheet';
import { RegionFindsView } from '../regions/RegionFindsView';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useDrivingMode } from '@/hooks/useDrivingMode';
import { Filter, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  onShowAll?: () => void;
  onHideAll?: () => void;
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
  // Fokusera EN guds kultplatser på kartan (null = visa alla)
  onFocusDeity?: (deityKey: string | null) => void;

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
  onShowAll,
  onHideAll,
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
  onFocusDeity,
  selectedTimePeriod = 'all',
  setSelectedTimePeriod,
  onInscriptionUpdate
}) => {
  const { activePreset } = usePanelManager();
  const { currentFocus, clearFocus } = useFocusManager();
  const { language } = useLanguage();
  const focusSv = language === 'sv';
  const isExplorerMode = activePreset === 'explore';
  const isMobile = useIsMobile();
  const driving = useDrivingMode(); // billäge: strippa tidslinje/händelselinje/intresse-knapp
  
  // Module state management
  const [selectedCarverId, setSelectedCarverId] = useState<string | null>(null);
  const [isSearchMinimized, setIsSearchMinimized] = useState(false);
  // Kondenserad (minimerad) som standard på mobil (Daniel) — tidslinjen tar annars mycket
  // yta över kartan; öppnas med ett klick. Desktop startar expanderad.
  // Historiska tidslinjen: condensed by default ÄVEN på desktop (Daniel). Var tidigare bara minimerad <768px.
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(true);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  // "Anpassa karta"-legenden startar ALLTID STÄNGD (Daniel) — på både desktop och mobil.
  // Kartan ska mötas ren; legenden/lager-panelen öppnas via "Anpassa karta"-knappen.
  const [showLegendPanel, setShowLegendPanel] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchResultsMinimized, setIsSearchResultsMinimized] = useState(false);
  
  // Mobile-specific state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // "Min sida"-arket (mobil): intresseprofil + tidsperiod + konto, öppnas via avatar-ikonen på kartan.
  const [profileOpen, setProfileOpen] = useState(false);

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
          return <RegionFindsView inscriptions={allInscriptions} mode="hundreds" onResultClick={onResultClick} />;
        case 'parishes':
          return <RegionFindsView inscriptions={allInscriptions} mode="parishes" onResultClick={onResultClick} />;
        default:
          return null;
      }
    };

    return (
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Stäng-knapp: alla focus-moduler (parishes/hundreds/carvers…) måste gå att lämna,
            särskilt i mobilen där man annars blir låst. clearFocus → tillbaka till kartan/near me. */}
        <button
          onClick={clearFocus}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" /> {focusSv ? 'Stäng — tillbaka till kartan' : 'Close — back to map'}
        </button>
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

  // Modul-fokus som byter sidans innehåll (gudar/kultplatser/farleder/forten). Dessa föll
  // förut igenom UTAN stäng-knapp → man kunde bli låst på mobilen (Daniel: "kunde inte stänga
  // ner gudamodulen"). Invariant: varje modul måste ha en synlig väg tillbaka till kartan.
  const moduleFocus = currentFocus === 'gods' || currentFocus === 'cultSites'
    || currentFocus === 'rivers' || currentFocus === 'fortresses';

  // Intresseprofilen (profil-header med profilväljare + inbäddat sök). Extraherad så den kan
  // placeras SIST på namn-fokus (Daniel: "interest profile kan väl visas sist på sidan?").
  const desktopHeader = !isMobile ? (
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
  ) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      {moduleFocus && (
        <button
          onClick={clearFocus}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" /> {focusSv ? 'Stäng — tillbaka till kartan' : 'Close — back to map'}
        </button>
      )}
      {/* cultSites: runstenssöket är irrelevant (platserna är innehållet) —
          behåll profilväljaren men släck sök-/tidslinjemodulen (Daniel 2026-07-20). */}
      {/* Intresseprofilen + explore-kontrollerna flyttade SIST på sidan (fotband, se slutet) för alla
          vyer utom cultSites — kartan först (Daniel: "interest profile och explore längst ner"). */}
      {currentFocus === 'cultSites' ? <PanelLayoutSelector /> : null}

      {/* Mobil: profil-headern (intresseprofil + sök) döljs ovanför kartan — den bor nu i "Min sida"-
          arket (avatar-ikonen). Sök finns kvar via förstoringsglaset i sidhuvudet. */}
      {isMobile && (
        <>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label={focusSv ? 'Min sida' : 'My page'}
            className="fixed right-3 top-[4.75rem] z-[1100] flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-500/70 bg-slate-900/70 text-amber-200 shadow-lg backdrop-blur hover:bg-slate-800"
          >
            <span className="font-norse text-xl leading-none">ᚠ</span>
          </button>
          <MobileProfileSheet
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            selectedTimePeriod={selectedTimePeriod}
            setSelectedTimePeriod={(v) => setSelectedTimePeriod?.(v)}
          />
        </>
      )}

      {/* Gudakorten flyttade UNDER kartan i gods-fokus (Daniel: visa kartan först) — se efter LayoutContent. */}

      {/* Heliga källor & kultplatser: CultSitesView flyttad UNDER kartan (kartan först, som
          övriga sidor) — renderas efter LayoutContent nedan. */}

      {/* Mobil "Intresse"-knappen borttagen (Daniel): filtren bor nu i "Anpassa karta"-panelen
          (FloatingPanels) → mobilen har EN inställningsyta i st.f. flera. */}

      {/* Stats and Filters Status - Desktop. Visas bara vid aktiv sökning/filtrering —
          annars tar "Resultat"-rutan onödig yta i kondenserat läge (Daniel). */}
      {!isMobile && (hasActiveSearch || activeFiltersCount > 0) && (
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
        onShowAll={onShowAll}
        onHideAll={onHideAll}
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

      {/* Heliga källor & kultplatser: kartan FÖRST (som övriga sidor), platslistan under. */}
      {currentFocus === 'cultSites' && (
        <div className="mt-6">
          <CultSitesView onNavigate={mapNavigate ? (lat, lng, zoom) => mapNavigate(lat, lng, zoom ?? 12) : undefined} />
        </div>
      )}

      {/* Gudakorten UNDER kartan i gods-fokus (Daniel: kartan först, bilderna som fördjupning) */}
      {currentFocus === 'gods' && (
        <div className="mt-6">
          <GodCardsGrid onFocusDeity={onFocusDeity} />
        </div>
      )}

      {/* Vindrosor på farleds-/marinvyerna — förhärskande vind PER farvatten (SMHI), inte bara Kalmarsund. */}
      {(currentFocus === 'rivers' || currentFocus === 'marine') && (
        <div className="mt-4">
          <WindRoses />
        </div>
      )}

      {/* Timeline Module — döljs i billäget (map-first) OCH på mobil (tiden bor i "Min sida"-arket). */}
      {shouldShowTimeline && !driving && !isMobile && (
        <div className="mt-6">
          <TimelineModule
            selectedPeriod={selectedTimePeriod}
            onPeriodChange={(value: string) => setSelectedTimePeriod?.(value)}
            mapNavigate={mapNavigate}
            isMinimized={isTimelineMinimized}
            onToggleMinimized={() => setIsTimelineMinimized(!isTimelineMinimized)}
          />
        </div>
      )}

      {/* SMHI-vädervarningar (aktiva) under kartan — nyckelfritt SMHI open data, dold i billäge. */}
      {!driving && (
        <div className="mt-4">
          <SmhiWarnings />
        </div>
      )}

      {/* Eventlinjen ("Events over time") borttagen på begäran (Daniel) — större karta.
          Komponenten EventTimeline finns kvar i repo; återinför här vid behov. */}

      {/* FOTBAND: intresseprofil + explore-kontroller (profilväljare + sök) SIST på sidan, under
          kartan/innehållet — alla vyer utom cultSites (som har sin egen överst). Kartan först. */}
      {currentFocus !== 'cultSites' && desktopHeader && (
        <div className="mt-6 pt-4 border-t border-slate-700/50">{desktopHeader}</div>
      )}

    </div>
  );
};
