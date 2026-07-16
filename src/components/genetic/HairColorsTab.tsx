
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dna, MapPin, TrendingUp, Users, Eye, Lightbulb, Sun, Snowflake } from "lucide-react";
import { HairColor, HairColorRegion, HairColorGenetics } from './types';
import { hairColorData, hairColorRegions, hairColorGenetics } from './data/hairColorData';
import { useLanguage } from "@/contexts/LanguageContext";

interface HairColorsTabProps {
  searchTerm: string;
}

export const HairColorsTab: React.FC<HairColorsTabProps> = ({ searchTerm }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    simple: 'Enkel',
    moderate: 'Måttlig',
    complex: 'Komplex',
    veryComplex: 'Mycket komplex',
    blondInScandinavia: 'Blont hår i Skandinavien',
    highestGlobalFrequency: 'Högsta globala frekvensen',
    geneticMarkers: 'Genetiska markörer',
    identifiedVariants: 'Identifierade varianter',
    mainGene: 'Huvudgen',
    evolutionaryAge: 'Evolutionär ålder',
    years: 'år',
    scandinavianHunterGatherers: 'Skandinaviska jägare-samlare',
    globalFrequency: 'Global frekvens:',
    scandinavianFrequency: 'Skandinavisk frekvens:',
    mainGenes: 'Huvudgener:',
    more: 'till',
    keyMarkers: 'Nyckelmarkörer:',
    historicalOrigin: 'Historiskt ursprung:',
    evolutionaryAdvantage: 'Evolutionär fördel:',
    detailedAnalysis: 'Detaljerad analys:',
    regionalDistribution: 'Regional fördelning',
    frequency: 'Frekvens:',
    marker: 'Markör:',
    chromosome: 'Kromosom',
    effectSize: 'Effektstorlek:',
    population: 'Population:',
  } : {
    simple: 'Simple',
    moderate: 'Moderate',
    complex: 'Complex',
    veryComplex: 'Very complex',
    blondInScandinavia: 'Blond hair in Scandinavia',
    highestGlobalFrequency: 'Highest global frequency',
    geneticMarkers: 'Genetic markers',
    identifiedVariants: 'Identified variants',
    mainGene: 'Main gene',
    evolutionaryAge: 'Evolutionary age',
    years: 'years',
    scandinavianHunterGatherers: 'Scandinavian hunter-gatherers',
    globalFrequency: 'Global frequency:',
    scandinavianFrequency: 'Scandinavian frequency:',
    mainGenes: 'Main genes:',
    more: 'more',
    keyMarkers: 'Key markers:',
    historicalOrigin: 'Historical origin:',
    evolutionaryAdvantage: 'Evolutionary advantage:',
    detailedAnalysis: 'Detailed analysis:',
    regionalDistribution: 'Regional distribution',
    frequency: 'Frequency:',
    marker: 'Marker:',
    chromosome: 'Chromosome',
    effectSize: 'Effect size:',
    population: 'Population:',
  };

  const [selectedHairColor, setSelectedHairColor] = useState<HairColor | null>(null);
  const [showGenetics, setShowGenetics] = useState(false);

  const filteredHairColors = hairColorData.filter(color => {
    if (searchTerm.length === 0) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      color.color_name.toLowerCase().includes(searchLower) ||
      color.color_name_en.toLowerCase().includes(searchLower) ||
      color.main_genes.some(gene => gene.toLowerCase().includes(searchLower)) ||
      color.key_markers.some(marker => marker.toLowerCase().includes(searchLower)) ||
      color.historical_origin.toLowerCase().includes(searchLower)
    );
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-orange-100 text-orange-800';
      case 'very_complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'simple': return c.simple;
      case 'moderate': return c.moderate;
      case 'complex': return c.complex;
      case 'very_complex': return c.veryComplex;
      default: return complexity;
    }
  };

  const getUVAdaptationIcon = (adaptation: string) => {
    switch (adaptation) {
      case 'very_high_latitude': return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'high_latitude': return <Snowflake className="h-4 w-4 text-blue-400" />;
      case 'moderate_latitude': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'low_latitude': return <Sun className="h-4 w-4 text-orange-500" />;
      default: return <Sun className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-900/20 border-amber-500/30">
          <CardContent className="p-4">
            <div className="text-amber-300 text-sm mb-1">{c.blondInScandinavia}</div>
            <div className="text-white font-bold text-xl">45%</div>
            <div className="text-amber-200 text-xs">{c.highestGlobalFrequency}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-blue-300 text-sm mb-1">{c.geneticMarkers}</div>
            <div className="text-white font-bold text-xl">200+</div>
            <div className="text-blue-200 text-xs">{c.identifiedVariants}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-green-300 text-sm mb-1">{c.mainGene}</div>
            <div className="text-white font-bold text-xl">HERC2</div>
            <div className="text-green-200 text-xs">rs12913832</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-purple-300 text-sm mb-1">{c.evolutionaryAge}</div>
            <div className="text-white font-bold text-xl">8000 {c.years}</div>
            <div className="text-purple-200 text-xs">{c.scandinavianHunterGatherers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hair Color Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHairColors.map((hairColor) => (
          <Card 
            key={hairColor.id} 
            className={`bg-white/5 backdrop-blur-md border-white/10 cursor-pointer transition-all duration-200 ${
              selectedHairColor?.id === hairColor.id ? 'ring-2 ring-amber-500' : 'hover:bg-white/10'
            }`}
            onClick={() => setSelectedHairColor(selectedHairColor?.id === hairColor.id ? null : hairColor)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{hairColor.color_name}</CardTitle>
                  <p className="text-slate-300 text-sm">{hairColor.color_name_en}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getUVAdaptationIcon(hairColor.uv_adaptation)}
                  <Badge className={getComplexityColor(hairColor.genetic_complexity)}>
                    {getComplexityText(hairColor.genetic_complexity)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Frequency Comparison */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{c.globalFrequency}</span>
                  <span className="text-white">{hairColor.global_frequency_percent}%</span>
                </div>
                <Progress value={hairColor.global_frequency_percent} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{c.scandinavianFrequency}</span>
                  <span className="text-amber-300">{hairColor.scandinavian_frequency_percent}%</span>
                </div>
                <Progress value={hairColor.scandinavian_frequency_percent} className="h-2" />
              </div>

              {/* Main Genes */}
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-slate-400 mb-2 text-sm flex items-center gap-1">
                  <Dna className="h-3 w-3" />
                  <span>{c.mainGenes}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hairColor.main_genes.slice(0, 4).map((gene, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {gene}
                    </Badge>
                  ))}
                  {hairColor.main_genes.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{hairColor.main_genes.length - 4} {c.more}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Markers */}
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-slate-400 mb-2 text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{c.keyMarkers}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hairColor.key_markers.map((marker, index) => (
                    <Badge key={index} className="bg-blue-600 text-white text-xs">
                      {marker}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Historical Origin */}
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-slate-400 mb-1 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{c.historicalOrigin}</span>
                </div>
                <p className="text-slate-300 text-xs">{hairColor.historical_origin}</p>
              </div>

              {/* Evolutionary Advantage */}
              <div className="bg-green-900/20 rounded p-3 border border-green-700/30">
                <div className="text-green-400 mb-1 text-sm flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <span>{c.evolutionaryAdvantage}</span>
                </div>
                <p className="text-green-300 text-xs">{hairColor.evolutionary_advantage}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedHairColor && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">
                {c.detailedAnalysis} {selectedHairColor.color_name}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant={showGenetics ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowGenetics(!showGenetics)}
                >
                  <Dna className="h-4 w-4 mr-2" />
                  {c.geneticMarkers}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Regional Distribution */}
            <div>
              <h4 className="text-white font-semibold mb-3">{c.regionalDistribution}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hairColorRegions
                  .filter(region => region.hair_color_id === selectedHairColor.id)
                  .map((region) => (
                    <div key={region.id} className="bg-slate-800/50 rounded p-3">
                      <div className="font-semibold text-amber-300 mb-1">{region.region_name}</div>
                      <div className="text-sm text-slate-300 mb-2">{region.country}</div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">{c.frequency}</span>
                        <span className="text-white font-semibold">{region.frequency_percent}%</span>
                      </div>
                      <Progress value={region.frequency_percent} className="h-1 mb-2" />
                      <p className="text-xs text-slate-400">{region.population_notes}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Genetic Markers */}
            {showGenetics && (
              <div>
                <h4 className="text-white font-semibold mb-3">{c.geneticMarkers}</h4>
                <div className="space-y-3">
                  {hairColorGenetics
                    .filter(genetics => genetics.hair_color_id === selectedHairColor.id)
                    .map((genetics) => (
                      <div key={genetics.id} className="bg-slate-800/50 rounded p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-amber-300 font-semibold mb-1">{genetics.gene_name}</div>
                            <div className="text-sm text-slate-300 mb-2">{c.marker} {genetics.marker_id}</div>
                            <div className="text-xs text-slate-400">
                              {c.chromosome} {genetics.chromosome} • {c.effectSize} {(genetics.effect_size * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-300 mb-2">{genetics.functional_impact}</div>
                            <div className="text-xs text-slate-400">
                              {c.population} {(genetics.population_frequency * 100).toFixed(0)}% • {genetics.discovery_study}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
