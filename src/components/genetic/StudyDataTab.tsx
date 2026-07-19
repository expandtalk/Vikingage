
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Dna } from "lucide-react";
import { DatabaseSite, DatabaseIndividual } from '@/hooks/useGeneticData';
import { useLanguage } from "@/contexts/LanguageContext";

interface StudyDataTabProps {
  filteredSites: DatabaseSite[];
  individuals: DatabaseIndividual[];
}

export const StudyDataTab: React.FC<StudyDataTabProps> = ({ filteredSites, individuals }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    dating: 'Datering:',
    notSpecified: 'Ej specificerad',
    individuals: 'Individer:',
    burialType: 'Begravningstyp:',
    noDescription: 'Ingen beskrivning tillgänglig',
    geneticData: 'Genetiska data:',
    coordinates: 'Koordinater:',
    noResults: 'Inga arkeologiska platser hittades som matchar sökkriterier.',
  } : {
    dating: 'Dating:',
    notSpecified: 'Not specified',
    individuals: 'Individuals:',
    burialType: 'Burial type:',
    noDescription: 'No description available',
    geneticData: 'Genetic data:',
    coordinates: 'Coordinates:',
    noResults: 'No archaeological sites found matching your search criteria.',
  };

  const getIndividualCountBadgeColor = (count: number) => {
    if (count === 1) return 'bg-blue-100 text-blue-800';
    if (count <= 3) return 'bg-green-100 text-green-800';
    if (count <= 7) return 'bg-orange-100 text-orange-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getPeriodColor = (period: string) => {
    switch (period.toLowerCase()) {
      case 'pre-viking': return 'bg-slate-100 text-slate-800';
      case 'viking': return 'bg-red-100 text-red-800';
      case 'late viking': return 'bg-orange-100 text-orange-800';
      case 'medieval': return 'bg-green-100 text-green-800';
      case 'post-medieval': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSiteIndividuals = (siteId: string) => {
    return individuals.filter(individual => individual.site_id === siteId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSites.map((site) => {
        const siteIndividuals = getSiteIndividuals(site.id);
        
        return (
          <Card key={site.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {site.name}
                </CardTitle>
                <Badge className={getPeriodColor(site.period)}>
                  {site.period}
                </Badge>
              </div>
              <CardDescription className="text-slate-300">
                {site.location}, {site.parish}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-slate-300 text-sm">
                <Calendar className="h-4 w-4 inline mr-1" />
                <strong>{c.dating}</strong> {site.dating || c.notSpecified}
              </div>

              <div className="text-slate-300 text-sm">
                <Users className="h-4 w-4 inline mr-1" />
                <strong>{c.individuals}</strong>
                <Badge className={`ml-2 ${getIndividualCountBadgeColor(siteIndividuals.length)}`}>
                  {siteIndividuals.length}
                </Badge>
              </div>

              <div className="text-slate-300 text-sm">
                <strong>{c.burialType}</strong> {site.burial_type || c.notSpecified}
              </div>

              <p className="text-slate-200 text-sm">
                {site.description && site.description.length > 150
                  ? `${site.description.substring(0, 150)}...`
                  : site.description || c.noDescription}
              </p>

              {siteIndividuals.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-slate-200 text-sm">
                    <Dna className="h-4 w-4 inline mr-1" />
                    <strong>{c.geneticData}</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {siteIndividuals.map((individual) => (
                        <Badge key={individual.id} variant="outline" className="text-xs">
                          {individual.sample_id} ({individual.genetic_sex})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {site.coordinates && site.coordinates.y && site.coordinates.x && (
                <div className="text-slate-400 text-xs">
                  <strong>{c.coordinates}</strong> {site.coordinates.y.toFixed(4)}, {site.coordinates.x.toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {filteredSites.length === 0 && (
        <div className="col-span-full text-center text-slate-300 py-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{c.noResults}</p>
        </div>
      )}
    </div>
  );
};
