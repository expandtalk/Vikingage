import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Church as ChurchIcon, Building2, Clock, MapPin, Info, Landmark, Search, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChurches, churchEra, churchYear, type Church, type ChurchEra } from '@/hooks/useChurches';
import { useChurchDatings } from '@/hooks/useChurchDatings';
import { useChurchInvestigations } from '@/hooks/useChurchInvestigations';
import { useChurchArtworks } from '@/hooks/useChurchArtworks';

// Byggnadsfas-typ: skiljer ursprunglig (nybyggnad) från senare ombyggnad/rivning (t.ex. 1800-talet).
const EVENT_SV: Record<string, string> = {
  nybyggnad: 'nybyggd', ombyggnad: 'ombyggd', tillbyggnad: 'tillbyggd',
  rivning: 'riven', brand: 'brand', inredning: 'inredning', valvslagning: 'valv',
};

// /sv/kyrkor — kyrko- & klosterlager med tidsålder-zoom, snabbval och byggnadshistoria (Öland-kvalitet).
// Data: ecclesiastical_sites (4146, RAÄ/BBR/Wikidata) + church_datings (byggnadsfaser). Dedikerad route (SEO).

const ERAS: { key: ChurchEra; sv: string; en: string; color: string }[] = [
  { key: 'tidigkristet', sv: 'Tidigkristet (–1100)', en: 'Early Christian (–1100)', color: '#6366f1' },
  { key: 'romansk', sv: 'Romansk (1100–1250)', en: 'Romanesque (1100–1250)', color: '#0ea5e9' },
  { key: 'gotik', sv: 'Gotik (1250–1400)', en: 'Gothic (1250–1400)', color: '#10b981' },
  { key: 'senmedeltid', sv: 'Senmedeltid (1400–1520)', en: 'Late medieval (1400–1520)', color: '#f59e0b' },
  { key: 'efterreformatorisk', sv: 'Efter reformationen (1520–)', en: 'Post-Reformation (1520–)', color: '#ef4444' },
  { key: 'odaterad', sv: 'Odaterad', en: 'Undated', color: '#94a3b8' },
];
const eraColor = (e: ChurchEra) => ERAS.find((x) => x.key === e)?.color ?? '#94a3b8';

const KyrkorMap: React.FC<{ churches: Church[]; onSelect: (c: Church) => void }> = ({ churches, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.3, 16.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  // Rita om markörer + zooma till urvalet ("tidsålder-zoom") när filtret ändras.
  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    churches.forEach((c) => {
      const col = eraColor(churchEra(c));
      L.circleMarker([c.lat, c.lng], { radius: c.kind === 'monastery' ? 6 : 4, color: col, weight: 1, fillColor: col, fillOpacity: 0.75 })
        .on('click', () => onSelectRef.current(c))
        .bindTooltip(c.name || '', { direction: 'top' })
        .addTo(layer);
    });
    if (churches.length) {
      try { map.fitBounds(L.latLngBounds(churches.map((c) => [c.lat, c.lng] as [number, number])), { padding: [30, 30], maxZoom: 12 }); } catch { /* ignore */ }
    }
  }, [churches]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />;
};

