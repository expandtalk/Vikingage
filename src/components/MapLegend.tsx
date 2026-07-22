import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Map, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { LegendItemComponent } from './legend/LegendItem';
import { LegendCategory } from './legend/LegendCategory';
import { MapLegendProps } from './legend/types';

export const MapLegend: React.FC<MapLegendProps> = ({
  isVikingMode,
  legendItems,
  onToggleItem,
  className = "",
  onShowAll,
  onHideAll
}) => {
  const { t } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['religious_places', 'heritage_sites']);
  
  const totalVisible = legendItems.filter(item => item.enabled).reduce((sum, item) => {
    let total = item.count;
    if (item.children) {
      total += item.children.filter(child => child.enabled).reduce((childSum, child) => childSum + child.count, 0);
    }
    return sum + total;
  }, 0);
  
  const allEnabled = legendItems.every(item => item.enabled);

  const handleToggleAll = () => {
    if (allEnabled && onHideAll) {
      console.log(`🙈 All items enabled, hiding all`);
      onHideAll();
    } else if (!allEnabled && onShowAll) {
      console.log(`👁️ Not all items enabled, showing all`);
      onShowAll();
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const primaryItems = legendItems.filter(item => !item.type || item.type === 'primary');
  const categoryItems = legendItems.filter(item => item.type === 'category');

  return (
    <Card className={`bg-gray-950/95 backdrop-blur-md border-gray-600/50 ${className}`}>
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-white flex items-center gap-2 text-xs">
          <Map className="h-3 w-3" />
          {t('mapLegend')}
          <Badge variant="secondary" className="text-xs ml-auto px-1 py-0 bg-gray-600 text-white border-gray-500">
            {totalVisible}
          </Badge>
        </CardTitle>
        
        {/* Toggle All Button */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleToggleAll}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-white hover:bg-gray-700/50 flex items-center gap-1"
          >
            {allEnabled ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
            {allEnabled ? t('hideAll') : t('showAll')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pb-2">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-1 pt-0">
            {/* Primary items */}
            {primaryItems.map((item) => (
              <LegendItemComponent
                key={item.id}
                item={item}
                onToggleItem={onToggleItem}
              />
            ))}
            
            {/* Category items with expandable children */}
            {categoryItems.map((item) => (
              <LegendCategory
                key={item.id}
                item={item}
                onToggleItem={onToggleItem}
                expandedCategories={expandedCategories}
                onCategoryToggle={handleCategoryToggle}
              />
            ))}
            
            {isVikingMode && (
              <div className="pt-2 border-t border-gray-600/50 mt-2">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {t('authenticVikingColors')}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
