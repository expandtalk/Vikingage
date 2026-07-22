import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Hammer, Scroll, BookOpen, Compass, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Permalänksida per inskrift (/inscription/:signum) — den kanoniska stenartikeln.
// Länkmål från artefakter, globalsök, namngivna stenar och källsidan. All data i
// ett RPC-anrop (get_inscription_page). Egen dokumentation prioriteras bland bilder.

interface Img { url: string; description: string | null; photographer: string | null; credit: string | null; source: string | null; }
interface Carver { id: string; name: string; }
interface Reading { type: string | null; text: string; }
interface Interpretation { version: string | null; language: string | null; text: string; }
interface LitLink { title: string; source_id: string; relation: string | null; }
interface InscriptionData {
  id: string; signum: string; name: string | null; name_en: string | null; name_source: string | null;
  also_known_as: string[] | null; alternative_signum: string[] | null;
  transliteration: string | null; normalization: string | null; translation_sv: string | null; translation_en: string | null;
  dating_text: string | null; period_start: number | null; period_end: number | null;
  socken: string | null; harad: string | null; landscape: string | null; province: string | null;
  county: string | null; municipality: string | null; location: string | null; country: string | null; current_location: string | null;
  object_type: string | null; material: string | null; style_group: string | null; rune_type: string | null; meter: string | null;
  scholarly_notes: string | null; historical_context: string | null; paleographic_notes: string | null; condition_notes: string | null;
  k_samsok_uri: string | null; raa_number: string | null; bibliography: string | null;
  lat: number | null; lng: number | null;
  images: Img[]; carvers: Carver[]; readings: Reading[]; interpretations: Interpretation[]; literary_links: LitLink[];
}

// Editionsversioner och språklager ur Samnordisk runtextdatabas (samma koder som RAÄ Runor).
const READING_LABEL: Record<string, { sv: string; en: string }> = {
  P: { sv: 'primär läsning', en: 'primary reading' },
  Q: { sv: 'alternativ läsning', en: 'alternative reading' },
  R: { sv: 'äldre läsning', en: 'older reading' },
  S: { sv: 'läsvariant', en: 'reading variant' },
};
const LANG_LABEL: Record<string, { sv: string; en: string }> = {
  FVN: { sv: 'fornvästnordiska', en: 'Old West Norse' },
  RSV: { sv: 'runsvenska', en: 'Runic Swedish' },
  RDA: { sv: 'rundanska', en: 'Runic Danish' },
  URN: { sv: 'urnordiska', en: 'Proto-Norse' },
  FSV: { sv: 'fornsvenska', en: 'Old Swedish' },
  FDA: { sv: 'forndanska', en: 'Old Danish' },
  NFS: { sv: 'nyisländska', en: 'Modern Icelandic' },
};

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => any };

