
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Users, MapPin, Eye, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GeneticSummaryStatsProps {
  vikingGeneticMarkersCount: number;
  studySitesCount: number;
  studyIndividualsCount: number;
}

export const GeneticSummaryStats: React.FC<GeneticSummaryStatsProps> = ({
  vikingGeneticMarkersCount,
  studySitesCount,
  studyIndividualsCount
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    title: 'Sammanfattning av genetisk data',
    geneticMarkers: 'Genetiska markörer',
    archaeologicalSites: 'Arkeologiska platser',
    analysedIndividuals: 'Analyserade individer',
    eyeColorsStudied: 'Ögonfärger studerade',
    hairColorsAnalysed: 'Hårfärger analyserade',
    pigmentGenetics: 'Pigmentgenetik',
    populationGenetics: 'Populationsgenetik',
    evolutionaryAdaptation: 'Evolutionär anpassning',
    scandinavianEvolution: 'Skandinavisk evolution',
    uvAdaptation: 'UV-anpassning',
  } : {
    title: 'Genetic data summary',
    geneticMarkers: 'Genetic markers',
    archaeologicalSites: 'Archaeological sites',
    analysedIndividuals: 'Analysed individuals',
    eyeColorsStudied: 'Eye colours studied',
    hairColorsAnalysed: 'Hair colours analysed',
    pigmentGenetics: 'Pigment genetics',
    populationGenetics: 'Population genetics',
    evolutionaryAdaptation: 'Evolutionary adaptation',
    scandinavianEvolution: 'Scandinavian evolution',
    uvAdaptation: 'UV adaptation',
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Dna className="h-6 w-6" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{vikingGeneticMarkersCount}</div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-1">
            <Dna className="h-4 w-4" />
            {c.geneticMarkers}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{studySitesCount}</div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            {c.archaeologicalSites}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{studyIndividualsCount}</div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-1">
            <Users className="h-4 w-4" />
            {c.analysedIndividuals}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400 mb-2">12</div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-1">
            <Eye className="h-4 w-4" />
            {c.eyeColorsStudied}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">4</div>
          <div className="text-sm text-slate-300 flex items-center justify-center gap-1">
            <Palette className="h-4 w-4" />
            {c.hairColorsAnalysed}
          </div>
        </div>
      </CardContent>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge className="bg-blue-600 text-white">{c.pigmentGenetics}</Badge>
          <Badge className="bg-green-600 text-white">{c.populationGenetics}</Badge>
          <Badge className="bg-purple-600 text-white">{c.evolutionaryAdaptation}</Badge>
          <Badge className="bg-amber-600 text-white">{c.scandinavianEvolution}</Badge>
          <Badge className="bg-orange-600 text-white">{c.uvAdaptation}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
