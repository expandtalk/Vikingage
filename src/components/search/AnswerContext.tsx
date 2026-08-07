import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, BookOpen, GraduationCap, ArrowRight, Library, X, ExternalLink } from 'lucide-react';
import { useAnswerContext } from '@/hooks/useAnswerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FindBookLink } from './FindBookLink';

// RAÄ-bildtexter är långa ("Resmo kyrka. Runsignum Öl 4 — Anmärkning: …") — visa bara den
// läsbara ledtexten (före första ". " eller " — "), kapad, så man ser VAD bilden är.
const shortCaption = (d: string): string => {
  const cut = (d.split(/\s—\s|\.\s/)[0] || d).trim();
  return cut.length > 70 ? cut.slice(0, 68) + '…' : cut;
};

// Dedup bildkarusellen på bildtext (Daniel: "tre bilder heter alla Kyrkogården"). Behåll första
// per ledtext; bilder utan text dedupas på url. Kapa långa RAÄ-texter via shortCaption.
const dedupImages = (imgs: { url: string; desc: string | null }[]): { url: string; desc: string | null }[] => {
  const seen = new Set<string>();
  const out: { url: string; desc: string | null }[] = [];
  for (const im of imgs) {
    const key = (im.desc ? shortCaption(im.desc) : im.url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(im);
  }
  return out;
};

// Rik svars-topp: inbäddad minikarta av den sökta platsen + kopplade runinskrifter (pins)
// + bilder. Visas överst i söksvaret; självdöljande när platsen inte har kopplat innehåll.
export const AnswerContext: React.FC<{ query: string; onGo: (route: string) => void }> = ({ query, onGo }) => {
  const { data } = useAnswerContext(query);
  const { language } = useLanguage();
  const sv = language === 'sv';
  // Giltig center = både lat OCH lng är tal (t.ex. Gotland gav {null,null} → rita ingen trasig karta).
  const hasCenter = !!(data?.center && data.center.lat != null && data.center.lng != null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  // Bild-lightbox: håll användaren KVAR i plattformen (öppna inte källbilden i ny flik). Daniel.
  const [lightbox, setLightbox] = useState<{ url: string; desc: string | null } | null>(null);

  useEffect(() => {
    if (!hasCenter || !data?.center || !mapEl.current) return;
    try {
      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapRef.current);
        // Kartan initieras i en overlay-kolumn som ofta har 0 bredd tills panelen animerat in /
        // grid:en satt sig → Leaflet målar grått tills dess. Måla om vid varje storleksändring
        // (ResizeObserver) så kartan dyker upp direkt när kolumnen får sin bredd (Daniel: "kartan
        // visas inte när jag klickar på Kalmar").
        roRef.current = new ResizeObserver(() => { try { mapRef.current?.invalidateSize(); } catch { /* noop */ } });
        roRef.current.observe(mapEl.current);
      }
      const m = mapRef.current;
      if (!layerRef.current) layerRef.current = L.layerGroup().addTo(m);
      layerRef.current.clearLayers();
      const pts: [number, number][] = [];
      (data.inscriptions || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        pts.push([r.lat, r.lng]);
        L.circleMarker([r.lat, r.lng], { radius: 4, color: '#0f172a', weight: 1, fillColor: '#f59e0b', fillOpacity: 0.9 })
          .bindPopup(`<b>${r.signum ?? ''}</b> ${r.label ?? ''}`)
          .addTo(layerRef.current!);
      });
      // fitBounds till entitetens geometri ALLTID (Daniel: "Öland syns knappt, centrerad på
      // fastlandet"). Har vi flera pins → ram runt dem; annars centrera på platsnoden.
      if (pts.length >= 2) {
        m.fitBounds(L.latLngBounds(pts), { padding: [24, 24], maxZoom: 11 });
      } else {
        m.setView([data.center.lat, data.center.lng], pts.length ? 11 : 9);
      }
      // Flera omritningar över några frames tills layouten satt sig (belt-and-suspenders utöver RO).
      [0, 80, 250, 600].forEach((d) => setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, d));
    } catch { /* karta-init misslyckades → panelen visar ändå listor/bilder */ }
  }, [data]);

  useEffect(() => () => {
    try { roRef.current?.disconnect(); } catch { /* noop */ }
    try { mapRef.current?.remove(); } catch { /* noop */ }
    roRef.current = null; mapRef.current = null; layerRef.current = null;
  }, []);

  if (!data || (data.count === 0 && (data.images?.length ?? 0) === 0 && !data.page
      && (data.research?.length ?? 0) === 0 && (data.literature?.length ?? 0) === 0)) return null;

  return (
    <div className="border-b border-slate-800 bg-slate-900">
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

      {/* SEKTION 2: kartan VÄNSTER/prominent, forskning+runstenar i HÖGERKOLUMNEN (Daniel).
          Saknas karta → ren enkolumn (ingen strandad kolumn). */}
      <div className={`grid gap-4 px-5 pb-4 ${hasCenter ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
        <div className="min-w-0 space-y-4 lg:order-2">
          {data.research?.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
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
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                <BookOpen className="h-3.5 w-3.5" /> {sv ? 'Runstenar i trakten' : 'Runestones nearby'} · {data.count}
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

          {/* Litteratur: böcker som documents-länkats till entiteten. ISBN → "Hitta boken"-länk
              (STEG 0, ingen affiliate ännu). Skild från källor/forskning för trovärdighetens skull. */}
          {data.literature?.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
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

        {/* Kartan till vänster/prominent på desktop (order-1); överst på mobil. Rubrik så man ser VAD
            kartan visar (Daniel: "en karta som jag inte vet vad den föreställer"). */}
        {hasCenter && (
          <div className="order-first lg:order-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
              <MapPin className="h-3.5 w-3.5" />
              {sv ? 'Karta' : 'Map'}
              {data.page?.title ? ` · ${data.page.title}` : query ? ` · ${query}` : ''}
              {data.count ? ` · ${data.count} ${sv ? 'runstenar i trakten' : 'runestones nearby'}` : ''}
            </div>
            <div ref={mapEl} className="h-64 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 lg:h-80" style={{ minHeight: 256 }} />
          </div>
        )}
      </div>

      {/* SEKTION 3: bilder — öppnas i en LIGHTBOX-modal (håll kvar användaren i plattformen, Daniel),
          inte i ny flik. Kort bildtext under varje så man ser VAD de är. */}
      {data.images?.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-5 pb-4">
          {dedupImages(data.images).slice(0, 12).map((img, i) => (
            <button key={i} type="button" onClick={() => setLightbox({ url: img.url, desc: img.desc })}
              title={img.desc ?? undefined} className="group block w-32 shrink-0 text-left">
              <img src={img.url} alt={img.desc ?? ''} loading="lazy"
                className="h-24 w-32 rounded-lg object-cover bg-slate-800 transition-opacity group-hover:opacity-90"
                onError={(e) => { const b = (e.currentTarget as HTMLImageElement).closest('button'); if (b) (b as HTMLElement).style.display = 'none'; }} />
              {img.desc && (
                <span className="mt-1 block text-[10px] leading-tight text-slate-400 line-clamp-2">{shortCaption(img.desc)}</span>
              )}
            </button>
          ))}
        </div>
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
