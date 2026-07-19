import React from 'react';
import { Map } from 'lucide-react';
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
  onHideAll
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