import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Compass, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS } from '@/data/excursions';

const ExcursionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const excursion = EXCURSIONS.find((e) => e.id === id);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!excursion || !containerRef.current || mapRef.current) return;
    const { lat, lng } = excursion.coords;
    const map = L.map(containerRef.current, { center: [lat, lng], zoom: 14, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    L.circleMarker([lat, lng], {
      radius: 9, color: '#78350f', fillColor: '#eab308', fillOpacity: 0.9, weight: 2,
    }).addTo(map).bindPopup(`<strong>${excursion.name}</strong>`);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    // Nivå 2: ladda per-monument-geodata (GeoJSON) om den finns och färga efter typ.
    // feature.properties.type matchas mot monumentTypes (färg ur legenden).
    const norm = (s: unknown) => String(s ?? '').toLowerCase().trim();
    const colorByType = new Map((excursion.monumentTypes ?? []).map((m) => [norm(m.sv), m.color]));
    let cancelled = false;
    fetch(`/excursion-data/${excursion.id}.geojson`)
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => {
        if (cancelled || !geo || !mapRef.current) return;
        const layer = L.geoJSON(geo, {
          // Ytor (t.ex. gravfältets registrerade RAÄ-polygon) stylas i guld.
          style: () => ({ color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.12 }),
          pointToLayer: (feature, latlng) => {
            const typ = feature?.properties?.type ?? feature?.properties?.typ;
            const color = colorByType.get(norm(typ)) ?? '#94a3b8';
            return L.circleMarker(latlng, {
              radius: 5, color: '#1c1917', weight: 1, fillColor: color, fillOpacity: 0.85,
            });
          },
          onEachFeature: (feature, lyr) => {
            const p = feature?.properties ?? {};
            const typ = p.type ?? p.typ ?? '';
            lyr.bindPopup(`<strong>${typ || 'Lämning'}</strong>${p.raa ? `<br/>${p.raa}` : ''}`);
          },
        }).addTo(mapRef.current);
        try {
          const b = layer.getBounds();
          if (b.isValid()) mapRef.current.fitBounds(b, { padding: [30, 30], maxZoom: 17 });
        } catch { /* tom eller punktlös geojson */ }
      })
      .catch(() => { /* ingen geodata än — behåll platsmarkören */ });

    return () => { cancelled = true; map.remove(); mapRef.current = null; };
  }, [excursion]);

  if (!excursion) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <Breadcrumbs />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{sv ? 'Utflyktsmålet hittades inte.' : 'Excursion not found.'}</p>
          <Link to="/excursions" className="text-gold hover:underline mt-4 inline-block">
            {sv ? '← Tillbaka till utflykter' : '← Back to excursions'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={`${excursion.name} — Utflykt`}
        titleEn={`${excursion.name} — Excursion`}
        description={excursion.sv}
        descriptionEn={excursion.en}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/excursions" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          {sv ? 'Alla utflykter' : 'All excursions'}
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" />
            {excursion.name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">{excursion.region}</Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />{excursion.period}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">{sv ? excursion.sv : excursion.en}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Karta */}
          <div className="lg:col-span-2">
            <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: '60vh', minHeight: 420 }} />
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={`/explore?lat=${excursion.coords.lat}&lng=${excursion.coords.lng}`}
                 className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                <Compass className="h-3 w-3" />{sv ? 'Utforska i kartan' : 'Explore on map'}
              </a>
              <a href={`https://www.openstreetmap.org/?mlat=${excursion.coords.lat}&mlon=${excursion.coords.lng}#map=15/${excursion.coords.lat}/${excursion.coords.lng}`}
                 target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                <ExternalLink className="h-3 w-3" />{sv ? 'Öppna i OpenStreetMap' : 'Open in OpenStreetMap'}
              </a>
            </div>
          </div>

          {/* Typologi-legend */}
          {excursion.monumentTypes && excursion.monumentTypes.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {sv ? 'Monument på platsen' : 'Monuments on site'}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {sv
                    ? 'Gravtyper enligt informationsskylten. Kartan visar gravfältets registrerade yta (RAÄ, CC0); de ~1000 enskilda gravarna finns inte som öppen geodata och är därför inte utplacerade var för sig.'
                    : 'Grave types per the information sign. The map shows the registered extent of the grave field (RAÄ, CC0); the ~1000 individual graves are not available as open geodata and are therefore not plotted individually.'}
                </p>
                <ul className="space-y-2">
                  {excursion.monumentTypes.map((m) => (
                    <li key={m.sv} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span
                        className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border border-black/20"
                        style={{ backgroundColor: m.color }}
                        aria-hidden="true"
                      />
                      <span>{sv ? m.sv : m.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExcursionDetail;
