import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../Header';
import { Breadcrumbs } from '../Breadcrumbs';
import { Footer } from '../Footer';
import { PageMeta } from '../PageMeta';

export interface ThemeRow { signum?: string; label: string; lat: number | null; lng: number | null; note?: string | null; }

interface Props {
  title: string; titleEn: string; description: string;
  intro: React.ReactNode;
  rows: ThemeRow[];
  stats?: { label: string; value: React.ReactNode }[];
  center?: [number, number]; zoom?: number;
  footerNote?: React.ReactNode;
}

// Delad forskningssida för runstens-teman: liten karta (var stenarna står) + lista + ärlig text.
export function CorpusThemePage({ title, titleEn, description, intro, rows, stats, center = [59.3, 17.6], zoom = 5, footerNote }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center, zoom, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const pts = rows.filter(r => r.lat != null && r.lng != null && Number.isFinite(r.lat) && Number.isFinite(r.lng));
    const layer = L.layerGroup().addTo(map);
    pts.forEach(r => {
      L.circleMarker([r.lat as number, r.lng as number], { radius: 6, color: '#a0342a', fillColor: '#d4af37', fillOpacity: 0.85, weight: 1.5 })
        .bindPopup(`<b>${r.signum ?? ''}</b><br>${r.label}${r.note ? `<br><span style="font-size:11px">${r.note}</span>` : ''}`)
        .addTo(layer);
    });
    if (pts.length) { try { map.fitBounds(L.latLngBounds(pts.map(p => [p.lat as number, p.lng as number])).pad(0.2)); } catch { /* noop */ } }
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; };
  }, [rows, center, zoom]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={title} titleEn={titleEn} description={description} descriptionEn={description} />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        <div className="text-sm text-muted-foreground mb-4 max-w-3xl space-y-2">{intro}</div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {stats.map((s, i) => (
              <div key={i} className="viking-card rounded-lg border border-border px-3 py-2">
                <div className="text-lg font-bold text-gold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div ref={ref} className="w-full rounded-lg border border-border" style={{ height: '60vh', minHeight: 420 }} />
          </div>
          <div className="viking-card rounded-lg border border-border p-3 max-h-[60vh] overflow-y-auto">
            <div className="text-sm font-semibold text-foreground mb-2">{rows.length} poster</div>
            <ul className="space-y-1.5">
              {rows.map((r, i) => (
                <li key={i} className="text-xs border-b border-border/50 pb-1.5">
                  {r.signum && <span className="text-gold font-medium">{r.signum} </span>}
                  <span className="text-foreground">{r.label}</span>
                  {r.note && <div className="text-muted-foreground">{r.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {footerNote && <p className="text-[11px] text-muted-foreground mt-4 max-w-3xl">{footerNote}</p>}
      </main>
      <Footer />
    </div>
  );
}
