import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const VIKING_GODS = [
  'Odin', 'Thor', 'Freyr', 'Freyja', 'Balder', 'Loki', 'Tyr', 'Heimdall', 
  'Frigg', 'Njörðr', 'Vidar', 'Vali', 'Ullr', 'Höðr', 'Bragi', 'Idunn',
  'Frej', 'Ull', 'Njord', 'Idun', 'Mimer', 'Hel'
];

interface GodNameSearchProps {
  onGodNameSearch: (godName: string) => void;
  onLegendToggle: (id: string) => void;
  compact?: boolean;
}

export const GodNameSearch: React.FC<GodNameSearchProps> = ({ 
  onGodNameSearch, 
  onLegendToggle, 
  compact = false 
}) => {
  const [godSearchQuery, setGodSearchQuery] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const t = {
    placeholder: sv ? 'Sök gudanamn...' : 'Search god names...',
    search: sv ? 'Sök' : 'Search',
    intro: sv
      ? 'Utforska platser associerade med fornnordisk religion och gudar.'
      : 'Explore places associated with Old Norse religion and gods.',
    showOnMap: sv ? 'Visa religiösa platser på kartan' : 'Show religious sites on the map',
    searchingFor: (s: string) => (sv ? `Söker efter ${s}` : `Searching for ${s}`),
    searchingDesc: sv ? 'Letar efter kultplatser och religiösa platser...' : 'Looking for cult sites and religious places...',
  };

  const handleGodSearch = (godName?: string) => {
    const searchTerm = godName || godSearchQuery;
    if (!searchTerm.trim()) return;

    onGodNameSearch(searchTerm);
    onLegendToggle('religious_locations');

    toast({
      title: t.searchingFor(searchTerm),
      description: t.searchingDesc,
    });

    if (!godName) setGodSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGodSearch();
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={t.placeholder}
              value={godSearchQuery}
              onChange={(e) => setGodSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-8 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm"
            />
            <Zap className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-400" />
          </div>
          <Button
            onClick={() => handleGodSearch()}
            size="sm"
            className="bg-amber-600/80 hover:bg-amber-700 text-white text-xs"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {VIKING_GODS.slice(0, 6).map((god) => (
            <Button
              key={god}
              variant="outline"
              size="sm"
              onClick={() => handleGodSearch(god)}
              className="text-xs h-6 px-2 bg-amber-900/20 border-amber-500/30 text-amber-200 hover:bg-amber-800/30"
            >
              {god}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/70">
        {t.intro}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Sök gudanamn..."
            value={godSearchQuery}
            onChange={(e) => setGodSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-8 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm"
          />
          <Zap className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-400" />
        </div>
        <Button
          onClick={() => handleGodSearch()}
          className="bg-amber-600/80 hover:bg-amber-700 text-white text-sm"
        >
          <Search className="h-4 w-4 mr-2" />
          {t.search}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {VIKING_GODS.map((god) => (
          <Button
            key={god}
            variant="outline"
            onClick={() => handleGodSearch(god)}
            className="text-sm h-8 px-3 bg-amber-900/20 border-amber-500/30 text-amber-200 hover:bg-amber-800/30"
          >
            {god}
          </Button>
        ))}
      </div>
      <Button
        variant="link"
        onClick={() => onLegendToggle('religious_locations')}
        className="text-amber-500 hover:text-amber-400 text-sm"
      >
        <Zap className="h-4 w-4 mr-2" />
        {t.showOnMap}
      </Button>
    </div>
  );
};
