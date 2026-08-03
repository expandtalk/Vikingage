import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Map, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { LegendItemComponent } from './legend/LegendItem';
import { LegendCategory } from './legend/LegendCategory';
import { MapsControl } from './legend/MapsControl';
import { MapLegendProps } from './legend/types';

// Tematisk ordning för legenden (mobil) — grupperar besläktade lager så listan blir läsbar
// i stället för "alla lösa toggles, sedan alla kategorier" (Daniel: "ser rörigt ut").
//
// VIKTIGT: ids här måste vara TOPPNIVÅ-id:n ur den faktiska trädstrukturen som
// generateBasicInscriptionItems (legendItemGenerators.ts) bygger — filtret nedan
// (theme.ids.includes(item.id)) matchar bara på toppnivå, inte i children. Efter
// "FULL KATEGORI-GRUPPERING"-steget i den filen är de riktiga toppnivå-id:na:
// cat_runic, runbleck_only, cat_church, heritage_sites, heritage_folklore,
// heritage_marine, religious_places, water_routes, cat_defense, cat_folk, cat_coins,
// cat_geo, historical_maps, maritime, fort_territories, heritage_stones, museums, estates.
// (Barn som t.ex. thing_sites/place_names ligger nästlade under cat_geo/heritage_sites
// och kan INTE placeras separat utan att ändra generatorlogiken. coins/solidus_die_links
// flyttades UT ur cat_geo till egen cat_coins — se not i legendItemGenerators.ts.)
const LEGEND_THEMES: { label: string; ids: string[] }[] = [
  { label: 'Runor', ids: ['cat_runic', 'runbleck_only'] },
  { label: 'Gravar & fornlämningar', ids: ['heritage_sites'] },
  // Egen sten-grupp (form): milstenar, gränsstenar, väghållnings-, bild- och sägenstenar (mytiska).
  { label: 'Stenar', ids: ['heritage_stones'] },
  { label: 'Kyrkor & kristendom', ids: ['cat_church'] },
  // Hednisk kult (gudar/Freja/offerplatser) + folktradition & sägen (sägenstenar, jätte-/troll,
  // vårdträd, GROTTOR) hör ihop under tro/myt — skilt från kristna kyrkor.
  { label: 'Kult, tro & myter', ids: ['religious_places', 'heritage_folklore'] },
  { label: 'Försvar & bevakning', ids: ['cat_defense', 'fort_territories', 'beacon_sites'] },
  { label: 'Makt & samhälle', ids: ['cat_folk', 'estates', 'heritage_avrattning'] },
  // Marinarkeologi inkl. farleder/vattenvägar (Daniel: slå ihop farleder med marinarkeologi).
  { label: 'Marinarkeologi', ids: ['heritage_marine', 'maritime', 'water_routes'] },   // vrak, vraktradition, pålspärrar, noder, haverier + farleder
  // Mynt & fynd: coins/solidus_die_links, nu egen toppnivå-kategori (cat_coins) —
  // utbrutna ur cat_geo (se not i legendItemGenerators.ts).
  { label: 'Mynt & fynd', ids: ['cat_coins'] },
  { label: 'Museer & samlingar', ids: ['museums'] },
  { label: 'Vetenskap & tid', ids: ['cat_geo'] },
  { label: 'Kartor & ortnamn', ids: ['historical_maps'] },
  { label: 'Äventyr & upplevelser', ids: ['spokvandring_kalmar', 'heritage_grotta', 'experiences'] },
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
  
  // Länk-poster (t.ex. spökvandringen) har ingen enabled/switch — de ska inte räknas
  // med i "alla på?"-bedömningen, annars låser en enda länk fast "Visa alla".
  const toggleableItems = legendItems.filter(item => item.type !== 'link');
  const allEnabled = toggleableItems.length > 0 && toggleableItems.every(item => item.enabled);

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
      : item.type === 'link'
      ? (
        // Länk-typ: ingen switch/räknare — öppnar href i ny flik. Stilkonsekvent med
        // LegendItemComponents "på"-rad (bg-slate-800/90 + border), men klickbar hela raden.
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 py-2 px-2 rounded-md bg-slate-800/90 border border-slate-600/50 shadow-sm text-gray-100 hover:bg-slate-700/90 hover:text-white transition-all duration-200"
        >
          <span className="text-xs flex-1 truncate leading-4 font-medium" title={item.label}>
            {item.label}
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        </a>
      )
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
              // "Kartor"-temat får en dedikerad kontroll: bakgrundskarta (radio) + historiska
              // kartor (opacitet + Färg/Gråskala + zoom-notis) i st.f. vanliga toggles.
              const isMaps = theme.ids.includes('historical_maps');
              const histChildren = isMaps
                ? (its.find(i => i.id === 'historical_maps')?.children ?? []).map(c => ({ id: c.id, label: c.label, enabled: !!c.enabled }))
                : [];
              return (
                <div key={theme.label} className="pt-2 first:pt-0">
                  <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{theme.label}</p>
                  {isMaps
                    ? <MapsControl historicalChildren={histChildren} onToggleItem={onToggleItem} />
                    : its.map(renderItem)}
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
