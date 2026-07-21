import React from 'react';
import { Map, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraggablePanel } from '@/components/draggable/DraggablePanel';
import { MapLegend } from '@/components/MapLegend';
import { LegendItem } from '@/types/common';
import { useLanguage } from "@/contexts/LanguageContext";

interface DraggableLegendProps {
  visible: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVikingMode: boolean;
  legendItems: LegendItem[];
  onToggleItem: (itemId: string) => void;
  onClose: () => void;
  onMinimize: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
  onOpenFilter?: () => void;
  filterActive?: boolean;
  activeFiltersCount?: number;
}

export const DraggableLegend: React.FC<DraggableLegendProps> = ({
  visible,
  minimized,
  position,
  size,
  isVikingMode,
  legendItems,
  onToggleItem,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
  onShowAll,
  onHideAll,
  onOpenFilter,
  filterActive = false,
  activeFiltersCount = 0
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <DraggablePanel
      id="legend"
      title={sv ? 'Teckenförklaring' : 'Legend'}
      icon={<Map className="h-4 w-4" />}
      visible={visible}
      minimized={minimized}
      initialPosition={position}
      initialSize={size}
      onClose={onClose}
      onMinimize={onMinimize}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      resizable={true}
      headerActions={onOpenFilter && (
        <Button
          onClick={onOpenFilter}
          variant="ghost"
          size="sm"
          title={sv ? 'Filtrera' : 'Filter'}
          aria-label={sv ? 'Filtrera' : 'Filter'}
          className={`relative h-6 w-6 p-0 hover:bg-slate-700/50 ${filterActive ? 'text-orange-400' : 'text-slate-300 hover:text-white'}`}
        >
          <Filter className="h-3.5 w-3.5" />
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] leading-none bg-orange-600 text-white border-orange-500 font-bold flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}
    >
      <div className="p-0">
        <MapLegend
          isVikingMode={isVikingMode}
          legendItems={legendItems}
          onToggleItem={onToggleItem}
          onShowAll={onShowAll}
          onHideAll={onHideAll}
          className="bg-transparent border-0"
        />
      </div>
    </DraggablePanel>
  );
};