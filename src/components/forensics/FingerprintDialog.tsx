import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2, Upload, X } from 'lucide-react';
import { fingerprintObject, fileToDataUrl, type FingerprintResult } from '@/services/fingerprintService';
import { ImageEnhancer } from './ImageEnhancer';

interface Props {
  kind: 'runestone' | 'fornborg' | 'grave';
  className?: string;
}

const LABEL: Record<Props['kind'], { title: string; placeholder: string; hint: string }> = {
  runestone: {
    title: 'Runsten-fingerprint',
    placeholder: 'Beskriv runstenen: text/translitteration om känd, ornamentik (djurhuvud, korstyp, runbandsslingor), material, skick, plats…',
    hint: 'Datering (Gräslund-stil), ristartradition och ornamentik.',
  },
  fornborg: {
    title: 'Fornborg-fingerprint',
    placeholder: 'Beskriv fornborgen: höjdläge, planform, murtyp, portar, fasindelning, terräng, ev. fynd…',
    hint: 'Typologi, byggnadstradition, trolig datering och funktion.',
  },
  grave: {
    title: 'Grav-fingerprint',
    placeholder: 'Beskriv graven: kyrka/plats (kor, framför altare…), kroppslängd, ålder/kön, gravutformning (tumba, gravhäll, kista), symboler & föremål (ring, vapen/heraldik, dräkt), datering…',
    hint: 'Trolig identitet/status utifrån plats, längd, gravutformning och symboler.',
  },
};

// Forensiskt fingerprint-verktyg: skicka en beskrivning (+ valfri bild) → AI-analys.
// Delas av runsten- och fornborg-sidorna via kind-propen.
export const FingerprintDialog: React.FC<Props> = ({ kind, className }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FingerprintResult | null>(null);
  const L = LABEL[kind];

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setImage(await fileToDataUrl(f)); } catch (err) { setError((err as Error).message); }
  };

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try { setResult(await fingerprintObject({ kind, description, imageBase64: image })); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Fingerprint className="h-4 w-4 mr-2" />{L.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5 text-gold" />{L.title}</DialogTitle>
          <DialogDescription>
            {L.hint} Skicka en beskrivning och (valfritt) en bild — verktyget ger en forensisk fingerprint. Det är ett forskningsstöd; kontrollera alltid mot källor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder={L.placeholder}
            className="w-full rounded-md border border-input bg-background p-2 text-sm resize-y"
          />

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer rounded-md border px-2 py-1 hover:bg-muted">
              <Upload className="h-4 w-4" /> {image ? 'Byt bild' : 'Lägg till bild (valfritt)'}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
            {image && (
              <button onClick={() => setImage(undefined)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="h-3 w-3" />ta bort
              </button>
            )}
          </div>
          {/* Bildförbättring i webbläsaren (släpljus/DStretch-lite/kantlinjer) → få fram baslinjerna
              INNAN läsning. Den förbättrade bilden kan skickas vidare till AI-analysen. */}
          {image && <ImageEnhancer src={image} onUseEnhanced={setImage} />}

          <Button onClick={run} disabled={loading || !description.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyserar…</> : 'Kör fingerprint'}
          </Button>

          {error && <p className="text-sm text-red-500">⚠ {error}</p>}

          {result && (
            <div className="rounded-md border p-3 space-y-1.5 text-sm bg-muted/30">
              {result.summary && <p className="font-medium text-foreground">{result.summary}</p>}
              {result.dating && (
                <div><span className="text-muted-foreground">Datering: </span>
                  {result.dating.period}
                  {result.dating.yearRange && (result.dating.yearRange.start != null || result.dating.yearRange.end != null) &&
                    ` (${result.dating.yearRange.start ?? '?'}–${result.dating.yearRange.end ?? ''})`}
                  {result.dating.basis && <span className="text-muted-foreground"> — {result.dating.basis}</span>}
                </div>
              )}
              {typeof result.confidence === 'number' && (
                <div className="text-muted-foreground">Konfidens: {Math.round(result.confidence * 100)}%</div>
              )}
              {result.typology && <div><span className="text-muted-foreground">Typologi: </span>{result.typology}</div>}
              {result.interpretation && <div><span className="text-muted-foreground">Tolkning: </span>{result.interpretation}</div>}
              {result.features && result.features.length > 0 && (
                <div><span className="text-muted-foreground">Diagnostiska drag: </span>{result.features.join(', ')}</div>
              )}
              {result.caveats && result.caveats.length > 0 && (
                <ul className="text-amber-600 dark:text-amber-400 text-xs list-disc pl-4 pt-1">
                  {result.caveats.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
              {/* AI-transparens (EU AI Act art. 50.4): märk AI-genererad output + verifieringsväg. */}
              <p className="text-[11px] text-muted-foreground/70 pt-1.5 mt-1 border-t border-border/50">
                AI-genererad forensisk analys — preliminärt underlag, verifiera mot källa/runolog innan citat.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
