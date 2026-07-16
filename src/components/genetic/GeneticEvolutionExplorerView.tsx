import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dna, Eye, Clock, MapPin, Upload, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { VikingGeneticsTab } from './VikingGeneticsTab';
import { HistoricalPeriodsTab } from './HistoricalPeriodsTab';
import { EyeColorsTab } from './EyeColorsTab';
import { StudyDataTab } from './StudyDataTab';
import { GeneticSearchControls } from './GeneticSearchControls';
import { GeneticSummaryStats } from './GeneticSummaryStats';
import { useArchaeologicalSites, useGeneticIndividuals, useGeneticMarkers, useHistoricalPeriods, useBulkImportStudyData } from '@/hooks/useGeneticData';
import { importStudyDataToDatabase } from '@/services/studyDataImporter';
import { EyeColor, EyeColorRegion } from './types';
import { HairColorsTab } from './HairColorsTab';
import { useLanguage } from "@/contexts/LanguageContext";

export const GeneticEvolutionExplorerView: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv
    ? {
        loading: 'Laddar genetisk evolution-data…',
        title: 'Skandinavisk Genetisk Evolution',
        subtitle: 'Utforska 2000 år av genetisk historia från romersk järnålder till nutid',
        source: 'Källa: Rodriguez-Varela et al., 2023',
        publishedIn: 'Publicerad i:',
        readStudy: 'Läs hela studien här',
        importTitle: 'Importera studiedata',
        importDesc: 'Importera Rodriguez-Varela et al. (2023) studiedata till databasen för permanent lagring',
        importing: 'Importerar…',
        importData: 'Importera data',
        importSuccess: 'Import lyckades!',
        importSuccessDesc: 'Studiedata har importerats till databasen. Du kan nu utforska all genetisk data.',
        showingResults: (q: string) => `Visar resultat för "${q}" –`,
        counts: (m: number, p: number, s: number) => `${m} markörer, ${p} perioder, ${s} platser`,
        noResults: 'Inga resultat hittades. Prova ett bredare sökord.',
        tabStudy: 'Studiedata', tabPeriods: 'Tidsperioder', tabEyes: 'Ögonfärger', tabHair: 'Hårfärger',
      }
    : {
        loading: 'Loading genetic evolution data…',
        title: 'Scandinavian Genetic Evolution',
        subtitle: 'Explore 2000 years of genetic history from the Roman Iron Age to the present',
        source: 'Source: Rodriguez-Varela et al., 2023',
        publishedIn: 'Published in:',
        readStudy: 'Read the full study here',
        importTitle: 'Import study data',
        importDesc: 'Import Rodriguez-Varela et al. (2023) study data into the database for permanent storage',
        importing: 'Importing…',
        importData: 'Import data',
        importSuccess: 'Import successful!',
        importSuccessDesc: 'Study data has been imported to the database. You can now explore all genetic data.',
        showingResults: (q: string) => `Showing results for "${q}" –`,
        counts: (m: number, p: number, s: number) => `${m} markers, ${p} periods, ${s} sites`,
        noResults: 'No results found. Try a broader search term.',
        tabStudy: 'Study data', tabPeriods: 'Time periods', tabEyes: 'Eye colours', tabHair: 'Hair colours',
      };
  const [eyeColors, setEyeColors] = useState<EyeColor[]>([]);
  const [eyeColorRegions, setEyeColorRegions] = useState<EyeColorRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('viking-genetics');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);

  // Database hooks
  const { data: dbSites = [], isLoading: sitesLoading, refetch: refetchSites } = useArchaeologicalSites();
  const { data: dbIndividuals = [], isLoading: individualsLoading, refetch: refetchIndividuals } = useGeneticIndividuals();
  const { data: dbMarkers = [], isLoading: markersLoading, refetch: refetchMarkers } = useGeneticMarkers();
  const { data: dbPeriods = [], isLoading: periodsLoading, refetch: refetchPeriods } = useHistoricalPeriods();
  const { mutate: bulkImport, isPending: isImporting } = useBulkImportStudyData();

  const isDbLoading = sitesLoading || individualsLoading || markersLoading || periodsLoading;

  useEffect(() => {
    loadEyeColorData();
  }, []);

  const loadEyeColorData = async () => {
    try {
      const [eyeColorsResponse, regionsResponse] = await Promise.all([
        supabase.from('eye_colors').select('*').order('rarity_rank', { ascending: true }),
        supabase.from('eye_color_regions').select('*')
      ]);

      if (eyeColorsResponse.error) {
        console.error('Error loading eye colors:', eyeColorsResponse.error);
      } else {
        setEyeColors(eyeColorsResponse.data || []);
      }

      if (regionsResponse.error) {
        console.error('Error loading regions:', regionsResponse.error);
      } else {
        setEyeColorRegions(regionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportStudyData = async () => {
    console.log('Starting import of study data to database...');
    setImportStatus('importing');
    setImportError(null);
    
    try {
      await importStudyDataToDatabase((data) => {
        return new Promise((resolve, reject) => {
          bulkImport(data, {
            onSuccess: (result) => {
              console.log('Import successful:', result);
              setImportStatus('success');
              // Refetch all data to update the UI
              refetchSites();
              refetchIndividuals();
              refetchMarkers();
              refetchPeriods();
              resolve(result);
            },
            onError: (error) => {
              console.error('Import failed:', error);
              setImportStatus('error');
              setImportError(error.message || 'Import misslyckades');
              reject(error);
            }
          });
        });
      });
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportError(error.message || 'Import misslyckades');
    }
  };

  // Filter database data based on search criteria with more flexible matching
  const filteredMarkers = dbMarkers.filter(marker => {
    if (searchTerm.length === 0) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      marker.haplogroup?.toLowerCase().includes(searchLower) ||
      marker.gene?.toLowerCase().includes(searchLower) ||
      marker.description?.toLowerCase().includes(searchLower) ||
      marker.origin.toLowerCase().includes(searchLower) ||
      marker.modern_distribution?.toLowerCase().includes(searchLower) ||
      marker.significance?.toLowerCase().includes(searchLower) ||
      marker.marker_type.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const filteredPeriods = dbPeriods.filter(period => {
    if (searchTerm.length === 0) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      period.name.toLowerCase().includes(searchLower) ||
      period.name_en.toLowerCase().includes(searchLower) ||
      period.description?.toLowerCase().includes(searchLower) ||
      period.time_range.toLowerCase().includes(searchLower)
    );
  });

  const filteredSites = dbSites.filter(site => {
    const matchesSearch = searchTerm.length === 0 || 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.parish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = selectedPeriod === 'all' || 
      site.period.toLowerCase().includes(selectedPeriod.toLowerCase());
    
    return matchesSearch && matchesPeriod;
  });

  // Filter eye colors (keep existing logic for compatibility)
  const filteredColors = eyeColors.filter(color => {
    if (searchTerm.length === 0 && selectedComplexity === 'all') return true;
    
    const matchesSearch = searchTerm.length === 0 || 
      color.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.color_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (color.main_genes && color.main_genes.some(gene => 
        gene.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    const matchesComplexity = selectedComplexity === 'all' || color.genetic_complexity === selectedComplexity;
    return matchesSearch && matchesComplexity;
  });

  if (loading || isDbLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="text-white text-center flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          {c.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Dna className="h-10 w-10" />
            {c.title}
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            {c.subtitle}
          </p>
          
          {/* Study Source Reference */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Dna className="h-5 w-5 text-blue-300" />
              <h3 className="text-blue-300 font-semibold">{c.source}</h3>
            </div>
            <p className="text-blue-200 text-sm mb-2">
              "The genetic history of Scandinavia from the Roman Iron Age to the present"
            </p>
            <p className="text-blue-200 text-xs">
              <strong>{c.publishedIn}</strong> Cell, 2023 | 
              <a 
                href="https://www.cell.com/cell/fulltext/S0092-8674(22)01468-4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 underline ml-1"
              >
                {c.readStudy}
              </a>
            </p>
          </div>

          {/* Data Import Controls */}
          {(dbSites.length === 0 || dbMarkers.length === 0) && importStatus !== 'success' && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-amber-300 font-semibold">{c.importTitle}</h3>
                  <p className="text-amber-200 text-sm">
                    {c.importDesc}
                  </p>
                  {importError && (
                    <p className="text-red-300 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {importError}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleImportStudyData}
                  disabled={importStatus === 'importing'}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {importStatus === 'importing' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {c.importing}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {c.importData}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importStatus === 'success' && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <h3 className="text-green-300 font-semibold">{c.importSuccess}</h3>
              </div>
              <p className="text-green-200 text-sm">
                {c.importSuccessDesc}
              </p>
            </div>
          )}

          <GeneticSearchControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedComplexity={selectedComplexity}
            setSelectedComplexity={setSelectedComplexity}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        </div>

        {/* Show search results summary */}
        {searchTerm.length > 0 && (
          <div className="mb-4 text-slate-300 text-sm">
            {c.showingResults(searchTerm)} 
            <span className="ml-2">
              {c.counts(filteredMarkers.length, filteredPeriods.length, filteredSites.length)}
            </span>
            {(filteredMarkers.length === 0 && filteredPeriods.length === 0 && filteredSites.length === 0) && (
              <span className="text-amber-300 ml-2">
                {c.noResults}
              </span>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/10 border border-white/20">
            <TabsTrigger value="viking-genetics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Dna className="h-4 w-4 mr-2" />
              Viking DNA
            </TabsTrigger>
            <TabsTrigger value="study-data" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <MapPin className="h-4 w-4 mr-2" />
              {c.tabStudy}
            </TabsTrigger>
            <TabsTrigger value="historical-periods" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Clock className="h-4 w-4 mr-2" />
              {c.tabPeriods}
            </TabsTrigger>
            <TabsTrigger value="eye-colors" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Eye className="h-4 w-4 mr-2" />
              {c.tabEyes}
            </TabsTrigger>
            <TabsTrigger value="hair-colors" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Users className="h-4 w-4 mr-2" />
              {c.tabHair}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="viking-genetics">
            <VikingGeneticsTab filteredMarkers={filteredMarkers} />
          </TabsContent>

          <TabsContent value="study-data">
            <StudyDataTab filteredSites={filteredSites} individuals={dbIndividuals} />
          </TabsContent>

          <TabsContent value="historical-periods">
            <HistoricalPeriodsTab filteredPeriods={filteredPeriods} />
          </TabsContent>

          <TabsContent value="eye-colors">
            <EyeColorsTab filteredColors={filteredColors} eyeColorRegions={eyeColorRegions} />
          </TabsContent>

          <TabsContent value="hair-colors">
            <HairColorsTab searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>

        <GeneticSummaryStats 
          vikingGeneticMarkersCount={dbMarkers.length}
          studySitesCount={dbSites.length}
          studyIndividualsCount={dbIndividuals.length}
        />
      </div>
    </div>
  );
};
