import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, Loader2, X, Navigation, Sparkles, Minus, ChevronUp, Compass } from 'lucide-react';
import {
  useNearMe, openNearMe, closeNearMe, setNearMeLocating, setNearMePos,
  setNearMeError, setNearMeRadiusKm, setNearMeResults, type NearMeFeature,
} from '@/hooks/useNearMe';
import { useNearbyFeatures } from '@/hooks/useNearbyFeatures';
import { useNearbyRanked } from '@/hooks/useNearbyRanked';
import { useNearbyExperiences } from '@/hooks/useNearbyExperiences';
import {
  useRoadtrip, setRoadtripSearching, setRoadtripResult, setRoadtripCorridor, setRoadtripError, clearRoadtrip,
  getRecentDestinations, pushRecentDestination, type RecentDest,
} from '@/hooks/useRoadtrip';
import { useNearbyAlongRoute } from '@/hooks/useNearbyAlongRoute';
import { geocode, route as computeRoute } from '@/services/routing';
import { setDrivingMode, useCourseUp, setCourseUp } from '@/hooks/useDrivingMode';
import { useTravelMode, setTravelMode, TRAVEL_MODE_LABELS, type TravelMode } from '@/hooks/useTravelMode';
import { useNearbyPages } from '@/hooks/useNearbyPages';
import { useCustomPoints, addCustomPoint, removeCustomPoint } from '@/hooks/useCustomPoints';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { setProbe, setProbeShape, setProbeRadiusKm } from '@/hooks/useProximityProbe';
import { useDraggable } from '@/hooks/useDraggable';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { startFieldNav, stopFieldNav, useFieldNav, setFieldNavTarget, requestCompassPermission } from '@/hooks/useFieldNav';
import { bucketCorridor, gateBySpeed } from '@/utils/navCorridor';
import { haversineKm } from '@/utils/geoDistance';

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
  // Gå: upp till ~5 km (~5000 steg). Cykla: 500 m – 5 mil (50 km). Kör: 100 m – 500 km (log-lika steg).
  // Båt: 500 m – 30 km (3 mil — man åker sällan längre; Daniel). "Vad finns här"-sonden (meter) är
  // golvet under detta. Stegen snäpper via stops[].
  { key: 'foot', label: 'Gå',    min: 0.1, def: 0.5, max: 5,   step: 0.1, stops: [0.1, 0.25, 0.5, 1, 2, 3, 5] },
  { key: 'bike', label: 'Cykla', min: 0.5, def: 3,   max: 50,  step: 0.5, stops: [0.5, 1, 2, 5, 10, 20, 30, 50] },
  { key: 'car',  label: 'Kör',   min: 0.1, def: 5,   max: 500, step: 0.1, stops: [0.1, 0.5, 1, 5, 10, 25, 50, 100, 200, 300, 500] },
  { key: 'boat', label: 'Båt',   min: 0.5, def: 5,   max: 30,  step: 0.5, stops: [0.5, 1, 2, 5, 10, 15, 20, 30] },
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
// Beständig "nekad"-flagga: när webbläsaren nekat plats ska vi INTE öppna en stor panel vid varje
// sidladdning (Daniel: "jag ser den hela tiden i desktoppen") — visa bara en liten pill-länk.
const DENIED_KEY = 'nearme_denied_v1';
// Modulnivå (överlever route-remontering i SPA:n, nollställs vid full omladdning): har användaren
// STÄNGT Near me ska den inte auto-öppnas igen vid navigering (Daniel: "störigt att behöva stänga
// ner near me när jag redan gjort det en gång"). Manuellt öppnande via pill-knappen nollställer den.
let sessionDismissed = false;

