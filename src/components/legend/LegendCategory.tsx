
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, ChevronDown, ChevronRight } from 'lucide-react';
import { LegendItemComponent } from './LegendItem';
import { LegendItem } from './types';

interface LegendCategoryProps {
  item: LegendItem;
  onToggleItem: (id: string) => void;
  expandedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export const LegendCategory: React.FC<LegendCategoryProps> = ({
  item,
  onToggleItem,
  expandedCategories,
  onCategoryToggle
}) => {
  return (
    <div className="mt-2">
      {/* Category header */}
      <div className="flex items-center justify-between py-1 border-t border-gray-600/30 pt-2 bg-gray-800/30 rounded-md px-2 mb-1 hover:bg-gray-700/40 transition-colors">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            onClick={() => onCategoryToggle(item.id)}
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 text-white hover:bg-gray-600/50 hover:text-white"
          >
            {expandedCategories.includes(item.id) ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
            }
          </Button>
          
          <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
            <Building 
              className="h-3 w-3" 
              style={{ 
                color: item.color,
                opacity: item.enabled ? 1 : 0.5 
              }} 
            />
          </div>
          
          <Label 
            htmlFor={`legend-${item.id}`} 
            className={`text-xs cursor-pointer flex-1 truncate leading-4 font-semibold hover:text-white transition-colors ${
              item.enabled ? 'text-white' : 'text-gray-300'
            }`}
            title={item.label}
          >
            {item.label}
          </Label>
          
          {!!item.count && (
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 h-5 flex-shrink-0 font-semibold ${
                item.enabled ? 'text-white border-amber-600 bg-amber-700/50' : 'text-gray-300 border-gray-500/60 bg-gray-800/70'
              }`}
            >
              {item.count}
            </Badge>
          )}
        </div>
        
        <Switch
          id={`legend-${item.id}`}
          checked={item.enabled}
          onCheckedChange={() => onToggleItem(item.id)}
          className="data-[state=checked]:bg-amber-600 scale-75 ml-2"
        />
      </div>
      
      {/* Children - only show if expanded and enabled */}
      {expandedCategories.includes(item.id) && item.enabled && item.children && (
        <div className="ml-2 mt-1 space-y-1 bg-gray-900/20 rounded-md p-2">
          {item.children.map((child) => (
            <LegendItemComponent
              key={child.id}
              item={child}
              onToggleItem={onToggleItem}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};
