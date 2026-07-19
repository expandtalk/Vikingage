import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, Play, Pause, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchGeocode, getInscriptionsForGeocoding, geocodeInscription, saveGeocodedCoordinates, addManualCoordinates, addBornholmSjaellandCoordinates } from "@/services/geocodingService";
import { supabase } from "@/integrations/supabase/client";

interface GeocodingStats {
  totalInscriptions: number;
  hasCoordinates: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export const GeocodingManager: React.FC = () => {
  const [stats, setStats] = useState<GeocodingStats | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string>('');
  const { toast } = useToast();

  const addDebugMessage = (message: string) => {
    console.log(message);
    setDebugMessages(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadStats = async () => {
    try {
      addDebugMessage('Loading geocoding stats...');
      
      // Hämta total count
      const { count: totalCount, error: totalError } = await supabase
        .from('runic_inscriptions')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        addDebugMessage(`Error getting total count: ${totalError.message}`);
        throw totalError;
      }

      // Hämta count från original coordinates
      const { count: hasCoordinatesCount, error: hasCoordError } = await supabase
        .from('runic_inscriptions')
        .select('*', { count: 'exact', head: true })
        .not('coordinates', 'is', null);

      // Hämta count från additional coordinates (geocoded)
      const { count: additionalCoordinatesCount, error: additionalError } = await supabase
        .from('additional_coordinates')
        .select('*', { count: 'exact', head: true });

      // Total coordinates = original + additional (geocoded)
      const totalCoordinates = (hasCoordinatesCount || 0) + (additionalCoordinatesCount || 0);

      // Simplified - just count inscriptions without coordinates
      const { count: highPriorityCount, error: highError } = await supabase
        .from('runic_inscriptions')
        .select('*', { count: 'exact', head: true })
        .is('coordinates', null)
        .not('location', 'is', null)
        .not('parish', 'is', null);

      const { count: mediumPriorityCount, error: mediumError } = await supabase
        .from('runic_inscriptions')
        .select('*', { count: 'exact', head: true })
        .is('coordinates', null)
        .not('location', 'is', null)
        .is('parish', null);

      const { count: lowPriorityCount, error: lowError } = await supabase
        .from('runic_inscriptions')
        .select('*', { count: 'exact', head: true })
        .is('coordinates', null)
        .is('location', null);

      if (hasCoordError || additionalError || highError || mediumError || lowError) {
        addDebugMessage('Error getting category counts');
        throw hasCoordError || additionalError || highError || mediumError || lowError;
      }

      const statsData = {
        totalInscriptions: totalCount || 0,
        hasCoordinates: totalCoordinates,
        highPriority: highPriorityCount || 0,
        mediumPriority: mediumPriorityCount || 0,
        lowPriority: lowPriorityCount || 0
      };

      addDebugMessage(`Stats loaded: Original: ${hasCoordinatesCount}, Geocoded: ${additionalCoordinatesCount}, Total: ${totalCoordinates}`);
      addDebugMessage(`Full stats: ${JSON.stringify(statsData)}`);
      setStats(statsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugMessage(`Error loading stats: ${errorMessage}`);
      toast({
        title: "Fel",
        description: "Kunde inte ladda statistik",
        variant: "destructive"
      });
    }
  };

  const startGeocoding = async () => {
    setIsGeocoding(true);
    setCurrentBatch(0);
    setDebugMessages([]);
    setProgress(0);
    
    try {
      addDebugMessage('Starting geocoding process...');
      
      // First, let's test the database connection
      addDebugMessage('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('runic_inscriptions')
        .select('signum')
        .limit(1);
      
      if (testError) {
        addDebugMessage(`Database connection failed: ${testError.message}`);
        throw new Error(`Database error: ${testError.message}`);
      }
      
      addDebugMessage(`Database test successful, found ${testData?.length || 0} records`);
      
      // Get inscriptions that need geocoding
      addDebugMessage('Fetching inscriptions for geocoding...');
      const inscriptionsToGeocode = await getInscriptionsForGeocoding(50); // Start with smaller batch
      addDebugMessage(`Got ${inscriptionsToGeocode.length} inscriptions to geocode`);
      
      if (inscriptionsToGeocode.length === 0) {
        addDebugMessage('No inscriptions found that need geocoding');
        toast({
          title: "Ingen data",
          description: "Inga inskrifter behöver geocodas",
        });
        setIsGeocoding(false);
        return;
      }
      
      // Show first few examples
      addDebugMessage(`First 3 inscriptions: ${inscriptionsToGeocode.slice(0, 3).map(i => `${i.signum}:${i.location}`).join(', ')}`);
      
      const batchSize = 10; // Smaller batch size for testing
      const batches = Math.ceil(inscriptionsToGeocode.length / batchSize);
      setTotalBatches(batches);
      addDebugMessage(`Will process ${batches} batches of ${batchSize} items each`);
      
      let totalSuccess = 0;
      let totalFailed = 0;
      
      for (let i = 0; i < batches; i++) {
        setCurrentBatch(i + 1);
        setProgress(((i + 1) / batches) * 100);
        
        addDebugMessage(`Starting batch ${i + 1}/${batches}`);
        
        // Process current batch
        const start = i * batchSize;
        const end = Math.min(start + batchSize, inscriptionsToGeocode.length);
        const currentBatchItems = inscriptionsToGeocode.slice(start, end);
        
        addDebugMessage(`Processing items ${start + 1}-${end} of ${inscriptionsToGeocode.length}`);
        
        let batchSuccess = 0;
        let batchFailed = 0;
        
        for (const inscription of currentBatchItems) {
          try {
            setCurrentItem(`${inscription.signum} - ${inscription.location}`);
            addDebugMessage(`Processing: ${inscription.signum} - ${inscription.location}`);
            
            // Test if we already have coordinates for this inscription
            const { data: existingCoords, error: checkError } = await supabase
              .from('additional_coordinates')
              .select('signum')
              .eq('signum', inscription.signum)
              .limit(1);
            
            if (checkError) {
              addDebugMessage(`Error checking existing coordinates: ${checkError.message}`);
            } else if (existingCoords && existingCoords.length > 0) {
              addDebugMessage(`${inscription.signum} already has coordinates, skipping`);
              continue;
            }
            
            const result = await geocodeInscription(inscription);
            addDebugMessage(`Geocoding result for ${inscription.signum}: ${result ? 'SUCCESS' : 'FAILED'}`);
            
            if (result) {
              const locationString = `${inscription.location}, ${inscription.parish || ''}, ${inscription.province || ''}, ${inscription.country || 'Sweden'}`.replace(/,\s*,/g, ',').replace(/,$/, '');
              addDebugMessage(`Saving coordinates for ${inscription.signum}: [${result.latitude}, ${result.longitude}]`);
              
              const saved = await saveGeocodedCoordinates(inscription.signum, result, locationString);
              addDebugMessage(`Save result for ${inscription.signum}: ${saved ? 'SUCCESS' : 'FAILED'}`);
              
              if (saved) {
                batchSuccess++;
                totalSuccess++;
              } else {
                batchFailed++;
                totalFailed++;
              }
            } else {
              batchFailed++;
              totalFailed++;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addDebugMessage(`ERROR processing ${inscription.signum}: ${errorMessage}`);
            batchFailed++;
            totalFailed++;
          }
        }
        
        addDebugMessage(`Batch ${i + 1} completed: ${batchSuccess} successful, ${batchFailed} failed`);
        
        // Wait between batches
        if (i < batches - 1) {
          addDebugMessage('Waiting 2 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      addDebugMessage(`Geocoding completed! Total: ${totalSuccess} successful, ${totalFailed} failed`);
      
      toast({
        title: "Geocoding slutfört",
        description: `${totalSuccess} lyckades, ${totalFailed} misslyckades`,
      });
      
      // Reload stats
      await loadStats();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugMessage(`FATAL ERROR: ${errorMessage}`);
      console.error('Geocoding error:', error);
      toast({
        title: "Fel",
        description: `Geocoding misslyckades: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
      setProgress(0);
      setCurrentBatch(0);
      setTotalBatches(0);
      setCurrentItem('');
    }
  };

  const stopGeocoding = () => {
    setIsGeocoding(false);
    addDebugMessage('Geocoding manually stopped');
    toast({
      title: "Stoppad",
      description: "Geocoding avbruten",
    });
  };

  const addGotlandCoordinates = async () => {
    setIsGeocoding(true);
    addDebugMessage('Adding Gotland runestone coordinates...');
    
    try {
      const { addGotlandCoordinates } = await import("@/services/geocodingService");
      const result = await addGotlandCoordinates();
      
      addDebugMessage(`Gotland coordinates completed: ${result.success} successful, ${result.failed} failed`);
      
      toast({
        title: "Gotland koordinater tillagda",
        description: `${result.success} koordinater tillagda, ${result.failed} misslyckades`,
      });
      
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugMessage(`Error adding Gotland coordinates: ${errorMessage}`);
      toast({
        title: "Fel",
        description: `Kunde inte lägga till Gotlandkoordinater: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const addScanianCoordinates = async () => {
    setIsGeocoding(true);
    addDebugMessage('Adding Scanian (Skåne) runestone coordinates...');
    
    try {
      const { addScanianCoordinates } = await import("@/services/geocodingService");
      const result = await addScanianCoordinates();
      
      addDebugMessage(`Scanian coordinates completed: ${result.success} successful, ${result.failed} failed`);
      
      toast({
        title: "Skånska koordinater tillagda",
        description: `${result.success} koordinater tillagda, ${result.failed} misslyckades`,
      });
      
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugMessage(`Error adding Scanian coordinates: ${errorMessage}`);
      toast({
        title: "Fel",
        description: `Kunde inte lägga till Skånska koordinater: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const addMissingCoordinates = async () => {
    setIsGeocoding(true);
    addDebugMessage('Adding manual coordinates for missing inscriptions...');
    
    try {
      const manualCoordinates = [
        { signum: 'B 113', lat: 59.5075, lng: 17.9044, notes: 'Hammarby socken, Sverige' },
        { signum: 'U 1152', lat: 59.7338, lng: 17.0153, notes: 'Brunnby, Frösthults socken' },
        { signum: 'B 1135', lat: 59.5283, lng: 18.0045, notes: 'Gällsta, Vallentuna socken' },
        { signum: 'B 1136', lat: 59.3601, lng: 17.534, notes: 'Hovgården, Adelsö socken' }
      ];
      
      const result = await addManualCoordinates(manualCoordinates);
      
      addDebugMessage(`Manual coordinates completed: ${result.success} successful, ${result.failed} failed`);
      
      toast({
        title: "Manuella koordinater tillagda",
        description: `${result.success} koordinater tillagda, ${result.failed} misslyckades`,
      });
      
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugMessage(`Error adding manual coordinates: ${errorMessage}`);
      toast({
        title: "Fel",
        description: `Kunde inte lägga till koordinater: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <Card className="viking-card relative z-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gold" />
          Geografisk Kodning
        </CardTitle>
        <CardDescription>
          Automatisk geocoding av runinskrifter baserat på platsnamn
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalInscriptions}</div>
              <div className="text-sm text-muted-foreground">Totalt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.hasCoordinates}</div>
              <div className="text-sm text-muted-foreground">
                Har koordinater ({Math.round((stats.hasCoordinates / stats.totalInscriptions) * 100)}%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.highPriority}</div>
              <div className="text-sm text-muted-foreground">Hög potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</div>
              <div className="text-sm text-muted-foreground">Medium potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.lowPriority}</div>
              <div className="text-sm text-muted-foreground">Låg potential</div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isGeocoding && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Batch {currentBatch} av {totalBatches}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {currentItem && (
              <div className="text-sm text-muted-foreground">
                Bearbetar: {currentItem}
              </div>
            )}
          </div>
        )}

        {/* Debug Messages */}
        {debugMessages.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-60 overflow-y-auto">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Log
            </h4>
            <div className="text-sm font-mono space-y-1">
              {debugMessages.map((msg, index) => (
                <div key={index} className="text-xs">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={startGeocoding}
            disabled={isGeocoding}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Starta Geocoding
          </Button>
          
          <Button
            onClick={addGotlandCoordinates}
            disabled={isGeocoding}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lägg till Gotlandkoordinater
          </Button>
          
          <Button
            onClick={addScanianCoordinates}
            disabled={isGeocoding}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lägg till Skånska koordinater
          </Button>
          
          <Button
            onClick={addMissingCoordinates}
            disabled={isGeocoding}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lägg till saknade koordinater
          </Button>
          
          <Button
            onClick={async () => {
              setIsGeocoding(true);
              addDebugMessage('Adding Bornholm & Sjælland coordinates...');
              try {
                const result = await addBornholmSjaellandCoordinates();
                addDebugMessage(`Bornholm/Sjælland coordinates: ${result.success} successful, ${result.failed} failed`);
                toast({
                  title: "Bornholm & Sjælland koordinater tillagda",
                  description: `${result.success} koordinater tillagda, ${result.failed} misslyckades`,
                });
                await loadStats();
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                addDebugMessage(`Error: ${errorMessage}`);
                toast({
                  title: "Fel",
                  description: `Kunde inte lägga till koordinater: ${errorMessage}`,
                  variant: "destructive"
                });
              } finally {
                setIsGeocoding(false);
              }
            }}
            disabled={isGeocoding}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Fixa Bornholm & Sjælland
          </Button>
          
          {isGeocoding && (
            <Button
              onClick={stopGeocoding}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Stoppa
            </Button>
          )}
          
          <Button
            onClick={loadStats}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Uppdatera statistik
          </Button>
        </div>

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Hur det fungerar:</h3>
          <ul className="text-sm space-y-1">
            <li>• <Badge variant="outline">Hög potential</Badge> - Har location + parish (bästa för geocoding)</li>
            <li>• <Badge variant="outline">Medium potential</Badge> - Har bara location</li>
            <li>• <Badge variant="outline">Låg potential</Badge> - Saknar användbar location-data</li>
          </ul>
          <p className="text-sm mt-2 text-muted-foreground">
            Geocoding använder OpenStreetMap Nominatim API med respektfull rate limiting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};