const InscriptionPage = () => {
  const { signum } = useParams<{ signum: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inscription-page', signum],
    enabled: !!signum,
    queryFn: async () => {
      const { data, error } = await sb.rpc('get_inscription_page', { p_signum: signum });
      if (error) throw error;
      return data as InscriptionData | null;
    },
  });

  useEffect(() => {
    if (!data?.lat || !data?.lng || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [data.lat, data.lng], zoom: 13, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    L.circleMarker([data.lat, data.lng], { radius: 9, color: '#78350f', fillColor: '#eab308', fillOpacity: 0.9, weight: 2 })
      .addTo(map).bindPopup(`<strong>${data.signum}</strong>`);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, [data]);

  const title = data ? (data.name ? `${data.signum} — ${sv ? data.name : (data.name_en || data.name)}` : data.signum) : (signum ?? '');
  const place = data ? [data.socken, data.harad, data.landscape, data.country].filter(Boolean).join(' · ') : '';
  const dating = data
    ? (data.dating_text || (data.period_start ? `${data.period_start}–${data.period_end ?? ''} ${sv ? 'e.Kr.' : 'AD'}` : null))
    : null;

  const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <section className="viking-card rounded-lg border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </section>
  );

  const facts: Array<[string, string | null]> = data ? [
    [sv ? 'Objekttyp' : 'Object type', data.object_type],
    [sv ? 'Material' : 'Material', data.material],
    [sv ? 'Stilgrupp' : 'Style group', data.style_group],
    [sv ? 'Runtyp' : 'Rune type', data.rune_type],
    [sv ? 'Versmått' : 'Metre', data.meter],
    [sv ? 'Nuvarande plats' : 'Current location', data.current_location],
  ] : [];

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={title}
        titleEn={title}
        description={(sv ? data?.translation_sv : data?.translation_en) || data?.scholarly_notes || `Runinskrift ${signum}`}
        descriptionEn={data?.translation_en || `Runic inscription ${signum}`}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/inscriptions" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Alla runinskrifter' : 'All inscriptions'}
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar inskrift…' : 'Loading inscription…'}
          </div>
        )}
        {!isLoading && !data && (
          <p className="text-muted-foreground py-16 text-center">
            {sv ? `Inskriften "${signum}" hittades inte.` : `Inscription "${signum}" not found.`}
          </p>
        )}

        {data && (
          <>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <span className="text-3xl">ᚱ</span>{title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{data.signum}</Badge>
                {dating && <Badge variant="secondary" className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />{dating}</Badge>}
                {data.name_source === 'wikipedia-artikel' && (
                  <Badge className="text-xs bg-gold/20 text-gold border-gold/40">{sv ? 'Känd sten' : 'Notable stone'}</Badge>
                )}
              </div>
              {place && <p className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" />{place}</p>}
              {(data.also_known_as?.length || data.alternative_signum?.length) && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {sv ? 'Även känd som: ' : 'Also known as: '}
                  {[...(data.also_known_as ?? []), ...(data.alternative_signum ?? [])].join(', ')}
                </p>
              )}
            </div>

            {/* Bilder */}
            {data.images.length > 0 && (
              <section className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {data.images.map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-border bg-card group relative">
                      <img src={img.url} alt={img.description || data.signum} loading="lazy"
                        className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
                        title={[img.photographer, img.credit].filter(Boolean).join(', ') || undefined} />
                      {(img.photographer || img.credit) && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] text-white/60 bg-black/40 px-1 rounded">
                          {[img.photographer, img.credit].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Text */}
                {(data.transliteration || data.normalization || data.translation_sv || data.translation_en) && (
                  <Section icon={<Scroll className="h-5 w-5 text-gold" />} title={sv ? 'Inskriften' : 'The inscription'}>
                    {data.transliteration && (
                      <div className="mb-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Translitteration' : 'Transliteration'}</div>
                        <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200 whitespace-pre-wrap">{data.transliteration}</div>
                      </div>
                    )}
                    {data.normalization && (
                      <div className="mb-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Normaliserad fornnordiska' : 'Normalised Old Norse'}</div>
                        <p className="text-sm text-slate-200 font-serif italic whitespace-pre-wrap">{data.normalization}</p>
                      </div>
                    )}
                    {(data.translation_sv || data.translation_en) && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Översättning' : 'Translation'}</div>
                        <p className="text-sm text-muted-foreground italic">"{(sv ? data.translation_sv : data.translation_en) || data.translation_sv || data.translation_en}"</p>
                      </div>
                    )}
                  </Section>
                )}

                {/* Läsningar & tolkningar — flera forskares läsningar + normaliseringslager,
                    ur Samnordisk runtextdatabas. Det scenkritiska djupet RAÄ Runor har. */}
                {(data.readings.length > 1 || data.interpretations.length > 1) && (
                  <Section icon={<Scroll className="h-5 w-5 text-gold" />} title={sv ? 'Läsningar & tolkningar' : 'Readings & interpretations'}>
                    <p className="text-xs text-muted-foreground mb-3">
                      {sv ? 'Varianta läsningar och normaliseringar från olika editioner (Samnordisk runtextdatabas).'
                          : 'Variant readings and normalisations from different editions (Scandinavian Runic-text Database).'}
                    </p>
                    {data.readings.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">{sv ? 'Läsningar' : 'Readings'}</div>
                        {data.readings.map((r, i) => (
                          <div key={i}>
                            {r.type && <span className="text-[10px] uppercase text-gold/80 mr-2">{(READING_LABEL[r.type]?.[sv ? 'sv' : 'en']) ?? r.type}</span>}
                            <span className="font-mono text-sm text-slate-200">{r.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {data.interpretations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">{sv ? 'Normaliseringar' : 'Normalisations'}</div>
                        {data.interpretations.map((it, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-[10px] uppercase text-gold/80 mr-2">
                              {[it.language && (LANG_LABEL[it.language]?.[sv ? 'sv' : 'en'] ?? it.language),
                                it.version && (READING_LABEL[it.version]?.[sv ? 'sv' : 'en'] ?? `ed. ${it.version}`)]
                                .filter(Boolean).join(' · ')}
                            </span>
                            <span className="text-slate-200 font-serif italic">{it.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {(data.scholarly_notes || data.historical_context || data.paleographic_notes || data.condition_notes) && (
                  <Section icon={<BookOpen className="h-5 w-5 text-gold" />} title={sv ? 'Forskning & kontext' : 'Research & context'}>
                    {data.scholarly_notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{data.scholarly_notes}</p>}
                    {data.historical_context && <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{data.historical_context}</p>}
                    {data.paleographic_notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{data.paleographic_notes}</p>}
                    {data.condition_notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.condition_notes}</p>}
                  </Section>
                )}
              </div>

              <div className="space-y-6">
                {/* Karta */}
                {data.lat && data.lng && (
                  <div>
                    <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: 240 }} />
                    <div className="mt-2 flex flex-wrap gap-3">
                      <a href={`/explore?lat=${data.lat}&lng=${data.lng}`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><Compass className="h-3 w-3" />{sv ? 'Visa i kartan' : 'Show on map'}</a>
                      <a href={`https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lng}#map=15/${data.lat}/${data.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><ExternalLink className="h-3 w-3" />OpenStreetMap</a>
                    </div>
                  </div>
                )}

                {/* Fakta */}
                {facts.some(([, v]) => v) && (
                  <Section icon={<ImageIcon className="h-5 w-5 text-gold" />} title={sv ? 'Fakta' : 'Facts'}>
                    <dl className="space-y-1.5 text-sm">
                      {facts.filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-muted-foreground shrink-0">{k}</dt>
                          <dd className="text-foreground text-right">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Section>
                )}

                {/* Ristare */}
                {data.carvers.length > 0 && (
                  <Section icon={<Hammer className="h-5 w-5 text-gold" />} title={sv ? 'Ristare' : 'Carver(s)'}>
                    <ul className="space-y-1">
                      {data.carvers.map((c) => (
                        <li key={c.id}>
                          <Link to={`/carvers?carver=${c.id}`} className="text-gold hover:underline text-sm">{c.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Litterära kopplingar */}
                {data.literary_links.length > 0 && (
                  <Section icon={<BookOpen className="h-5 w-5 text-gold" />} title={sv ? 'Litterära kopplingar' : 'Literary links'}>
                    <ul className="space-y-1">
                      {data.literary_links.map((l, i) => (
                        <li key={i}>
                          <Link to={`/sources/${l.source_id}`} className="text-gold hover:underline text-sm">{l.title}</Link>
                          {l.relation && <span className="text-xs text-muted-foreground"> · {l.relation}</span>}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Källor / länkar */}
                {(data.k_samsok_uri || data.raa_number || data.bibliography) && (
                  <Section icon={<ExternalLink className="h-5 w-5 text-gold" />} title={sv ? 'Källor' : 'Sources'}>
                    <ul className="space-y-1.5 text-sm">
                      {data.k_samsok_uri && (
                        <li>
                          <a href={data.k_samsok_uri} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />RAÄ Runor / Samnordisk runtextdatabas</a>
                          <span className="block text-[11px] text-muted-foreground/70">{sv ? 'Auktoritativ källa att citera (Riksantikvarieämbetet & Uppsala universitet)' : 'Authoritative source for citation (Swedish National Heritage Board & Uppsala University)'}</span>
                        </li>
                      )}
                      {data.raa_number && <li className="text-muted-foreground">RAÄ-nr: {data.raa_number}</li>}
                      {data.bibliography && <li className="text-muted-foreground text-xs">{data.bibliography}</li>}
                    </ul>
                  </Section>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InscriptionPage;
