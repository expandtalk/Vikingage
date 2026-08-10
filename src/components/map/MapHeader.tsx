
import React from 'react';
import { useSearchParams } from "react-router-dom";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLanguage } from "@/contexts/LanguageContext";

// Vissa fokus-lägen (/explore?focus=…) är egna forskningsvyer och förtjänar en egen
// sektionsrubrik i st.f. den generella "Utforska". Saknas fokus i tabellen → default nedan.
const FOCUS_TITLES: Record<string, { sv: string; en: string }> = {
  marine: { sv: 'Marinarkeologi', en: 'Marine archaeology' },
};

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
  const [searchParams] = useSearchParams();
  if (isMobile) return null;

  // Kartrubriken är sajtens sektionsnamn, inte en period — sajten heter redan Viking Age,
  // så rubriken ska vara "Explore"/"Utforska" (Daniel). Perioden syns i tidsfiltret/badgesen.
  // Undantag: dedikerade fokus-vyer (t.ex. marinarkeologi) får sin egen rubrik.
  const focus = searchParams.get('focus') ?? '';
  const getTitle = () => {
    const t = FOCUS_TITLES[focus];
    if (t) return language === 'sv' ? t.sv : t.en;
    return language === 'sv' ? 'Utforska' : 'Explore';
  };

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
