import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, Sword, Heart, Shield, Mountain, Eye, Trees } from "lucide-react";
import { getDeityPlaces } from '@/utils/religiousLocations/religiousPlacesData';

// Endast gudar med faktiska, koordinatsatta kultplatser. Inga påhittade tal.
const DEITY_KEY: Record<string, string> = {
  Oden: 'odin', Tor: 'thor', Frej: 'frey', Frigg: 'frigg', 'Njörd': 'njord', Ull: 'ull',
};

interface GodData {
  name: string;
  nameOldNorse: string;
  category: 'aesir' | 'vanir' | 'giant' | 'dwarf' | 'other';
  domain: string[];
  description: string;
  symbols: string[];
  icon: React.ReactNode;
  color: string;
}

const VIKING_GODS: GodData[] = [
  {
    name: 'Oden',
    nameOldNorse: 'Óðinn',
    category: 'aesir',
    domain: ['Visdom', 'Krig', 'Död', 'Poesi'],
    description: 'Allfather, högste gud bland asarna. Envägd gud som offrade sitt öga för visdom.',
    symbols: ['Gungnir', 'Sleipner', 'Huginn & Muninn'],
    icon: <Eye className="h-5 w-5" />,
    color: 'from-blue-600 to-purple-700'
  },
  {
    name: 'Tor',
    nameOldNorse: 'Þórr',
    category: 'aesir',
    domain: ['Åska', 'Styrka', 'Beskydd'],
    description: 'Åskguden, folkets beskyddare mot jättar och ondska. Son till Oden.',
    symbols: ['Mjölnir', 'Järnhandskar', 'Megingjörð'],
    icon: <Zap className="h-5 w-5" />,
    color: 'from-yellow-500 to-red-600'
  },
  {
    name: 'Frej',
    nameOldNorse: 'Freyr',
    category: 'vanir',
    domain: ['Fruktbarhet', 'Välstånd', 'Fred'],
    description: 'Fruktbarhets- och välståndsgud från vanernas släkt. Herre över Alfheim.',
    symbols: ['Gullinbursti', 'Skidbladner', 'Kornax'],
    icon: <Mountain className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-600'
  },
  {
    name: 'Freja',
    nameOldNorse: 'Freyja',
    category: 'vanir',
    domain: ['Kärlek', 'Skönhet', 'Fruktbarhet'],
    description: 'Kärleks- och skönhetsgudinnan. Äger hälften av de stupade krigarna.',
    symbols: ['Brísingamen', 'Falkdräkt', 'Hildisvíni'],
    icon: <Heart className="h-5 w-5" />,
    color: 'from-pink-500 to-rose-600'
  },
  {
    name: 'Balder',
    nameOldNorse: 'Baldr',
    category: 'aesir',
    domain: ['Ljus', 'Renhet', 'Rättvisa'],
    description: 'Ljusets gud, vackrast och visast bland gudarna. Odens son.',
    symbols: ['Draupner', 'Hringhorni', 'Ljus'],
    icon: <Crown className="h-5 w-5" />,
    color: 'from-amber-400 to-yellow-500'
  },
  {
    name: 'Loke',
    nameOldNorse: 'Loki',
    category: 'other',
    domain: ['List', 'Förändring', 'Eld'],
    description: 'Trickster-guden, asarnas blodsbror men också deras fiende. Föränderlig natur.',
    symbols: ['Eld', 'Nät', 'Förvandling'],
    icon: <Sword className="h-5 w-5" />,
    color: 'from-orange-500 to-red-700'
  },
  {
    name: 'Ty',
    nameOldNorse: 'Týr',
    category: 'aesir',
    domain: ['Krig', 'Rättvisa', 'Mod'],
    description: 'Krigsguden som offrade sin hand för att binda Fenrir. Symbol för rättvisa.',
    symbols: ['Svärd', 'Rättvåg', 'Enhandsgestalt'],
    icon: <Shield className="h-5 w-5" />,
    color: 'from-red-600 to-red-800'
  },
  {
    name: 'Heimdall',
    nameOldNorse: 'Heimdallr',
    category: 'aesir',
    domain: ['Vakt', 'Ljus', 'Hörsel'],
    description: 'Regnbågsbrons väktare, ser och hör allt. Vaktar Bifrost.',
    symbols: ['Gjallarhorn', 'Bifrost', 'Ljus'],
    icon: <Eye className="h-5 w-5" />,
    color: 'from-indigo-500 to-purple-600'
  },
  {
    name: 'Frigg',
    nameOldNorse: 'Frigg',
    category: 'aesir',
    domain: ['Äktenskap', 'Hem', 'Moderlighet'],
    description: 'Odens hustru, drottning bland asarna. Beskyddar hem och familj.',
    symbols: ['Spinnrock', 'Nyckel', 'Fjäder'],
    icon: <Heart className="h-5 w-5" />,
    color: 'from-blue-400 to-blue-600'
  },
  {
    name: 'Njörd',
    nameOldNorse: 'Njörðr',
    category: 'vanir',
    domain: ['Sjöfart', 'Vind', 'Fiske'],
    description: 'Havs- och vindguden från vanernas släkt. Frej och Frejas fader.',
    symbols: ['Skepp', 'Vågor', 'Vind'],
    icon: <Mountain className="h-5 w-5" />,
    color: 'from-blue-500 to-teal-600'
  },
  {
    name: 'Vidar',
    nameOldNorse: 'Víðarr',
    category: 'aesir',
    domain: ['Hämnd', 'Tystnad', 'Skogar'],
    description: 'Den tyste guden, ska hämnas på Fenrir vid Ragnarök. Odens son.',
    symbols: ['Tjocka skor', 'Skog', 'Tystnad'],
    icon: <Trees className="h-5 w-5" />,
    color: 'from-green-700 to-green-900'
  },
  {
    name: 'Vale',
    nameOldNorse: 'Váli',
    category: 'aesir',
    domain: ['Hämnd', 'Rättvisa'],
    description: 'Född för att hämnas Balders död. En dag gammal när han dödade Höder.',
    symbols: ['Pilbåge', 'Hämnd'],
    icon: <Sword className="h-5 w-5" />,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Ull',
    nameOldNorse: 'Ullr',
    category: 'aesir',
    domain: ['Jakt', 'Skidor', 'Pilbågsskytte'],
    description: 'Jakt- och skidguden, mästare med pilbågen. Balders styvson.',
    symbols: ['Pilbåge', 'Skidor', 'Sköld'],
    icon: <Mountain className="h-5 w-5" />,
    color: 'from-emerald-600 to-green-700'
  },
  {
    name: 'Höder',
    nameOldNorse: 'Höðr',
    category: 'aesir',
    domain: ['Mörker', 'Vinter'],
    description: 'Den blinde guden som av misstag dödade Balder, lurad av Loke.',
    symbols: ['Mörker', 'Mistel'],
    icon: <Eye className="h-5 w-5" />,
    color: 'from-gray-700 to-black'
  },
  {
    name: 'Brage',
    nameOldNorse: 'Bragi',
    category: 'aesir',
    domain: ['Poesi', 'Visdom', 'Vältalighet'],
    description: 'Skaldernas gud, mästare av poesi och vältalighet.',
    symbols: ['Harpa', 'Runor', 'Ord'],
    icon: <Crown className="h-5 w-5" />,
    color: 'from-purple-500 to-purple-700'
  },
  {
    name: 'Idun',
    nameOldNorse: 'Iðunn',
    category: 'aesir',
    domain: ['Ungdom', 'Förnyelse'],
    description: 'Vårdens gudinna som bevarar gudarnas ungdom med sina äpplen.',
    symbols: ['Äpplen', 'Vår', 'Ungdom'],
    icon: <Heart className="h-5 w-5" />,
    color: 'from-green-400 to-lime-500'
  }
];

