import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FlaskConical, Search, X } from 'lucide-react';
import {
  PLACE_NAME_ELEMENTS,
  EVIDENCE_LAYER_META,
  ELEMENT_CATEGORY_META,
  SACRAL_CONFIDENCE_META,
  type EvidenceLayer,
} from '@/utils/placeNameElements';

interface Props {
  /** Antal orter per led (n_osm = hela registret). */
  elementCounts: Record<string, { n_osm?: number; n_curated?: number }>;
  /** Skicka ledet till Hypotestestaren (steg 1). */
  onTest: (key: string) => void;
  sv: boolean;
}

/**
 * Steg 0b i ortnamnsmetoden: välj ett namnled att testa. Bläddra/sök katalogen
 * (evidensskikt kärna/utvidgad/kontroll), se etymologi, omtvistad-flagga, antal
 * orter — och skicka ett led direkt till Hypotestestaren. Ren katalog-data
 * (placeNameElements.ts) + faktiska antal; inga påhittade kategorier.
 */
export const PlaceNameElementExplorer: React.FC<Props> = ({ elementCounts, onTest, sv }) => {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const byLayer = useMemo(() => {
    const match = (e: (typeof PLACE_NAME_ELEMENTS)[number]) =>
      !query || e.label.toLowerCase().includes(query) || e.etymology.toLowerCase().includes(query) || e.key.includes(query);
    return (['core', 'extended', 'control'] as EvidenceLayer[]).map((layer) => ({
      layer,
      meta: EVIDENCE_LAYER_META[layer],
      els: PLACE_NAME_ELEMENTS.filter((e) => e.evidenceLayer === layer && match(e)),
    }));
  }, [query]);

  const hits = byLayer.reduce((n, g) => n + g.els.length, 0);

  return (
    <div>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        {sv
          ? 'Steg 0b: välj ett led att testa. Leden är indelade i evidensskikt — erkänd kärna, utvidgad hypotes och kontroller (baslinjen). Varje kort visar etymologi, om ledet är omtvistat, och hur många orter som bär det. Skicka ett led vidare till Hypotestestaren med en knapp.'
          : 'Step 0b: pick an element to test. Elements are grouped into evidence layers — recognised core, extended hypothesis and controls (the baseline). Each card shows the etymology, whether it is contested, and how many places carry it. Send an element straight to the Hypothesis tester.'}
      </p>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={sv ? 'Sök led (t.ex. tor, lund, tuna)…' : 'Search element (e.g. tor, lund, tuna)…'}
          className="w-full rounded border border-slate-600 bg-slate-900 py-1.5 pl-8 pr-7 text-[13px] text-white placeholder:text-slate-500 focus:border-gold focus:outline-none"
        />
        {q ? (
          <button onClick={() => setQ('')} className="absolute right-2 top-2 text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        ) : null}
      </div>

      {byLayer.map(({ layer, meta, els }) => els.length === 0 ? null : (
        <div key={layer} className="mb-8">
          <h3 className="text-lg font-semibold text-foreground">{sv ? meta.label : meta.labelEn}</h3>
          <p className="mb-3 max-w-2xl text-xs text-muted-foreground">{sv ? meta.note : meta.noteEn}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {els.map((el) => {
              const cat = ELEMENT_CATEGORY_META[el.category];
              const conf = SACRAL_CONFIDENCE_META[el.sacralConfidence];
              const n = elementCounts[el.key]?.n_osm ?? 0;
              return (
                <Card key={el.key} className="viking-card flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                      <span style={{ color: cat.color }}>{cat.symbol}</span>
                      {el.label}
                      {el.contested && (
                        <span title={sv ? 'Etymologiskt omtvistad' : 'Etymologically contested'}>
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs" style={{ backgroundColor: cat.color + '22', color: cat.color }}>{cat.label}</Badge>
                      <Badge variant="outline" className="text-xs" style={{ borderColor: conf.color, color: conf.color }}>
                        {sv ? 'Sakral' : 'Sacral'}: {sv ? conf.label : conf.labelEn}
                      </Badge>
                      {el.isControl && <Badge variant="outline" className="border-slate-400 text-slate-300 text-xs">{sv ? 'Kontroll' : 'Control'}</Badge>}
                      {n > 0 && <Badge variant="secondary" className="text-xs">{n} {sv ? 'orter' : 'places'}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">{el.etymology}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>{sv ? 'Matchar' : 'Matches'}</strong> ({el.boundaryRule}): {el.patterns.join(', ')}
                      {el.excludes.length > 0 && (<> · <strong>{sv ? 'utesluter' : 'excludes'}:</strong> {el.excludes.join(', ')}</>)}
                    </p>
                    <div className="flex-1" />
                    <Button size="sm" variant="outline" className="mt-1 h-7 self-start border-gold/60 text-xs text-gold hover:bg-gold/10" onClick={() => onTest(el.key)}>
                      <FlaskConical className="mr-1 h-3 w-3" />{sv ? 'Testa i Hypotestestaren' : 'Test in the Hypothesis tester'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {hits === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">{sv ? 'Inget led matchar sökningen.' : 'No element matches the search.'}</p>
      )}

      {/* Källkritik: taggningen är preliminär (flyttad hit från katalogsektionen). */}
      <Card className="viking-card mt-4 border-amber-600/40">
        <CardContent className="flex gap-3 py-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p>
            {sv
              ? 'Obs: taggningen på ortnamnen är preliminär och görs om enligt den reviderade metoden. Den tidigare importen var för generös — t.ex. taggades alla -lund (även sena herrgårdsnamn som Erikslund, Marielund) som "sakralt". Efter omtaggning räknas -lund som sakralt bara med teofor bestämning (Fröslunda), och -inge/-hem/-by behandlas som kontrollgrupp.'
              : 'Note: the tagging is preliminary and being redone with the revised method. The earlier import was too generous — e.g. all -lund names (including late estate names) were tagged "sacral". After re-tagging, -lund counts as sacral only with a theophoric qualifier (Fröslunda), and -inge/-hem/-by are treated as a control group.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceNameElementExplorer;
