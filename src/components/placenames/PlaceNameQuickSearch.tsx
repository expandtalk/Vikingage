import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, X, Clock } from 'lucide-react';
import { getElement } from '@/utils/placeNameElements';
import { PlaceNameTwoAxisCard } from './PlaceNameTwoAxisCard';

// Sök-FÖRST-ruta högst upp på /sv/ortnamn. Söker HELA nationella ortnamnsregistret
// (place_names, ~358k) server-side via pg_trgm — inte det lilla kurerade urvalet i
// usePlaceNamesData. Daniel: "man vill säkert kunna söka på ortnamnen först."

interface Hit {
  id: string; name: string; province: string | null; element_keys: string[] | null;
  lat: number | null; lng: number | null; earliest_attestation_year: number | null;
  attested_form: string | null; source: string | null; source_license: string | null; attribution: string | null;
}

const elementLabel = (k: string) => getElement(k)?.label ?? (k.charAt(0).toUpperCase() + k.slice(1));

export const PlaceNameQuickSearch: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [raw, setRaw] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null); // valt namn → tvåaxel-kort

  // Debounce (250 ms) så vi inte frågar per tangenttryck.
  useEffect(() => {
    const t = setTimeout(() => setQ(raw.trim()), 250);
    return () => clearTimeout(t);
  }, [raw]);

  const { data: hits = [], isFetching } = useQuery({
    queryKey: ['place-name-quick-search', q],
    enabled: q.length >= 2,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Hit[]> => {
      const { data, error } = await (supabase as any)
        .from('place_names')
        .select('id,name,province,element_keys,lat,lng,earliest_attestation_year,attested_form,source,source_license,attribution')
        .ilike('name', `%${q}%`)
        .is('superseded_by', null)
        .order('name', { ascending: true })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Hit[];
    },
  });

  // Dedup: samma namn+landskap kan finnas i flera källor → visa en rad (behåll den med koordinat).
  const results = useMemo(() => {
    const byKey = new Map<string, Hit>();
    for (const h of hits) {
      const key = `${h.name.toLowerCase()}|${h.province ?? ''}`;
      const prev = byKey.get(key);
      if (!prev || (prev.lat == null && h.lat != null)) byKey.set(key, h);
    }
    return Array.from(byKey.values());
  }, [hits]);

  // Attribution-rad (Lantmäteriets ortnamn kräver attribution — ej CC0).
  const attrib = useMemo(() => {
    const set = new Set<string>();
    results.forEach((h) => { if (h.attribution || h.source_license || h.source) set.add(h.attribution || h.source_license || h.source!); });
    return Array.from(set).slice(0, 3).join(' · ');
  }, [results]);

  return (
    <div className="mb-6 rounded-xl border border-gold/40 bg-slate-900/40 p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Search className="h-4 w-4 text-gold" />
        {sv ? 'Sök ortnamn' : 'Search place names'}
        <span className="text-xs font-normal text-muted-foreground">
          {sv ? '— hela registret (~358 000 namn)' : '— the whole register (~358,000 names)'}
        </span>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={sv ? 'Skriv ett ortnamn, t.ex. Vallentuna, Frösö, Torsåker…' : 'Type a place name, e.g. Vallentuna, Frösö, Torsåker…'}
          className="bg-slate-800/60 pl-9 pr-9 text-white border-slate-600"
          aria-label={sv ? 'Sök ortnamn' : 'Search place names'}
        />
        {raw && (
          <button
            type="button"
            onClick={() => setRaw('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-white"
            aria-label={sv ? 'Rensa' : 'Clear'}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {q.length >= 2 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-muted-foreground">
            {isFetching ? (sv ? 'Söker…' : 'Searching…')
              : results.length === 0 ? (sv ? 'Inga träffar.' : 'No matches.')
              : (sv ? `${results.length} träffar${hits.length >= 60 ? '+ (visar de första)' : ''}` : `${results.length} matches${hits.length >= 60 ? '+ (showing first)' : ''}`)}
          </p>
          {results.length > 0 && (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {results.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(h.name)}
                    aria-pressed={selected === h.name}
                    title={sv ? 'Visa tvåaxel (belägg + namnålder)' : 'Show two axes (attestation + name-age)'}
                    className={`flex w-full flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors ${selected === h.name ? 'border-gold/70 bg-gold/10' : 'border-slate-700/50 bg-slate-800/40 hover:border-gold/50 hover:bg-slate-800/70'}`}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-gold/70" />
                    <span className="font-medium text-foreground">{h.name}</span>
                    {h.province && <span className="text-xs text-muted-foreground">{h.province}</span>}
                    {h.earliest_attestation_year != null && (
                      <span className="text-[11px] text-slate-400">{sv ? 'äldsta belägg' : 'attested'} {h.earliest_attestation_year}{h.attested_form ? ` (${h.attested_form})` : ''}</span>
                    )}
                    {(h.element_keys ?? []).slice(0, 4).map((k) => (
                      <Badge key={k} variant="outline" className="text-[10px]">{elementLabel(k)}</Badge>
                    ))}
                    {h.lat != null && h.lng != null && (
                      <a
                        href={`/explore?lat=${h.lat}&lng=${h.lng}`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-gold hover:underline"
                      >
                        <MapPin className="h-3 w-3" />{sv ? 'Visa på kartan' : 'Show on map'}
                      </a>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && !selected && (
            <p className="mt-1.5 text-[11px] text-muted-foreground/70">{sv ? 'Klicka på ett namn för tvåaxeln — när det skrevs (belägg) vs namnets ålder (skikt).' : 'Click a name for the two axes — when it was written (attestation) vs the name’s age (stratum).'}</p>
          )}
          {selected && <PlaceNameTwoAxisCard name={selected} sv={sv} onClose={() => setSelected(null)} />}
          {attrib && (
            <p className="mt-2 text-[10px] text-slate-500">{sv ? 'Källa' : 'Source'}: {attrib}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceNameQuickSearch;
