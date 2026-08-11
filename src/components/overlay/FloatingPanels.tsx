
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, ChevronRight, Map, Check } from 'lucide-react';
import { FilterPanel } from '../filters/FilterPanel';
import { DraggableLegend } from '../legend/DraggableLegend';
import { ProximityControl } from './ProximityControl';
import { ElementSpotlightControl } from './ElementSpotlightControl';
import { NearMeControl } from './NearMeControl';
import { FieldNavControl } from './FieldNavControl';
import { ChurchYearControl } from './ChurchYearControl';
import { ClusterLegendControl } from './ClusterLegendControl';
import { LegendItem } from '@/types/common';
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { MapLegend } from '../MapLegend';
import { PanelLayoutSelector } from '../panels/PanelLayoutSelector';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useTravelMode, TRAVEL_MODE_LABELS } from '@/hooks/useTravelMode';

interface FloatingPanelsProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedLandscape: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedStatus: string;
  selectedObjectType: string;
  onLandscapeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onObjectTypeChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  // Legend props
  showLegend?: boolean;
  onToggleLegend?: () => void;
  isVikingMode?: boolean;
  legendItems?: LegendItem[];
  onLegendToggle?: (itemId: string) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
  // Draggable legend props
  legendVisible?: boolean;
  legendMinimized?: boolean;
  legendPosition?: { x: number; y: number };
  legendSize?: { width: number; height: number };
  onLegendMinimize?: () => void;
  onLegendPositionChange?: (position: { x: number; y: number }) => void;
  onLegendSizeChange?: (size: { width: number; height: number }) => void;
}

