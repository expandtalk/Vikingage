import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDeityPlaces } from '@/utils/religiousLocations/religiousPlacesData';

// Endast gudar med faktiska, koordinatsatta kultplatser i RELIGIOUS_PLACES.
// Övriga gudar saknar attribuerbara kultplatser → ingen siffra visas.
// INGA påhittade "omnämnanden"-tal — bara verklig, katalogförd kultplatsdata.
const DEITY_KEY: Record<string, string> = {
  Oden: 'odin', Tor: 'thor', Frej: 'frey', Frigg: 'frigg', Njord: 'njord', Ull: 'ull',
};

interface GodData {
  name: string;
  nameOldNorse: string;
  category: 'aesir' | 'vanir' | 'giant' | 'other';
  domain: string[];
  description: string;
  symbols: string[];
  image: string; // egna copyright-bilder i public/excursion-photos/gudar/
}

const IMG = '/excursion-photos/gudar';

const VIKING_GODS_SORTED: GodData[] = [
  {
    name: 'Oden',
    nameOldNorse: 'Óðinn',
    category: 'aesir',
    domain: ['Visdom', 'Krig', 'Död', 'Poesi'],
    description: 'Allfather, högste gud bland asarna. Envägd gud som offrade sitt öga för visdom.',
    symbols: ['Gungnir', 'Sleipner', 'Huginn & Muninn'],
    image: `${IMG}/oden-styrka-beskydd.jpg`,
  },
  {
    name: 'Tor',
    nameOldNorse: 'Þórr',
    category: 'aesir',
    domain: ['Åska', 'Styrka', 'Beskydd'],
    description: 'Åskguden, folkets beskyddare mot jättar och ondska. Son till Oden.',
    symbols: ['Mjölnir', 'Järnhandskar', 'Megingjörð'],
    image: `${IMG}/tor-aska-styrka-beskydd.jpg`,
  },
  {
    name: 'Frej',
    nameOldNorse: 'Freyr',
    category: 'vanir',
    domain: ['Fruktbarhet', 'Välstånd', 'Fred'],
    description: 'Fruktbarhets- och välståndsgud från vanernas släkt. Herre över Alfheim.',
    symbols: ['Gullinbursti', 'Skidbladner', 'Kornax'],
    image: `${IMG}/frej-fruktbarhet.jpg`,
  },
  {
    name: 'Freja',
    nameOldNorse: 'Freyja',
    category: 'vanir',
    domain: ['Kärlek', 'Skönhet', 'Fruktbarhet'],
    description: 'Kärlekens och skönhetens gudinna. Syster till Frej och mäktigaste gudinna.',
    symbols: ['Brísingamen', 'Hildisvín', 'Seidr'],
    image: `${IMG}/freja-karlek-skonhet-fruktbarhet.jpg`,
  },
  {
    name: 'Frigg',
    nameOldNorse: 'Frigg',
    category: 'aesir',
    domain: ['Modersskap', 'Äktenskap', 'Hem'],
    description: 'Odins hustru och moderskapets gudinna. Kan se framtiden men berättar aldrig vad hon vet.',
    symbols: ['Spinnrock', 'Falkham', 'Nyckel'],
    image: `${IMG}/frigg-moderskap-aktenskap.jpg`,
  },
  {
    name: 'Balder',
    nameOldNorse: 'Baldr',
    category: 'aesir',
    domain: ['Ljus', 'Godhet', 'Renhet'],
    description: 'Ljusets och godhetens gud, vackraste av alla gudar. Odins och Friggs älskade son.',
    symbols: ['Hringhorni', 'Draupnir', 'Ljus'],
    image: `${IMG}/balder-godhet-renhet.jpg`,
  },
  {
    name: 'Loke',
    nameOldNorse: 'Loki',
    category: 'other',
    domain: ['List', 'Skepnadsskifte', 'Kaos'],
    description: 'Den vackre och listige skepnadsskiftaren av jätteblod, upptagen bland asarna. Både gudarnas hjälpare och deras undergångs upphov — far till Fenrisulven, Midgårdsormen och Hel.',
    symbols: ['Skepnadsskifte', 'Eld', 'Nät'],
    image: `${IMG}/loke-list-skepnadsskiftare.jpg`,
  },
  {
    name: 'Ull',
    nameOldNorse: 'Ullr',
    category: 'aesir',
    domain: ['Jakt', 'Bågskytte', 'Vinter'],
    description: 'Jaktens och bågskyttes gud. Styvson till Tor och expert på skidor.',
    symbols: ['Båge', 'Skidor', 'Sköld'],
    image: `${IMG}/ull-jakt-bagskytte-vinter.jpg`,
  },
  {
    name: 'Njord',
    nameOldNorse: 'Njörðr',
    category: 'vanir',
    domain: ['Hav', 'Vind', 'Rikedom'],
    description: 'Havets och vindens gud. Far till Frej och Freja, från vanernas släkt.',
    symbols: ['Hav', 'Skepp', 'Fiskenät'],
    image: `${IMG}/njord-hav-land-rikedom.jpg`,
  },
  {
    name: 'Tyr',
    nameOldNorse: 'Týr',
    category: 'aesir',
    domain: ['Krig', 'Rättvisa', 'Mod'],
    description: 'Krigsgud och rättvisa. Offrade sin hand för att binda Fenrisulven.',
    symbols: ['Svärd', 'Rättvåg', 'Kedja'],
    image: `${IMG}/tyr-krig-rattvisa-mod.jpg`,
  },
  {
    name: 'Idun',
    nameOldNorse: 'Iðunn',
    category: 'aesir',
    domain: ['Ungdom', 'Förnyelse'],
    description: 'Ungdomens gudinna som bevarar gudarnas ungdom med sina magiska äpplen.',
    symbols: ['Äpplen', 'Vår', 'Ungdom'],
    image: `${IMG}/idun-ungdom-fornyelse.jpg`,
  },
  {
    name: 'Draugen',
    nameOldNorse: 'Draugr',
    category: 'other',
    domain: ['Gengångare', 'Övermänsklig styrka'],
    description: 'Ingen gud utan ett fruktat väsen: den levande döde som vaktar sin gravhög med övermänsklig styrka. Draugen kunde växa i storlek, och i sagorna måste hjälten brottas ned honom för att vinna gravens skatt.',
    symbols: ['Gravhög', 'Skatt', 'Mörker'],
    image: `${IMG}/draugen-farlig-varelse.jpg`,
  },
];