// "Near me" — var är jag & vad finns omkring. Förstagångs: stor knapp = samtyckesgest
// → webbläsarens platsdialog. Efter godkänt (localStorage) auto-lokaliseras vid retur.
// Position hämtas PÅ BEGÄRAN (getCurrentPosition), ingen följning. Träffar → kunskapsgrafen.
export const NearMeControl: React.FC<{ enabledLayers?: Record<string, boolean> }> = ({ enabledLayers }) => {
  const { open, pos, radiusKm, locating, error } = useNearMe();
  // Fältnavigeringens live-position (GPS-fart) — driver hastighetsgrindningen i korridorlistan.
  // `active` = fältläge på → dölj Near me-pillen (FieldModeHud äger då nedre zonen; en framdörr).
  const { pos: fieldPos, active: fieldActive } = useFieldNav();
  const [debouncedR, setDebouncedR] = useState(radiusKm);
  useEffect(() => { const t = setTimeout(() => setDebouncedR(radiusKm), 300); return () => clearTimeout(t); }, [radiusKm]);
  // Grupperad lista: en kollapsbar sektion per typ (Runstenar, Gravar, Kyrkor…).
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (t: string) => setOpenGroups((p) => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });
  // Valt färdsätt styr radie-intervallet + hur listan presenteras (band / typ / översikt).
  // Delad store → samma läge som mobil-legendens Gå/Cykla/Kör.
  const mode = useTravelMode();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Nekad/otillgänglig plats → liten länk i st.f. stor panel. Kvarstår mellan besök.
  const [denied, setDenied] = useState(() => { try { return localStorage.getItem(DENIED_KEY) === '1'; } catch { return false; } });
  const setDeniedPersist = (v: boolean) => { setDenied(v); try { if (v) localStorage.setItem(DENIED_KEY, '1'); else localStorage.removeItem(DENIED_KEY); } catch { /* noop */ } };
  // Flyttbar panel (desktop) som minns sin position mellan besök.
  const { rootRef, dragHandleProps, style: dragStyle } = useDraggable('vikingage_nearme_pos_v1');
  // Mina platser (localStorage) — ersätter fristående "Mina punkter"-kontrollen.
  const savedPlaces = useCustomPoints();
  // Discovery + ruttplanering är öppet för alla; att SPARA egna platser/vyer kräver konto
  // (Daniel: kontrollerat sparande, konsekvent med Fas 1). Geolokalisering/rutt gate:as EJ.
  const { user } = useAuth();
  const [placeName, setPlaceName] = useState('');
  // Bil: Översikt (stanna & planera på den breda kartan) vs Kör (med mål → rutt + korridor).
  const [carView, setCarView] = useState<'overview' | 'drive'>('overview');
  // Kryssruta: spara samtycket (auto-lokalisera vid återbesök) bara om ikryssad. Default på.
  const [remember, setRemember] = useState(true);
  // Minimera-läge: fäll ihop panelen till bara rubrikraden (behåll position/träffar) — Daniel
  // ville kunna få undan Near me på desktop utan att stänga och tappa sin lokalisering.
  const [minimized, setMinimized] = useState(() => { try { return localStorage.getItem('vikingage_nearme_min_v1') === '1'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem('vikingage_nearme_min_v1', minimized ? '1' : '0'); } catch { /* privat läge */ } }, [minimized]);
  // Roadtrip (bil-läge): skriv ett mål → geokoda → rita bilrutt. Store ⇄ useMapRoadtrip.
  const { dest, route, status: rtStatus, error: rtError } = useRoadtrip();
  const courseUp = useCourseUp();
  const [destQuery, setDestQuery] = useState('');
  const goRoadtrip = async () => {
    const q = destQuery.trim();
    if (!q || !pos) return;
    setRoadtripSearching();
    try {
      const g = await geocode(q);
      if (!g) { setRoadtripError(`Hittade ingen plats för "${q}" i Sverige.`); return; }
      const r = await computeRoute(pos, g);
      if (!r) { setRoadtripError('Kunde inte beräkna en bilrutt dit.'); return; }
      setRoadtripResult({ lat: g.lat, lng: g.lng, label: g.label }, r);
      pushRecentDestination({ label: g.label, lat: g.lat, lng: g.lng });
    } catch (e) {
      setRoadtripError(e instanceof Error ? e.message : 'Något gick fel vid ruttberäkningen.');
    }
  };
  // Klick på ett "nyligen"-mål → rutt direkt (lagrad koordinat, ingen ny geokodning).
  const goRecent = async (d: RecentDest) => {
    if (!pos) return;
    setDestQuery(d.label);
    setRoadtripSearching();
    try {
      const r = await computeRoute(pos, d);
      if (!r) { setRoadtripError('Kunde inte beräkna vägen dit.'); return; }
      setRoadtripResult(d, r);
      pushRecentDestination(d);
    } catch (e) { setRoadtripError(e instanceof Error ? e.message : 'Fel vid ruttberäkningen.'); }
  };
  const recentDests = getRecentDestinations();

  // Auto-avsluta resan efter >30 min stillastående (Daniel). Följer fältnavets live-position; nollställs
  // vid varje rörelse >30 m. GPS-watchen sänder regelbundet även stilla, så effekten körs på pos-uppdatering.
  const lastMoveRef = useRef<{ lat: number; lng: number; t: number } | null>(null);
  useEffect(() => {
    if (!route) { lastMoveRef.current = null; return; }
    const p = fieldPos; if (!p) return;
    const now = Date.now();
    const last = lastMoveRef.current;
    if (!last || haversineKm({ lat: last.lat, lng: last.lng }, { lat: p.lat, lng: p.lng }) > 0.03) {
      lastMoveRef.current = { lat: p.lat, lng: p.lng, t: now };
      return;
    }
    if (now - last.t > 30 * 60 * 1000) {
      clearRoadtrip(); setDestQuery(''); setCarView('overview'); lastMoveRef.current = null;
    }
  }, [fieldPos, route]);
  // OBS: rutten rensas MEDVETET inte längre vid stängning/avmontering — Task 2 gav rutten
  // sessionStorage-persistens, och en tyst clearRoadtrip() här skulle wipe:a den direkt igen.
  // Enda sättet att rensa en aktiv rutt är nu den explicita "Avsluta resa"-knappen (endTrip).
  // Billäge: map-first-läget slås på när man kör (bil-läge + öppet). Strippar chrome + zoomar in
  // + startar Kompass till punkt-fältnavet (live-position + riktningskägla; GPS-kurs räcker i
  // bil, ingen kompassgest).
  // AVSTÄNGNING är MEDVETET inte bara "on"-villkorets negation: att stänga (minimera/X) panelen
  // (open→false) ska INTE döda en aktiv körsession — t.ex. en startad via NavigatorHud:s egna,
  // fristående "Följ färd"-knapp (den är oberoende av den här panelens öppen/stängd-tillstånd).
  // Bara ett explicit bortval — byt färdsätt bort från bil, eller lämna Kör-vyn (Översikt-knappen
  // eller endTrip, båda sätter carView='overview') — stänger av. `open` triggar alltså bara PÅ.
  useEffect(() => {
    if (open && mode === 'car' && carView === 'drive') {
      setDrivingMode(true);
      startFieldNav();
    } else if (mode !== 'car' || carView !== 'drive') {
      setDrivingMode(false);
      stopFieldNav();
    }
  }, [open, mode, carView]);
  useEffect(() => () => { setDrivingMode(false); stopFieldNav(); }, []);
  const activeMode = TRAVEL_MODES.find((m) => m.key === mode) ?? TRAVEL_MODES[0];

  const { data, isFetching } = useNearbyFeatures(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  const { data: ranked = [] } = useNearbyRanked(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  // Säsongsfiltrerade upplevelser (badplatser m.fl.) merge:as in i listan — RPC:n filtrerar på månad.
  // OBS: INGEN default (= []) här — det skapar ny array-referens varje render, och eftersom exp
  // ligger i useEffect-deps nedan gav det en oändlig render-loop (React #185). undefined är stabil.
  const { data: exp } = useNearbyExperiences(open ? pos?.lat : null, open ? pos?.lng : null, debouncedR);
  // Kurerade sidor/upplevelser nära dig (content_pages via pages_near) — "gå Göta landsvägen",
  // "besök Sandby borg", "se Kalmar". Fast 40 km-radie (region matchar på innehållande bbox).
  const { data: nearbyPages = [] } = useNearbyPages(open ? pos?.lat : null, open ? pos?.lng : null, 40);
  // Filtrera på intresseprofilen (dölj typer vars lager är avslaget).
  const showByInterest = (t: string) => { const k = LAYER_FOR[t]; return k == null ? true : enabledLayers?.[k] !== false; };
  const rows = [...(data ?? []), ...(exp ?? [])].filter((f: any) => showByInterest(f.feature_type))
    .sort((a, b) => a.distance_km - b.distance_km) as NearMeFeature[];
  // "Mest sevärt nära dig" — topp ur rank-RPC:n. Bil-läget leder med fler (översikten).
  const topRanked = ranked.filter((f) => showByInterest(f.feature_type)).slice(0, mode === 'car' ? 12 : 6);

  // Korridorsökning: sevärt LÄNGS VÄGEN (bara bil-läge + aktiv rutt). Skickar de påslagna
  // lagertyperna (intresse/legend) till RPC:n; resultatet ordnas som en resväg (frac_along).
  const CORRIDOR_TYPES = ['runestone', 'church', 'cult_site', 'estate', 'museum', 'heritage', 'maritime_node'];
  const { data: corridorData } = useNearbyAlongRoute(mode === 'car' ? route?.coords : null, CORRIDOR_TYPES.filter(showByInterest));
  useEffect(() => { setRoadtripCorridor(corridorData ?? []); }, [corridorData]);
  // Zonat (närzon ≤100 m / synfält) + hastighetsgrindat (fort → bara hög signifikans) — annars
  // svämmar listan över vid motorvägsfart. Ingen position/fart (fieldPos null) → visa allt.
  const zoned = bucketCorridor(gateBySpeed(corridorData ?? [], fieldPos?.speed ?? null));
  const corridorCount = zoned.near.length + zoned.sight.length;

  // Kom-ihåg riktig GPS-startpunkt (för "↩ Min plats" + "Kör hem"). Sätts bara vid äkta locate.
  const homePosRef = useRef<{ lat: number; lng: number } | null>(null);
  const hoppedAway = !!(pos && homePosRef.current &&
    (Math.abs(pos.lat - homePosRef.current.lat) > 1e-6 || Math.abs(pos.lng - homePosRef.current.lng) > 1e-6));
  // Klick på sevärdhet → flytta referenspunkten dit (utforska härifrån) + fäll ihop panelen så
  // kartan tar hela skärmen. useMapNearMe flyger dit; nearby räknas om från nya punkten.
  const hopTo = (lat: number, lng: number) => { setNearMePos(lat, lng, 0); setMinimized(true); };
  const backToMyLocation = () => { const h = homePosRef.current; if (h) setNearMePos(h.lat, h.lng, 0); };
  // "Visa vägen dit": upptäck → välj → guida. Sätter mål + startar fältläge (kompass-till-punkt)
  // på den interaktiva /explore-kartan. Enda vägen in i fältläge (ingen separat grön startknapp).
  // OBS: startFieldNav() nollar target → setFieldNavTarget MÅSTE ske efter.
  const guideTo = async (lat: number, lng: number, label: string) => {
    await requestCompassPermission();
    startFieldNav();
    setFieldNavTarget({ lat, lng, label });
    closeNearMe();          // stäng panelen → FieldModeHud äger skärmen (en framdörr)
    navigate('/explore');
  };
  // "Kör hem": bilrutt från nuvarande position tillbaka till startpunkten.
  const goHome = async () => {
    const h = homePosRef.current; if (!h || !pos) return;
    setRoadtripSearching();
    try {
      const r = await computeRoute(pos, h);
      if (!r) { setRoadtripError('Kunde inte beräkna vägen hem.'); return; }
      setRoadtripResult({ lat: h.lat, lng: h.lng, label: 'Min startpunkt' }, r);
    } catch (e) { setRoadtripError(e instanceof Error ? e.message : 'Fel vid vägen hem.'); }
  };
  // Klick på "sevärt längs vägen" → flyg dit + fäll ihop panelen (karta fullskärm).
  const flyToAlong = (f: { lat: number; lng: number; label: string; feature_type: string; feature_id: string; detour_km: number }) => {
    (window as unknown as { __nearMeFlyTo?: (a: number, b: number, l?: string, t?: string, d?: string, p?: string | null, u?: string | null, ft?: string | null, fi?: string | null) => void })
      .__nearMeFlyTo?.(f.lat, f.lng, f.label, typeInfo(f.feature_type).sv, `${fmtDist(f.detour_km)} från vägen`, undefined, undefined, f.feature_type, f.feature_id);
    setMinimized(true);
  };
  // Efter att en rutt beräknats (mål angivet) → fäll ihop panelen så kartan tar hela skärmen.
  const prevRtStatusRef = useRef(rtStatus);
  useEffect(() => { if (rtStatus === 'done' && prevRtStatusRef.current !== 'done') { setCarView('drive'); setMinimized(true); } prevRtStatusRef.current = rtStatus; }, [rtStatus]);
  // Enda vägen att rensa en AKTIV rutt (X stänger numera bara panelen). Går ur körvyn också
  // (annars kvarstår map-first-chrome:et utan mål) — motsvarar vad gamla X-knappen gjorde.
  const endTrip = () => { clearRoadtrip(); setDestQuery(''); setCarView('overview'); };

  // Fallback utan GPS (nekad plats/desktop): skriv in en plats (geokoda) eller släpp en nål på
  // kartan → sätter referenspunkten så nearby/korridor/roadtrip funkar ändå (Daniel).
  const [manualQuery, setManualQuery] = useState('');
  const [manualBusy, setManualBusy] = useState(false);
  const geocodeToPos = async () => {
    const q = manualQuery.trim(); if (!q) return;
    setManualBusy(true);
    try {
      const g = await geocode(q);
      if (!g) { setNearMeError(`Hittade ingen plats för "${q}".`); return; }
      setNearMePos(g.lat, g.lng, 0);
    } catch { setNearMeError('Kunde inte slå upp platsen.'); }
    finally { setManualBusy(false); }
  };
  const pickOnMap = () => { (window as unknown as { __nearMePickLocation?: () => void }).__nearMePickLocation?.(); setMinimized(true); };
  // Första etablerade positionen (GPS/geokod/nål) blir "startpunkt/hem" för ↩ och Kör hem.
  useEffect(() => { if (pos && !homePosRef.current) homePosRef.current = { lat: pos.lat, lng: pos.lng }; }, [pos]);

  // Manuell-position-block (återanvänds i nekad-läget + föreläget innan man lokaliserat).
  const manualBlock = (
    <div className="mt-2">
      <p className="text-[11px] text-slate-400 mb-1">Eller välj plats manuellt:</p>
      <div className="flex gap-1">
        <input value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') geocodeToPos(); }}
          placeholder="Skriv ort eller adress" className="flex-1 min-w-0 px-2 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-100 text-xs placeholder:text-slate-500" style={{ minHeight: 36 }} />
        <button type="button" onClick={geocodeToPos} disabled={!manualQuery.trim() || manualBusy}
          className="shrink-0 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs disabled:opacity-50 flex items-center justify-center" style={{ minHeight: 36, minWidth: 56 }}>
          {manualBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Använd'}
        </button>
      </div>
      <button type="button" onClick={pickOnMap} className="mt-1 w-full py-1.5 rounded border border-slate-600 text-slate-200 text-[11px] hover:bg-slate-800" style={{ minHeight: 34 }}>
        📍 Släpp en nål på kartan
      </button>
    </div>
  );
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
      setDeniedPersist(false); // plats fungerar igen → rensa nekad-flaggan
      // Spara samtycket bara om användaren kryssat "kom ihåg" — annars gäller det bara denna gång.
      if (remember) { try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* noop */ } }
      // Riktig GPS-position = "startpunkt/hem" (för "↩ Min plats" + "Kör hem").
      homePosRef.current = { lat: p.coords.latitude, lng: p.coords.longitude };
      setNearMePos(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
    };
    const fail = (err: GeolocationPositionError) => {
      // Nekad → kom ihåg det, så vi inte auto-öppnar en stor panel varje gång (visa liten länk).
      if (err.code === err.PERMISSION_DENIED) setDeniedPersist(true);
      setNearMeError(
        err.code === err.PERMISSION_DENIED ? 'Platsåtkomst nekad — tillåt plats i webbläsarinställningarna'
        : err.code === err.POSITION_UNAVAILABLE ? 'Positionen kunde inte fastställas (ingen GPS/nätverksplats). Prova igen.'
        : 'Tidsgränsen gick ut — försök igen.');
    };
    // Hög precision först (mobil-GPS); vid annat fel än nekad → fall tillbaka till nätverksläge
    // (desktop saknar GPS → high-accuracy timeout/POSITION_UNAVAILABLE).
    const attempt = (highAcc: boolean) => navigator.geolocation.getCurrentPosition(
      ok,
      (err) => { if (highAcc && err.code !== err.PERMISSION_DENIED) { attempt(false); return; } fail(err); },
      { enableHighAccuracy: highAcc, timeout: highAcc ? 8000 : 15000, maximumAge: highAcc ? 0 : 300000 },
    );
    attempt(true);
  };

  // Retur-besök: auto-lokalisera BARA om behörigheten är bekräftat 'granted' (Permissions API).
  // Annars ('prompt'/'denied', eller API saknas) öppnar vi INGENTING — då slapp man den ständigt
  // öppna "nekad"-panelen på desktop (Daniel). Användaren tar fram den via den lilla länken.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return; autoRan.current = true;
    if (open || !consented() || sessionDismissed) return;
    let cancelled = false;
    (async () => {
      let granted = false;
      try {
        const perm = await (navigator as any).permissions?.query({ name: 'geolocation' as PermissionName });
        granted = perm?.state === 'granted';
        if (perm?.state === 'denied') setDeniedPersist(true);
      } catch { granted = false; }
      if (granted && !cancelled) { openNearMe(); locate(); }
    })();
    return () => { cancelled = true; };
  }, []); // en gång vid montering

  // Fältläge aktivt → dölj pillen helt (FieldModeHud äger nedre zonen; en enda framdörr).
  // Undvik två location-kontroller samtidigt nere på mobilen.
  if (!open && fieldActive) return null;

  if (!open) {
    // EN kompakt pill (mobil + desktop) — ingen stor CTA-ruta med mörka textblock som täcker kartan
    // (Daniel: två mörkblå bakgrunder tog ~1/4 av mobilytan). Kom-ihåg + integritetsnotis bor i den
    // öppnade panelen i stället. Knappen är sky-färgad = läsbar mot kartan utan egen mörk platta.
    return (
      <button
        onClick={() => { sessionDismissed = false; openNearMe(); locate(); }}
        title="Near me — vad finns omkring?"
        aria-label="Near me"
        className="absolute z-[1050] bottom-3 right-4 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-sky-600/90 hover:bg-sky-600 text-white text-sm font-medium border-2 border-sky-400 shadow-lg backdrop-blur-md"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <LocateFixed className="h-5 w-5" /><span>Near me</span>
      </button>
    );
  }

  return (
    <div
      ref={rootRef}
      // Billäge (mode==='car'): tvinga alltid den fasta mobil-kanten (botten, full bredd) —
      // ALDRIG sm:-brytpunktens flytande högerhörn eller en sparad drag-position. En bilplatta/
      // liggande mobil kan lätt vara ≥768px bred (då useIsMobile ger false) och skulle annars
      // ärva en gammal skrivbordsposition mitt i bilden (bug 2, carmode-investigation.md).
      className={`absolute inset-x-0 bottom-0 z-[1055] bg-slate-900/90 backdrop-blur-md border-t border-slate-600 rounded-t-2xl shadow-2xl flex flex-col${mode === 'car' ? '' : ' sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96 sm:border sm:rounded-lg'}`}
      style={{ maxHeight: '62vh', paddingBottom: 'env(safe-area-inset-bottom)', ...(isMobile || mode === 'car' ? {} : dragStyle) }}
    >
      <div className="sm:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-slate-600" aria-hidden="true" />
      <div {...(!isMobile && mode !== 'car' ? dragHandleProps : {})} className={`flex items-center justify-between px-4 py-2.5${mode === 'car' ? '' : ' sm:cursor-grab sm:active:cursor-grabbing'}`}>
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Navigation className="h-4 w-4 text-sky-400" />Near me
          {minimized && pos && !error && <span className="text-slate-400 font-normal text-xs">· {isFetching ? '…' : `${rows.length} objekt`}</span>}
        </span>
        <div className="flex items-center">
          {/* Aktiv rutt: enda sättet att rensa den. Ligger i headern (inte MINIMIZE_BODY) så den
              går att nå även när panelen fällts ihop i körläge. */}
          {route && (
            <button type="button" onClick={endTrip} title="Avsluta resa" aria-label="Avsluta resa"
              className="mr-1 px-2.5 rounded border border-rose-500/50 text-rose-200 hover:bg-rose-500/15 text-[11px] font-medium whitespace-nowrap"
              style={{ minHeight: 36 }}>
              Avsluta resa
            </button>
          )}
          <button onClick={() => setMinimized((m) => !m)} aria-label={minimized ? 'Expandera' : 'Minimera'} title={minimized ? 'Expandera' : 'Minimera'} className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
            {minimized ? <ChevronUp className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
          </button>
          {/* Stänger BARA panelen — rensar aldrig en aktiv rutt (den lever kvar på kartan). */}
          <button onClick={() => { sessionDismissed = true; closeNearMe(); }} aria-label="Stäng" className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!minimized && (
      /* HELA kroppen scrollar (Daniels fälttest: "Kör dit-knappen utanför skärmfältet"). Tidigare
         scrollade bara träfflistan medan kontrollblocket klipptes av maxHeight:62vh. min-h-0 låter
         flex-barnet krympa och scrolla inom panelens maxhöjd. */
      <div className="flex-1 min-h-0 overflow-y-auto scroll-fade">

      <div className="px-4 pb-2">
        {locating ? (
          <div className="flex items-center gap-2 text-sky-300 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" />Hämtar din position…</div>
        ) : error ? (
          <div className="py-2">
            <div className="flex items-center justify-between gap-2 text-rose-300 text-sm">
              <span>{error}</span>
              <button onClick={locate} className="shrink-0 px-2.5 py-1.5 rounded border border-rose-500/50 text-rose-200 hover:bg-rose-500/15" style={{ minHeight: 40 }}>Försök igen</button>
            </div>
            {manualBlock}
          </div>
        ) : pos ? (
          <>
            {/* Utforskade man sig bort från sin GPS-plats (klick på sevärdhet) → väg tillbaka. */}
            {hoppedAway && (
              <button onClick={backToMyLocation} className="mb-2 w-full text-[11px] text-sky-200 bg-sky-500/10 border border-sky-500/40 rounded py-1.5 hover:bg-sky-500/20" style={{ minHeight: 34 }}>
                ↩ Tillbaka till min plats
              </button>
            )}
            {/* Färdsätt — sätter radie-intervallet (Gående nära, Bil långt) */}
            <div className="flex gap-1 mb-2">
              {TRAVEL_MODES.map((m) => (
                <button key={m.key} onClick={() => { setTravelMode(m.key as TravelMode); setNearMeRadiusKm(m.def); }}
                  className={`flex-1 py-1.5 rounded border text-[11px] transition-colors ${mode === m.key ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  style={{ minHeight: 36 }}>{m.label}</button>
              ))}
            </div>
            {/* Primär-action: starta fält-/GPS-läge på den INTERAKTIVA Explore-kartan (klick på
                objekt + nypa-zoom funkar där; INTE 3D-drive-betan, som var svart/låst i fält).
                Läges-knapparna ovan förblir räckvidds-FILTER; "starta färden" = ETT separat steg. */}
            <button
              type="button"
              onClick={async () => { await requestCompassPermission(); startFieldNav(); closeNearMe(); navigate('/explore'); }}
              className="w-full mb-2 flex items-center justify-center gap-2 py-2 rounded-lg border border-gold/50 bg-gold/15 text-amber-100 text-sm font-medium hover:bg-gold/25"
              style={{ minHeight: 42 }}
            >
              <span aria-hidden="true">{TRAVEL_MODE_LABELS[mode].icon}</span>
              {mode === 'foot' ? 'Starta gångläge' : mode === 'bike' ? 'Starta cykelläge' : mode === 'boat' ? 'Starta båtläge' : 'Starta körläge'}
            </button>
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
            {/* Bil: Översikt (stanna & planera på breda kartan) vs Kör (mål → rutt + 100 m-korridor). */}
            {mode === 'car' && (
              <div className="flex gap-1 mt-2">
                <button type="button" onClick={() => setCarView('overview')}
                  className={`flex-1 py-1.5 rounded border text-[11px] ${carView === 'overview' ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`} style={{ minHeight: 34 }}>🗺️ Översikt</button>
                <button type="button" onClick={() => setCarView('drive')}
                  className={`flex-1 py-1.5 rounded border text-[11px] ${carView === 'drive' ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`} style={{ minHeight: 34 }}>🚗 Kör</button>
              </div>
            )}
            {/* Färd upp / Norr upp — kartrotation i billäget (rotation passar inte alla). */}
            {mode === 'car' && (
              <button type="button" onClick={() => setCourseUp(!courseUp)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded border border-slate-700 text-slate-200 text-[11px] hover:bg-slate-800" style={{ minHeight: 34 }}>
                <Compass className="h-3.5 w-3.5" /> {courseUp ? 'Färd upp (roterar) — tryck för Norr upp' : 'Norr upp — tryck för Färd upp'}
              </button>
            )}
            {/* Roadtrip: skriv ett mål → geokodad bilrutt ritas på kartan (bil-läge). */}
            {mode === 'car' && (
              <form onSubmit={(e) => { e.preventDefault(); goRoadtrip(); }} className="mt-2">
                <div className="flex gap-1">
                  <input value={destQuery} onChange={(e) => setDestQuery(e.target.value)} placeholder="Kör till… (ort eller adress)"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-100 text-xs placeholder:text-slate-500" style={{ minHeight: 36 }} />
                  <button type="submit" disabled={!destQuery.trim() || rtStatus === 'searching'}
                    className="shrink-0 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium disabled:opacity-50 flex items-center justify-center" style={{ minHeight: 36, minWidth: 56 }}>
                    {rtStatus === 'searching' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kör dit'}
                  </button>
                </div>
                {/* Nyligen (Waze): återkommande mål ett klick bort. Lokalt, cookie-fritt. */}
                {!route && recentDests.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400">Nyligen:</span>
                    {recentDests.slice(0, 6).map((d) => (
                      <button key={d.label} type="button" onClick={() => goRecent(d)} disabled={rtStatus === 'searching'}
                        className="px-2 py-0.5 rounded-full border border-slate-600 text-slate-200 text-[11px] hover:bg-slate-700/50 disabled:opacity-50 max-w-[140px] truncate" style={{ minHeight: 28 }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
                {rtError && <p className="mt-1 text-[11px] text-rose-300">{rtError}</p>}
                {route && dest && rtStatus === 'done' && (
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-sky-100 truncate text-xs">🏁 {dest.label}</span>
                    <span className="shrink-0 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-sky-300 tabular-nums">{Math.round(route.durationMin)}</span>
                      <span className="text-[11px] text-slate-400">min · {route.distanceKm.toFixed(0)} km</span>
                    </span>
                    <button type="button" onClick={endTrip} className="shrink-0 text-[11px] text-slate-400 hover:text-white underline">Avsluta</button>
                  </div>
                )}
                {homePosRef.current && hoppedAway && (
                  <button type="button" onClick={goHome} disabled={rtStatus === 'searching'}
                    className="mt-1 w-full py-1.5 rounded border border-emerald-600/50 text-emerald-200 text-[11px] hover:bg-emerald-600/15 disabled:opacity-50" style={{ minHeight: 34 }}>
                    🏠 Kör hem (till startpunkten)
                  </button>
                )}
              </form>
            )}
          </>
        ) : (
          <div>
            <button onClick={locate} className="w-full py-2.5 rounded bg-sky-600/90 hover:bg-sky-600 text-white text-sm font-medium" style={{ minHeight: 44 }}>Hämta min position</button>
            {manualBlock}
          </div>
        )}
      </div>

      {/* Mina platser — sparade egna punkter (localStorage). Ersätter fristående "Mina punkter":
          spara nuvarande referenspunkt, centrera Near me där, eller analysera 9 km (hexagon). */}
      {pos && !error && (
        <div className="px-4 pb-2 border-t border-slate-700/60 pt-2">
          {user ? (
            <>
              <div className="flex items-center gap-1">
                <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Namnge & spara denna plats"
                  className="flex-1 min-w-0 px-2 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-100 text-xs placeholder:text-slate-500" style={{ minHeight: 34 }} />
                <button type="button" onClick={() => { if (pos) { addCustomPoint(placeName || 'Min plats', pos.lat, pos.lng); setPlaceName(''); } }}
                  className="shrink-0 px-2.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs" style={{ minHeight: 34 }}>Spara</button>
              </div>
              {savedPlaces.length > 0 && (
                <ul className="mt-1 space-y-0.5 max-h-28 overflow-y-auto">
                  {savedPlaces.map((p) => (
                    <li key={p.id} className="flex items-center gap-1 text-xs">
                      <button onClick={() => setNearMePos(p.lat, p.lng, 0)} title="Centrera Near me här"
                        className="flex-1 min-w-0 truncate text-left text-slate-200 hover:text-white px-1" style={{ minHeight: 32 }}>📍 {p.name}</button>
                      <button onClick={() => { setProbe(p.lat, p.lng, p.name); setProbeShape('hexagon'); setProbeRadiusKm(9); }} title="Analysera 9 km (hexagon)"
                        className="shrink-0 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-amber-200 text-[10px]">9 km</button>
                      <button onClick={() => removeCustomPoint(p.id)} title="Ta bort" className="shrink-0 px-1 text-slate-500 hover:text-rose-400">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            /* Sparande kräver konto — discovery + rutt ovan är fortfarande öppet för alla. */
            <p className="text-[11px] text-slate-400 leading-snug">
              <Link to="/auth" className="text-sky-300 underline hover:text-sky-200">Logga in</Link> för att spara egna platser och vyer.
            </p>
          )}
        </div>
      )}

      {pos && !error && (
        <div className="px-2 pb-3">
          {/* Upplevelser & sidor nära dig — nu FÖRST i den ENADE nära-dig-listan (Daniel: slå ihop
              de två listorna → en). Kurerade sidor/rutter finns inte i "mest sevärt", så de behålls. */}
          {nearbyPages.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 px-1 mb-1 text-[10px] uppercase tracking-wide text-gold">✨ Upplevelser & sidor</div>
              <ul className="space-y-1">
                {nearbyPages.slice(0, 5).map((p) => {
                  const km = p.dist_m / 1000;
                  const dist = p.kind === 'region' ? 'här' : p.dist_m < 1000 ? `${p.dist_m} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
                  const icon = p.kind === 'route' ? '🥾' : p.kind === 'site' ? '📍' : p.kind === 'region' ? '🗺️' : '📖';
                  return (
                    <li key={p.slug}>
                      <a href={p.url} className="flex items-start gap-2 rounded px-2 py-1.5 border border-slate-700/50 hover:bg-slate-800/60">
                        <span className="shrink-0 text-base leading-none mt-0.5">{icon}</span>
                        <span className="min-w-0">
                          <span className="text-sm text-white font-medium">{p.title_sv}</span>
                          <span className="text-[11px] text-sky-300"> · {p.verb_sv} · {dist}{p.geom_approx ? ' (ungefär)' : ''}</span>
                          {p.teaser_sv && <span className="block text-[11px] text-slate-400 leading-snug">{p.teaser_sv}</span>}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {/* Sevärt LÄNGS VÄGEN — korridorsökning, visas när en bilrutt är aktiv. Zonat (närzon
              ≤100 m / synfält) + hastighetsgrindat (fort → bara hög signifikans, se navCorridor.ts). */}
          {mode === 'car' && route && corridorCount > 0 && (
            <div className="mb-3">
              <div className="px-1 mb-1 text-[10px] uppercase tracking-wide text-amber-300/90">🏁 Sevärt längs vägen ({corridorCount})</div>
              {zoned.near.length > 0 && (
                <>
                  <div className="px-1 mb-1 text-[10px] uppercase tracking-wide text-amber-300/70">Precis här (≤100 m)</div>
                  <ul className="space-y-0.5">
                    {zoned.near.map((f) => {
                      const isHer = f.feature_type === 'heritage';
                      const name = isHer ? (heritageName(f.label) || capFirst(heritageType(f.label))) : f.label;
                      return (
                        <li key={`along-${f.feature_id}`}>
                          <button onClick={() => flyToAlong(f)} title="Visa på kartan"
                            className="w-full flex items-center justify-between gap-2 text-left px-2 rounded hover:bg-slate-800" style={{ minHeight: 40 }}>
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-slate-200">{name}</span>
                              <span className="block truncate text-[11px] text-amber-300/70">{f.rank_reason}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-xs text-amber-300/80" title="omväg från vägen">{fmtDist(f.detour_km)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {zoned.sight.length > 0 && (
                <>
                  <div className="px-1 mb-1 mt-2 text-[10px] uppercase tracking-wide text-amber-300/70">Längs vägen</div>
                  <ul className="space-y-0.5">
                    {zoned.sight.map((f) => {
                      const isHer = f.feature_type === 'heritage';
                      const name = isHer ? (heritageName(f.label) || capFirst(heritageType(f.label))) : f.label;
                      return (
                        <li key={`along-${f.feature_id}`}>
                          <button onClick={() => flyToAlong(f)} title="Visa på kartan"
                            className="w-full flex items-center justify-between gap-2 text-left px-2 rounded hover:bg-slate-800" style={{ minHeight: 40 }}>
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-slate-200">{name}</span>
                              <span className="block truncate text-[11px] text-amber-300/70">{f.rank_reason}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-xs text-amber-300/80" title="omväg från vägen">{fmtDist(f.detour_km)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              <div className="border-t border-slate-700/60 mt-2" />
            </div>
          )}
          {topRanked.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 px-1 mb-1 text-[10px] uppercase tracking-wide text-amber-300/90">
                <Sparkles className="h-3 w-3" /> Mest sevärt nära dig
              </div>
              <ul className="space-y-0.5">
                {topRanked.map((f) => {
                  const isHer = f.feature_type === 'heritage';
                  const name = isHer ? (heritageName(f.label) || capFirst(heritageType(f.label))) : f.label;
                  return (
                    <li key={`top-${f.feature_id}`} className="flex items-center gap-1">
                      {/* Klick → flytta referenspunkten hit (utforska härifrån), Daniel. */}
                      <button onClick={() => hopTo(f.lat, f.lng)} title="Utforska härifrån"
                        className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left px-2 rounded bg-amber-500/5 hover:bg-amber-500/15" style={{ minHeight: 44 }}>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-slate-100">{name}</span>
                          <span className="block truncate text-[11px] text-amber-300/80">{f.rank_reason} · utforska härifrån →</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-xs text-sky-300">{fmtDist(f.distance_km)}</span>
                      </button>
                      {/* Upptäck → välj → guida: sätt mål + starta fältläge (kompass till punkt). */}
                      <button onClick={() => guideTo(f.lat, f.lng, name)} title="Visa vägen dit" aria-label={`Visa vägen till ${name}`}
                        className="shrink-0 flex items-center justify-center rounded border border-emerald-600/50 text-emerald-300 hover:bg-emerald-600/15" style={{ minWidth: 40, minHeight: 44 }}>
                        <Compass className="h-4 w-4" />
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
      </div>
      )}
    </div>
  );
};
