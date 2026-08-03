import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, Loader2, X, Navigation, Sparkles, Minus, ChevronUp } from 'lucide-react';
import {
  useNearMe, openNearMe, closeNearMe, setNearMeLocating, setNearMePos,
  setNearMeError, setNearMeRadiusKm, setNearMeResults, type NearMeFeature,
} from '@/hooks/useNearMe';
import { useNearbyFeatures } from '@/hooks/useNearbyFeatures';
import { useNearbyRanked } from '@/hooks/useNearbyRanked';
import { useNearbyExperiences } from '@/hooks/useNearbyExperiences';

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
  // Upplevelser (experiences) — säsongsfiltrerade via nearby_experiences.
  badplats: { sv: 'Badplats', color: 'text-sky-300' },
  camping: { sv: 'Camping', color: 'text-emerald-300' },
  vandringsled: { sv: 'Vandringsled', color: 'text-amber-300' },
  utsiktsplats: { sv: 'Utsiktsplats', color: 'text-violet-300' },
  simhall: { sv: 'Simhall', color: 'text-cyan-300' },
  golfbana: { sv: 'Golfbana', color: 'text-lime-300' },
  attraktion: { sv: 'Attraktion', color: 'text-pink-300' },
  cafe: { sv: 'Café', color: 'text-orange-300' },
  turistbyra: { sv: 'Turistbyrå', color: 'text-amber-300' },
  svampplockning: { sv: 'Svampplockning', color: 'text-amber-300' },
  fagelskadning: { sv: 'Fågelskådning', color: 'text-cyan-300' },
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
  f: { lat: number; lng: number; distance_km: number; parish?: string | null; source_uri?: string | null; feature_type?: string; feature_id?: string },
  name: string,
  typeSv: string,
) =>
  (window as unknown as { __nearMeFlyTo?: (a: number, b: number, l?: string, t?: string, d?: string, p?: string | null, u?: string | null, ft?: string | null, fi?: string | null) => void })
    .__nearMeFlyTo?.(f.lat, f.lng, name, typeSv, fmtDist(f.distance_km), f.parish ?? undefined, f.source_uri ?? undefined, f.feature_type, f.feature_id);