interface GodCardsGridProps {
  // Fokusera EN guds kultplatser på kartan (legend-nyckel religious_<deity>), null = alla.
  onFocusDeity?: (deityKey: string | null) => void;
}

export const GodCardsGrid: React.FC<GodCardsGridProps> = ({ onFocusDeity }) => {
  const [selectedGod, setSelectedGod] = useState<string | null>(null);

  const handleGodClick = (godName: string, cultSiteCount: number) => {
    const deity = DEITY_KEY[godName];
    // Gudar utan katalogförda kultplatser kan inte visas på kartan → ingen filtrering.
    if (!deity || cultSiteCount === 0) return;
    if (selectedGod === godName) {
      setSelectedGod(null);
      onFocusDeity?.(null); // klick igen = visa alla gudars kultplatser
    } else {
      setSelectedGod(godName);
      onFocusDeity?.(`religious_${deity}`);
    }
  };
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'aesir': return 'bg-blue-600 text-white';
      case 'vanir': return 'bg-green-600 text-white';
      case 'giant': return 'bg-red-600 text-white';
      case 'other': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'aesir': return 'Aser';
      case 'vanir': return 'Vaner';
      case 'giant': return 'Jätte';
      case 'other': return 'Väsen';
      default: return category;
    }
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nordiska Gudar & Väsen</h2>
            <p className="text-muted-foreground">Klicka på en gud för att visa dess kultplatser på kartan</p>
          </div>
          {selectedGod && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedGod(null); onFocusDeity?.(null); }}
            >
              Visa alla gudar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VIKING_GODS_SORTED.map((god) => {
            // Verklig siffra: antal katalogförda, koordinatsatta kultplatser för guden.
            const cultSiteCount = getDeityPlaces(DEITY_KEY[god.name] ?? '').length;
            return (
            <Card
              key={god.name}
              className={`overflow-hidden transition-all duration-200 group ${
                cultSiteCount > 0 ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
              } ${selectedGod === god.name ? 'ring-2 ring-accent shadow-lg' : ''}`}
              onClick={() => handleGodClick(god.name, cultSiteCount)}
            >
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={god.image}
                  alt={`${god.name} (${god.nameOldNorse})`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-2 right-2 ${getCategoryBadgeColor(god.category)}`}>
                  {getCategoryName(god.category)}
                </Badge>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-2">
                  <CardTitle className="text-lg text-white">{god.name}</CardTitle>
                  <p className="text-sm text-white/70">{god.nameOldNorse}</p>
                </div>
              </div>

              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Områden:</p>
                  <div className="flex flex-wrap gap-1">
                    {god.domain.slice(0, 3).map((domain) => (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                    {god.domain.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{god.domain.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {god.description}
                </p>

                {cultSiteCount > 0 ? (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    {cultSiteCount} {cultSiteCount === 1 ? 'känd kultplats' : 'kända kultplatser'} i katalogen
                  </div>
                ) : (
                  <div className="pt-2 border-t text-xs text-muted-foreground/60 italic">
                    Inga katalogförda kultplatser
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
