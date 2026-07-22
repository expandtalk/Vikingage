
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ship, Shield, Crown, Anchor } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { LEDUNG_BY_REGION, LedungArea } from "@/utils/ledungSystem/ledungAreas";

interface RegionalLegendProps {
  className?: string;
}

const getRegionIcon = (region: string) => {
  switch (region) {
    case 'svealand':
      return Crown;
    case 'gotaland':
      return Shield;
    case 'kustomraden':
      return Anchor;
    case 'special':
      return Ship;
    default:
      return Shield;
  }
};

const getRegionTitle = (region: string) => {
  switch (region) {
    case 'svealand':
      return 'Svealands ledungsområden';
    case 'gotaland':
      return 'Götalands ledungsområden';
    case 'kustomraden':
      return 'Kustområdenas specialområden';
    case 'special':
      return 'Särskilda områden';
    default:
      return region;
  }
};

const RegionSection: React.FC<{ region: string; areas: LedungArea[] }> = ({ region, areas }) => {
  const IconComponent = getRegionIcon(region);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="h-4 w-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-white">{getRegionTitle(region)}</h4>
      </div>

      <div className="space-y-1 ml-6">
        {areas.map((area) => (
          <div key={area.id} className="flex items-center gap-2 py-1">
            <div
              className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"
              style={{ backgroundColor: area.color }}
            />
            <span className="text-xs text-gray-300 truncate" title={area.name}>
              {area.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RegionalLegend: React.FC<RegionalLegendProps> = ({ className = "" }) => {
  const { t } = useLanguage();

  return (
    <Card className={`bg-gray-950/95 backdrop-blur-md border-gray-600/50 ${className}`}>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-white flex items-center gap-2 text-xs">
          <Ship className="h-3 w-3" />
          Ledungsområden (schematiska)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 pb-2">
        <ScrollArea className="h-[350px] px-4">
          <div className="space-y-0 pt-0">
            {Object.entries(LEDUNG_BY_REGION).map(([region, areas]) => (
              <RegionSection key={region} region={region} areas={areas} />
            ))}
            
            <div className="pt-3 border-t border-gray-600/50 mt-3 space-y-2">
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Ledungssystem (allmän princip, ur landskapslagarna):</strong> 1 hundare ≈ 4 skepp ≈ 100 man;
                varje skepp ~24 roddare + styrman. Böter i marker.
              </p>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                ⚠︎ Områdesgränserna här är <strong>schematiska</strong> och de tidigare per-områdes-skeppskvoterna
                var inte källbelagda — de har tagits bort. En källbelagd indelning kräver härads-/sockenpolygoner
                (Geotorget) och kan då byggas på riktigt.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
