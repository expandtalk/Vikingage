
import React from 'react';
import { useSearchParams } from "react-router-dom";
import { CardHeader, CardTitle } from "@/components/ui/card";
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

  const sv = language === 'sv';
  // Räknaren ligger som en DÄMPAD undertext direkt efter rubriken (baslinjejusterad) i st.f.
  // badge-pillar längst till höger — de kolliderade med "Anpassa karta"-legenden som flyter i
  // kartans övre högra hörn (Daniel). tabular-nums håller siffrorna på linje.
  const places = `${totalLocations.toLocaleString(sv ? 'sv-SE' : 'en-GB')} ${sv ? 'platser' : 'places'}`;
  const realms = `${geoCount} ${isVikingMode ? (sv ? 'riken' : 'realms') : (sv ? 'länder' : 'countries')}`;
  return (
    <CardHeader>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <CardTitle className="text-white flex items-center gap-2 font-norse">
          <MapPin className="h-5 w-5" />
          {getTitle()}
        </CardTitle>
        <p className="text-sm text-slate-400 tabular-nums">
          {places} <span className="text-slate-600">•</span> {realms}
          {totalInscriptions ? (
            <> <span className="text-slate-600">·</span> {totalInscriptions.toLocaleString(sv ? 'sv-SE' : 'en-GB')} {sv ? 'inskrifter' : 'inscriptions'}</>
          ) : null}
        </p>
      </div>
    </CardHeader>
  );
};
