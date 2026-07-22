
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Map } from 'lucide-react';
import { FilterPanel } from '../filters/FilterPanel';
import { DraggableLegend } from '../legend/DraggableLegend';
import { ProximityControl } from './ProximityControl';
import { CustomPointsControl } from './CustomPointsControl';
import { EpochControl } from './EpochControl';
import { ElementSpotlightControl } from './ElementSpotlightControl';
import { RulerControl } from './RulerControl';
import { LegendItem } from '@/types/common';
import { useLanguage } from "@/contexts/LanguageContext";

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
  // Är arts-lagret påslaget? (Sök rekursivt i legend-träden.)
  const findEnabled = (items: LegendItem[] | undefined, id: string): boolean => {
    for (const it of items ?? []) {
      if (it.id === id) return !!it.enabled;
      if (it.children && findEnabled(it.children, id)) return true;
    }
    return false;
  };
  const speciesOn = findEnabled(legendItems, 'species_introductions');
  return (
    <>
      <ProximityControl />
      <CustomPointsControl />
      <EpochControl visible={speciesOn} />
      <ElementSpotlightControl />
      <RulerControl />
      {/* Control Button — single entry point. Filtret bor nu som ikon inuti legenden. */}
      {onToggleLegend && !showLegend && (
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
          <Button
            onClick={onToggleLegend}
            className="bg-slate-900/95 backdrop-blur-md border-slate-500 text-white hover:bg-slate-800/95 flex items-center gap-2 shadow-lg border-2"
            size="sm"
          >
            <Map className="h-4 w-4" />
            <span className="text-xs font-medium">{sv ? 'Teckenförklaring' : 'Legend'}</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-orange-600 text-white border-orange-500 font-bold">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Enda legenden: dragbar panel. Filtret ligger som en sektion INUTI legenden
          (togglas av filter-ikonen i headern) — så det ligger parallellt med legenden
          och ärver panelens ogenomskinliga bakgrund. */}
      {showLegend && onLegendToggle && onToggleLegend && (
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
