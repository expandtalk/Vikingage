
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ARCHAEOLOGICAL_PERIODS } from "@/utils/archaeologicalFinds/periods";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface MapHeaderProps {
  isVikingMode: boolean;
  totalLocations: number;
  geoCount: number;
  selectedTimePeriod?: string;
  totalInscriptions?: number;
}

// Function to get period display info
const getPeriodDisplayInfo = (selectedTimePeriod: string) => {
  const period = ARCHAEOLOGICAL_PERIODS.find(p => p.id === selectedTimePeriod);
  if (!period) {
    return {
      name: 'Okänd period',
      nameEn: 'Unknown period',
      years: ''
    };
  }

  const startYear = Math.abs(period.startYear);
  const endYear = Math.abs(period.endYear);
  
  let yearsDisplay = '';
  if (period.startYear < 0 && period.endYear < 0) {
    yearsDisplay = `${startYear}-${endYear} f.Kr.`;
  } else if (period.startYear < 0 && period.endYear > 0) {
    yearsDisplay = `${startYear} f.Kr.-${endYear} e.Kr.`;
  } else {
    yearsDisplay = `${period.startYear}-${period.endYear} e.Kr.`;
  }

  return {
    name: period.name,
    nameEn: period.nameEn,
    years: yearsDisplay
  };
};

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
  if (isMobile) return null;

  // Get correct period info based on selectedTimePeriod
  const periodInfo = getPeriodDisplayInfo(selectedTimePeriod);
  
  const getTitle = () => {
    if (isVikingMode) {
      if (selectedTimePeriod === 'viking_age') {
        return `Vikingatiden (${periodInfo.years})`;
      } else {
        return `${periodInfo.name} (${periodInfo.years})`;
      }
    } else {
      if (selectedTimePeriod === 'all') {
        return 'Runic Inscriptions Map';
      } else {
        return `${periodInfo.nameEn} (${periodInfo.years})`;
      }
    }
  };

  console.log('MapHeader: Selected time period:', selectedTimePeriod);
  console.log('MapHeader: Period info:', periodInfo);
  console.log('MapHeader: Generated title:', getTitle());

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