interface GodNamesViewProps {
  onGodSelect?: (godName: string) => void;
  searchQuery?: string;
}

export const GodNamesView: React.FC<GodNamesViewProps> = ({ onGodSelect, searchQuery = '' }) => {
  const filteredGods = VIKING_GODS.filter(god => 
    searchQuery === '' || 
    god.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    god.nameOldNorse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    god.domain.some(domain => domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'aesir': return 'bg-blue-600 text-white';
      case 'vanir': return 'bg-green-600 text-white';
      case 'giant': return 'bg-red-600 text-white';
      case 'dwarf': return 'bg-amber-600 text-white';
      default: return 'bg-purple-600 text-white';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'aesir': return 'Asar';
      case 'vanir': return 'Vaner';
      case 'giant': return 'Jätte';
      case 'dwarf': return 'Dvärg';
      default: return 'Övrigt';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Nordiska Gudar</h2>
        <p className="text-muted-foreground">
          Upptäck gudarna från den fornnordiska mytologin och deras betydelse i vikingatiden
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Visar {filteredGods.length} av {VIKING_GODS.length} gudar
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGods.map((god) => {
          const cultSiteCount = getDeityPlaces(DEITY_KEY[god.name] ?? '').length;
          return (
          <Card
            key={god.name}
            className={`viking-card hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br ${god.color} text-white border-0 shadow-lg hover:shadow-xl`}
            onClick={() => onGodSelect?.(god.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    {god.icon}
                  </div>
                  <Badge className={getCategoryBadgeColor(god.category) + ' text-xs'}>
                    {getCategoryName(god.category)}
                  </Badge>
                </div>
                {cultSiteCount > 0 && (
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {cultSiteCount} {cultSiteCount === 1 ? 'kultplats' : 'kultplatser'}
                  </div>
                )}
              </div>
              <CardTitle className="text-lg text-white">
                {god.name}
              </CardTitle>
              <CardDescription className="text-white/80 text-sm font-medium">
                {god.nameOldNorse}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/90 leading-relaxed">
                {god.description}
              </p>
              
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">Domäner:</h4>
                <div className="flex flex-wrap gap-1">
                  {god.domain.map((domain) => (
                    <Badge 
                      key={domain} 
                      variant="secondary"
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-2">Symboler:</h4>
                <div className="text-xs text-white/80">
                  {god.symbols.join(' • ')}
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {filteredGods.length === 0 && (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Inga gudar hittades</h3>
          <p className="text-muted-foreground">
            Prova att söka efter ett annat namn eller domän
          </p>
        </div>
      )}
    </div>
  );
};