// Färdsätt → radie-INTERVALL (min/default/max) + snabbstopp. Skalan byter KARAKTÄR med färdsättet:
// gående = tät närzon (koncentriska band), bil = regional översikt. Bara mobil (Daniel).
interface TravelMode { key: string; label: string; min: number; def: number; max: number; step: number; stops: number[] }
const TRAVEL_MODES: TravelMode[] = [
  { key: 'foot', label: 'Gå',    min: 0.1, def: 5,  max: 5,   step: 0.1, stops: [0.1, 0.2, 0.5, 1, 2, 3, 4, 5] },
  { key: 'bike', label: 'Cykla', min: 1,   def: 3,  max: 30,  step: 1,   stops: [3, 5, 10, 15, 20, 25, 30] },
  { key: 'car',  label: 'Kör',   min: 40,  def: 40, max: 500, step: 10,  stops: [40, 50, 100, 200, 300, 400, 500] },
];
// Koncentriska bandkanter i gång-läget (meter): "Inom 100 m", "100–200 m", … regelbunden skala.
const FOOT_BAND_EDGES_M = [100, 200, 500, 1000, 2000, 3000, 4000, 5000];
const fmtKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`);
const fmtM = (m: number) => (m < 1000 ? `${m} m` : `${m / 1000} km`);
const bandLabel = (lo: number, hi: number) => (lo === 0 ? `Inom ${fmtM(hi)}` : `${fmtM(lo)}–${fmtM(hi)}`);
// Zooma kartan så FLERA objekt ryms (klick på kategori-/bandrubrik) — satt av useMapNearMe.
const fitFeatures = (items: { lat: number; lng: number }[]) =>
  (window as unknown as { __nearMeFitFeatures?: (p: { lat: number; lng: number }[]) => void }).__nearMeFitFeatures?.(items);
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
  // Valt färdsätt styr radie-intervallet + hur listan presenteras (band / typ / översikt).
  const [mode, setMode] = useState('foot');
  // Kryssruta: spara samtycket (auto-lokalisera vid återbesök) bara om ikryssad. Default på.
  const [remember, setRemember] = useState(true);
  // Minimera-läge: fäll ihop panelen till bara rubrikraden (behåll position/träffar) — Daniel
  // ville kunna få undan Near me på desktop utan att stänga och tappa sin lokalisering.
  const [minimized, setMinimized] = useState(false);
  const activeMode = TRAVEL_MODES.find((m) => m.key === mode) ?? TRAVEL_MODES[0];

  const { data, isFetching } = useNearbyFeatures(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  const { data: ranked = [] } = useNearbyRanked(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  // Säsongsfiltrerade upplevelser (badplatser m.fl.) merge:as in i listan — RPC:n filtrerar på månad.
  // OBS: INGEN default (= []) här — det skapar ny array-referens varje render, och eftersom exp
  // ligger i useEffect-deps nedan gav det en oändlig render-loop (React #185). undefined är stabil.
  const { data: exp } = useNearbyExperiences(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  // Filtrera på intresseprofilen (dölj typer vars lager är avslaget).
  const showByInterest = (t: string) => { const k = LAYER_FOR[t]; return k == null ? true : enabledLayers?.[k] !== false; };
  const rows = [...(data ?? []), ...(exp ?? [])].filter((f: any) => showByInterest(f.feature_type))
    .sort((a, b) => a.distance_km - b.distance_km) as NearMeFeature[];
  // "Mest sevärt nära dig" — topp ur rank-RPC:n. Bil-läget leder med fler (översikten).
  const topRanked = ranked.filter((f) => showByInterest(f.feature_type)).slice(0, mode === 'car' ? 12 : 6);
  // Bil-översikt: antal per typ (störst först) — klick zoomar till alla objekt av den typen.
  const carGroups = Object.entries(rows.reduce<Record<string, NearMeFeature[]>>((acc, f) => { (acc[groupKeyOf(f)] ||= []).push(f); return acc; }, {})).sort((a, b) => b[1].length - a[1].length);
  // Gående: bucketa raderna i koncentriska avståndsband upp till vald radie.
  const footBands = (() => {
    const edges = FOOT_BAND_EDGES_M.filter((e) => e <= radiusKm * 1000 + 1);
    if (edges.length === 0 || edges[edges.length - 1] < radiusKm * 1000 - 1) edges.push(Math.round(radiusKm * 1000));
    const bands = edges.map((hi, i) => ({ lo: i === 0 ? 0 : edges[i - 1], hi, items: [] as NearMeFeature[] }));
    for (const f of rows) {
      const m = f.distance_km * 1000;
      (bands.find((bd) => m <= bd.hi + 1e-6) ?? bands[bands.length - 1])?.items.push(f);
    }
    return bands.filter((b) => b.items.length > 0);
  })();
  useEffect(() => { setNearMeResults(rows, isFetching); }, [data, exp, isFetching, enabledLayers]); // eslint-disable-line react-hooks/exhaustive-deps

  const locate = () => {
    if (!('geolocation' in navigator)) { setNearMeError('Platstjänst stöds inte i denna webbläsare'); return; }
    // Geolokalisering kräver säker kontext (https). På http blockerar webbläsaren den helt —
    // vanligaste orsaken på desktop. Ge tydligt besked i stället för generiskt "kunde inte hämta".
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setNearMeError('Platstjänst kräver säker anslutning (https). Sidan verkar köras över http.');
      return;
    }
    setNearMeLocating(true);
    const ok = (p: GeolocationPosition) => {
      // Spara samtycket bara om användaren kryssat "kom ihåg" — annars gäller det bara denna gång.
      if (remember) { try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* noop */ } }
      setNearMePos(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
    };
    const fail = (err: GeolocationPositionError) => setNearMeError(
      err.code === err.PERMISSION_DENIED ? 'Platsåtkomst nekad — tillåt plats i webbläsarinställningarna'
      : err.code === err.POSITION_UNAVAILABLE ? 'Positionen kunde inte fastställas (ingen GPS/nätverksplats). Prova igen.'
      : 'Tidsgränsen gick ut — försök igen.');
    // Hög precision först (mobil-GPS); vid annat fel än nekad → fall tillbaka till nätverksläge
    // (desktop saknar GPS → high-accuracy timeout/POSITION_UNAVAILABLE).
    const attempt = (highAcc: boolean) => navigator.geolocation.getCurrentPosition(
      ok,
      (err) => { if (highAcc && err.code !== err.PERMISSION_DENIED) { attempt(false); return; } fail(err); },
      { enableHighAccuracy: highAcc, timeout: highAcc ? 8000 : 15000, maximumAge: highAcc ? 0 : 300000 },
    );
    attempt(true);
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
          <label className="mt-2 flex items-center justify-center gap-2 text-xs text-white/90 bg-slate-900/80 rounded-lg px-3 py-1.5 backdrop-blur-md cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-sky-500" />
            Kom ihåg mitt val (lokalisera automatiskt vid återbesök)
          </label>
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
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Navigation className="h-4 w-4 text-sky-400" />Near me
          {minimized && pos && !error && <span className="text-slate-400 font-normal text-xs">· {isFetching ? '…' : `${rows.length} objekt`}</span>}
        </span>
        <div className="flex items-center">
          <button onClick={() => setMinimized((m) => !m)} aria-label={minimized ? 'Expandera' : 'Minimera'} title={minimized ? 'Expandera' : 'Minimera'} className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
            {minimized ? <ChevronUp className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
          </button>
          <button onClick={closeNearMe} aria-label="Stäng" className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!minimized && (
      <>
      {/* MINIMIZE_BODY_START */}

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
            {/* Färdsätt — sätter radie-intervallet (Gående nära, Bil långt) */}
            <div className="flex gap-1 mb-2">
              {TRAVEL_MODES.map((m) => (
                <button key={m.key} onClick={() => { setMode(m.key); setNearMeRadiusKm(m.def); }}
                  className={`flex-1 py-1.5 rounded border text-[11px] transition-colors ${mode === m.key ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  style={{ minHeight: 36 }}>{m.label}</button>
              ))}
            </div>
            {/* Snabbstopp för valt färdsätt (regelbunden skala) */}
            <div className="flex flex-wrap gap-1 mb-2">
              {activeMode.stops.map((km) => (
                <button key={km} onClick={() => setNearMeRadiusKm(km)}
                  className={`px-2 py-1 rounded border text-[10px] transition-colors ${Math.abs(radiusKm - km) < 1e-6 ? 'bg-sky-500/25 border-sky-500 text-sky-100' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  style={{ minHeight: 32 }}>{fmtKm(km)}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-sky-300 whitespace-nowrap">Radie: {fmtDist(radiusKm)}</span>
              <input type="range" min={activeMode.min} max={activeMode.max} step={activeMode.step} value={radiusKm}
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
          {topRanked.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 px-1 mb-1 text-[10px] uppercase tracking-wide text-amber-300/90">
                <Sparkles className="h-3 w-3" /> Mest sevärt nära dig
              </div>
              <ul className="space-y-0.5">
                {topRanked.map((f) => {
                  const isHer = f.feature_type === 'heritage';
                  const name = isHer ? (heritageName(f.label) || capFirst(heritageType(f.label))) : f.label;
                  const typeSv = isHer ? capFirst(heritageType(f.label)) : typeInfo(f.feature_type).sv;
                  return (
                    <li key={`top-${f.feature_id}`}>
                      <button onClick={() => flyTo(f, name, typeSv)} title="Visa på kartan"
                        className="w-full flex items-center justify-between gap-2 text-left px-2 rounded bg-amber-500/5 hover:bg-amber-500/15" style={{ minHeight: 44 }}>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-slate-100">{name}</span>
                          <span className="block truncate text-[11px] text-amber-300/80">{f.rank_reason}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-xs text-sky-300">{fmtDist(f.distance_km)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-slate-700/60 mt-2" />
            </div>
          )}
          {rows.length === 0 && !isFetching ? (
            <p className="text-slate-400 text-sm text-center py-6">Inget registrerat inom {fmtDist(radiusKm)}. Dra ut radien.</p>
          ) : mode === 'car' ? (
            /* Bil: översikt — rankat leder ovan, här antal per typ. Klick zoomar till alla av typen. */
            <div className="space-y-1">
              <div className="px-1 text-[10px] uppercase tracking-wide text-slate-400">Antal per typ (närmaste {rows.length}) — tryck för att zooma dit</div>
              <div className="flex flex-wrap gap-1 px-1">
                {carGroups.map(([key, items]) => {
                  const info = groupInfo(key, items[0].feature_type === 'heritage');
                  return (
                    <button key={key} onClick={() => fitFeatures(items)} title="Zooma till dessa"
                      className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700 hover:bg-slate-800" style={{ minHeight: 36 }}>
                      <span className={`text-xs font-medium ${info.color}`}>{info.sv}</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">{items.length}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 px-1 pt-1">Bil-läget visar de mest sevärda + antal (närmaste {rows.length}). Byt till Cykel/Gående för fullständig lista.</p>
            </div>
          ) : mode === 'foot' ? (
            /* Gående: koncentriska avståndsband ("Inom 100 m", "100–200 m", …). Rubrikklick zoomar till bandet. */
            <ul className="space-y-1">
              {footBands.map(({ lo, hi, items }) => {
                const key = `band-${hi}`;
                const isOpen = openGroups.has(key);
                return (
                  <li key={key}>
                    <button onClick={() => { toggleGroup(key); fitFeatures(items); }} className="w-full flex items-center justify-between px-2.5 rounded bg-slate-800/60 hover:bg-slate-800" style={{ minHeight: 44 }}>
                      <span className="text-sm font-medium text-sky-200">{isOpen ? '▾' : '▸'} {bandLabel(lo, hi)}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{items.length}</span>
                    </button>
                    {isOpen && (
                      <ul className="mt-0.5 ml-2 border-l border-slate-700 pl-1">
                        {items.slice(0, 60).map((f, i) => {
                          const isHer = f.feature_type === 'heritage';
                          const name = isHer ? (heritageName(f.label) || capFirst(heritageType(f.label))) : f.label;
                          const typeSv = isHer ? capFirst(heritageType(f.label)) : typeInfo(f.feature_type).sv;
                          return (
                            <li key={`${f.feature_id}-${i}`}>
                              <button onClick={() => flyTo(f, name, typeSv)} title="Visa på kartan" className="w-full flex items-center justify-between gap-2 text-left px-2 rounded hover:bg-slate-800" style={{ minHeight: 40 }}>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm text-slate-200">{name}</span>
                                  <span className="block truncate text-[11px] text-slate-500">{typeSv}{f.parish ? ` · ${f.parish} sn` : ''}</span>
                                </span>
                                <span className="shrink-0 tabular-nums text-xs text-sky-300">{fmtDist(f.distance_km)}</span>
                              </button>
                            </li>
                          );
                        })}
                        {items.length > 60 && <li className="text-[11px] text-slate-500 px-2 py-1">… {items.length - 60} till</li>}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Cykel: gruppera per typ. Rubrikklick fäller ut OCH zoomar till flera av typen. */
            <ul className="space-y-1">
              {carGroups.map(([key, items]) => {
                const isHeritage = items[0].feature_type === 'heritage';
                const info = groupInfo(key, isHeritage);
                const isOpen = openGroups.has(key);
                return (
                  <li key={key}>
                    <button onClick={() => { toggleGroup(key); fitFeatures(items); }} className="w-full flex items-center justify-between px-2.5 rounded bg-slate-800/60 hover:bg-slate-800" style={{ minHeight: 44 }}>
                      <span className={`text-sm font-medium ${info.color}`}>{isOpen ? '▾' : '▸'} {info.sv}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{items.length}</span>
                    </button>
                    {isOpen && (
                      <ul className="mt-0.5 ml-2 border-l border-slate-700 pl-1">
                        {items.slice(0, 60).map((f, i) => {
                          const name = isHeritage ? heritageName(f.label) : f.label;
                          const shown = name || `#${i + 1}`;
                          return (
                            <li key={`${f.feature_id}-${i}`}>
                              <button onClick={() => flyTo(f, name || info.sv, info.sv)} title="Visa på kartan" className="w-full flex items-center justify-between gap-2 text-left px-2 rounded hover:bg-slate-800" style={{ minHeight: 40 }}>
                                <span className={`min-w-0 truncate text-sm ${name ? 'text-slate-200' : 'text-slate-400'}`}>{shown}{f.parish ? <span className="text-slate-500"> · {f.parish} sn</span> : null}</span>
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
      {/* MINIMIZE_BODY_END */}
      </>
      )}
    </div>
  );
};
