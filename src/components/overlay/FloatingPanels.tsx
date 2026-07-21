
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Map } from 'lucide-react';
import { FilterPanel } from '../filters/FilterPanel';
import { DraggableLegend } from '../legend/DraggableLegend';
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
  return (
    <>
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

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-20 left-4 z-40 w-[380px] max-h-[70vh] overflow-y-auto">
          <div className="bg-slate-800/98 backdrop-blur-md border-slate-600/50 rounded-lg shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Filtrera resultat</h3>
              <Button
                onClick={onToggleFilters}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-slate-700/50"
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
        </div>
      )}

      {/* Enda legenden: dragbar panel med filter som ikon i headern. */}
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
        />
      )}
    </>
  );
};
