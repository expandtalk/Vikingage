
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Crown, Heart, Shield, Loader2 } from 'lucide-react';
import { useVikingNames, useVikingNamesStats, type VikingName } from '@/hooks/useVikingNames';
import { useLanguage } from '@/contexts/LanguageContext';

interface VikingNamesViewProps {
  onNameSelect?: (name: string) => void;
}

export const VikingNamesView: React.FC<VikingNamesViewProps> = ({ onNameSelect }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv
    ? {
        title: 'Vikinganamn', intro: 'Utforska autentiska vikingatida personnamn från runinskrifter — mäns och kvinnors namn med betydelser och historisk information',
        search: 'Sök efter namn, betydelse eller historisk info…',
        allGenders: 'Alla kön', male: 'Mansnamn', female: 'Kvinnonamn', allRegions: 'Alla regioner',
        totalNames: 'Totalt antal namn', totalFreq: 'Total förekomst',
        allTab: 'Alla namn', etymology: 'Etymologi', occurrence: 'Förekomst', unit: 'inskrifter',
        loading: 'Laddar vikinganamn…', error: 'Ett fel uppstod när vikinganamnen skulle laddas.',
      }
    : {
        title: 'Viking Names', intro: 'Explore authentic Viking Age personal names from runic inscriptions — men’s and women’s names with meanings and historical information',
        search: 'Search by name, meaning or historical info…',
        allGenders: 'All genders', male: 'Male names', female: 'Female names', allRegions: 'All regions',
        totalNames: 'Total names', totalFreq: 'Total occurrences',
        allTab: 'All names', etymology: 'Etymology', occurrence: 'Occurrence', unit: 'inscriptions',
        loading: 'Loading Viking names…', error: 'An error occurred while loading the Viking names.',
      };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { data: names = [], isLoading: isLoadingNames, error: namesError } = useVikingNames();
  const { data: stats, isLoading: isLoadingStats } = useVikingNamesStats();

  const filteredNames = useMemo(() => {
    if (!names) return [];
    
    return names.filter(name => {
      const matchesSearch = name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (name.historical_info && name.historical_info.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (name.etymology && name.etymology.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGender = selectedGender === 'all' || name.gender === selectedGender;
      const matchesRegion = selectedRegion === 'all' || name.regions.includes(selectedRegion);
      
      return matchesSearch && matchesGender && matchesRegion;
    });
  }, [names, searchQuery, selectedGender, selectedRegion]);

  const maleNames = filteredNames.filter(n => n.gender === 'male');
  const femaleNames = filteredNames.filter(n => n.gender === 'female');

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? Shield : Heart;
  };

  const getGenderColor = (gender: string) => {
    return gender === 'male' ? 'text-blue-400' : 'text-pink-400';
  };

  // Get unique regions for filter
  const allRegions = useMemo(() => {
    if (!names) return [];
    return [...new Set(names.flatMap(name => name.regions))].sort();
  }, [names]);

  if (isLoadingNames) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">{c.loading}</span>
      </div>
    );
  }

  if (namesError) {
    return (
      <Card className="bg-red-500/10 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">{c.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            {c.title}
          </CardTitle>
          <p className="text-slate-300">
            {c.intro}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder={c.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{c.allGenders}</SelectItem>
                <SelectItem value="male">{c.male}</SelectItem>
                <SelectItem value="female">{c.female}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{c.allRegions}</SelectItem>
                {allRegions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.totalNames}</p>
                <p className="text-2xl font-bold text-white">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.total_names || 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.male}</p>
                <p className="text-2xl font-bold text-blue-400">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.male_names || 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.female}</p>
                <p className="text-2xl font-bold text-pink-400">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.female_names || 0)}
                </p>
              </div>
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.totalFreq}</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.total_frequency || 0)}
                </p>
              </div>
              <Crown className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Names List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/60">
          <TabsTrigger value="all">{c.allTab} ({filteredNames.length})</TabsTrigger>
          <TabsTrigger value="male">{c.male} ({maleNames.length})</TabsTrigger>
          <TabsTrigger value="female">{c.female} ({femaleNames.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNames.map((nameData) => {
              const GenderIcon = getGenderIcon(nameData.gender);
              return (
                <Card 
                  key={nameData.id} 
                  className="bg-slate-800/60 backdrop-blur-md border-slate-600/30 hover:bg-slate-700/60 transition-colors cursor-pointer"
                  onClick={() => onNameSelect?.(nameData.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg">{nameData.name}</h3>
                      <GenderIcon className={`h-5 w-5 ${getGenderColor(nameData.gender)}`} />
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-2">{nameData.meaning}</p>
                    
                    {nameData.etymology && (
                      <p className="text-slate-400 text-xs mb-2 italic">{c.etymology}: {nameData.etymology}</p>
                    )}
                    
                    {nameData.historical_info && (
                      <p className="text-slate-400 text-xs mb-3 italic">{nameData.historical_info}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">{c.occurrence}:</span>
                        <Badge variant="outline" className="text-slate-300">
                          {nameData.frequency} {c.unit}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {nameData.regions.map((region) => (
                          <Badge key={region} variant="secondary" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="male" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maleNames.map((nameData) => (
              <Card 
                key={nameData.id} 
                className="bg-slate-800/60 backdrop-blur-md border-slate-600/30 border-l-4 border-l-blue-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                onClick={() => onNameSelect?.(nameData.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{nameData.name}</h3>
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{nameData.meaning}</p>
                  {nameData.etymology && (
                    <p className="text-slate-400 text-xs mb-2 italic">{c.etymology}: {nameData.etymology}</p>
                  )}
                  {nameData.historical_info && (
                    <p className="text-slate-400 text-xs mb-3 italic">{nameData.historical_info}</p>
                  )}
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-slate-300">
                      {nameData.frequency} {c.unit}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {nameData.regions.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="female" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {femaleNames.map((nameData) => (
              <Card 
                key={nameData.id} 
                className="bg-slate-800/60 backdrop-blur-md border-slate-600/30 border-l-4 border-l-pink-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                onClick={() => onNameSelect?.(nameData.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{nameData.name}</h3>
                    <Heart className="h-5 w-5 text-pink-400" />
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{nameData.meaning}</p>
                  {nameData.etymology && (
                    <p className="text-slate-400 text-xs mb-2 italic">{c.etymology}: {nameData.etymology}</p>
                  )}
                  {nameData.historical_info && (
                    <p className="text-slate-400 text-xs mb-3 italic">{nameData.historical_info}</p>
                  )}
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-slate-300">
                      {nameData.frequency} {c.unit}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {nameData.regions.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
