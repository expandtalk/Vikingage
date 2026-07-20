import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ArrowRight, ArrowLeft, Network } from 'lucide-react';
import {
  useDebounced,
  useEntitySearch,
  useEntityGraph,
  type SearchHit,
  type EntityEdge,
  type EntityNode,
} from '@/hooks/useEntityGraph';

const confidenceClass = (c: string | null) => {
  switch (c) {
    case 'certain':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30';
    case 'probable':
      return 'bg-sky-500/20 text-sky-200 border-sky-400/30';
    case 'possible':
      return 'bg-amber-500/20 text-amber-200 border-amber-400/30';
    case 'contested':
      return 'bg-red-500/20 text-red-200 border-red-400/30';
    default:
      return 'bg-slate-500/20 text-slate-200 border-slate-400/30';
  }
};

const typeBadge = 'bg-purple-500/15 text-purple-200 border-purple-400/25';

const EdgeRow: React.FC<{ edge: EntityEdge; direction: 'out' | 'in' }> = ({ edge, direction }) => {
  const node: EntityNode | undefined = direction === 'out' ? edge.target : edge.source;
  const qualifiers = edge.qualifiers
    ? Object.entries(edge.qualifiers).filter(([, v]) => v !== null && v !== '')
    : [];
  return (
    <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-white/5 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {direction === 'out' ? (
          <ArrowRight className="h-4 w-4 text-orange-400 shrink-0" />
        ) : (
          <ArrowLeft className="h-4 w-4 text-cyan-400 shrink-0" />
        )}
        <span className="text-slate-400">{edge.label_sv}</span>
        <span className="font-medium text-white">{node?.label ?? '—'}</span>
        {node?.type && (
          <Badge variant="outline" className={typeBadge}>
            {node.type}
          </Badge>
        )}
        {edge.confidence && (
          <Badge variant="outline" className={confidenceClass(edge.confidence)}>
            {edge.confidence}
          </Badge>
        )}
      </div>
      {qualifiers.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 pl-6 text-xs text-slate-400">
          {qualifiers.map(([k, v]) => (
            <span key={k}>
              <span className="text-slate-500">{k}:</span> {String(v)}
            </span>
          ))}
        </div>
      )}
      {edge.source_ref && (
        <div className="pl-6 text-xs text-slate-500">Källa: {edge.source_ref}</div>
      )}
    </div>
  );
};

const EntityPanel: React.FC<{ id: string }> = ({ id }) => {
  const { data: graph, isLoading, error } = useEntityGraph(id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" /> Laddar entitet…
      </div>
    );
  }
  if (error) return <div className="text-red-300">Kunde inte ladda: {(error as Error).message}</div>;
  if (!graph) return <div className="text-slate-400">Ingen entitet hittades.</div>;
  if (!graph.entity) {
    return (
      <div className="text-slate-400">
        Den här entiteten är inte en nod i kunskapsgrafen ännu (t.ex. socken, plats eller ortnamn —
        de hanteras via sina egna tabeller, inte via <code className="rounded bg-white/10 px-1">relationship</code>).
      </div>
    );
  }

  const out = graph.edges_out ?? [];
  const inc = graph.edges_in ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-semibold text-white">{graph.entity.label}</h3>
        <Badge variant="outline" className={typeBadge}>
          {graph.entity.type}
        </Badge>
        <span className="text-xs text-slate-500">{graph.entity.id}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Network className="h-4 w-4 text-orange-400" />
        {out.length + inc.length} relation{out.length + inc.length === 1 ? '' : 'er'} i kunskapsgrafen
      </div>

      {out.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Utgående</div>
          {out.map((e, i) => (
            <EdgeRow key={`out-${i}`} edge={e} direction="out" />
          ))}
        </div>
      )}

      {inc.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inkommande</div>
          {inc.map((e, i) => (
            <EdgeRow key={`in-${i}`} edge={e} direction="in" />
          ))}
        </div>
      )}

      {out.length + inc.length === 0 && (
        <div className="text-slate-400">Inga relationer ännu — kandidat för kurering i Fas B.</div>
      )}
    </div>
  );
};

export const EntityEditor = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const debounced = useDebounced(query, 300);
  const { data: hits = [], isLoading } = useEntitySearch(debounced);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
      {/* Sök + resultatlista */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Search className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Innehåll — sök entitet</h2>
        </div>
        <p className="text-sm text-slate-400">
          Sök inskrift, ristare, kung, källa, tema m.m. (signum, namn, ort, begrepp). Rankad via
          <code className="mx-1 rounded bg-white/10 px-1">search_v1</code>.
        </p>
        <Input
          autoFocus
          placeholder="t.ex. U 337, Jelling, Varin, Rök…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
        />
        <div className="space-y-1">
          {isLoading && debounced.trim().length >= 2 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Söker…
            </div>
          )}
          {!isLoading && debounced.trim().length >= 2 && hits.length === 0 && (
            <div className="text-sm text-slate-400">Inga träffar.</div>
          )}
          {hits.map((hit) => {
            const active = selected?.entity_id === hit.entity_id;
            return (
              <button
                key={`${hit.entity_type}-${hit.entity_id}`}
                onClick={() => setSelected(hit)}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-orange-400/40 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{hit.label}</span>
                  <Badge variant="outline" className={typeBadge}>
                    {hit.entity_type}
                  </Badge>
                </div>
                {hit.sublabel && <div className="text-xs text-slate-400">{hit.sublabel}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vald entitet */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-5 min-h-[200px]">
        {selected ? (
          <EntityPanel id={selected.entity_id} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            Välj en träff för att se dess relationer.
          </div>
        )}
      </div>
    </div>
  );
};
