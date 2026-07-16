
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Globe, Heart, Users, Activity, Dna } from "lucide-react";
import { DatabaseMarker } from '@/hooks/useGeneticData';
import { useLanguage } from "@/contexts/LanguageContext";

interface VikingGeneticsTabProps {
  filteredMarkers: DatabaseMarker[];
}

export const VikingGeneticsTab: React.FC<VikingGeneticsTabProps> = ({ filteredMarkers }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    unknownMarker: 'Okänd markör',
    origin: 'Ursprung:',
    frequency: 'Frekvens:',
    frequencySuffix: '% i studiepopulation',
    modernDistribution: 'Modern fördelning:',
    historicalSignificance: 'Historisk betydelse:',
    studyEvidence: 'Studiebevis:',
    introduction: 'Introduktion:',
    geographicSpread: 'Geografisk spridning:',
    noResults: 'Inga genetiska markörer hittades som matchar sökkriterier.',
  } : {
    unknownMarker: 'Unknown marker',
    origin: 'Origin:',
    frequency: 'Frequency:',
    frequencySuffix: '% in study population',
    modernDistribution: 'Modern distribution:',
    historicalSignificance: 'Historical significance:',
    studyEvidence: 'Study evidence:',
    introduction: 'Introduction:',
    geographicSpread: 'Geographic distribution:',
    noResults: 'No genetic markers found matching your search criteria.',
  };

  const getMarkerTypeColor = (type: string) => {
    switch (type) {
      case 'mtDNA': return 'bg-pink-100 text-pink-800';
      case 'Y-DNA': return 'bg-blue-100 text-blue-800';
      case 'Autosomal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'mtDNA': return <Heart className="h-5 w-5" />;
      case 'Y-DNA': return <Users className="h-5 w-5" />;
      case 'Autosomal': return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMarkers.map((marker) => (
        <Card key={marker.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {getMarkerIcon(marker.marker_type)}
                {marker.haplogroup || marker.gene || c.unknownMarker}
              </CardTitle>
              <Badge className={getMarkerTypeColor(marker.marker_type)}>
                {marker.marker_type}
              </Badge>
            </div>
            <CardDescription className="text-slate-300">
              {c.origin} {marker.origin}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {marker.frequency && (
              <div className="text-slate-300 text-sm">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                <strong>{c.frequency}</strong> {marker.frequency}{c.frequencySuffix}
              </div>
            )}

            {marker.description && (
              <p className="text-slate-200 text-sm">
                {marker.description}
              </p>
            )}

            {marker.modern_distribution && (
              <div className="text-slate-300 text-sm">
                <Globe className="h-4 w-4 inline mr-1" />
                <strong>{c.modernDistribution}</strong> {marker.modern_distribution}
              </div>
            )}

            {marker.significance && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-slate-200 text-sm">
                  <strong>{c.historicalSignificance}</strong> {marker.significance}
                </div>
              </div>
            )}

            {marker.study_evidence && (
              <div className="bg-blue-900/20 rounded-lg p-3">
                <div className="text-blue-200 text-sm">
                  <strong>{c.studyEvidence}</strong> {marker.study_evidence}
                </div>
              </div>
            )}

            {marker.time_introduction && (
              <div className="text-slate-400 text-xs">
                <Clock className="h-3 w-3 inline mr-1" />
                {c.introduction} {marker.time_introduction}
              </div>
            )}

            {marker.geographic_spread && (
              <div className="text-slate-400 text-xs">
                <strong>{c.geographicSpread}</strong> {marker.geographic_spread}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {filteredMarkers.length === 0 && (
        <div className="col-span-full text-center text-slate-300 py-8">
          <Dna className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{c.noResults}</p>
        </div>
      )}
    </div>
  );
};
