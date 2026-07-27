import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Map, Globe, RefreshCw } from "lucide-react";

interface ValidationResult {
  signum: string;
  found: boolean;
  coordinates?: { lat: number; lng: number };
  country_code?: string;
  country_name?: string;
  full_signum?: string;
  place?: string;
  parish?: string;
  province?: string;
  municipality?: string;
  extant?: boolean;
  uri?: string;
  error?: string;
}

interface EnrichmentResult {
  processed: number;
  enriched: number;
  results: Array<{
    signum: string;
    status: string;
    coordinates?: { lat: number; lng: number };
    error?: string;
  }>;
}

interface SignumSyncResult {
  processed: number;
  updated: number;
  already_mapped: number;
  not_found: number;
  results: Array<{
    old_signum: string;
    new_signum?: string;
    status: string;
    method?: string;
    error?: string;
  }>;
}

interface BulkImportResult {
  total_srd_inscriptions: number;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
  sample_results: Array<{
    signum: string;
    status: string;
    country?: string;
    location?: string;
    error?: string;
  }>;
}

export const SRDIntegration: React.FC = () => {
  const [signumInput, setSignumInput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);
  const [metadataResult, setMetadataResult] = useState<EnrichmentResult | null>(null);
  const [signumSyncResult, setSignumSyncResult] = useState<SignumSyncResult | null>(null);
  const [bulkImportResult, setBulkImportResult] = useState<BulkImportResult | null>(null);
  const [typeaheadResults, setTypeaheadResults] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isEnrichingMetadata, setIsEnrichingMetadata] = useState(false);
  const [isValidatingGeography, setIsValidatingGeography] = useState(false);
  const [isSyncChecking, setIsSyncChecking] = useState(false);
  const [isSyncingSignums, setIsSyncingSignums] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const { toast } = useToast();

  const validateSignum = async () => {
    if (!signumInput.trim()) {
      toast({
        title: "Fel",
        description: "Ange ett signum att validera",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { 
          action: 'validate_signum', 
          signum: signumInput.trim() 
        }
      });

      if (error) throw error;

      setValidationResult(data);
      
      if (data.found) {
        toast({
          title: "Validering lyckades",
          description: `${data.signum} hittades i SRD`,
        });
      } else {
        toast({
          title: "Signum ej hittat",
          description: `${data.signum} kunde inte hittas i SRD`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Valideringsfel",
        description: "Kunde inte validera signum mot SRD",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const enrichCoordinates = async () => {
    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'enrich_coordinates' }
      });

      if (error) throw error;

      setEnrichmentResult(data);
      
      toast({
        title: "Koordinatberikande slutfört",
        description: `${data.enriched} av ${data.processed} inskrifter berikades med koordinater`,
      });
    } catch (error) {
      console.error('Enrichment error:', error);
      toast({
        title: "Koordinatfel",
        description: "Kunde inte berika koordinater från SRD",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const validateGeography = async () => {
    setIsValidatingGeography(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'validate_geography' }
      });

      if (error) throw error;

      toast({
        title: "Geografisk validering slutförd",
        description: `${data.mismatches} avvikelser hittades av ${data.validated} validerade`,
        variant: data.mismatches > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Geography validation error:', error);
      toast({
        title: "Geografisk validering misslyckades",
        description: "Kunde inte validera geografi mot SRD",
        variant: "destructive",
      });
    } finally {
      setIsValidatingGeography(false);
    }
  };

  const enrichMetadata = async () => {
    setIsEnrichingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'enrich_metadata' }
      });

      if (error) throw error;

      setMetadataResult(data);
      
      toast({
        title: "Metadata-berikande slutfört",
        description: `${data.enriched} av ${data.processed} inskrifter berikades med metadata`,
      });
    } catch (error) {
      console.error('Metadata enrichment error:', error);
      toast({
        title: "Metadatafel",
        description: "Kunde inte berika metadata från SRD",
        variant: "destructive",
      });
    } finally {
      setIsEnrichingMetadata(false);
    }
  };

  const syncSignumFormats = async () => {
    setIsSyncingSignums(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'sync_signum_formats' }
      });

      if (error) throw error;

      setSignumSyncResult(data);
      
      toast({
        title: "Signum-synkronisering slutförd",
        description: `${data.updated} av ${data.processed} signum uppdaterades till SRD-format`,
      });
    } catch (error) {
      console.error('Signum sync error:', error);
      toast({
        title: "Signum-synkronisering misslyckades",
        description: "Kunde inte synkronisera signum-format med SRD",
        variant: "destructive",
      });
    } finally {
      setIsSyncingSignums(false);
    }
  };

  const bulkImportMissing = async () => {
    setIsBulkImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'bulk_import_missing' }
      });

      if (error) throw error;

      setBulkImportResult(data);
      
      toast({
        title: "Bulk-import slutförd",
        description: `${data.imported} nya runstenar importerades från SRD`,
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Bulk-import misslyckades",
        description: "Kunde inte importera saknade runstenar från SRD",
        variant: "destructive",
      });
    } finally {
      setIsBulkImporting(false);
    }
  };

  const performSyncCheck = async () => {
    setIsSyncChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('srd-integration', {
        body: { action: 'sync_check' }
      });

      if (error) throw error;

      toast({
        title: "Synkroniseringskontroll slutförd",
        description: `Lokal databas: ${data.local_count} runstenar. Status: ${data.sync_status}`,
      });
    } catch (error) {
      console.error('Sync check error:', error);
      toast({
        title: "Synkroniseringskontroll misslyckades",
        description: "Kunde inte kontrollera synkronisering med SRD",
        variant: "destructive",
      });
    } finally {
      setIsSyncChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6" />
        <h1 className="text-2xl font-bold">SRD Integration</h1>
        <Badge variant="outline">Samnordisk runtextdatabas</Badge>
      </div>
      
      <p className="text-muted-foreground">
        Integration med Uppsala Universitets Samnordisk runtextdatabas (SRD) för validering och berikande av rundata.
      </p>

      {/* Signum Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Validera Signum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ange signum (t.ex. BH 42, U 344, DR 42)"
              value={signumInput}
              onChange={(e) => setSignumInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && validateSignum()}
            />
            <Button 
              onClick={validateSignum} 
              disabled={isValidating}
              className="shrink-0"
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validera
            </Button>
          </div>

          {validationResult && (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{validationResult.signum}</span>
                <Badge variant={validationResult.found ? "default" : "destructive"}>
                  {validationResult.found ? "Hittad" : "Ej hittad"}
                </Badge>
              </div>
              
              {validationResult.found && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    {validationResult.full_signum && (
                      <p><strong>Fullständigt signum:</strong> {validationResult.full_signum}</p>
                    )}
                    {validationResult.country_name && (
                      <p><strong>Land:</strong> {validationResult.country_name} ({validationResult.country_code})</p>
                    )}
                    {validationResult.place && (
                      <p><strong>Plats:</strong> {validationResult.place}</p>
                    )}
                    {validationResult.parish && (
                      <p><strong>Socken:</strong> {validationResult.parish}</p>
                    )}
                    {typeof validationResult.extant === 'boolean' && (
                      <p><strong>Existerar:</strong> {validationResult.extant ? 'Ja' : 'Nej'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    {validationResult.province && (
                      <p><strong>Landskap:</strong> {validationResult.province}</p>
                    )}
                    {validationResult.municipality && (
                      <p><strong>Kommun:</strong> {validationResult.municipality}</p>
                    )}
                    {validationResult.coordinates && (
                      <p><strong>Koordinater:</strong> {validationResult.coordinates ? `${validationResult.coordinates.lat.toFixed(6)}, ${validationResult.coordinates.lng.toFixed(6)}` : '—'}</p>
                    )}
                    {validationResult.uri && (
                      <p><strong>URI:</strong> <a href={validationResult.uri} target="_blank" rel="noopener" className="text-blue-600 hover:underline">Länk</a></p>
                    )}
                  </div>
                </div>
              )}
              
              {validationResult.error && (
                <p className="text-sm text-destructive">{validationResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Batch Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coordinate Enrichment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Berika Koordinater
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hämtar koordinater från SRD för runstenar som saknar dem.
            </p>
            
            <Button 
              onClick={enrichCoordinates} 
              disabled={isEnriching}
              className="w-full"
            >
              {isEnriching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Berika Koordinater
            </Button>

            {enrichmentResult && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="text-sm">
                  <p><strong>Bearbetade:</strong> {enrichmentResult.processed}</p>
                  <p><strong>Berikade:</strong> {enrichmentResult.enriched}</p>
                  <p><strong>Framgång:</strong> {Math.round((enrichmentResult.enriched / enrichmentResult.processed) * 100)}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Enrichment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Berika Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hämtar saknad metadata (landskap, kommun, socken) från SRD.
            </p>
            
            <Button 
              onClick={enrichMetadata} 
              disabled={isEnrichingMetadata}
              className="w-full"
            >
              {isEnrichingMetadata && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Berika Metadata
            </Button>

            {metadataResult && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="text-sm">
                  <p><strong>Bearbetade:</strong> {metadataResult.processed}</p>
                  <p><strong>Berikade:</strong> {metadataResult.enriched}</p>
                  <p><strong>Framgång:</strong> {Math.round((metadataResult.enriched / metadataResult.processed) * 100)}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geography Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Validera Geografi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kontrollerar att lands-mappning stämmer med SRD.
          </p>
          
          <Button 
            onClick={validateGeography} 
            disabled={isValidatingGeography}
            className="w-full"
          >
            {isValidatingGeography && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validera Geografi
          </Button>
        </CardContent>
      </Card>

      {/* Signum Format Sync */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <RefreshCw className="h-5 w-5" />
            Synkronisera Signum-format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-700">
            Uppdaterar lokala signum till SRD:s standardformat (t.ex. KJ 540 → N 540). 
            Detta låser upp sök- och kartfunktionalitet för runstenar som N 540, Rökstenen, etc.
          </p>
          
          <Button 
            onClick={syncSignumFormats} 
            disabled={isSyncingSignums}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSyncingSignums && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Synkronisera Signum-format
          </Button>

          {signumSyncResult && (
            <div className="p-4 border border-blue-200 rounded-lg space-y-2 bg-white">
              <div className="text-sm">
                <p><strong>Bearbetade:</strong> {signumSyncResult.processed}</p>
                <p><strong>Uppdaterade:</strong> {signumSyncResult.updated}</p>
                <p><strong>Redan korrekta:</strong> {signumSyncResult.already_mapped}</p>
                <p><strong>Ej hittade:</strong> {signumSyncResult.not_found}</p>
                <p><strong>Framgång:</strong> {Math.round((signumSyncResult.updated / signumSyncResult.processed) * 100)}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Import Missing */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Map className="h-5 w-5" />
            Importera Saknade Runstenar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-700">
            Hämtar saknade runstenar från SRD-databasen (som N 540, Öl 1, Sö 179, etc.) 
            som inte finns i din lokala databas. Detta expanderar kraftigt din samling!
          </p>
          
          <Button 
            onClick={bulkImportMissing} 
            disabled={isBulkImporting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isBulkImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importera Saknade Runstenar
          </Button>

          {bulkImportResult && (
            <div className="p-4 border border-green-200 rounded-lg space-y-2 bg-white">
              <div className="text-sm">
                <p><strong>SRD Totalt:</strong> {bulkImportResult.total_srd_inscriptions} runstenar</p>
                <p><strong>Bearbetade:</strong> {bulkImportResult.processed}</p>
                <p><strong>Importerade:</strong> {bulkImportResult.imported}</p>
                <p><strong>Redan fanns:</strong> {bulkImportResult.skipped}</p>
                <p><strong>Fel:</strong> {bulkImportResult.errors}</p>
                <p><strong>Nya runstenar:</strong> {Math.round((bulkImportResult.imported / bulkImportResult.processed) * 100)}%</p>
              </div>
              {bulkImportResult.sample_results && bulkImportResult.sample_results.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-800 mb-2">Exempel på importerade runstenar:</p>
                  <div className="space-y-1">
                    {bulkImportResult.sample_results.filter(r => r.status === 'imported').slice(0, 5).map((result, idx) => (
                      <p key={idx} className="text-xs text-green-700">
                        <strong>{result.signum}</strong> - {result.location}, {result.country}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synkroniseringskontroll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Jämför din lokala databas med SRD för att identifiera avvikelser och möjligheter för förbättring.
          </p>
          
          <Button 
            onClick={performSyncCheck} 
            disabled={isSyncChecking}
            variant="outline"
            className="w-full"
          >
            {isSyncChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kör Synkroniseringskontroll
          </Button>
        </CardContent>
      </Card>

      {/* Quick Test for BH 42 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Test: BH 42 (Danmark)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 mb-3">
            Snabbtest för att verifiera att BH 42 verkligen ligger i Danmark enligt SRD.
          </p>
          <Button 
            onClick={() => {
              setSignumInput('BH 42');
              validateSignum();
            }}
            variant="outline"
            size="sm"
          >
            Testa BH 42
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};