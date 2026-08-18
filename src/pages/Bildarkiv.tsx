import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Images, Boxes, ExternalLink, AlertTriangle, Search, MapPin } from 'lucide-react';
import {
  useImageArchive, type ArchiveImage, type ImageCategory, type NormalizedLicense,
} from '@/hooks/useImageArchive';

// /sv/bildarkiv + /en/image-archive — bildarkiv/bildsök över flera kategorier (tidigare
// bara runstenar). Kategori-facett + textsök. LICENS visas per bild; originalet hotlänkas,
// rehostas aldrig. Bilder utan känd/fri licens antingen utesluts (runstenar) eller märks
// tydligt "Licens ej fastställd" (mynt). Se useImageArchive.ts för datakällor + policy.

type Facet = 'all' | ImageCategory;

const FACETS: { key: Facet; sv: string; en: string }[] = [
  { key: 'all',              sv: 'Alla',          en: 'All' },
  { key: 'runestone',        sv: 'Runstenar',     en: 'Runestones' },
  { key: 'historical_drawing', sv: 'Runstensteckningar', en: 'Runestone drawings' },
  { key: 'historical_depiction', sv: 'Kyrkor & objekt', en: 'Churches & objects' },
  { key: 'church_art',       sv: 'Kyrkokonst',    en: 'Church art' },
  { key: 'history_painting', sv: 'Historiemåleri', en: 'History paintings' },
  { key: 'coin',             sv: 'Mynt',          en: 'Coins' },
  { key: 'model3d',          sv: '3D-modeller',   en: '3D models' },
];

const CAT_LABEL: Record<ImageCategory, { sv: string; en: string }> = {
  runestone:        { sv: 'Runsten',      en: 'Runestone' },
  historical_drawing: { sv: 'Teckning',   en: 'Drawing' },
  historical_depiction: { sv: 'Avbildning', en: 'Depiction' },
  church_art:       { sv: 'Kyrkokonst',   en: 'Church art' },
  history_painting: { sv: 'Historiemåleri', en: 'History painting' },
  coin:             { sv: 'Mynt',         en: 'Coin' },
  model3d:          { sv: '3D-modell',    en: '3D model' },
};

const LicenseBadge: React.FC<{ license: NormalizedLicense; sv: boolean }> = ({ license, sv }) => {
  if (license.status === 'free') {
    const body = (
      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">
        {license.label}
      </span>
    );
    return license.url ? (
      <a href={license.url} target="_blank" rel="noopener noreferrer nofollow"
        className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        aria-label={sv ? `Licens: ${license.label} (öppnas i ny flik)` : `License: ${license.label} (opens in new tab)`}>
        {body}
      </a>
    ) : body;
  }
  // unverified
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-300"
      title={sv ? 'Licens ej fastställd — visas med reservation, se källa' : 'License not established — shown with caveat, see source'}>
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      {sv ? 'Licens ej fastställd' : 'License unverified'}
    </span>
  );
};

