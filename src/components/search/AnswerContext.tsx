import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, BookOpen, GraduationCap, ArrowRight, Library, X, ExternalLink, Image as ImageIcon, Users, Clock } from 'lucide-react';
import { useAnswerContext } from '@/hooks/useAnswerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FindBookLink } from './FindBookLink';
import { TopicMedia } from '@/components/media/TopicMedia';
import { SearchFallback } from './SearchFallback';
import { LandscapeNode, type LandscapeOverview } from './LandscapeNode';
import { CharterAnswerSection } from './CharterAnswerSection';

// RAÄ-bildtexter är långa ("Resmo kyrka. Runsignum Öl 4 — Anmärkning: …") — visa bara den
// läsbara ledtexten (före första ". " eller " — "), kapad, så man ser VAD bilden är.
const shortCaption = (d: string): string => {
  const cut = (d.split(/\s—\s|\.\s/)[0] || d).trim();
  return cut.length > 70 ? cut.slice(0, 68) + '…' : cut;
};

// Dedup bildkarusellen på bildtext (Daniel: "tre bilder heter alla Kyrkogården"). Behåll första
// per ledtext; bilder utan text dedupas på url. Kapa långa RAÄ-texter via shortCaption.
const dedupImages = <T extends { url: string; desc: string | null }>(imgs: T[]): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const im of imgs) {
    const key = (im.desc ? shortCaption(im.desc) : im.url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(im);
  }
  return out;
};