const ChurchDetail: React.FC<{ church: Church }> = ({ church }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: datings } = useChurchDatings({ churchId: church.id });
  const { investigations } = useChurchInvestigations(church.id);
  const { data: artworks } = useChurchArtworks(church.id);
  const y = churchYear(church);
  const eraLabel = ERAS.find((e) => e.key === churchEra(church));
  return (
    <Card className="viking-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold">
          {church.kind === 'monastery' ? <Building2 className="h-5 w-5" /> : <ChurchIcon className="h-5 w-5" />}
          {sv ? church.name : (church.name_en || church.name)}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        {church.image_url && (
          <img src={church.image_url} alt={church.name} loading="lazy"
            className="w-full max-h-56 object-cover rounded border border-border" />
        )}
        <div className="flex flex-wrap gap-1.5">
          {church.church_form === 'rundkyrka' && <Badge variant="outline" className="text-xs border-gold/60 text-gold">⭕ {sv ? 'Rundkyrka' : 'Round church'}</Badge>}
          {eraLabel && <Badge variant="outline" style={{ borderColor: eraLabel.color, color: eraLabel.color }} className="text-xs">{sv ? eraLabel.sv : eraLabel.en}</Badge>}
          {church.parish && <Badge variant="secondary" className="text-xs">{church.parish}{church.landscape ? `, ${church.landscape}` : ''}</Badge>}
          {church.religious_order && <Badge variant="secondary" className="text-xs">{church.religious_order}</Badge>}
          {church.patron_saint && <Badge variant="secondary" className="text-xs">☩ {church.patron_saint}</Badge>}
        </div>
        {(y != null) && (
          <p className="text-xs"><strong>{sv ? 'Byggår' : 'Built'}:</strong> {church.built_from ?? y}{church.built_to ? `–${church.built_to}` : ''}
            {church.dating_class ? ` (${church.dating_class})` : ''}{church.dating_source ? ` — ${church.dating_source}` : ''}</p>
        )}
        {(sv ? church.description : (church.description_en || church.description)) && (
          <p className="text-sm">{sv ? church.description : (church.description_en || church.description)}</p>
        )}
        {church.historical_notes && <p className="text-xs opacity-80">{church.historical_notes}</p>}

        {datings && datings.length > 0 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {sv ? 'Byggnadshistoria' : 'Building history'}</p>
            <ol className="border-l border-border pl-3 space-y-1.5">
              {datings.map((d, i) => (
                <li key={i} className="text-xs">
                  <span className="text-gold font-medium">{d.year_from ?? ''}{d.year_to && d.year_to !== d.year_from ? `–${d.year_to}` : ''}</span>
                  {d.event_type && EVENT_SV[d.event_type] && (
                    <span className={`ml-1 px-1 rounded text-[10px] align-middle ${d.event_type === 'nybyggnad' ? 'bg-emerald-900/50 text-emerald-300' : d.event_type === 'rivning' || d.event_type === 'brand' ? 'bg-rose-900/50 text-rose-300' : 'bg-amber-900/40 text-amber-300'}`}>{EVENT_SV[d.event_type]}</span>
                  )}{' '}
                  {d.event_label}{d.building_part ? ` (${d.building_part})` : ''}{d.architect ? ` — ${d.architect}` : ''}
                </li>
              ))}
            </ol>
          </div>
        )}

        {investigations && investigations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> {sv ? 'Kyrkoundersökningar (under golvet / källaren)' : 'Church investigations (under floor / crypt)'}</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              {investigations.map((inv, i) => (
                <li key={i}>
                  <span className="text-gold">{inv.year_from ?? ''}{inv.year_to && inv.year_to !== inv.year_from ? `–${inv.year_to}` : ''}</span>{' '}
                  {inv.what_found || inv.investigation_type}{inv.find_context ? ` — ${inv.find_context}` : ''}
                  {inv.source_url && <> · <a href={inv.source_url} target="_blank" rel="noreferrer" className="text-gold hover:underline">{sv ? 'arkiv' : 'archive'}</a></>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {artworks && artworks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><Palette className="h-3.5 w-3.5" /> {sv ? 'Konst & inventarier' : 'Art & furnishings'}</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              {artworks.map((aw) => (
                <li key={aw.id}>
                  <span className="text-gold">{aw.title || aw.artwork_type}</span>
                  {aw.artist?.name ? <span> — {aw.artist.name}</span> : null}
                  {(aw.dating_text || aw.year_from != null) ? <span className="opacity-80"> ({aw.dating_text || aw.year_from})</span> : null}
                  {aw.motif ? <span className="block opacity-80">{aw.motif}</span> : null}
                  {aw.location_in_church ? <span className="block opacity-70">{sv ? 'Placering' : 'Location'}: {aw.location_in_church}</span> : null}
                  {aw.condition ? <span className="block opacity-70 italic">{aw.condition}</span> : null}
                  {aw.source_url ? <a href={aw.source_url} target="_blank" rel="noreferrer" className="text-gold hover:underline">{sv ? 'källa →' : 'source →'}</a> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
        {church.register_url && (
          <a href={church.register_url} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">
            {sv ? 'Källa / register →' : 'Source / register →'}
          </a>
        )}
      </CardContent>
    </Card>
  );
};

const Kyrkor = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { churches, isLoading } = useChurches(true);
  const [eraFilter, setEraFilter] = useState<ChurchEra | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'parish_church' | 'monastery' | 'chapel'>('all');
  const [onlyRound, setOnlyRound] = useState(false);
  const [hideModern, setHideModern] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Church | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return churches.filter((c) =>
      (eraFilter === 'all' || churchEra(c) === eraFilter) &&
      (kindFilter === 'all' || c.kind === kindFilter) &&
      (!onlyRound || c.church_form === 'rundkyrka') &&
      (!hideModern || churchEra(c) !== 'efterreformatorisk') &&
      (!q || (c.name || '').toLowerCase().includes(q) || (c.name_en || '').toLowerCase().includes(q))
    );
  }, [churches, eraFilter, kindFilter, onlyRound, hideModern, query]);

  return (
    <div className="min-h-screen viking-bg overflow-x-hidden">
      <PageMeta
        title="Kyrkor & kloster — byggnadshistoria och tidsålder"
        titleEn="Churches & monasteries — building history and period"
        description="Utforska Sveriges medeltida kyrkor och kloster på karta, filtrerat på tidsålder (tidigkristet, romansk, gotik, senmedeltid). Byggnadshistoria per kyrka ur RAÄ/BBR, med skyddshelgon, orden och datering."
        descriptionEn="Explore Sweden's medieval churches and monasteries on a map, filtered by period (Early Christian, Romanesque, Gothic, Late Medieval). Per-church building history from RAÄ/BBR, with patron saints, orders and dating."
        keywords="kyrkor, kloster, medeltidskyrkor, sockenkyrkor, romansk, gotik, byggnadshistoria, stift, skyddshelgon, Öland, kyrkoarkeologi"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ChurchIcon className="h-8 w-8 text-gold" />
            {sv ? 'Kyrkor & kloster' : 'Churches & monasteries'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? `${churches.length} kyrkor och kloster på karta. Zooma på tidsålder, filtrera på typ, och klicka en kyrka för byggnadshistoria.`
              : `${churches.length} churches and monasteries mapped. Zoom by period, filter by type, and click a church for its building history.`}
          </p>
        </div>

        {/* Sök kyrka på namn */}
        <div className="mb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sv ? 'Sök kyrka på namn…' : 'Search church by name…'}
              aria-label={sv ? 'Sök kyrka på namn' : 'Search church by name'}
              className="w-full rounded-md border border-border bg-card/60 pl-8 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={sv ? 'Rensa sökning' : 'Clear search'}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground text-sm"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tidsålder-zoom */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {sv ? 'Tidsålder:' : 'Period:'}</span>
          <Button variant={eraFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setEraFilter('all')}>{sv ? 'Alla' : 'All'}</Button>
          {ERAS.map((e) => (
            <Button key={e.key} variant={eraFilter === e.key ? 'default' : 'outline'} size="sm" onClick={() => setEraFilter(e.key)}
              style={eraFilter === e.key ? { background: e.color, borderColor: e.color } : { borderColor: e.color, color: e.color }}>
              {sv ? e.sv : e.en}<Badge variant="secondary" className="ml-1">{churches.filter((c) => churchEra(c) === e.key).length}</Badge>
            </Button>
          ))}
        </div>

        {/* Snabbval: typ */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> {sv ? 'Snabbval:' : 'Quick pick:'}</span>
          {([['all', sv ? 'Alla' : 'All'], ['parish_church', sv ? 'Sockenkyrkor' : 'Parish churches'], ['monastery', sv ? 'Kloster' : 'Monasteries'], ['chapel', sv ? 'Kapell' : 'Chapels']] as const).map(([key, label]) => (
            <Button key={key} variant={kindFilter === key ? 'default' : 'outline'} size="sm" onClick={() => setKindFilter(key)}>
              {label}<Badge variant="secondary" className="ml-1">{key === 'all' ? churches.length : churches.filter((c) => c.kind === key).length}</Badge>
            </Button>
          ))}
          <Button
            variant={onlyRound ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyRound(v => !v)}
            title={sv ? 'Bevarade medeltida rundkyrkor (8 i Sverige)' : "Sweden's preserved medieval round churches (8)"}
          >
            ⭕ {sv ? 'Rundkyrkor' : 'Round churches'}<Badge variant="secondary" className="ml-1">{churches.filter((c) => c.church_form === 'rundkyrka').length}</Badge>
          </Button>
          <Button
            variant={hideModern ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHideModern(v => !v)}
            title={sv ? 'Dölj kyrkor byggda efter reformationen (1520–)' : 'Hide churches built after the Reformation (1520–)'}
          >
            {hideModern ? '🚫' : '👁'} {sv ? 'Dölj moderna' : 'Hide modern'}<Badge variant="secondary" className="ml-1">{churches.filter((c) => churchEra(c) === 'efterreformatorisk').length}</Badge>
          </Button>
          <span className="text-xs text-muted-foreground ml-2">{sv ? 'Visar' : 'Showing'} {filtered.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> {sv ? 'Karta' : 'Map'}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[520px] flex items-center justify-center text-muted-foreground">{sv ? 'Laddar kyrkor…' : 'Loading churches…'}</div>
                ) : (
                  <KyrkorMap churches={filtered} onSelect={setSelected} />
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  {ERAS.map((e) => (
                    <span key={e.key} className="inline-flex items-center gap-1.5">
                      <span style={{ width: 10, height: 10, borderRadius: 9999, background: e.color, display: 'inline-block' }} /> {sv ? e.sv : e.en}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selected ? (
              <ChurchDetail church={selected} />
            ) : (
              <Card className="viking-card">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  <ChurchIcon className="h-8 w-8 text-gold mx-auto mb-3 opacity-70" />
                  {sv ? 'Klicka en kyrka på kartan för byggnadshistoria, skyddshelgon och datering.' : 'Click a church on the map for its building history, patron saint and dating.'}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{sv
            ? 'Data: ecclesiastical_sites (RAÄ Fornsök/BBR, Wikidata) + church_datings (byggnadsfaser ur BBR). Tidsålder = bästa tillgängliga byggår; odaterade visas separat. Bilder enligt respektive licens/attribuering.'
            : 'Data: ecclesiastical_sites (RAÄ/BBR, Wikidata) + church_datings (building phases from BBR). Period = best available construction year; undated shown separately. Images per their licence/attribution.'}</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Kyrkor;
