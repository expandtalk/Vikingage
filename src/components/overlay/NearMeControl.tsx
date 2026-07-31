import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, Loader2, X, Navigation } from 'lucide-react';
import {
  useNearMe, openNearMe, closeNearMe, setNearMeLocating, setNearMePos,
  setNearMeError, setNearMeRadiusKm, setNearMeResults,
} from '@/hooks/useNearMe';
import { useNearbyFeatures } from '@/hooks/useNearbyFeatures';

// Svenska etiketter + färg per feature_type ur nearby_features (fallback = råtypen).
const TYPE_LABEL: Record<string, { sv: string; color: string }> = {
  runestone: { sv: 'Runsten', color: 'text-amber-300' },
  church: { sv: 'Kyrka', color: 'text-sky-300' },
  fortress: { sv: 'Fornborg', color: 'text-orange-300' },
  heritage: { sv: 'Lämning', color: 'text-purple-300' },
  estate: { sv: 'Gods/gård', color: 'text-emerald-300' },
  beacon: { sv: 'Vårdkase', color: 'text-red-300' },
  thing_site: { sv: 'Tingsplats', color: 'text-cyan-300' },
  coin: { sv: 'Myntfynd', color: 'text-yellow-300' },
  cult_site: { sv: 'Kultplats', color: 'text-fuchsia-300' },
  maritime_node: { sv: 'Maritim nod', color: 'text-cyan-300' },
};
const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const typeInfo = (t: string) => TYPE_LABEL[t] ?? { sv: capFirst(t), color: 'text-slate-300' };
// Heritage-rader bär label = "raa_type – namn" (ex. "gravfält – Store högen") eller bara
// "gravfält". Gruppera på lämningstypen (delen före " – "), Versal, EN gång som rubrik.
const HERITAGE_SEP = ' – ';
const heritageType = (label: string) => (label?.split(HERITAGE_SEP)[0]?.trim() || 'lämning');
const heritageName = (label: string) => { const i = label?.indexOf(HERITAGE_SEP); return i >= 0 ? label.slice(i + HERITAGE_SEP.length).trim() : ''; };
// Gruppnyckel: heritage → lämningstyp; övrigt → feature_type.
const groupKeyOf = (f: { feature_type: string; label: string }) => (f.feature_type === 'heritage' ? heritageType(f.label) : f.feature_type);
const groupInfo = (key: string, isHeritage: boolean) => (isHeritage ? { sv: capFirst(key), color: 'text-purple-300' } : typeInfo(key));
// Near me respekterar intresseprofilen: dölj typer vars lager är AVSLAGET. heritage/estate
// = null (alltid, kärnarkeologi). Ej-mappad typ visas. Saknas enabledLayers → ingen filtrering.
const LAYER_FOR: Record<string, string | null> = {
  runestone: 'runic_inscriptions', church: 'ecclesiastical_churches',
  cult_site: 'gods', maritime_node: 'maritime_nodes', estate: null, heritage: null,
};
const fmtDist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
// Klick på ett listobjekt: flyg dit + öppna popup (VAR + VAD). __nearMeFlyTo sätts av useMapNearMe.
const flyTo = (
  f: { lat: number; lng: number; distance_km: number },
  name: string,
  typeSv: string,
) =>
  (window as unknown as { __nearMeFlyTo?: (a: number, b: number, l?: string, t?: string, d?: string) => void })
    .__nearMeFlyTo?.(f.lat, f.lng, name, typeSv, fmtDist(f.distance_km));
// Färdsätt → radie (samma logik som linjalens dagsresa, men en promenad härifrån).
const MODES: [string, number][] = [['Gående 5 km', 5], ['Cykel 15 km', 15], ['Bil 40 km', 40]];
const CONSENT_KEY = 'nearme_consent';
const consented = () => { try { return localStorage.getItem(CONSENT_KEY) === '1'; } catch { return false; } };

