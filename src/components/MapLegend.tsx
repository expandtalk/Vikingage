import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Map, ToggleLeft, ToggleRight, ExternalLink, Save, RotateCcw, Sparkles, Navigation2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from '@/hooks/useMediaQuery';
import { startFieldNav } from '@/hooks/useFieldNav';
import { useTravelMode, setTravelMode, TRAVEL_MODE_LABELS, type TravelMode } from '@/hooks/useTravelMode';
import { saveModePreset, clearModePreset, useHasModePreset } from '@/hooks/useModePresets';
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
  onHideAll,
  onModeSelected
}) => {
  const { t, language } = useLanguage();
  const sv = language === 'sv';
  const isMobile = useIsMobile();
  const travelMode = useTravelMode();
  const hasPreset = useHasModePreset(travelMode);
  const navigate = useNavigate();
  // "Starta [läge]" direkt i mobil-drawern där färdsättet väljs — annars låg start-knappen i en
  // ANNAN panel (Near me) och det såg ut som att inget hände (fältrapport 2026-08-16).
  const startTravel = () => { startFieldNav(); onModeSelected?.(); navigate('/explore'); };
  // Gå-läge: fyll alla lager + släck historiska rasterkartor (de täcker vägarna). Engångsåtgärd
  // vid val (funktionella updaters → sekventiellt, ingen race), inte per render → förblir togglingsbart.
  // Släck historiska rasterlager (fula färgade fyrkanter som täcker vägarna): historical_maps +
  // dess barn (histmap_*) + paleo_shoreline. Anropas DIREKT efter onShowAll (då är de PÅ → en
  // toggle var flippar dem AV; funktionella updaters = sekventiellt, ingen race).
  const hideHistoricalRasters = () => {
    const hist = legendItems.find((i) => i.id === 'historical_maps');
    ['historical_maps', ...(hist?.children?.map((c) => c.id) ?? []), 'paleo_shoreline']
      .forEach((id) => onToggleItem(id));
  };
  // Platt {id:enabled} ur legendträdet (hoppa länk-typer) — för spara/applicera preset.
  const flattenEnabled = (): Record<string, boolean> => {
    const out: Record<string, boolean> = {};
    const walk = (items: typeof legendItems) => items.forEach((it) => {
      if (it.type !== 'link') out[it.id] = !!it.enabled;
      if (it.children) walk(it.children);
    });
    walk(legendItems);
    return out;
  };
  const saveCurrentAsPreset = () => saveModePreset(travelMode, flattenEnabled());
  // Dum by design: sätt bara färdläget + stäng panelen. useLegendManagers färdläges-seed
  // sköter lagren reaktivt (sparad preset > kurerad mobil-default / allt på) — så det inte blir
  // en kapplöpning mellan MapLegend och hooken. På mobil = kartan öppnar lugn (3 grupper), inte allt.
  const selectMode = (m: TravelMode) => {
    setTravelMode(m);
    onModeSelected?.();  // map-first: stäng mobilpanelen så kartan syns direkt
  };
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['religious_places', 'heritage_sites']);
  
  // Null-vakt på varje count (som LegendCategory) — ETT odefinierat count gav annars NaN som
  // propagerade till hela summan (mobilens "Map Legend NaN"-badge, fältrapport 2026-08-16).
  const totalVisible = legendItems.filter(item => item.enabled).reduce((sum, item) => {
    let total = item.count || 0;
    if (item.children) {
      total += item.children.filter(child => child.enabled).reduce((childSum, child) => childSum + (child.count || 0), 0);
    }
    return sum + total;
  }, 0);
  
  // Länk-poster (t.ex. spökvandringen) har ingen enabled/switch — de ska inte räknas
  // med i "alla på?"-bedömningen, annars låser en enda länk fast "Visa alla".
  // Historiska rasterkartor räknas INTE in i "alla på?" (de hålls medvetet av i Visa alla),
  // annars kan knappen aldrig flippa till "Dölj alla".
  const toggleableItems = legendItems.filter(item => item.type !== 'link');
  const dataItems = toggleableItems.filter(item => item.id !== 'historical_maps' && item.id !== 'paleo_shoreline');
  const allEnabled = dataItems.length > 0 && dataItems.every(item => item.enabled);

  const handleToggleAll = () => {
    if (allEnabled && onHideAll) {
      console.log(`🙈 All items enabled, hiding all`);
      onHideAll();
    } else if (!allEnabled && onShowAll) {
      console.log(`👁️ Not all items enabled, showing all`);
      onShowAll();
      hideHistoricalRasters();  // "Visa alla" ska INTE tända de fula rasterfyrkanterna
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
        // Länk-typ: ingen switch/räknare — öppnar href i ny flik. Speglar LegendItemComponents
        // rad-design (vänster ikon-kolumn + label + höger-affordans) så den inte bryter mot övriga
        // rader (Daniel: "följer inte designen på resten av legenden"). Höger = ExternalLink i st.f. switch.
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between py-2 px-2 rounded-md bg-slate-800/90 border border-slate-600/50 shadow-sm text-gray-100 hover:bg-slate-700/90 hover:text-white transition-all duration-200"
        >
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-center w-4 h-4 flex-shrink-0 mt-0.5">
              <Sparkles className="h-3 w-3" style={{ color: '#d97706' }} />
            </div>
            <span className="text-xs flex-1 leading-tight break-words font-medium" title={item.label}>
              {item.label}
            </span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 ml-2" />
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

        {/* Färdsätt (Gå/Cykla/Kör) + spara egen vy — BARA på mobil (fält/billäge). Desktop behöver
            det inte (Daniel); där räcker legend-lagren + eget sparläge via konto. */}
        {isMobile && (
        <div className="pt-1">
          <div className="flex gap-1">
            {(['foot', 'bike', 'car'] as TravelMode[]).map((m) => {
              const lbl = TRAVEL_MODE_LABELS[m];
              const active = travelMode === m;
              return (
                <button
                  key={m}
                  onClick={() => selectMode(m)}
                  className={`flex-1 py-1.5 rounded border text-[11px] transition-colors ${active ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
                >
                  {lbl.icon} {sv ? lbl.sv : lbl.en}
                </button>
              );
            })}
          </div>
          {/* Primär-action: starta valt färdsätt direkt härifrån (live-GPS-fältläge på kartan). */}
          <button
            onClick={startTravel}
            className="mt-1.5 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
            style={{ minHeight: 44 }}
          >
            <Navigation2 className="h-4 w-4" />
            {sv
              ? (travelMode === 'foot' ? 'Starta gångläge' : travelMode === 'bike' ? 'Starta cykelläge' : 'Starta körläge')
              : (travelMode === 'foot' ? 'Start walking mode' : travelMode === 'bike' ? 'Start cycling mode' : 'Start driving mode')}
          </button>
          {/* Spara/återställ egen vy per läge (localStorage; funkar utan konto). */}
          <div className="flex items-center gap-1 px-1 pt-1">
            <Button onClick={saveCurrentAsPreset} variant="ghost" size="sm"
              className="h-6 px-2 text-[10px] text-emerald-300 hover:bg-emerald-900/30 flex items-center gap-1">
              <Save className="h-3 w-3" /> {sv ? 'Spara' : 'Save'} {sv ? TRAVEL_MODE_LABELS[travelMode].sv : TRAVEL_MODE_LABELS[travelMode].en}
            </Button>
            {hasPreset && (
              <>
                <Button onClick={() => clearModePreset(travelMode)} variant="ghost" size="sm"
                  className="h-6 px-1.5 text-[10px] text-gray-400 hover:bg-gray-700/50 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> {sv ? 'standard' : 'default'}
                </Button>
                <span className="text-[10px] text-emerald-400/80 ml-auto">✓ {sv ? 'egen vy' : 'custom'}</span>
              </>
            )}
          </div>
          {travelMode === 'foot' && !hasPreset && (
            <p className="px-1 pt-0.5 text-[10px] text-gray-500">{sv ? 'Gåläge: alla lager på, historiska kartor av.' : 'Walking: all layers on, historical maps off.'}</p>
          )}
        </div>
        )}
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
