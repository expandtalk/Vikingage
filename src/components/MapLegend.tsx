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

// Tematisk ordning för legenden (mobil) — grupperar besläktade lager så listan blir läsbar
// i stället för "alla lösa toggles, sedan alla kategorier" (Daniel: "ser rörigt ut").
const LEGEND_THEMES: { label: string; ids: string[] }[] = [
  { label: 'Runor', ids: ['runic_inscriptions', 'runestone_density', 'runbleck_only'] },
  { label: 'Gravar & fornlämningar', ids: ['heritage_sites', 'picture_stone_reuse'] },
  // Egen sten-grupp (form): milstenar, gränsstenar, väghållnings-, bild- och sägenstenar (mytiska).
  { label: 'Stenar', ids: ['heritage_stones'] },
  // Hednisk kult (gudar/Freja/offerplatser) + folktradition & sägen (sägenstenar, jätte-/troll,
  // vårdträd, GROTTOR) hör ihop under tro/myt — skilt från kristna kyrkor.
  { label: 'Kult, tro & myter', ids: ['religious_places', 'pagan_gods', 'heritage_folklore'] },
  { label: 'Kyrkor & kristendom', ids: ['ecclesiastical_churches', 'heritage_kyrka', 'heritage_kapell', 'heritage_kloster', 'heritage_kyrkoruin'] },
  { label: 'Marint & farleder', ids: ['heritage_marine', 'maritime', 'stake_barriers', 'water_routes', 'paleo_shoreline'] },
  { label: 'Borgar & makt', ids: ['viking_fortresses', 'fort_territories', 'estates', 'thing_sites', 'viking_regions', 'folk_groups'] },
  { label: 'Mynt & fynd', ids: ['coins', 'solidus_die_links', 'archaeological_finds'] },
  { label: 'Museer & samlingar', ids: ['museums'] },
  { label: 'Vetenskap & tid', ids: ['adna_sites', 'species_introductions', 'germanic_timeline'] },
  { label: 'Kartor & ortnamn', ids: ['historical_maps', 'place_names'] },
];

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

  const renderItem = (item: MapLegendProps['legendItems'][number]) => (
    item.type === 'category'
      ? <LegendCategory key={item.id} item={item} onToggleItem={onToggleItem} expandedCategories={expandedCategories} onCategoryToggle={handleCategoryToggle} />
      : <LegendItemComponent key={item.id} item={item} onToggleItem={onToggleItem} />
  );
  const themedIds = new Set(LEGEND_THEMES.flatMap(t => t.ids));
  const restItems = legendItems.filter(item => !themedIds.has(item.id));

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
            {/* Tematiska sektioner — besläktade lager grupperade med rubrik. */}
            {LEGEND_THEMES.map((theme) => {
              const its = legendItems.filter(item => theme.ids.includes(item.id));
              if (!its.length) return null;
              return (
                <div key={theme.label} className="pt-2 first:pt-0">
                  <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{theme.label}</p>
                  {its.map(renderItem)}
                </div>
              );
            })}
            {restItems.length > 0 && (
              <div className="pt-2">
                <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Övrigt</p>
                {restItems.map(renderItem)}
              </div>
            )}

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
