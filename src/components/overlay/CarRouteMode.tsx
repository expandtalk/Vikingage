import React, { useEffect, useState } from 'react';
import { Car, X, Loader2, Route as RouteIcon } from 'lucide-react';
import {
  useCarRoute, openCarRoute, closeCarRoute, setCarRoute, setCarRouteLine,
  setCarRouteFeatures, setCarRouteBuffer, type CarRouteMeta,
} from '@/hooks/useCarRoute';
import { useCuratedRoutes, type CuratedRoute } from '@/hooks/useCuratedRoutes';
import { useRouteLine, useRouteFeatures } from '@/hooks/useCarRouteData';

// Bil-läge NIVÅ 1 (rutt-korridor): välj en KURERAD rutt (viking_roads) → rita väg-linjen +
// objekt inom en justerbar buffert längs vägen (medaljong-kluster på kartan). Fristående
// flytande kontroll (skild från Near me/roadtrip). Senaste rutter sparas i localStorage.

// Korridorbredd (halva bufferten) i meter — log-ish skala: körfältsnära → några km.
const BUFFER_STOPS: { m: number; label: string }[] = [
  { m: 50, label: '50 m' },
  { m: 200, label: '200 m' },
  { m: 500, label: '500 m' },
  { m: 1000, label: '1 km' },
  { m: 2000, label: '2 km' },
  { m: 3000, label: '3 km' },
];

const RECENT_KEY = 'nm_recent_routes';
const RECENT_MAX = 8;
const loadRecent = (): CarRouteMeta[] => {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(v) ? v.slice(0, RECENT_MAX) : []; }
  catch { return []; }
};
const pushRecent = (r: CarRouteMeta): CarRouteMeta[] => {
  const next = [r, ...loadRecent().filter((x) => x.id !== r.id)].slice(0, RECENT_MAX);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* privat läge */ }
  return next;
};

const ROAD_TYPE_SV: Record<string, string> = {
  landsvag: 'landsväg', kungavag: 'kungaväg', rullstensas: 'rullstensås',
  halvag: 'hålväg', vintervag: 'vinterväg', bro: 'bro', vad: 'vadställe',
};

export const CarRouteMode: React.FC = () => {
  const { open, route, features, bufferM, loading } = useCarRoute();
  const { data: routes = [], isLoading: routesLoading } = useCuratedRoutes();
  const [recent, setRecent] = useState<CarRouteMeta[]>(() => loadRecent());

  // Hämta linje + objekt för vald rutt; skriv in i store:t → useMapCarRoute ritar.
  const { data: line } = useRouteLine(route?.id ?? null, 300);
  const { data: feats, isFetching: featsFetching } = useRouteFeatures(route?.id ?? null, bufferM, 300, null);
  useEffect(() => { if (line) setCarRouteLine(line); }, [line]);
  useEffect(() => { setCarRouteFeatures(feats ?? [], featsFetching); }, [feats, featsFetching]);

  // Städa kartan när kontrollen avmonteras.
  useEffect(() => () => { closeCarRoute(); }, []);

  const selectRoute = (r: CuratedRoute | CarRouteMeta) => {
    const meta: CarRouteMeta = { id: r.id, name: r.name, length_km: (r as CuratedRoute).length_km ?? (r as CarRouteMeta).length_km ?? null };
    setCarRoute(meta);
    setRecent(pushRecent(meta));
  };

  const prominentCount = features.filter((f) => f.prominent).length;

  if (!open) {
    return (
      <button
        onClick={() => openCarRoute()}
        title="Bil-läge — rutt-korridor"
        aria-label="Bil-läge"
        className="absolute z-[1050] bottom-3 left-4 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-amber-700/90 hover:bg-amber-700 text-white text-sm font-medium border-2 border-amber-500 shadow-lg backdrop-blur-md"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Car className="h-5 w-5" /><span>Bil-läge</span>
      </button>
    );
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-80 z-[1055] bg-slate-900/92 backdrop-blur-md border-t sm:border border-slate-600 sm:rounded-lg rounded-t-2xl shadow-2xl flex flex-col"
      style={{ maxHeight: '62vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="sm:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-slate-600" aria-hidden="true" />
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Car className="h-4 w-4 text-amber-400" /> Bil-läge
          {route && <span className="text-slate-400 font-normal text-xs">· {loading || featsFetching ? '…' : `${features.length} objekt`}</span>}
        </span>
        <button onClick={() => closeCarRoute()} aria-label="Stäng" className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3">
        {/* Korridorbredd (buffert) — log-ish skala: körfältsnära → några km */}
        {route && (
          <div className="mb-3">
            <div className="text-[11px] text-slate-400 mb-1">Bredd längs vägen (±)</div>
            <div className="flex flex-wrap gap-1">
              {BUFFER_STOPS.map((b) => (
                <button key={b.m} onClick={() => setCarRouteBuffer(b.m)}
                  className={`px-2 py-1 rounded border text-[11px] transition-colors ${bufferM === b.m ? 'bg-amber-500/25 border-amber-500 text-amber-100' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  style={{ minHeight: 32 }}>{b.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Senast körda rutter */}
        {recent.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] text-slate-400 mb-1">Senaste</div>
            <div className="flex flex-wrap gap-1">
              {recent.map((r) => (
                <button key={r.id} onClick={() => selectRoute(r)}
                  className={`px-2 py-1 rounded border text-[11px] transition-colors ${route?.id === r.id ? 'bg-amber-500/20 border-amber-500 text-amber-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  style={{ minHeight: 32 }}>{r.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Väljare: kurerade rutter */}
        <div className="text-[11px] text-slate-400 mb-1">Välj rutt</div>
        {routesLoading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" /> Hämtar rutter…</div>
        ) : routes.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Inga kurerade rutter med vägpunkter ännu.</p>
        ) : (
          <ul className="space-y-1">
            {routes.map((r) => {
              const active = route?.id === r.id;
              const type = r.road_type ? (ROAD_TYPE_SV[r.road_type] ?? r.road_type) : '';
              return (
                <li key={r.id}>
                  <button onClick={() => selectRoute(r)}
                    className={`w-full flex items-center justify-between gap-2 text-left px-2.5 rounded border transition-colors ${active ? 'bg-amber-500/15 border-amber-500' : 'border-slate-700 hover:bg-slate-800'}`}
                    style={{ minHeight: 46 }}>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm text-slate-100">
                        <RouteIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{r.name}</span>
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {type}{r.length_km != null ? ` · ~${Number(r.length_km).toLocaleString('sv-SE')} km` : ''} · {r.waypoint_count} vägpunkter
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Sammanfattning för vald rutt */}
        {route && (
          <p className="mt-3 text-[11px] text-slate-500 leading-snug">
            {featsFetching ? 'Söker längs vägen…' : (
              <>
                {features.length} objekt inom ±{bufferM < 1000 ? `${bufferM} m` : `${bufferM / 1000} km`} längs {route.name}
                {prominentCount > 0 ? ` · ${prominentCount} huvudnoder namnges` : ''}. Täta stråk klustras på kartan.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
