import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, BookOpen } from 'lucide-react';
import { useAnswerContext } from '@/hooks/useAnswerContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Rik svars-topp: inbäddad minikarta av den sökta platsen + kopplade runinskrifter (pins)
// + bilder. Visas överst i söksvaret; självdöljande när platsen inte har kopplat innehåll.
export const AnswerContext: React.FC<{ query: string; onGo: (route: string) => void }> = ({ query, onGo }) => {
  const { data } = useAnswerContext(query);
  const { language } = useLanguage();
  const sv = language === 'sv';
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!data?.center || !mapEl.current) return;
    try {
      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapRef.current);
      }
      const m = mapRef.current;
      m.setView([data.center.lat, data.center.lng], 9);
      if (!layerRef.current) layerRef.current = L.layerGroup().addTo(m);
      layerRef.current.clearLayers();
      (data.inscriptions || []).forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        L.circleMarker([r.lat, r.lng], { radius: 4, color: '#0f172a', weight: 1, fillColor: '#f59e0b', fillOpacity: 0.9 })
          .bindPopup(`<b>${r.signum ?? ''}</b> ${r.label ?? ''}`)
          .addTo(layerRef.current!);
      });
      setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, 60);
    } catch { /* karta-init misslyckades → panelen visar ändå listor/bilder */ }
  }, [data]);

  useEffect(() => () => { try { mapRef.current?.remove(); } catch { /* noop */ } mapRef.current = null; layerRef.current = null; }, []);

  if (!data || (data.count === 0 && (data.images?.length ?? 0) === 0)) return null;

  return (
    <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
      {data.center && (
        <div ref={mapEl} className="h-48 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-800" />
      )}

      {data.images?.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {data.images.slice(0, 10).map((img, i) => (
            <img key={i} src={img.url} alt={img.desc ?? ''} loading="lazy"
              className="h-20 w-28 shrink-0 rounded object-cover bg-slate-800"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ))}
        </div>
      )}

      {data.count > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <BookOpen className="h-3 w-3" /> {sv ? `Runinskrifter kopplade till "${query}"` : `Runic inscriptions linked to "${query}"`} · {data.count}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.inscriptions.slice(0, 14).map((r) => (
              <button key={r.id} onClick={() => onGo(`/inscription/${encodeURIComponent(r.signum ?? r.label)}`)}
                className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
                {r.signum ?? r.label}
              </button>
            ))}
            {data.count > 14 && (
              <button onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(query)}`)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-100">
                <MapPin className="h-3 w-3" /> {sv ? 'alla på kartan' : 'all on map'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
