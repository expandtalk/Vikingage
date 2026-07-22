
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getIconForLegendItem } from './utils';
import { cleanLabelText } from '@/hooks/map/legend/labelUtils';
import { LegendItem as LegendItemType } from './types';

interface LegendItemProps {
  item: LegendItemType;
  onToggleItem: (id: string) => void;
  level?: number;
}

export const LegendItemComponent: React.FC<LegendItemProps> = ({ 
  item, 
  onToggleItem, 
  level = 0 
}) => {
  const IconComponent = getIconForLegendItem(item.id);
  const indent = level * 16;
  const cleanedLabel = cleanLabelText(item.label);
  return (
    <div
      className={`flex items-center justify-between py-2 px-2 rounded-md transition-all duration-200 ${
        item.enabled
          ? 'bg-slate-800/90 border border-slate-600/50 shadow-sm'
          : 'bg-slate-900/80 border border-slate-700/40'
      }`}
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
          <IconComponent 
            className="h-3 w-3" 
            style={{ 
              color: item.color,
              opacity: item.enabled ? 1 : 0.5 
            }} 
          />
        </div>
        <Label 
          htmlFor={`legend-${item.id}`} 
          className={`text-xs cursor-pointer flex-1 truncate leading-4 hover:text-gray-100 transition-colors font-medium ${
            item.enabled ? 'text-gray-100' : 'text-gray-300'
          }`}
          title={cleanedLabel}
        >
          {cleanedLabel}
        </Label>
        {/* Antalet visas BARA när lagret är på, dämpat grått. Av-läge = ren etikett
            utan sifferbrus (Daniel: "dölj hur många men visa dämpat när det sätts on"). */}
        {item.enabled && !!item.count && (
          <span
            className="text-[11px] tabular-nums text-slate-400 flex-shrink-0"
            title={`${item.count} objekt`}
          >
            {item.count.toLocaleString('sv-SE')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Switch
          id={`legend-${item.id}`}
          checked={item.enabled}
          onCheckedChange={() => onToggleItem(item.id)}
          className={`scale-75 transition-all duration-200 ${
            item.enabled 
              ? 'data-[state=checked]:bg-blue-600' 
              : 'data-[state=unchecked]:bg-slate-600'
          }`}
        />
        <span className={`text-xs font-bold ${
          item.enabled ? 'text-gray-100' : 'text-gray-300'
        }`}>
          {item.enabled ? 'PÅ' : 'AV'}
        </span>
      </div>
    </div>
  );
};
