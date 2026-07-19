import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeInscriptionBySignum } from '@/services/aiService';
import type { RunicAnalysis } from '@/types/runic';

// P5 graf-RAG-panel: analysen körs server-side mot kunskapsgrafens källmaterial
// (kanter med proveniens/konfidens, Gräslund-intervall, socken/härad, läsningar).
// Resultatet visar vilka kontextfält som citerats + caveats — aldrig utan disclaimer.
interface Props {
  signum: string;
  sv: boolean;
}

type Result = RunicAnalysis & { contextCited?: string[]; caveats?: string[]; contextUsed?: boolean };

export const AIAnalysisPanel: React.FC<Props> = ({ signum, sv }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await analyzeInscriptionBySignum(signum));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          {sv ? 'AI-analys med källkontext' : 'AI analysis with source context'}
        </h3>
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading
            ? (<><Loader2 className="h-4 w-4 animate-spin mr-1" />{sv ? 'Analyserar…' : 'Analysing…'}</>)
            : (sv ? 'Analysera' : 'Analyse')}
        </Button>
      </div>

      {!result && !error && !loading && (
        <p className="text-xs text-muted-foreground">
          {sv
            ? 'Analysen körs mot kunskapsgrafens källmaterial: relationer med proveniens och konfidens, stilarnas dateringsintervall, socken/härad samt alla läsningar och tolkningar.'
            : 'The analysis runs against the knowledge graph: relations with provenance and confidence, style dating ranges, parish/hundred and all readings and interpretations.'}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{error}
        </p>
      )}

      {result && (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{result.period}</Badge>
            {result.yearRange && (
              <Badge variant="outline">{result.yearRange.start}–{result.yearRange.end}</Badge>
            )}
            <Badge variant="outline">
              {sv ? 'säkerhet' : 'confidence'}: {Math.round((result.confidence ?? 0) * 100)}%
            </Badge>
            {result.runType && <Badge variant="outline">{result.runType}</Badge>}
          </div>

          <p className="text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>

          {result.linguisticFeatures?.length ? (
            <div className="flex flex-wrap gap-1">
              {result.linguisticFeatures.map((f) => (
                <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
              ))}
            </div>
          ) : null}

          {result.contextCited?.length ? (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {sv ? 'Källkontext som användes:' : 'Source context used:'}
              </span>{' '}
              {result.contextCited.join(' · ')}
            </div>
          ) : null}

          {result.caveats?.length ? (
            <div className="text-xs text-amber-500/90">
              <span className="font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {sv ? 'Förbehåll:' : 'Caveats:'}
              </span>
              <ul className="list-disc list-inside">
                {result.caveats.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ) : null}

          <p className="text-[11px] text-muted-foreground/70 border-t border-border pt-2">
            {sv
              ? 'AI-genererad analys — kontrollera alltid mot källorna ovan innan du citerar.'
              : 'AI-generated analysis — always verify against the sources above before citing.'}
          </p>
        </div>
      )}
    </div>
  );
};
