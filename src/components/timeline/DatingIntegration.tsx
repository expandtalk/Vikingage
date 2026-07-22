
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, RefreshCw, BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useDatingPeriods } from '@/hooks/useDatingPeriods';
import { useToast } from "@/hooks/use-toast";

interface DatingIntegrationProps {
  selectedPeriod: string;
  startYear?: number;
  endYear?: number;
}

export const DatingIntegration: React.FC<DatingIntegrationProps> = ({
  selectedPeriod,
  startYear,
  endYear
}) => {
  const [showDetails, setShowDetails] = useState(false);
  // Lat hämtning: dra INTE in hela dating-tabellen förrän användaren öppnar detaljerna.
  // Annars laddades allt + kördes sync-statistik vid varje tidslinje-klick → frös sajten.
  const {
    datingRecords,
    isLoading,
    updateDatingPeriods,
    isUpdating,
    getDatingInPeriod,
    getParsingStats
  } = useDatingPeriods({ enabled: showDetails });
  const { toast } = useToast();

  const stats = getParsingStats();
  const recordsInPeriod = startYear && endYear ? getDatingInPeriod(startYear, endYear) : [];

  const handleUpdatePeriods = async () => {
    try {
      const updatedCount = await updateDatingPeriods.mutateAsync();
      toast({
        title: "Dating-perioder uppdaterade",
        description: `${updatedCount} dateringsposter har analyserats och konverterats`,
      });
    } catch (error) {
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte uppdatera dating-perioder",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-white/70 text-sm">
        <Clock className="h-4 w-4 animate-spin mx-auto mb-2" />
        Laddar dating-data...
      </div>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-amber-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-white text-sm">Dating Integration</CardTitle>
          </div>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="text-amber-300 hover:text-amber-200"
          >
            {showDetails ? '−' : '+'}
          </Button>
        </div>
        <CardDescription className="text-slate-300 text-xs">
          Intelligenta daterings-analyser för tidslinjefiltrering
        </CardDescription>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Parsing Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/40 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-3 w-3 text-blue-400" />
                <span className="text-blue-300 text-xs font-medium">Parse Status</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Parsade:</span>
                  <Badge className="bg-green-600 text-white text-xs">{stats.parsed}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Oparsade:</span>
                  <Badge className="bg-red-600 text-white text-xs">{stats.unparsed}</Badge>
                </div>
                <Progress 
                  value={stats.parseRate} 
                  className="h-1 mt-2"
                />
                <div className="text-xs text-slate-400 text-center">
                  {stats.parseRate.toFixed(1)}% parsade
                </div>
              </div>
            </div>

            <div className="bg-slate-700/40 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-green-300 text-xs font-medium">Konfidens</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Hög (≥80%):</span>
                  <span className="text-green-300">{stats.confidenceDistribution.high}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Medium (≥60%):</span>
                  <span className="text-yellow-300">{stats.confidenceDistribution.medium}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Låg (&lt;60%):</span>
                  <span className="text-red-300">{stats.confidenceDistribution.low}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Period Results */}
          {startYear && endYear && (
            <div className="bg-amber-900/20 rounded p-3 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3 text-amber-400" />
                <span className="text-amber-300 text-xs font-medium">
                  Objekt i Period {startYear}-{endYear}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-600 text-white">
                  {recordsInPeriod.length} objekt
                </Badge>
                {recordsInPeriod.length > 0 && (
                  <span className="text-xs text-amber-200">
                    Klicka på kartan för att se resultat
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Update Button */}
          <div className="pt-2 border-t border-slate-600">
            <Button
              onClick={handleUpdatePeriods}
              disabled={isUpdating}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Analyserar...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Uppdatera Dating-analyser
                </>
              )}
            </Button>
          </div>

          {/* Sample Records */}
          {recordsInPeriod.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-white">Exempel från period:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {recordsInPeriod.slice(0, 5).map((record) => (
                  <div key={record.datingid} className="bg-slate-700/40 rounded p-2 text-xs">
                    <div className="text-amber-200 font-mono">"{record.dating}"</div>
                    <div className="text-slate-300 mt-1">
                      Parsed: {record.period_start}-{record.period_end}
                      {record.parsing_confidence && (
                        <span className="ml-2 text-green-400">
                          ({Math.round(record.parsing_confidence * 100)}% konfidens)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {recordsInPeriod.length > 5 && (
                  <div className="text-center text-slate-400 text-xs">
                    ...och {recordsInPeriod.length - 5} till
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