export const FloatingPanels: React.FC<FloatingPanelsProps> = ({
  showFilters,
  onToggleFilters,
  selectedLandscape,
  selectedCountry,
  selectedPeriod,
  selectedStatus,
  selectedObjectType,
  onLandscapeChange,
  onCountryChange,
  onPeriodChange,
  onStatusChange,
  onObjectTypeChange,
  onClearFilters,
  activeFiltersCount,
  // Legend props
  showLegend = false,
  onToggleLegend,
  isVikingMode = false,
  legendItems = [],
  onLegendToggle,
  onShowAll,
  onHideAll,
  // Draggable legend props
  legendVisible = false,
  legendMinimized = false,
  legendPosition = { x: 20, y: 20 },
  legendSize = { width: 320, height: 500 },
  onLegendMinimize,
  onLegendPositionChange,
  onLegendSizeChange
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const isMobile = useIsMobile();
  // Avancerade filter (land/period/typ/status) är hopfällda som standard på mobil — man ska inte
  // mötas av en avancerad meny direkt. Öppnas via "Fler filter". Aktiva filter puttar upp badgen.
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const travelMode = useTravelMode();
  const modeLbl = TRAVEL_MODE_LABELS[travelMode];
  // Är arts-lagret påslaget? (Sök rekursivt i legend-träden.)
  const findEnabled = (items: LegendItem[] | undefined, id: string): boolean => {
    for (const it of items ?? []) {
      if (it.id === id) return !!it.enabled;
      if (it.children && findEnabled(it.children, id)) return true;
    }
    return false;
  };
  const churchesOn = findEnabled(legendItems, 'ecclesiastical_churches');
  // Platt {id: enabled}-karta ur legendträdet → Near me kan filtrera på intresseprofilen.
  const enabledLayers: Record<string, boolean> = {};
  const flattenEnabled = (items: LegendItem[] | undefined) => {
    for (const it of items ?? []) { enabledLayers[it.id] = !!it.enabled; if (it.children) flattenEnabled(it.children); }
  };
  flattenEnabled(legendItems);
  return (
    <>
      {/* Avancerade flytande verktyg (linjal, räckvidd, mina punkter, element-spotlight,
          kluster-förklaring) är skrivbords-verktyg och skräpar ner den lilla mobilskärmen
          (Daniel). Dölj dem på mobil — Near me + teckenförklaringen räcker där. */}
      {!isMobile && <ProximityControl />}
      {/* "Mina punkter" är nu inbakat i Near me (Mina platser) → fristående kontrollen borttagen. */}
      {!isMobile && churchesOn && <ChurchYearControl />}
      {!isMobile && <ElementSpotlightControl />}
      {/* Linjalen flyttad till breadcrumb-raden (RulerBar i Explore) — inte längre flytande på kartan. */}
      <NearMeControl enabledLayers={enabledLayers} />
      <FieldNavControl />
      {!isMobile && <ClusterLegendControl onLegendToggle={onLegendToggle} enabledLayers={enabledLayers} />}
      {/* Control Button — single entry point. Filtret bor nu som ikon inuti legenden. */}
      {onToggleLegend && !showLegend && (
        <div className={isMobile ? 'fixed top-[4.75rem] right-[4.75rem] z-[1100]' : 'absolute top-4 left-4 z-50 flex flex-col gap-2'}>
          <Button
            onClick={onToggleLegend}
            aria-label={sv ? 'Anpassa karta' : 'Customize map'}
            className={isMobile
              ? 'relative h-11 w-11 p-0 rounded-full bg-slate-900/70 backdrop-blur-md border-2 border-slate-500 text-white hover:bg-slate-800 shadow-lg'
              : 'bg-slate-900/95 backdrop-blur-md border-slate-500 text-white hover:bg-slate-800/95 flex items-center gap-2 shadow-lg border-2'}
            size="sm"
          >
            <Map className="h-4 w-4" />
            {!isMobile && <span className="text-xs font-medium">{sv ? 'Anpassa karta' : 'Customize map'}</span>}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className={isMobile
                ? 'absolute -top-1 -right-1 px-1 text-[10px] bg-orange-600 text-white border-orange-500 font-bold'
                : 'text-xs bg-orange-600 text-white border-orange-500 font-bold'}>
                {activeFiltersCount}
              </Badge>
            )}
            {!isMobile && <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* Mobil: legenden bor i en bottom-sheet (den dragbara desktop-panelen ligger
          annars på x≈880 = utanför skärmen på en telefon). Stora tap-targets. */}
      {isMobile && onLegendToggle && onToggleLegend && (
        <MobileDrawer isOpen={showLegend} onClose={onToggleLegend} title={`${modeLbl.icon} ${sv ? modeLbl.sv : modeLbl.en} · ${sv ? 'Anpassa karta' : 'Customize map'}`}>
          <MapLegend
            isVikingMode={isVikingMode}
            legendItems={legendItems}
            onToggleItem={onLegendToggle}
            onShowAll={onShowAll}
            onHideAll={onHideAll}
            onModeSelected={onToggleLegend}
          />
          {/* Avancerade filter (land/period/typ/status) — HOPFÄLLDA som standard. Man ska förstå
              att lager-valen ovan redan gäller; det avancerade är ett medvetet extra steg (Daniel). */}
          <div className="border-t border-slate-600/60 pt-3 mt-3">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              aria-expanded={showAdvancedFilters}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 text-white font-medium text-sm">
                {sv ? 'Fler filter' : 'More filters'}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-600 text-white border-orange-500 font-bold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </span>
              {showAdvancedFilters ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
            </button>
            {showAdvancedFilters && (
              <div className="mt-2">
                <FilterPanel
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
                />
              </div>
            )}
          </div>
          {/* Intresseprofil SIST i modalen (Daniel): efter teckenförklaring + filter. Kondenserad
              som standard; visar aktiv profil tills man fäller ut. */}
          <div className="border-t border-slate-600/60 pt-3 mt-3">
            <h3 className="text-white font-medium text-sm mb-2">{sv ? 'Intresseprofil' : 'Interest profile'}</h3>
            <PanelLayoutSelector />
          </div>
          {/* Sticky "klart"-knapp: en tydlig väg tillbaka till kartan efter man justerat (Daniel:
              "man ska förstå att det sparas"). Valen gäller redan live — knappen stänger panelen. */}
          <div className="sticky bottom-0 -mx-4 mt-3 border-t border-slate-600/60 bg-background px-4 pt-3 pb-1">
            <Button
              onClick={onToggleFilters}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" /> {sv ? 'Visa kartan' : 'Show the map'}
            </Button>
          </div>
        </MobileDrawer>
      )}

      {/* Desktop: den dragbara legenden. Filtret ligger som en sektion INUTI legenden
          (togglas av filter-ikonen i headern) — så det ligger parallellt med legenden
          och ärver panelens ogenomskinliga bakgrund. */}
      {!isMobile && showLegend && onLegendToggle && onToggleLegend && (
        <DraggableLegend
          visible={showLegend}
          minimized={legendMinimized}
          position={legendPosition}
          size={legendSize}
          isVikingMode={isVikingMode}
          legendItems={legendItems}
          onToggleItem={onLegendToggle}
          onClose={() => onToggleLegend()}
          onMinimize={onLegendMinimize ?? (() => {})}
          onPositionChange={onLegendPositionChange ?? (() => {})}
          onSizeChange={onLegendSizeChange ?? (() => {})}
          onShowAll={onShowAll}
          onHideAll={onHideAll}
          onOpenFilter={onToggleFilters}
          filterActive={showFilters}
          activeFiltersCount={activeFiltersCount}
          filterSection={showFilters && (
            <div className="bg-slate-900 border-b border-slate-600/60 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm">{sv ? 'Filtrera' : 'Filter'}</h3>
                <Button
                  onClick={onToggleFilters}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:bg-slate-700/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterPanel
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
              />
            </div>
          )}
        />
      )}
    </>
  );
};
