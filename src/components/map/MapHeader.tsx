
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLanguage } from "@/contexts/LanguageContext";

interface MapHeaderProps {
  isVikingMode: boolean;
  totalLocations: number;
  geoCount: number;
  selectedTimePeriod?: string;
  totalInscriptions?: number;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  isVikingMode,
  totalLocations,
  geoCount,
  selectedTimePeriod = 'viking_age',
  totalInscriptions
}) => {
  // På mobil: dölj hela kartrubriken (titel "…Map" + platser/länder/inskrifter-badges)
  // — tar onödig yta och stats behövs inte i fält (Daniel).
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  if (isMobile) return null;

  // Kartrubriken är sajtens sektionsnamn, inte en period — sajten heter redan Viking Age,
  // så rubriken ska vara "Explore"/"Utforska" (Daniel). Perioden syns i tidsfiltret/badgesen.
  const getTitle = () => (language === 'sv' ? 'Utforska' : 'Explore');

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2 font-norse">
          <MapPin className="h-5 w-5" />
          {getTitle()}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {isVikingMode ? 
              `${totalLocations} platser • ${geoCount} riken` : 
              `${totalLocations} platser • ${geoCount} länder`
            }
          </Badge>
          {totalInscriptions && (
            <Badge variant="outline" className="text-xs border-blue-400 text-blue-200">
              {totalInscriptions} inskrifter
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
