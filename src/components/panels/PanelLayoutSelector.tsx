
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Microscope, Globe, FlaskConical } from "lucide-react";
import { usePanelManager } from '@/hooks/usePanelManager';
import { useLanguage } from "@/contexts/LanguageContext";
import { setActiveExploreRole } from '@/hooks/useActiveExploreRole';
import type { UserRole } from '@/hooks/legend/rolePresets';

export const PanelLayoutSelector: React.FC = () => {
  const { activePreset, presets, applyPreset } = usePanelManager();
  const { language } = useLanguage();

  const getPresetIcon = (presetName: string) => {
    switch (presetName) {
      case 'explorer': return Monitor;
      case 'linguist': return Microscope;
      case 'geographer': return Globe;
      case 'researcher': return FlaskConical;
      default: return Monitor;
    }
  };

  const getLocalizedLabels = (presetName: string) => {
    const labels = {
      explorer: {
        sv: { name: 'Explorer Mode', description: 'Balanserat läge för allmän utforskning' },
        en: { name: 'Explorer Mode', description: 'Balanced mode for general exploration' }
      },
      linguist: {
        sv: { name: 'Språkvetare', description: 'Fokus på text och språkanalys' },
        en: { name: 'Linguist', description: 'Focus on text and linguistic analysis' }
      },
      geographer: {
        sv: { name: 'Kulturgeograf', description: 'Stor karta och rumslig analys' },
        en: { name: 'Cultural Geographer', description: 'Large map and spatial analysis' }
      },
      researcher: {
        sv: { name: 'Forskare', description: 'Alla verktyg tillgängliga' },
        en: { name: 'Researcher', description: 'All tools available' }
      }
    };
    
    return labels[presetName as keyof typeof labels]?.[language as keyof typeof labels.explorer] || labels.explorer.en;
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-200">
            {language === 'en' ? 'Panel Layout' : 'Panellayout'}
          </h3>
          <Badge variant="outline" className="text-xs text-slate-300 border-slate-500">
            {getLocalizedLabels(activePreset).name}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.entries(presets).map(([key, preset]) => {
            const IconComponent = getPresetIcon(key);
            const isActive = activePreset === key;
            const localizedLabels = getLocalizedLabels(key);
            
            return (
              <Button
                key={key}
                onClick={() => {
                  console.log('Switching to preset:', key);
                  applyPreset(key);
                  // Drive the legend/map layers per persona, not just the layout.
                  setActiveExploreRole(key as UserRole);
                }}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-auto p-3 flex flex-col items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                    : 'bg-slate-700/50 hover:bg-slate-600/60 text-slate-200 border-slate-500/50'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <div className="text-center">
                  <div className="text-xs font-medium">{localizedLabels.name}</div>
                  <div className="text-xs opacity-75 mt-1">{localizedLabels.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