const ArchiveCard: React.FC<{ item: ArchiveImage; sv: boolean }> = ({ item, sv }) => {
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  const alt = item.caption ?? item.title;
  const catLabel = sv ? CAT_LABEL[item.category].sv : CAT_LABEL[item.category].en;

  // 3D-modeller (GLB) bäddas inte in i grid (tungt) → ikon-kort som länkar till 3D-visaren.
  const isModel = item.kind === 'model';

  return (
    <figure className="viking-card overflow-hidden rounded-lg border border-white/10 bg-black/20 flex flex-col">
      <a
        href={item.href ?? item.src}
        target={item.href && item.href.startsWith('/') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className="block group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {isModel ? (
          <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Boxes className="h-12 w-12 text-gold" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={item.src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover motion-safe:transition-opacity group-hover:opacity-85"
            onError={() => setBroken(true)}
          />
        )}
      </a>
      <figcaption className="flex flex-1 flex-col gap-1.5 p-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-foreground leading-tight">{item.title}</span>
          <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {isModel ? (sv ? '3D' : '3D') : catLabel}
          </span>
        </div>
        {item.caption && item.caption !== item.title && (
          <span className="text-xs leading-snug text-muted-foreground line-clamp-3">{item.caption}</span>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <LicenseBadge license={item.license} sv={sv} />
          {item.href && !item.href.startsWith('/') && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        {item.region && (
          <span className="inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground/90">
            <MapPin className="h-3 w-3 text-gold/70" aria-hidden="true" /> {item.region}
          </span>
        )}
        {item.credit && (
          <span className="text-[11px] leading-tight text-muted-foreground/80">{item.credit}</span>
        )}
        {isModel && (
          <a href="/sv/3d" className="text-[11px] text-gold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded">
            {sv ? 'Öppna i 3D-visaren →' : 'Open in 3D viewer →'}
          </a>
        )}
      </figcaption>
    </figure>
  );
};

const Bildarkiv: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data, isLoading, isError } = useImageArchive();
  const [facet, setFacet] = useState<Facet>('all');
  const [region, setRegion] = useState<string>('all');
  const [query, setQuery] = useState('');

  // Landskap/region-facett: distinkta regioner ur datan (bärs av runstensbilderna som har
  // landskap; övriga kategorier plats-taggas ännu ej → syns bara under "Alla landskap").
  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const it of data?.items ?? []) if (it.region) set.add(it.region);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'sv'));
  }, [data]);

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (facet !== 'all' && it.category !== facet) return false;
      if (region !== 'all' && it.region !== region) return false;
      if (!q) return true;
      return [it.title, it.caption, it.credit, it.region].filter(Boolean).some((s) => s!.toLowerCase().includes(q));
    });
  }, [data, facet, region, query]);

  const counts = data?.counts;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Bildarkiv"
        titleEn="Image archive"
        description="Sök bilder ur Viking Age-plattformen över flera kategorier — runstenar, kyrkokonst, mynt och 3D-modeller. Varje bild visas med bildtext, licens och källa; originalen hotlänkas."
        descriptionEn="Search images across the Viking Age platform — runestones, church art, coins and 3D models. Each image is shown with caption, license and source; originals are hotlinked."
        keywords="bildarkiv, bildsök, runstenar, kyrkokonst, mynt, 3D, RAÄ, Wikimedia, CC-BY, licens"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-foreground">
          <Images className="h-8 w-8 text-gold" aria-hidden="true" />
          {sv ? 'Bildarkiv' : 'Image archive'}
        </h1>
        <p className="mb-6 max-w-3xl text-muted-foreground">
          {sv
            ? 'Bilder ur plattformen samlade över flera kategorier. Varje bild redovisas med bildtext, licens och källa — originalen hotlänkas (rehostas aldrig). Bilder utan känd fri licens visas antingen inte eller märks tydligt.'
            : 'Images from the platform gathered across several categories. Each image is shown with caption, license and source — originals are hotlinked (never rehosted). Images without a known free license are either omitted or clearly flagged.'}
        </p>

        {/* Kategori-facett — grupp av toggle-knappar (aria-pressed, tangentbordsnåbara) */}
        <div
          role="group"
          aria-label={sv ? 'Filtrera bilder efter kategori' : 'Filter images by category'}
          className="mb-4 flex flex-wrap gap-2"
        >
          {FACETS.map((f) => {
            const active = facet === f.key;
            const n = f.key === 'all'
              ? (data?.items.length ?? 0)
              : (counts ? counts[f.key] : 0);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFacet(f.key)}
                className={[
                  'inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  active
                    ? 'border-gold bg-gold/15 text-gold font-semibold'
                    : 'border-white/15 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/30',
                ].join(' ')}
              >
                {sv ? f.sv : f.en}
                <span className="text-xs opacity-70">{n}</span>
              </button>
            );
          })}
        </div>

        {/* Landskaps-/region-facett — dropdown (runstensbilder bär landskap; övriga kategorier
            plats-taggas ännu ej). Källkritik: inget landskap gissas — saknas det, ingen etikett. */}
        {regions.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label htmlFor="image-archive-region" className="text-sm text-muted-foreground">
              {sv ? 'Landskap' : 'Province'}
            </label>
            <select
              id="image-archive-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="min-h-[36px] rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <option value="all">{sv ? 'Alla landskap' : 'All provinces'}</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Textsök */}
        <div className="mb-6 max-w-md">
          <label htmlFor="image-archive-search" className="mb-1 block text-sm text-muted-foreground">
            {sv ? 'Sök i bildtext, titel eller källa' : 'Search caption, title or source'}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="image-archive-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sv ? 'T.ex. Karlevi, Albertus Pictor, solidus…' : 'e.g. Karlevi, Albertus Pictor, solidus…'}
              className="pl-9"
            />
          </div>
        </div>

        {/* Resultat */}
        <p className="sr-only" aria-live="polite">
          {sv ? `${filtered.length} bilder` : `${filtered.length} images`}
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar bilder…' : 'Loading images…'}</p>
        ) : isError ? (
          <p className="text-muted-foreground">{sv ? 'Kunde inte ladda bildarkivet.' : 'Could not load the image archive.'}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">{sv ? 'Inga bilder matchar filtret.' : 'No images match the filter.'}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <ArchiveCard key={`${item.category}-${item.id}`} item={item} sv={sv} />
            ))}
          </div>
        )}

        <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-muted-foreground/70">
          {sv
            ? 'Källkritik: runstensbilder (RAÄ/Wikimedia via inscription_media) visas endast med känd fri licens (PD/CC0/CC BY/CC BY-SA); okänd licens utesluts. Kyrkokonst visas med licens ur källan. 3D-modeller är Statens historiska museers skanningar (CC BY 4.0, SweDigArch). Mynt saknar ännu strukturerad licensuppgift och märks därför "Licens ej fastställd" — se respektive källa. Originalbilder hotlänkas till sin ursprungskälla; inget rehostas.'
            : 'Source criticism: runestone images (RAÄ/Wikimedia via inscription_media) are shown only with a known free license (PD/CC0/CC BY/CC BY-SA); unknown licenses are omitted. Church art is shown with the license from its source. 3D models are National Historical Museums scans (CC BY 4.0, SweDigArch). Coins lack a structured license field and are therefore flagged "License unverified" — see each source. Original images are hotlinked to their source; nothing is rehosted.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Bildarkiv;