type GalleryImage = { url: string; desc: string | null; type?: string | null; source?: string | null; license?: string | null; credit?: string | null };
const isDrawing = (t?: string | null) => { const x = (t || '').toLowerCase(); return x === 'teckning' || x === 'etsning'; };
// Licens → visningsetikett + länk till licenstexten. Attribuering krävs för CC BY/BY-SA (fotograf),
// därför visas credit + licens i lightboxen. Okända licenser filtreras redan bort i RPC:n (visas ej).
const LICENSE_META: Record<string, { label: string; url: string }> = {
  'CC-BY':    { label: 'CC BY',         url: 'https://creativecommons.org/licenses/by/4.0/' },
  'CC-BY-SA': { label: 'CC BY-SA',      url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  'CC0':      { label: 'CC0',           url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  'PD':       { label: 'Public domain', url: 'https://creativecommons.org/publicdomain/mark/1.0/' },
};
// Bild-fel (död URL / blank ruta) → dölj HELA kortet så det aldrig blir en tom yta (Pinterest-läxan:
// inget kort får vara innehållslöst). Träffar närmaste knapp (alla bildkort är <button>).
const hideCard = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const b = (e.currentTarget as HTMLImageElement).closest('button');
  if (b) (b as HTMLElement).style.display = 'none';
};

// TIERAD galleri-vy (ersätter den gamla horisontella filkatalogen). Rangordnat på visuell bärkraft
// (RPC:n levererar foto > image > teckning): en HERO som spänner två kolumner, 2:3-stående kort för
// resten, PAPPERSMATTA för teckningar/arkivplanscher (ljus platta + object-contain så de läses som
// arkivmaterial, inte felrenderade filer), och TIER-5 typografiska kort för stenar UTAN bild
// (runsignum + bidra-CTA) i st f tomrum. Rutnät, inte scroll → tangentbord/överblick/tillgänglighet.
const TieredGallery: React.FC<{
  images: GalleryImage[];
  missing: { signum: string | null; label: string }[];
  sv: boolean;
  onOpen: (img: GalleryImage) => void;
}> = ({ images, missing, sv, onOpen }) => {
  // Rangordna "snyggast först": foto > image > teckning/etsning (ärlig signal ur RPC:ns typ, ingen
  // påhittad kvalitetspoäng). Hero = bästa fotot; teckningar/arkivplanscher hamnar sist.
  const q = (t?: string | null) => { const x = (t || '').toLowerCase(); return x === 'foto' || x === 'photo' ? 0 : (x === 'teckning' || x === 'etsning' ? 2 : 1); };
  const imgs = dedupImages(images).slice().sort((a, b) => q(a.type) - q(b.type));
  // Liggande foton (naturalWidth > höjd) får bredare kort så de inte klipps till en stående strimla.
  const [wide, setWide] = useState<Record<string, boolean>>({});
  // Stenar UTAN bild döljs per default (Daniel) → nås via en flik. Visa dem aldrig i tomrummet.
  const [showMissing, setShowMissing] = useState(false);
  if (!imgs.length && !missing.length) return null;
  const hero = imgs[0];
  const rest = imgs.slice(1);
  return (
    <div className="px-5 pb-4">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
          <ImageIcon className="h-3.5 w-3.5" /> {sv ? 'Bilder' : 'Images'}
        </span>
        {imgs.length > 0 && <span className="text-[11px] text-slate-500">{imgs.length}</span>}
        {/* Flik: stenar utan bild (dolda per default) → visa/dölj på begäran. */}
        {missing.length > 0 && (
          <button type="button" onClick={() => setShowMissing((v) => !v)}
            className="ml-auto text-[11px] text-amber-300/80 underline decoration-dotted underline-offset-2 hover:text-amber-200">
            {showMissing ? (sv ? 'dölj utan bild' : 'hide without image') : `${missing.length} ${sv ? 'utan bild' : 'without image'} →`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {hero && (
          <button type="button" onClick={() => onOpen(hero)} title={hero.desc ?? undefined}
            className="group relative col-span-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 text-left">
            <img src={hero.url} alt={hero.desc ?? ''} loading="lazy"
              className="aspect-[3/2] w-full object-cover transition group-hover:opacity-90" onError={hideCard} />
            {hero.desc && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-xs font-medium text-white line-clamp-2">
                {shortCaption(hero.desc)}
              </span>
            )}
          </button>
        )}
        {rest.map((img, i) => isDrawing(img.type) ? (
          // TIER 4: teckning/plansch → pappersmatta, object-contain (utfaller aldrig)
          <button key={`d-${i}`} type="button" onClick={() => onOpen(img)} title={img.desc ?? undefined}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-700 text-left">
            <div className="flex aspect-[2/3] items-center justify-center p-2.5" style={{ background: '#F1EFE8' }}>
              <img src={img.url} alt={img.desc ?? ''} loading="lazy"
                className="max-h-full max-w-full object-contain" onError={hideCard} />
            </div>
            <div className="bg-slate-900/60 px-2 py-1.5">
              <span className="block text-[10px] leading-tight text-slate-400 line-clamp-2">{img.desc ? shortCaption(img.desc) : (sv ? 'Teckning' : 'Drawing')}</span>
              <span className="text-[9px] uppercase tracking-wide text-amber-300/60">{sv ? 'arkivmaterial' : 'archival'}</span>
            </div>
          </button>
        ) : (
          // TIER 2/3: foto → stående 2:3-kort
          <button key={`p-${i}`} type="button" onClick={() => onOpen(img)} title={img.desc ?? undefined}
            className={`group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800 text-left${wide[img.url] ? ' col-span-2' : ''}`}>
            <img src={img.url} alt={img.desc ?? ''} loading="lazy"
              onLoad={(e) => { const t = e.currentTarget; if (t.naturalWidth > t.naturalHeight * 1.2 && !wide[img.url]) setWide((w) => ({ ...w, [img.url]: true })); }}
              className={`w-full object-cover transition group-hover:opacity-90 ${wide[img.url] ? 'aspect-[3/2]' : 'aspect-[2/3]'}`} onError={hideCard} />
            {img.desc && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6 text-[10px] leading-tight text-white line-clamp-2">
                {shortCaption(img.desc)}
              </span>
            )}
          </button>
        ))}
        {showMissing && missing.map((m, i) => (
          // TIER 5: ingen bild → typografiskt kort (runsignum), aldrig en tom ruta
          <div key={`m-${i}`}
            className="flex aspect-[2/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-600 px-2 text-center">
            <span className="text-2xl leading-none text-slate-500" style={{ fontFamily: 'var(--font-voice, serif)' }} aria-hidden="true">ᚱᚢᚾ</span>
            <span className="text-xs font-medium text-slate-300 line-clamp-2">{m.label}</span>
            {m.signum && m.signum !== m.label && <span className="text-[10px] text-slate-500">{m.signum}</span>}
            <span className="mt-1 text-[10px] text-amber-300/70">{sv ? 'bild saknas · bidra' : 'no image · contribute'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Rik svars-topp: inbäddad minikarta av den sökta platsen + kopplade runinskrifter (pins)
// + bilder. Visas överst i söksvaret; självdöljande när platsen inte har kopplat innehåll.
const PRED_SV: Record<string, string> = {
  has_estate: 'gods', belongs_to_dynasty: 'dynasti', dates_context: 'daterar', documents: 'dokumenteras av',
  located_in: 'ligger i', part_of: 'del av', mentions: 'nämner', depicts: 'avbildar', founded_by: 'grundad av',
};
export const AnswerContext: React.FC<{ query: string; onGo: (route: string) => void; onQuery?: (q: string) => void }> = ({ query, onGo, onQuery }) => {
  const { data } = useAnswerContext(query);
  const { language } = useLanguage();
  const sv = language === 'sv';
  // Giltig center = både lat OCH lng är tal (t.ex. Gotland gav {null,null} → rita ingen trasig karta).
  const hasCenter = !!(data?.center && data.center.lat != null && data.center.lng != null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);      // runstenar
  const siteLayerRef = useRef<L.LayerGroup | null>(null);  // sevärda platser (eget lager)
  const churchLayerRef = useRef<L.LayerGroup | null>(null); // kyrkor
  const wreckLayerRef = useRef<L.LayerGroup | null>(null);  // skeppsvrak
  const eventLayerRef = useRef<L.LayerGroup | null>(null);  // historiska händelser
  const fortLayerRef = useRef<L.LayerGroup | null>(null);   // befästningar (linjer/polygoner)
  const crossingLayerRef = useRef<L.LayerGroup | null>(null); // överfarter/båtdrag/grund/skyddsöar (sjösidan)
  const advLayerRef = useRef<L.LayerGroup | null>(null);   // äventyr & motion (badplatser m.m.)
  const fitKeyRef = useRef<string>('');                     // fitBounds bara vid nytt center, ej vid tids-scrub
  const roRef = useRef<ResizeObserver | null>(null);
  // Bild-lightbox: håll användaren KVAR i plattformen (öppna inte källbilden i ny flik). Daniel.
  const [lightbox, setLightbox] = useState<{ url: string; desc: string | null; license?: string | null; credit?: string | null } | null>(null);
  // Legend-togglar (default PÅ): runstenar + sevärda platser som separata kartlager.
  const [showRunes, setShowRunes] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [showChurches, setShowChurches] = useState(true);
  const [showWrecks, setShowWrecks] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showForts, setShowForts] = useState(true);
  const [showCrossings, setShowCrossings] = useState(true);
  const [showAdv, setShowAdv] = useState(true);
  // Befästningsgeometri (linjer/polygoner) nära svarets center — riktig fort_element- + RAÄ-lämningsgeometri.
  // Källkritik: varje feature bär evidence_class → tolkat/hypotetiskt ritas streckat, bevarat heldraget.
  const { data: forts } = useQuery({
    queryKey: ['forts-near', data?.center?.lat, data?.center?.lng],
    enabled: !!(data?.center && data.center.lat != null && data.center.lng != null),
    queryFn: async () => {
      const { data: rows } = await (supabase as any).rpc('fortifications_near', {
        p_lat: data!.center!.lat, p_lng: data!.center!.lng, p_radius_m: 3000,
      });
      return (rows ?? []) as Array<{ kind: string; name: string | null; subtype: string | null; evidence_class: string | null; year_from: number | null; year_to: number | null; geojson: string }>;
    },
  });
  // Äventyr & motion (Daniel): badplatser m.m. nära platsen via nearby_experiences. Egen legend-toggle.
  // v1 = mest badplatser (enda ifyllda kategorin idag); utbyggbart när leder/grottor/kulturvandring ingestas.
  const { data: adventures } = useQuery({
    queryKey: ['adventures-near', data?.center?.lat, data?.center?.lng],
    enabled: !!(data?.center && data.center.lat != null && data.center.lng != null),
    queryFn: async () => {
      const lat = data!.center!.lat, lng = data!.center!.lng;
      // Union av det vi HAR som "äventyr & motion": badplatser (experiences) + grottor (heritage_sites,
      // ~143 st, raa_type Grotta/naturgrotta/grotta med tradition). Grottorna bor i heritage → egen
      // bbox-fråga (~±0,3° ≈ 25 km). Utbyggbart med leder/kulturvandring när de ingestas.
      const [expRes, grottRes] = await Promise.all([
        (supabase as any).rpc('nearby_experiences', { p_lat: lat, p_lng: lng, p_radius_km: 25, p_limit: 60 }),
        (supabase as any).from('heritage_sites').select('id, name, raa_type, lat, lng')
          .gte('lat', lat - 0.28).lte('lat', lat + 0.28).gte('lng', lng - 0.45).lte('lng', lng + 0.45)
          .ilike('raa_type', '%grott%').not('lat', 'is', null).limit(60),
      ]);
      const bad = ((expRes.data ?? []) as any[]).map((a) => ({ feature_type: a.feature_type ?? 'badplats', label: a.label as string, lat: a.lat as number, lng: a.lng as number, parish: (a.parish ?? null) as string | null }));
      const grott = ((grottRes.data ?? []) as any[]).map((g) => ({ feature_type: 'grotta', label: g.name as string, lat: Number(g.lat), lng: Number(g.lng), parish: null as string | null }));
      return [...bad, ...grott];
    },
  });
  // Tidsreglage (Lotsen, spår 2): scrubba "visa fram till år N" → landskapet växer fram över tid.
  const [yearMax, setYearMax] = useState<number | null>(null);
  // "Dela" (Community/Bidra): mobil → native share-ark (navigator.share); desktop/utan stöd →
  // kopiera URL till urklipp + kort "Länk kopierad"-bekräftelse. Övriga bidra-knappar = fas 2.
  const [shareCopied, setShareCopied] = useState(false);
  const doShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    const title = (data as any)?.page?.title || (data as any)?.theme?.name || query || 'Viking Age';
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
    if (nav?.share) {
      try { await nav.share({ title, url }); return; }
      catch { return; } // användaren avbröt delningen — kopiera inte i onödan
    }
    try {
      await nav?.clipboard?.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* urklipp blockerat (t.ex. utan https) — tyst */ }
  };
  const timeBounds = (() => {
    const ys: number[] = [];
    const push = (v: unknown) => { const n = Number(v); if (Number.isFinite(n) && n > -4000 && n < 2100) ys.push(n); };
    ((data as any)?.inscriptions || []).forEach((r: any) => push(r.from));
    ((data as any)?.churches || []).forEach((c: any) => push(c.founded));
    ((data as any)?.wrecks || []).forEach((w: any) => push(w.sank));
    ((data as any)?.events || []).forEach((e: any) => push(e.from));
    return ys.length >= 2 ? { min: Math.min(...ys), max: Math.max(...ys) } : null;
  })();
  const ymax = yearMax ?? timeBounds?.max ?? 2100;
  const afterYmax = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > ymax; }; // dolt av tidsreglaget

  useEffect(() => {
    if (!hasCenter || !data?.center || !mapEl.current) return;
    try {
      if (!mapRef.current) {
        // Zoom aktiverat (Daniel: "vill kunna zooma in och ut"): knappar + hjul + dubbelklick.
        mapRef.current = L.map(mapEl.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: true, dragging: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapRef.current);
        // Kartan initieras i en overlay-kolumn som ofta har 0 bredd tills panelen animerat in /
        // grid:en satt sig → Leaflet målar grått tills dess. Måla om vid varje storleksändring
        // (ResizeObserver) så kartan dyker upp direkt när kolumnen får sin bredd (Daniel: "kartan
        // visas inte när jag klickar på Kalmar").
        roRef.current = new ResizeObserver(() => { try { mapRef.current?.invalidateSize(); } catch { /* noop */ } });
        roRef.current.observe(mapEl.current);
      }
      const m = mapRef.current;
      if (!layerRef.current) layerRef.current = L.layerGroup();
      if (!siteLayerRef.current) siteLayerRef.current = L.layerGroup();
      if (!churchLayerRef.current) churchLayerRef.current = L.layerGroup();
      if (!wreckLayerRef.current) wreckLayerRef.current = L.layerGroup();
      if (!eventLayerRef.current) eventLayerRef.current = L.layerGroup();
      if (!fortLayerRef.current) fortLayerRef.current = L.layerGroup();
      if (!crossingLayerRef.current) crossingLayerRef.current = L.layerGroup();
      if (!advLayerRef.current) advLayerRef.current = L.layerGroup();
      layerRef.current.clearLayers(); siteLayerRef.current.clearLayers();
      churchLayerRef.current.clearLayers(); wreckLayerRef.current.clearLayers(); eventLayerRef.current.clearLayers();
      fortLayerRef.current.clearLayers(); crossingLayerRef.current.clearLayers(); advLayerRef.current.clearLayers();
      const pts: [number, number][] = [];
      (data.inscriptions || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        if (afterYmax((r as any).from)) return;
        pts.push([r.lat, r.lng]);
        L.circleMarker([r.lat, r.lng], { radius: 4, color: '#0f172a', weight: 1, fillColor: '#f59e0b', fillOpacity: 0.9 })
          .bindPopup(`<b>${r.signum ?? ''}</b> ${r.label ?? ''}`)
          .addTo(layerRef.current!);
      });
      // Sevärda platser = eget, prominent lager (cyan, större) — inte bara chips (Daniel).
      (data.sites || []).forEach((s) => {
        if (s.lat == null || s.lng == null) return;
        pts.push([s.lat, s.lng]);
        L.circleMarker([s.lat, s.lng], { radius: 6, color: '#0c4a6e', weight: 1.5, fillColor: '#38bdf8', fillOpacity: 0.95 })
          .bindPopup(`<b>${s.name}</b>${s.type ? `<br/><span style="font-size:11px;color:#64748b">${s.type}</span>` : ''}`)
          .addTo(siteLayerRef.current!);
      });
      // Multi-domän-lager (Lotsen: rik dossier) — kyrkor, vrak, händelser nära platsens center.
      ((data as any).churches || []).forEach((c: any) => {
        if (c.lat == null || c.lng == null) return;
        if (afterYmax(c.founded)) return;
        pts.push([c.lat, c.lng]);
        L.circleMarker([c.lat, c.lng], { radius: 5, color: '#4c1d95', weight: 1.5, fillColor: '#a78bfa', fillOpacity: 0.95 })
          .bindPopup(`<b>${c.name ?? ''}</b>${c.founded ? `<br/><span style="font-size:11px;color:#64748b">grundad ${c.founded}</span>` : ''}`)
          .addTo(churchLayerRef.current!);
      });
      ((data as any).wrecks || []).forEach((w: any) => {
        if (w.lat == null || w.lng == null) return;
        if (afterYmax(w.sank)) return;
        pts.push([w.lat, w.lng]);
        L.circleMarker([w.lat, w.lng], { radius: w.iconic ? 6.5 : 5, color: '#881337', weight: 1.5, fillColor: w.iconic ? '#f59e0b' : '#fb7185', fillOpacity: 0.95 })
          .bindPopup(`<b>${w.name ?? ''}</b>${w.sank ? ` <span style="font-size:11px;color:#b45309">✝ ${w.sank}</span>` : ''}${w.type ? `<br/><span style="font-size:11px;color:#64748b">${w.type}</span>` : ''}`)
          .addTo(wreckLayerRef.current!);
      });
      ((data as any).events || []).forEach((ev: any) => {
        if (ev.lat == null || ev.lng == null) return;
        if (afterYmax(ev.from)) return;
        pts.push([ev.lat, ev.lng]);
        const yr = ev.from ? `${ev.from}${ev.to && ev.to !== ev.from ? '–' + ev.to : ''}` : '';
        L.circleMarker([ev.lat, ev.lng], { radius: 5, color: '#065f46', weight: 1.5, fillColor: '#34d399', fillOpacity: 0.95 })
          .bindPopup(`<b>${ev.name ?? ''}</b>${yr ? `<br/><span style="font-size:11px;color:#64748b">${yr}</span>` : ''}`)
          .addTo(eventLayerRef.current!);
      });
      // Sjösidan: överfarter, båtdrag, grund och skyddsöar (crossing_points) nära platsen — det
      // maritima "från sjösidan"-lagret (Daniel). Teal, egen legend-toggle.
      ((data as any).crossings || []).forEach((c: any) => {
        if (c.lat == null || c.lng == null) return;
        pts.push([c.lat, c.lng]);
        L.circleMarker([c.lat, c.lng], { radius: 5, color: '#0f766e', weight: 1.5, fillColor: '#2dd4bf', fillOpacity: 0.9 })
          .bindPopup(`<b>${c.name ?? ''}</b>${c.kind ? `<br/><span style="font-size:11px;color:#64748b">${c.kind}</span>` : ''}${c.note ? `<br/><span style="font-size:11px;color:#64748b">${c.note}</span>` : ''}`)
          .addTo(crossingLayerRef.current!);
      });
      // Äventyr & motion: badplatser m.m. nära platsen (grön). Egen legend-toggle.
      (adventures || []).forEach((a) => {
        if (a.lat == null || a.lng == null) return;
        pts.push([a.lat, a.lng]);
        L.circleMarker([a.lat, a.lng], { radius: 5, color: '#15803d', weight: 1.5, fillColor: '#22c55e', fillOpacity: 0.9 })
          .bindPopup(`<b>${a.label ?? ''}</b>${a.feature_type ? `<br/><span style="font-size:11px;color:#64748b">${a.feature_type}${a.parish ? ' · ' + a.parish : ''}</span>` : ''}`)
          .addTo(advLayerRef.current!);
      });
      // Befästningsgeometri: riktiga linjer/polygoner (stadsmur, bastioner, RAÄ-lämningar).
      // Bevarat ovan mark → heldraget; interpolerat/hypotetiskt/RAÄ-lämning utan bedömning → streckat.
      const FORT = '#c2410c';
      (forts || []).forEach((ff) => {
        if (afterYmax(ff.year_from)) return; // döljs av tidsreglaget om daterat efter ymax
        let gj: any; try { gj = JSON.parse(ff.geojson); } catch { return; }
        const preserved = ff.evidence_class === 'bevarat_ovan_mark';
        const yr = ff.year_from ? `${ff.year_from}${ff.year_to && ff.year_to !== ff.year_from ? '–' + ff.year_to : ''}` : '';
        const evLabel = ff.evidence_class === 'bevarat_ovan_mark' ? (sv ? 'bevarat ovan mark' : 'preserved above ground')
          : ff.evidence_class === 'interpolerad' ? (sv ? 'interpolerad sträckning' : 'interpolated')
          : ff.evidence_class === 'hypotetisk' ? (sv ? 'hypotetiskt läge' : 'hypothetical')
          : (sv ? 'RAÄ-lämning' : 'heritage record');
        const popup = `<b>${ff.name ?? ''}</b>${ff.subtype ? `<br/><span style="font-size:11px;color:#64748b">${ff.subtype}${yr ? ` · ${yr}` : ''}</span>` : (yr ? `<br/><span style="font-size:11px;color:#64748b">${yr}</span>` : '')}<br/><span style="font-size:10px;color:#9a3412">${evLabel}</span>`;
        const isPoint = gj.type === 'Point' || gj.type === 'MultiPoint';
        if (isPoint) {
          const c = gj.type === 'Point' ? gj.coordinates : gj.coordinates[0];
          L.circleMarker([c[1], c[0]], { radius: 4, color: '#7c2d12', weight: 1.5, fillColor: FORT, fillOpacity: preserved ? 0.95 : 0.4 })
            .bindPopup(popup).addTo(fortLayerRef.current!);
        } else {
          L.geoJSON(gj, {
            style: () => ({
              color: FORT, weight: preserved ? 3 : 2.5, opacity: preserved ? 0.95 : 0.75,
              dashArray: preserved ? undefined : '5,6',
              fill: gj.type === 'Polygon' || gj.type === 'MultiPolygon', fillColor: FORT, fillOpacity: 0.12,
            }),
          }).bindPopup(popup).addTo(fortLayerRef.current!);
        }
      });

      // Lager på/av enligt legend-togglar.
      if (showRunes) layerRef.current.addTo(m); else m.removeLayer(layerRef.current);
      if (showSites) siteLayerRef.current.addTo(m); else m.removeLayer(siteLayerRef.current);
      if (showChurches) churchLayerRef.current.addTo(m); else m.removeLayer(churchLayerRef.current);
      if (showWrecks) wreckLayerRef.current.addTo(m); else m.removeLayer(wreckLayerRef.current);
      if (showEvents) eventLayerRef.current.addTo(m); else m.removeLayer(eventLayerRef.current);
      if (showForts) fortLayerRef.current.addTo(m); else m.removeLayer(fortLayerRef.current);
      if (showCrossings) crossingLayerRef.current.addTo(m); else m.removeLayer(crossingLayerRef.current);
      if (showAdv) advLayerRef.current.addTo(m); else m.removeLayer(advLayerRef.current);
      // fitBounds bara vid NYTT center (ny fråga) — inte vid tids-scrub (annars zoomar kartan om hela tiden).
      const fitKey = `${data.center.lat},${data.center.lng}`;
      if (fitKeyRef.current !== fitKey) {
        if (pts.length >= 2) m.fitBounds(L.latLngBounds(pts), { padding: [24, 24], maxZoom: 11 });
        else m.setView([data.center.lat, data.center.lng], pts.length ? 11 : 9);
        fitKeyRef.current = fitKey;
      }
      // Flera omritningar över några frames tills layouten satt sig (belt-and-suspenders utöver RO).
      [0, 80, 250, 600].forEach((d) => setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, d));
    } catch { /* karta-init misslyckades → panelen visar ändå listor/bilder */ }
  }, [data, forts, adventures, showRunes, showSites, showChurches, showWrecks, showEvents, showForts, showCrossings, showAdv, ymax]);

  useEffect(() => () => {
    try { roRef.current?.disconnect(); } catch { /* noop */ }
    try { mapRef.current?.remove(); } catch { /* noop */ }
    roRef.current = null; mapRef.current = null; layerRef.current = null; siteLayerRef.current = null;
    churchLayerRef.current = null; wreckLayerRef.current = null; eventLayerRef.current = null;
    fortLayerRef.current = null; crossingLayerRef.current = null; advLayerRef.current = null;
  }, []);

  // Kurerad "relaterat/se även" (t.ex. Göteborg → Nya Lödöse/Kungahälla/Älvsborgs lösen) — FAKTA i vår
  // formulering, chips söker vidare in-skope. Visas i både fallback- och huvudsvaret.
  const { data: related } = useQuery({
    queryKey: ['search-related', query],
    enabled: !!query && query.trim().length >= 2,
    queryFn: async () => {
      const { data: rows } = await (supabase as any).rpc('get_search_related', { p_term: query });
      return (Array.isArray(rows) && rows[0]) || null;
    },
  });
  // Egen fakta-nod (kyrkor/heritage): entitetens EGEN beskrivning + datering, så svaret inte bara visar
  // "geografisk mittpunkt + närområde" (Daniel: Kläckeberga kyrka såg informationsfattig ut).
  const { data: node } = useQuery({
    queryKey: ['entity-node', query],
    enabled: !!query && query.trim().length >= 2,
    queryFn: async () => {
      const { data } = await (supabase as any).rpc('entity_node', { p_name: query });
      return (Array.isArray(data) && data[0]) as { kind: string; title: string; description: string; dating: string | null } | null;
    },
  });
  // Strukturerad LANDSKAPSNOD: när frågan löser ett landskap (även "hur många kyrkor på gotland")
  // → kategori-antal + kollapsbara drill-in-sektioner + lokala rättskällor. Gatas till rena
  // landskapsfrågor (ej när en egen kunskapssida/tema redan matchat).
  const { data: overview } = useQuery({
    queryKey: ['landscape-overview', query],
    enabled: !!query && query.trim().length >= 3,
    queryFn: async () => {
      // Landskap först (Gotland/Öland …); annars regionhubb (Kalmar) — samma JSON-form → samma vy.
      const { data: land } = await (supabase as any).rpc('landscape_overview', { p_name: query });
      if (land) return land as LandscapeOverview;
      const { data: area } = await (supabase as any).rpc('area_overview', { p_name: query });
      return (area ?? null) as LandscapeOverview | null;
    },
  });
  // Visa landskaps-/hubbnoden bara för RENA landskaps-/regionfrågor — inte när en specifik entitet
  // matchat (t.ex. "Kalmar slott" → entity_node för slottet vinner, ej hela Kalmar-översikten).
  const showLandscape = !!overview && !data?.page && !data?.theme && !node;

  const nodeBlock = node ? (
    <div className="border-b border-slate-800 bg-slate-900 px-5 pt-4 pb-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">{node.kind}{node.dating ? ` · ${node.dating}` : ''}</div>
      <h2 className="text-2xl font-bold leading-tight text-white">{node.title}</h2>
      {node.description && <p className="mt-1 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-300">{node.description}</p>}
    </div>
  ) : null;

  const relatedBlock = related ? (
    <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
        <ArrowRight className="h-3 w-3" />{sv ? 'Relaterat · se även' : 'Related · see also'}
      </div>
      {(sv ? related.note_sv : (related.note_en || related.note_sv)) && (
        <p className="mb-2 max-w-3xl text-xs leading-relaxed text-slate-300">{sv ? related.note_sv : (related.note_en || related.note_sv)}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {((related.related ?? []) as Array<{ term: string; label: string; hint?: string }>).map((r) => (
          <button key={r.term} onClick={() => onQuery?.(r.term)} title={r.hint}
            className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
            {r.label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  if (!data || (data.count === 0 && (data.images?.length ?? 0) === 0 && !data.page
      && (data.research?.length ?? 0) === 0 && (data.literature?.length ?? 0) === 0)) {
    // Ingen plats/entitet i kärnskopet (t.ex. "Hitler", "nazism", 1900-talsbegrepp). Sök-kaskadens
    // sista lager: media (poddar/video) + externa sök-URL:er + bidra — och sökordet loggas.
    // + relaterat-block överst (för t.ex. Göteborg som saknar egen entitet men har föregångare).
    return <>{showLandscape && <LandscapeNode overview={overview!} sv={sv} onGo={onGo} />}{nodeBlock}{relatedBlock}<SearchFallback query={query} /></>;
  }

  return (
    <div className="border-b border-slate-800 bg-slate-900">
      {showLandscape && <LandscapeNode overview={overview!} sv={sv} onGo={onGo} />}
      {!data.page && !showLandscape && nodeBlock}
      {relatedBlock}
      {/* SEKTION 1 (överst, spänner): platsnod-header — tydlig typografisk hierarki */}
      {data.page && (
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
              {sv ? 'Plats · kunskapsnod' : 'Place · knowledge node'}
            </div>
            <h2 className="truncate text-2xl font-bold leading-tight text-white">{data.page.title}</h2>
          </div>
          <button
            onClick={() => onGo(`/sv/${data.page!.slug}`)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
          >
            {sv ? 'Öppna kunskapssida' : 'Open knowledge page'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Temanod-header: en tematisk sökning ("poesi" …) visar temats material, inte en plats. Egen
          rubrikrad så vyn läses som en kunskapsnod, inte som "runstenar i närheten av en plats". */}
      {data.theme && !data.page && (
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
              {sv ? 'Tema · kunskapsnod' : 'Theme · knowledge node'}
            </div>
            <h2 className="truncate text-2xl font-bold leading-tight text-white">{data.theme.name}</h2>
          </div>
        </div>
      )}

      {/* SEKTION 2: karta i FULL BREDD (dominant) + legend-overlay uppe till höger (togglar lager).
          Panelerna ligger UNDER kartan i flerkolumn (Daniel: "använd hela skärmen").
          Döljs för landskaps-/hubbnoden — den har en egen grupperad karta (undviker dubbelkarta). */}
      {hasCenter && !showLandscape && (
        <div className="px-5 pb-4">
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800" style={{ height: '52vh', minHeight: 340 }}>
            <div ref={mapEl} className="absolute inset-0" />
            {timeBounds && (
              <div className="absolute bottom-3 left-3 right-3 z-[500] rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-amber-300/80" />
                  <span className="shrink-0">{sv ? 'Tidslinje' : 'Timeline'}</span>
                  <input type="range" min={timeBounds.min} max={timeBounds.max} step={10} value={ymax}
                    onChange={(e) => setYearMax(Number(e.target.value))}
                    className="min-w-0 flex-1 accent-amber-400"
                    aria-label={sv ? 'Visa fram till år' : 'Show up to year'} />
                  <span className="shrink-0 tabular-nums font-medium text-amber-300">{ymax < 0 ? `${-ymax} f.Kr.` : `${ymax} e.Kr.`}</span>
                  {yearMax != null && (
                    <button type="button" onClick={() => setYearMax(null)} className="shrink-0 text-slate-400 underline hover:text-slate-100">
                      {sv ? 'alla' : 'all'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="absolute right-3 top-3 z-[500] rounded-lg border border-slate-600 bg-slate-900/90 p-2.5 backdrop-blur-sm">
              <div className="mb-1.5 max-w-[180px] truncate text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                {data.page?.title || data.theme?.name || query}
              </div>
              <button onClick={() => setShowSites((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showSites ? '#38bdf8' : 'transparent', border: '1.5px solid #38bdf8' }} />
                <span className={showSites ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Sevärda platser' : 'Notable sites'}{data.sites?.length ? ` · ${data.sites.length}` : ''}</span>
              </button>
              <button onClick={() => setShowRunes((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showRunes ? '#f59e0b' : 'transparent', border: '1.5px solid #f59e0b' }} />
                <span className={showRunes ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Runstenar' : 'Runestones'}{data.count ? ` · ${data.count}` : ''}</span>
              </button>
              {(data as any).churches?.length > 0 && (
                <button onClick={() => setShowChurches((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showChurches ? '#a78bfa' : 'transparent', border: '1.5px solid #a78bfa' }} />
                  <span className={showChurches ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Kyrkor' : 'Churches'} · {(data as any).churches.length}</span>
                </button>
              )}
              {(data as any).wrecks?.length > 0 && (
                <button onClick={() => setShowWrecks((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showWrecks ? '#fb7185' : 'transparent', border: '1.5px solid #fb7185' }} />
                  <span className={showWrecks ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Skeppsvrak' : 'Shipwrecks'} · {(data as any).wrecks.length}</span>
                </button>
              )}
              {(data as any).events?.length > 0 && (
                <button onClick={() => setShowEvents((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showEvents ? '#34d399' : 'transparent', border: '1.5px solid #34d399' }} />
                  <span className={showEvents ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Händelser' : 'Events'} · {(data as any).events.length}</span>
                </button>
              )}
              {(forts?.length ?? 0) > 0 && (
                <button onClick={() => setShowForts((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-0.5 w-3 shrink-0 rounded" style={{ background: showForts ? '#c2410c' : 'transparent', border: '1.5px solid #c2410c' }} />
                  <span className={showForts ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Befästningar' : 'Fortifications'} · {forts!.length}</span>
                </button>
              )}
              {(data as any).crossings?.length > 0 && (
                <button onClick={() => setShowCrossings((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showCrossings ? '#2dd4bf' : 'transparent', border: '1.5px solid #2dd4bf' }} />
                  <span className={showCrossings ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Sjösidan · överfart/grund' : 'Sea side · crossings/shoals'} · {(data as any).crossings.length}</span>
                </button>
              )}
              {(adventures?.length ?? 0) > 0 && (
                <button onClick={() => setShowAdv((v) => !v)} className="flex w-full items-center gap-2 py-0.5 text-left text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: showAdv ? '#22c55e' : 'transparent', border: '1.5px solid #22c55e' }} />
                  <span className={showAdv ? 'text-slate-100' : 'text-slate-500'}>{sv ? 'Äventyr & motion' : 'Adventure & outdoors'} · {adventures!.length}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PANELER — full bredd, flerkolumn på desktop. Sevärda platser HÖGST (order-first). */}
      <div className="grid gap-4 px-5 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="contents">
          {data.research?.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
                <GraduationCap className="h-3.5 w-3.5" /> {sv ? 'Relaterad forskning' : 'Related research'}
              </h3>
              <ul className="space-y-2">
                {data.research.map((r) => (
                  <li key={r.id} className="border-l-2 border-slate-700 pl-2.5">
                    <span className="text-sm font-medium text-white">{r.name}</span>
                    {(r.role || r.affiliation) && (
                      <span className="block text-xs text-slate-400">{[r.role, r.affiliation].filter(Boolean).join(' · ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.count > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
                <BookOpen className="h-3.5 w-3.5" /> {data.theme ? (sv ? 'Runstenar i temat' : 'Runestones in this theme') : (sv ? 'Runstenar i trakten' : 'Runestones nearby')} · {data.count}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.inscriptions.slice(0, 12).map((r) => (
                  // Vardagsnamn (label) som default; signum visas vid hover om det skiljer sig.
                  <button key={r.id} onClick={() => onGo(`/inscription/${encodeURIComponent(r.signum ?? r.label)}`)}
                    title={r.signum && r.signum !== r.label ? r.signum : undefined}
                    className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
                    {r.label}
                  </button>
                ))}
                {data.count > 12 && (
                  <button onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(query)}`)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-100">
                    <MapPin className="h-3 w-3" /> {sv ? 'alla på kartan' : 'all on map'}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Sevärda platser: eget prominent kartlager (cyan) + HÖGST i panelerna (order-first). */}
          {data.sites?.length > 0 && (
            <section className="order-first">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
                <MapPin className="h-3.5 w-3.5" /> {sv ? 'Sevärda platser' : 'Notable sites'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.sites.slice(0, 10).map((s) => (
                  <button key={s.id} onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(s.name)}`)}
                    title={s.type ?? undefined}
                    className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
                    {s.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Litteratur: böcker som documents-länkats till entiteten. ISBN → "Hitta boken"-länk
              (STEG 0, ingen affiliate ännu). Skild från källor/forskning för trovärdighetens skull. */}
          {data.literature?.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
                <Library className="h-3.5 w-3.5" /> {sv ? 'Litteratur' : 'Literature'}
              </h3>
              <ul className="space-y-2">
                {data.literature.map((b) => (
                  <li key={b.id} className="border-l-2 border-slate-700 pl-2.5">
                    <div className="text-sm font-medium text-white leading-snug">{b.title}</div>
                    <div className="text-xs text-slate-400">{[b.author, b.year].filter(Boolean).join(' · ')}</div>
                    <FindBookLink isbn={b.isbn} title={b.title} sv={sv} className="mt-0.5" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {/* Community / Bidra — stub (fas 2: recensioner/betyg/foto/mät position/dela via granskningskö
            + licenssamtycke; overifierat märks tydligt, skilt från källförda paneler). */}
        <section className="rounded-lg border border-dashed border-slate-600 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
            <Users className="h-3.5 w-3.5" /> {sv ? 'Bidra / Community' : 'Contribute'}
          </h3>
          <p className="mb-2 text-xs leading-snug text-slate-400">
            {sv ? 'Skriv om platsen, ge betyg, skicka foto, mät en position, dela. Kommer via granskningskö + licenssamtycke — bidrag märks overifierade tills de granskats.'
                : 'Write about the place, rate it, submit a photo, measure a position, share. Coming via a moderation queue with licence consent.'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {[sv ? 'Skriv' : 'Write', sv ? 'Ge betyg' : 'Rate', sv ? 'Skicka foto' : 'Photo', sv ? 'Mät position' : 'Position'].map((b) => (
              <button key={b} disabled title={sv ? 'Kommer snart' : 'Coming soon'}
                className="cursor-not-allowed rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-500">{b}</button>
            ))}
            {/* Dela är aktiv (till skillnad från övriga bidra-knapparna som är fas 2). */}
            <button type="button" onClick={doShare} title={sv ? 'Dela länken till den här vyn' : 'Share the link to this view'}
              className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 transition-colors hover:border-amber-500/50 hover:text-amber-100">
              {sv ? 'Dela' : 'Share'}
            </button>
            {shareCopied && (
              <span className="text-xs text-emerald-300">{sv ? 'Länk kopierad' : 'Link copied'}</span>
            )}
          </div>
        </section>
      </div>

      {/* Podcast — tredjeparts historiepoddar (länk ut), full bredd under panelerna */}
      {/* KG-navigering (Lotsen, spår 3): följ grafen vidare — klickbara relaterade noder → ny sökning. */}
      {(data as any).related?.length > 0 && (
        <div className="px-5 pb-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">
            {sv ? 'Gå vidare i kunskapsgrafen' : 'Follow the knowledge graph'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(data as any).related.map((n: any, i: number) => (
              <button key={`${n.label}-${i}`} type="button"
                onClick={() => (onQuery ? onQuery(n.label) : onGo(`/?q=${encodeURIComponent(n.label)}`))}
                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
                <span className="font-medium">{n.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-amber-300/70">{PRED_SV[n.predicate] ?? n.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-4"><TopicMedia query={query} /></div>

      {/* Medeltidsbrev (SDHK) utfärdade i orten — efter podden. Visas bara för länkade KG-orter. */}
      <CharterAnswerSection name={query} sv={sv} />

      {/* SEKTION 3: tierat bildgalleri — hero + 2:3-kort + pappersmatta + Tier-5 typkort.
          Öppnas i LIGHTBOX (håll kvar användaren i plattformen, Daniel), inte i ny flik. */}
      {(((data.images?.length ?? 0) > 0) || ((data.missing?.length ?? 0) > 0)) && (
        <TieredGallery images={data.images ?? []} missing={data.missing ?? []} sv={sv}
          onOpen={(img) => setLightbox({ url: img.url, desc: img.desc, license: img.license, credit: img.credit })} />
      )}

      {/* Lightbox: större bild + bildtext + "öppna källan"-länk (för den som VILL lämna). */}
      {lightbox && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-h-[90vh] max-w-3xl w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setLightbox(null)} aria-label={sv ? 'Stäng' : 'Close'}
              className="absolute right-2 top-2 z-10 rounded-full bg-slate-900/80 p-1.5 text-slate-200 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <img src={lightbox.url} alt={lightbox.desc ?? ''} className="max-h-[70vh] w-full object-contain bg-black" />
            <div className="px-4 py-3">
              {lightbox.desc && <p className="text-sm text-slate-200 leading-snug">{lightbox.desc}</p>}
              {(lightbox.credit || lightbox.license) && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {lightbox.credit && <span>{sv ? 'Foto' : 'Photo'}: {lightbox.credit}</span>}
                  {lightbox.credit && lightbox.license && LICENSE_META[lightbox.license] && ' · '}
                  {lightbox.license && LICENSE_META[lightbox.license] && (
                    <a href={LICENSE_META[lightbox.license].url} target="_blank" rel="noopener noreferrer"
                      className="underline hover:text-slate-200">{LICENSE_META[lightbox.license].label}</a>
                  )}
                </p>
              )}
              <a href={lightbox.url} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200">
                {sv ? 'Öppna källbilden' : 'Open source image'} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
