
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Monitor, Microscope, Globe, FlaskConical, Save, RotateCcw } from 'lucide-react';
import { usePanelManager } from '@/hooks/usePanelManager';

const LEGEND_ITEMS = [
  { id: 'runic_inscriptions', label: 'Runinskrifter', category: 'primary' },
  { id: 'valdemar_route', label: 'Valdemars rutt', category: 'routes' },
  { id: 'river_routes', label: 'Flodvägar', category: 'routes' },
  { id: 'ring_fortress', label: 'Ringborgar', category: 'fortifications' },
  { id: 'hillfort', label: 'Fornborgar', category: 'fortifications' },
  { id: 'royal_center', label: 'Kungliga centra', category: 'settlements' },
  { id: 'trading_post_fortress', label: 'Handelsbefästningar', category: 'settlements' },
  { id: 'religious_places', label: 'Religiösa platser', category: 'religious' },
  { id: 'archaeological_finds', label: 'Arkeologiska fynd', category: 'archaeology' },
  { id: 'stake_barriers', label: 'Pålavspärrningar', category: 'military' },
  { id: 'viking_cities', label: 'Vikingastäder', category: 'settlements' },
  { id: 'trade_routes', label: 'Handelsrutter', category: 'routes' }
];

const PANEL_TYPES = [
  { id: 'map', label: 'Karta', icon: Monitor },
  { id: 'legend', label: 'Legend', icon: Microscope },
  { id: 'results', label: 'Resultat', icon: Globe },
  { id: 'search', label: 'Sök', icon: FlaskConical },
  { id: 'filters', label: 'Filter', icon: FlaskConical }
];

export const PanelLayoutManager: React.FC = () => {
  const { presets } = usePanelManager();
  const [selectedPreset, setSelectedPreset] = useState<string>('explore');
  const [presetConfig, setPresetConfig] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getPresetIcon = (presetName: string) => {
    switch (presetName) {
      case 'explorer': return Monitor;
      case 'linguist': return Microscope;
      case 'geographer': return Globe;
      case 'researcher': return FlaskConical;
      default: return Monitor;
    }
  };

  const handleLegendItemToggle = (itemId: string) => {
    setPresetConfig((prev: any) => ({
      ...prev,
      legendItems: {
        ...prev.legendItems,
        [itemId]: !prev.legendItems?.[itemId]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handlePanelToggle = (panelId: string, property: string, value: any) => {
    setPresetConfig((prev: any) => ({
      ...prev,
      panels: {
        ...prev.panels,
        [panelId]: {
          ...prev.panels?.[panelId],
          [property]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Här skulle vi spara till databas/localStorage
    console.log('Saving preset configuration:', selectedPreset, presetConfig);
    setHasUnsavedChanges(false);
  };

  const handleResetChanges = () => {
    setPresetConfig({});
    setHasUnsavedChanges(false);
  };

  const IconComponent = getPresetIcon(selectedPreset);

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Panel Layout Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(presets).map(([key, preset]) => {
              const PresetIcon = getPresetIcon(key);
              const isSelected = selectedPreset === key;
              
              return (
                <Button
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-auto p-3 flex flex-col items-center gap-2 ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-700/50 hover:bg-slate-600/60 text-slate-200'
                  }`}
                >
                  <PresetIcon className="h-4 w-4" />
                  <div className="text-center">
                    <div className="text-xs font-medium">{preset.name}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center justify-between p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
              <span className="text-amber-200 text-sm">Osparade ändringar</span>
              <div className="flex gap-2">
                <Button onClick={handleResetChanges} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Återställ
                </Button>
                <Button onClick={handleSaveChanges} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  Spara
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel Configuration */}
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Panel Synlighet - {presets[selectedPreset]?.name}
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Konfigurera vilka paneler som ska visas och vara minimerade per default
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {PANEL_TYPES.map((panel) => {
            const PanelIcon = panel.icon;
            
            return (
              <div key={panel.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <PanelIcon className="h-5 w-5 text-slate-300" />
                  <Label className="text-white font-medium">{panel.label}</Label>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300 text-sm">Synlig</Label>
                    <Switch
                      checked={presetConfig.panels?.[panel.id]?.visible ?? true}
                      onCheckedChange={(checked) => handlePanelToggle(panel.id, 'visible', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300 text-sm">Minimerad</Label>
                    <Switch
                      checked={presetConfig.panels?.[panel.id]?.minimized ?? false}
                      onCheckedChange={(checked) => handlePanelToggle(panel.id, 'minimized', checked)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Legend Items Configuration */}
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Standard Legend Items - {presets[selectedPreset]?.name}
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Välj vilka legend-objekt som ska vara aktiverade per default
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['primary', 'routes', 'fortifications', 'settlements', 'religious', 'archaeology', 'military'].map((category) => {
              const categoryItems = LEGEND_ITEMS.filter(item => item.category === category);
              
              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-white font-medium capitalize">{category}</h4>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-slate-700/20 rounded">
                        <Label className="text-slate-200 text-sm">{item.label}</Label>
                        <Switch
                          checked={presetConfig.legendItems?.[item.id] ?? false}
                          onCheckedChange={() => handleLegendItemToggle(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
