import React, { useState } from 'react';
import { Eye, Zap, Mountain, Heart, Shield, Crown, Sword, Sunrise, Wind, Trees } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  icon: React.ReactNode;
  color: string;
}

const VIKING_GODS_SORTED: GodData[] = [
  {
    name: 'Oden',
    nameOldNorse: 'Óðinn',
    category: 'aesir',
    domain: ['Visdom', 'Krig', 'Död', 'Poesi'],
    description: 'Allfather, högste gud bland asarna. Envägd gud som offrade sitt öga för visdom.',
    symbols: ['Gungnir', 'Sleipner', 'Huginn & Muninn'],
    icon: <Eye className="h-5 w-5" />,
    color: 'from-blue-600 to-purple-700',
  },
  {
    name: 'Tor',
    nameOldNorse: 'Þórr',
    category: 'aesir',
    domain: ['Åska', 'Styrka', 'Beskydd'],
    description: 'Åskguden, folkets beskyddare mot jättar och ondska. Son till Oden.',
    symbols: ['Mjölnir', 'Järnhandskar', 'Megingjörð'],
    icon: <Zap className="h-5 w-5" />,
    color: 'from-yellow-500 to-red-600',
  },
  {
    name: 'Frej',
    nameOldNorse: 'Freyr',
    category: 'vanir',
    domain: ['Fruktbarhet', 'Välstånd', 'Fred'],
    description: 'Fruktbarhets- och välståndsgud från vanernas släkt. Herre över Alfheim.',
    symbols: ['Gullinbursti', 'Skidbladner', 'Kornax'],
    icon: <Mountain className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Freja',
    nameOldNorse: 'Freyja',
    category: 'vanir',
    domain: ['Kärlek', 'Skönhet', 'Fruktbarhet'],
    description: 'Kärlekens och skönhetens gudinna. Syster till Frej och mäktigaste gudinna.',
    symbols: ['Brísingamen', 'Hildisvín', 'Seidr'],
    icon: <Heart className="h-5 w-5" />,
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: 'Frigg',
    nameOldNorse: 'Frigg',
    category: 'aesir',
    domain: ['Modersskap', 'Äktenskap', 'Hem'],
    description: 'Odins hustru och moderskapets gudinna. Kan se framtiden men berättar aldrig vad hon vet.',
    symbols: ['Spinnrock', 'Falkham', 'Nyckel'],
    icon: <Crown className="h-5 w-5" />,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    name: 'Balder',
    nameOldNorse: 'Baldr',
    category: 'aesir',
    domain: ['Ljus', 'Godhet', 'Renhet'],
    description: 'Ljusets och godhetens gud, vackraste av alla gudar. Odins och Friggs älskade son.',
    symbols: ['Hringhorni', 'Draupnir', 'Ljus'],
    icon: <Sunrise className="h-5 w-5" />,
    color: 'from-yellow-400 to-orange-500',
  },
  {
    name: 'Ull',
    nameOldNorse: 'Ullr',
    category: 'aesir',
    domain: ['Jakt', 'Bågskytte', 'Vinter'],
    description: 'Jaktens och bågskyttes gud. Styvson till Tor och expert på skidor.',
    symbols: ['Båge', 'Skidor', 'Sköld'],
    icon: <Sword className="h-5 w-5" />,
    color: 'from-blue-400 to-cyan-600',
  },
  {
    name: 'Njord',
    nameOldNorse: 'Njörðr',
    category: 'vanir',
    domain: ['Hav', 'Vind', 'Rikedom'],
    description: 'Havets och vindens gud. Far till Frej och Freja, från vanernas släkt.',
    symbols: ['Hav', 'Skepp', 'Fiskenät'],
    icon: <Wind className="h-5 w-5" />,
    color: 'from-blue-500 to-teal-600',
  },
  {
    name: 'Tyr',
    nameOldNorse: 'Týr',
    category: 'aesir',
    domain: ['Krig', 'Rättvisa', 'Mod'],
    description: 'Krigsgud och rättvisa. Offrade sin hand för att binda Fenrisulven.',
    symbols: ['Svärd', 'Rättvåg', 'Kedja'],
    icon: <Shield className="h-5 w-5" />,
    color: 'from-red-500 to-orange-600',
  },
  {
    name: 'Idun',
    nameOldNorse: 'Iðunn',
    category: 'aesir',
    domain: ['Ungdom', 'Förnyelse'],
    description: 'Ungdomens gudinna som bevarar gudarnas ungdom med sina magiska äpplen.',
    symbols: ['Äpplen', 'Vår', 'Ungdom'],
    icon: <Trees className="h-5 w-5" />,
    color: 'from-green-400 to-lime-500',
  }
];

// Komprimerade gudabilder (public/excursion-photos/gudar/), mappade på gudsnamn.
const GOD_IMAGES: Record<string, string> = {
  Oden: '/excursion-photos/gudar/oden-styrka-beskydd.jpg',
  Tor: '/excursion-photos/gudar/tor-aska-styrka-beskydd.jpg',
  Frej: '/excursion-photos/gudar/frej-fruktbarhet.jpg',
  Freja: '/excursion-photos/gudar/freja-karlek-skonhet-fruktbarhet.jpg',
  Frigg: '/excursion-photos/gudar/frigg-moderskap-aktenskap.jpg',
  Balder: '/excursion-photos/gudar/balder-godhet-renhet.jpg',
  Njord: '/excursion-photos/gudar/njord-hav-land-rikedom.jpg',
  Tyr: '/excursion-photos/gudar/tyr-krig-rattvisa-mod.jpg',
  Idun: '/excursion-photos/gudar/idun-ungdom-fornyelse.jpg',
};

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
      case 'other': return 'Övrigt';
      default: return category;
    }
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nordiska Gudar</h2>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {VIKING_GODS_SORTED.map((god) => {
            // Verklig siffra: antal katalogförda, koordinatsatta kultplatser för guden.
            const cultSiteCount = getDeityPlaces(DEITY_KEY[god.name] ?? '').length;
            const image = GOD_IMAGES[god.name];
            return (
            <Card
              key={god.name}
              className={`overflow-hidden transition-all duration-200 group ${
                cultSiteCount > 0 ? 'cursor-pointer hover:shadow-lg' : 'opacity-70 cursor-default'
              } ${selectedGod === god.name ? 'ring-2 ring-accent shadow-lg' : ''}`}
              onClick={() => handleGodClick(god.name, cultSiteCount)}
            >
              {image && (
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={image}
                    alt={`${god.name} (${god.nameOldNorse})`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <Badge className={`absolute top-2 right-2 ${getCategoryBadgeColor(god.category)}`}>
                    {getCategoryName(god.category)}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${god.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                    {god.icon}
                  </div>
                  {!image && (
                    <Badge className={getCategoryBadgeColor(god.category)} variant="secondary">
                      {getCategoryName(god.category)}
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{god.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{god.nameOldNorse}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
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