// "Near me" — var är jag & vad finns omkring. Förstagångs: stor knapp = samtyckesgest
// → webbläsarens platsdialog. Efter godkänt (localStorage) auto-lokaliseras vid retur.
// Position hämtas PÅ BEGÄRAN (getCurrentPosition), ingen följning. Träffar → kunskapsgrafen.
export const NearMeControl: React.FC<{ enabledLayers?: Record<string, boolean> }> = ({ enabledLayers }) => {
  const { open, pos, radiusKm, locating, error } = useNearMe();
  const [debouncedR, setDebouncedR] = useState(radiusKm);
  useEffect(() => { const t = setTimeout(() => setDebouncedR(radiusKm), 300); return () => clearTimeout(t); }, [radiusKm]);
  // Grupperad lista: en kollapsbar sektion per typ (Runstenar, Gravar, Kyrkor…).
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (t: string) => setOpenGroups((p) => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const { data, isFetching } = useNearbyFeatures(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  // Filtrera på intresseprofilen (dölj typer vars lager är avslaget).
  const showByInterest = (t: string) => { const k = LAYER_FOR[t]; return k == null ? true : enabledLayers?.[k] !== false; };
  const rows = (data ?? []).filter((f: any) => showByInterest(f.feature_type));
  useEffect(() => { setNearMeResults(rows, isFetching); }, [data, isFetching, enabledLayers]); // eslint-disable-line react-hooks/exhaustive-deps

  const locate = () => {
    if (!('geolocation' in navigator)) { setNearMeError('Platstjänst stöds inte i denna webbläsare'); return; }
    setNearMeLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* noop */ } setNearMePos(p.coords.latitude, p.coords.longitude, p.coords.accuracy); },
      (err) => setNearMeError(err.code === err.PERMISSION_DENIED ? 'Platsåtkomst nekad — tillåt plats i webbläsarinställningarna' : 'Kunde inte hämta din position'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Retur-besök: har man redan godkänt plats → auto-lokalisera + visa Near me direkt.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return; autoRan.current = true;
    if (consented() && !open) { openNearMe(); locate(); }
  }, []); // en gång vid montering

  if (!open) {
    // Förstagång = STOR, solklar knapp (gesten som utlöser platsdialogen). Retur = kompakt pill.
    if (!consented()) {
      return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1050] w-[min(92%,360px)] text-center">
          <button
            onClick={() => { openNearMe(); locate(); }}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-base font-semibold border-2 border-sky-300 shadow-2xl"
            style={{ minHeight: 56 }}
          >
            <LocateFixed className="h-6 w-6" />Near me — vad finns omkring mig?
          </button>
          <p className="mt-2 text-xs text-white/90 bg-slate-900/80 rounded-lg px-3 py-1.5 backdrop-blur-md">
            Visar runstenar, gravar, kyrkor & fornlämningar inom {radiusKm} km från dig. Din plats används bara här — vi följer dig inte.
          </p>
        </div>
      );
    }
    return (
      <button
        onClick={() => { openNearMe(); locate(); }}
        title="Near me — vad finns omkring?"
        className="absolute bottom-4 right-4 z-[1050] flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-sky-600/95 hover:bg-sky-600 text-white text-sm font-medium border-2 border-sky-400 shadow-lg backdrop-blur-md"
        style={{ minHeight: 44 }}
      >
        <LocateFixed className="h-5 w-5" />Near me
      </button>
    );
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96 z-[1055] bg-slate-900 border-t sm:border border-slate-600 sm:rounded-lg rounded-t-2xl shadow-2xl flex flex-col"
      style={{ maxHeight: '62vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="sm:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-slate-600" aria-hidden="true" />
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-white text-sm font-semibold flex items-center gap-2"><Navigation className="h-4 w-4 text-sky-400" />Near me</span>
        <button onClick={closeNearMe} aria-label="Stäng" className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-2">
        {locating ? (
          <div className="flex items-center gap-2 text-sky-300 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" />Hämtar din position…</div>
        ) : error ? (
          <div className="flex items-center justify-between gap-2 text-rose-300 text-sm py-2">
            <span>{error}</span>
            <button onClick={locate} className="shrink-0 px-2.5 py-1.5 rounded border border-rose-500/50 text-rose-200 hover:bg-rose-500/15" style={{ minHeight: 40 }}>Försök igen</button>
          </div>
        ) : pos ? (
          <>
            {/* Färdsätts-chips (räckvidd som en resa härifrån) */}
            <div className="flex gap-1 mb-2">
              {MODES.map(([label, km]) => (
                <button key={km} onClick={() => setNearMeRadiusKm(km)}
                  className={`flex-1 py-1.5 rounded border text-[11px] transition-colors ${radiusKm === km ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  style={{ minHeight: 36 }}>{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-sky-300 whitespace-nowrap">Radie: {radiusKm < 1 ? `${Math.round(radiusKm * 1000)} m` : `${radiusKm.toFixed(1)} km`}</span>
              <input type="range" min={0.2} max={40} step={0.2} value={radiusKm}
                onChange={(e) => setNearMeRadiusKm(Number(e.target.value))} className="flex-1 accent-sky-500 cursor-pointer" aria-label="Sökradie i kilometer" />
              <span className="text-slate-400 whitespace-nowrap">{isFetching ? '…' : `${rows.length} objekt`}</span>
            </div>
          </>
        ) : (
          <button onClick={locate} className="w-full py-2.5 rounded bg-sky-600/90 hover:bg-sky-600 text-white text-sm font-medium" style={{ minHeight: 44 }}>Hämta min position</button>
        )}
      </div>

      {pos && !error && (
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {rows.length === 0 && !isFetching ? (
            <p className="text-slate-400 text-sm text-center py-6">Inget registrerat inom {radiusKm < 1 ? `${Math.round(radiusKm * 1000)} m` : `${radiusKm.toFixed(1)} km`}. Dra ut radien.</p>
          ) : (
            <ul className="space-y-1">
              {/* Gruppera per typ — heritage delas upp per lämningstyp (Gravfält, Stensättning…),
                  så typordet står EN gång som Versal-rubrik med antal. Radklick flyger dit + popup. */}
              {(Object.entries(rows.reduce<Record<string, typeof rows>>((acc, f) => { (acc[groupKeyOf(f)] ||= []).push(f); return acc; }, {}))
                .sort((a, b) => b[1].length - a[1].length)).map(([key, items]) => {
                const isHeritage = items[0].feature_type === 'heritage';
                const info = groupInfo(key, isHeritage);
                const isOpen = openGroups.has(key);
                return (
                  <li key={key}>
                    <button onClick={() => toggleGroup(key)} className="w-full flex items-center justify-between px-2.5 rounded bg-slate-800/60 hover:bg-slate-800" style={{ minHeight: 44 }}>
                      <span className={`text-sm font-medium ${info.color}`}>{isOpen ? '▾' : '▸'} {info.sv}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{items.length}</span>
                    </button>
                    {isOpen && (
                      <ul className="mt-0.5 ml-2 border-l border-slate-700 pl-1">
                        {items.slice(0, 60).map((f, i) => {
                          // Namngivna objekt visar sitt namn; namnlösa lämningar visar bara ordningsnr
                          // (typordet står redan i rubriken → ingen upprepning).
                          const name = isHeritage ? heritageName(f.label) : f.label;
                          const shown = name || `#${i + 1}`;
                          return (
                            <li key={`${f.feature_id}-${i}`}>
                              <button onClick={() => flyTo(f, name || info.sv, info.sv)} title="Visa på kartan" className="w-full flex items-center justify-between gap-2 text-left px-2 rounded hover:bg-slate-800" style={{ minHeight: 40 }}>
                                <span className={`min-w-0 truncate text-sm ${name ? 'text-slate-200' : 'text-slate-400'}`}>{shown}</span>
                                <span className="shrink-0 tabular-nums text-xs text-sky-300">{fmtDist(f.distance_km)}</span>
                              </button>
                            </li>
                          );
                        })}
                        {items.length > 60 && <li className="text-[11px] text-slate-500 px-2 py-1">… {items.length - 60} till (dra in radien)</li>}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
