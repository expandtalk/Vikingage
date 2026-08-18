import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Bildarkiv/bildsök över flera kategorier. Tidigare var arkivet runsten-tungt (bara
// inscription_media). Här generaliseras det till en kategori-facett. Endast kategorier
// där bilddata FAKTISKT finns i schemat tas med (verifierat mot supabase/types.ts):
//   - Runstenar        → inscription_media.media_url  (license_code kontrollerad vokab)
//   - Kyrkokonst       → church_artworks.image_url    (license + image_attribution + source_url)
//   - 3D-modeller      → models_3d.file_path          (GLB; enhetligt CC-BY 4.0 SHM/SweDigArch)
//   - Mynt             → coins.image_url              (INGEN licenskolumn → märks "ej fastställd")
// EXKLUDERADE (ingen bildkolumn i schemat, gissas ej): artefacts, picture_stone_reuse,
// rock_art_dating, swedish_hillforts, heritage_sites.
//
// LICENS ÄR KRITISK: originalen hotlänkas (rehostas aldrig). Runstensbilder utan känd/fri
// licens utesluts helt (samma princip som entity_answer_context). Kategorier utan
// strukturerad licens (mynt) märks tydligt "Licens ej fastställd — se källa" och får aldrig
// en grön fri-licens-badge.

export type ImageCategory = 'runestone' | 'historical_drawing' | 'historical_depiction' | 'manuscript' | 'church_art' | 'model3d' | 'coin' | 'history_painting';

// Normaliserad licensstatus. `free` = fri/öppen licens som får visas med grön badge.
// `unverified` = licens saknas/okänd → amber-varning, kräver källa. `blocked` visas aldrig.
export interface NormalizedLicense {
  label: string;          // t.ex. "CC BY", "Public domain", "Licens ej fastställd"
  url: string | null;     // licenslänk om känd
  status: 'free' | 'unverified';
}

export interface ArchiveImage {
  id: string;
  category: ImageCategory;
  kind: 'image' | 'model';   // model = 3D GLB (ej rasterbild) → länkas ut, bäddas ej in i grid
  src: string;               // media_url / image_url / file_path (hotlänk till original) — visas vid klick
  thumb?: string | null;     // komprimerad Wikimedia-thumb (Commons-API), default i grid; null → använd src
  href: string | null;       // intern detaljsida eller extern källa
  title: string;             // primär etikett
  caption: string | null;    // används för alt-text + bildtext
  credit: string | null;     // fotograf / attribution / institution
  license: NormalizedLicense;
  sourceUrl: string | null;  // extern källänk (kulturarvsdata, museum, wikimedia …)
  region: string | null;     // landskap/plats — härlett ur källan (runsten=province/landskap,
                             // 3D=place_slug, mynt=mint). null = ingen känd plats (gissas ALDRIG).
}

// --- licens-normalisering -------------------------------------------------

const LICENSE_URLS: Record<string, string> = {
  'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'PD': 'https://creativecommons.org/publicdomain/mark/1.0/',
  'CC-BY': 'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA': 'https://creativecommons.org/licenses/by-sa/4.0/',
};
const LICENSE_LABELS: Record<string, string> = {
  'CC0': 'CC0',
  'PD': 'Public domain',
  'CC-BY': 'CC BY',
  'CC-BY-SA': 'CC BY-SA',
};

// Kontrollerad vokab i inscription_media.license_code: PD | CC0 | CC-BY | CC-BY-SA | unknown.
function licenseFromCode(code: string | null): NormalizedLicense | null {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  if (c in LICENSE_LABELS) {
    return { label: LICENSE_LABELS[c], url: LICENSE_URLS[c] ?? null, status: 'free' };
  }
  return null; // 'unknown' eller okänd kod → uteslut (runstensbilder)
}

// church_artworks.license är fritext → försök normalisera till fri licens, annars unverified.
function licenseFromFreeText(raw: string | null): NormalizedLicense {
  const t = (raw ?? '').toLowerCase();
  if (!t) return { label: 'Licens ej fastställd', url: null, status: 'unverified' };
  if (t.includes('publicdomain') || t === 'pd' || t.includes('public domain') || t.includes('pdm')) {
    return { label: 'Public domain', url: LICENSE_URLS['PD'], status: 'free' };
  }
  if (t.includes('cc0') || t.includes('zero')) return { label: 'CC0', url: LICENSE_URLS['CC0'], status: 'free' };
  if (t.includes('by-sa') || t.includes('by sa')) return { label: 'CC BY-SA', url: LICENSE_URLS['CC-BY-SA'], status: 'free' };
  // "copyright" / rättighetsskyddat → behandla som ej visningsbar fri licens
  if (t.includes('by')) return { label: 'CC BY', url: LICENSE_URLS['CC-BY'], status: 'free' };
  return { label: 'Licens ej fastställd', url: null, status: 'unverified' };
}

// Region/landskap-normalisering: trimma, släpp tomt. Gissar ALDRIG ett landskap som saknas.
function normalizeRegion(raw: string | null): string | null {
  const t = (raw ?? '').trim();
  return t.length ? t : null;
}

// --- fetch ---------------------------------------------------------------

const sb = supabase as unknown as { from: (t: string) => any };

const RUNESTONE_LIMIT = 600;

// Gemensam mappning för inscription_media-rader (foto och teckning) → ArchiveImage.
type InscMediaRow = {
  id: string; media_url: string; thumb_url: string | null; media_type: string | null; description: string | null; motive: string | null;
  photographer: string | null; source_institution: string | null; license_code: string | null;
  inscription: { signum: string | null; province: string | null; landscape: string | null } | null;
};
function mapInscriptionMedia(rows: InscMediaRow[], category: ImageCategory): ArchiveImage[] {
  const fallbackTitle = category === 'historical_drawing' ? 'Historisk avbildning' : 'Runinskrift';
  return rows.flatMap((r) => {
    const license = licenseFromCode(r.license_code);
    if (!license) return []; // extra skyddsnät
    const signum = r.inscription?.signum ?? null;
    const credit = [r.photographer, r.source_institution].filter(Boolean).join(', ') || null;
    return [{
      id: r.id,
      category,
      kind: 'image' as const,
      src: r.media_url,
      thumb: r.thumb_url ?? null,
      href: signum ? `/inscription/${encodeURIComponent(signum)}` : null,
      title: signum ?? fallbackTitle,
      caption: r.motive ?? r.description ?? null,
      credit,
      license,
      sourceUrl: r.media_url,
      region: normalizeRegion(r.inscription?.landscape ?? r.inscription?.province ?? null),
    }];
  });
}

const INSC_MEDIA_SELECT =
  'id, media_url, thumb_url, media_type, description, motive, photographer, source_institution, license_code, inscription:inscription_id(signum, province, landscape)';

async function fetchRunestones(): Promise<ArchiveImage[]> {
  // Foton av runstenar. Endast bildmedia med känd FRI licens (kontrollerad vokab); 'unknown'/null
  // utesluts i klienten. Inskrifts-join ger signum + province/landscape → region-facett (landskap).
  const { data, error } = await sb
    .from('inscription_media')
    .select(INSC_MEDIA_SELECT)
    .eq('media_type', 'image')
    .not('media_url', 'is', null)
    .in('license_code', ['PD', 'CC0', 'CC-BY', 'CC-BY-SA'])
    .limit(RUNESTONE_LIMIT);
  if (error) throw error;
  return mapInscriptionMedia((data ?? []) as InscMediaRow[], 'runestone');
}

async function fetchHistoricalDrawings(): Promise<ArchiveImage[]> {
  // media_type 'teckning' = historiska avbildningar (Peringskiöld, Hadorph, Dybeck, Säve m.fl.) —
  // primärkällor för många nu FÖRSVUNNA stenar. Egen kategori + egen hämtning så alla garanterat
  // surfar (delar annars 600-radersgränsen med tusentals foton). Samma URL-format och PD/CC-krav.
  const { data, error } = await sb
    .from('inscription_media')
    .select(INSC_MEDIA_SELECT)
    .eq('media_type', 'teckning')
    .not('media_url', 'is', null)
    .in('license_code', ['PD', 'CC0', 'CC-BY', 'CC-BY-SA'])
    .limit(400);
  if (error) throw error;
  return mapInscriptionMedia((data ?? []) as InscMediaRow[], 'historical_drawing');
}

// Historiska avbildningar av icke-runsten-objekt (kyrkor före ombyggnad, klosterruiner,
// offerlundar/källor, gravhögar, kungar) — Peringskiöld m.fl. Egen tabell historical_depictions.
const DEPICTION_SUBJECT: Record<string, { sv: string; en: string }> = {
  church:    { sv: 'Kyrka',            en: 'Church' },
  cult_site: { sv: 'Offerlund/källa',  en: 'Cult site' },
  mound:     { sv: 'Gravhög',          en: 'Burial mound' },
  king:      { sv: 'Kung/dynasti',     en: 'King/dynasty' },
  monument:  { sv: 'Monument',         en: 'Monument' },
  manuscript:{ sv: 'Manuskript',       en: 'Manuscript' },
  other:     { sv: 'Objekt',           en: 'Object' },
};
async function fetchHistoricalDepictions(): Promise<ArchiveImage[]> {
  const { data, error } = await sb
    .from('historical_depictions')
    .select('id, subject_type, title, place_name, province, image_url, thumb_url, artist, work_ref, year, license_code, source_url')
    .not('image_url', 'is', null)
    .limit(400);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    id: string; subject_type: string; title: string; place_name: string | null; province: string | null;
    image_url: string; thumb_url: string | null; artist: string | null; work_ref: string | null; year: string | null;
    license_code: string | null; source_url: string | null;
  }>;
  return rows.flatMap((r) => {
    if (!r.image_url) return [];
    const license = licenseFromCode(r.license_code) ?? { label: 'Public domain', url: LICENSE_URLS['PD'], status: 'free' as const };
    const subj = DEPICTION_SUBJECT[r.subject_type] ?? DEPICTION_SUBJECT.other;
    const credit = [r.artist, r.work_ref, r.year].filter(Boolean).join(' · ') || null;
    // Manuskript får en egen facett; övriga objekt (kyrkor, kungar, hög…) samlas under 'historical_depiction'.
    const category: ImageCategory = r.subject_type === 'manuscript' ? 'manuscript' : 'historical_depiction';
    return [{
      id: r.id,
      category,
      kind: 'image' as const,
      src: r.image_url,
      thumb: r.thumb_url ?? null,
      href: r.source_url,
      title: r.place_name ?? r.title,
      caption: `${subj.sv} — ${r.title}`,
      credit,
      license,
      sourceUrl: r.source_url,
      region: normalizeRegion(r.province),
    }];
  });
}

async function fetchChurchArt(): Promise<ArchiveImage[]> {
  const { data, error } = await sb
    .from('church_artworks')
    .select('id, title, motif, artwork_type, dating_text, image_url, image_attribution, license, source, source_url, artist:artists(name)')
    .not('image_url', 'is', null)
    .limit(300);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    id: string; title: string | null; motif: string | null; artwork_type: string | null;
    dating_text: string | null; image_url: string | null; image_attribution: string | null;
    license: string | null; source: string | null; source_url: string | null;
    artist: { name: string } | null;
  }>;
  return rows.flatMap((r) => {
    if (!r.image_url) return [];
    const license = licenseFromFreeText(r.license);
    // Ej fastställd licens OCH ingen källa att hänvisa till → uteslut (kan ej redovisas hederligt).
    if (license.status === 'unverified' && !r.source_url && !r.image_attribution) return [];
    const credit = [r.image_attribution, r.artist?.name, r.source].filter(Boolean).join(' · ') || null;
    const title = r.title ?? (r.motif ? r.motif : 'Kyrkokonst');
    return [{
      id: r.id,
      category: 'church_art' as const,
      kind: 'image' as const,
      src: r.image_url,
      href: r.source_url ?? null,
      title,
      caption: r.motif ?? r.title ?? r.artwork_type ?? null,
      credit,
      license,
      sourceUrl: r.source_url ?? r.image_url,
      region: null, // kyrkokonst plats-taggas ej ännu (via church_id) — v1
    }];
  });
}

async function fetchModels3D(): Promise<ArchiveImage[]> {
  const { data, error } = await sb
    .from('models_3d')
    .select('slug, file_path, name_sv, name_en, category, attribution, sketchfab_url, place_slug')
    .not('file_path', 'is', null)
    .order('sort', { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    slug: string; file_path: string; name_sv: string; name_en: string | null;
    category: string | null; attribution: string | null; sketchfab_url: string | null; place_slug: string | null;
  }>;
  // Enhetligt CC-BY 4.0 (SHM / SweDigArch) — dokumenterat i Models3D-sidan.
  return rows.flatMap((r) => {
    if (!r.file_path) return [];
    return [{
      id: r.slug,
      category: 'model3d' as const,
      kind: 'model' as const,
      src: r.file_path,
      href: '/sv/3d',
      title: r.name_sv,
      caption: r.name_en && r.name_en !== r.name_sv ? r.name_en : null,
      credit: r.attribution ?? 'Statens historiska museer / SHM · SweDigArch',
      license: { label: 'CC BY 4.0', url: LICENSE_URLS['CC-BY'], status: 'free' },
      sourceUrl: r.sketchfab_url ?? '/sv/3d',
      region: null, // 3D-modeller: place_slug är en enskild plats, ej landskap → utanför facetten (v1)
    }];
  });
}

async function fetchCoins(): Promise<ArchiveImage[]> {
  const { data, error } = await sb
    .from('coins')
    .select('id, name, name_en, description, sources, mint, metal, image_url')
    .not('image_url', 'is', null)
    .limit(300);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    id: string; name: string; name_en: string | null; description: string | null;
    sources: string | null; mint: string | null; metal: string | null; image_url: string | null;
  }>;
  // coins saknar strukturerad licenskolumn → ALDRIG grön fri-licens-badge. Märks tydligt
  // "Licens ej fastställd" och åtföljs av källtext (sources). Se rapport: kräver licens-backfill.
  return rows.flatMap((r) => {
    if (!r.image_url) return [];
    return [{
      id: r.id,
      category: 'coin' as const,
      kind: 'image' as const,
      src: r.image_url,
      href: `/sv/mynt/${r.id}`,
      title: r.name,
      caption: [r.mint, r.metal].filter(Boolean).join(' · ') || r.description || null,
      credit: r.sources ? `Källa: ${r.sources}` : null,
      license: { label: 'Licens ej fastställd', url: null, status: 'unverified' },
      sourceUrl: null,
      region: normalizeRegion(r.mint), // myntort som region (fåtal) — text ur källan, ej gissad
    }];
  });
}

// Historiemålningar (PD, 1800-tal) — knutna till kung/händelse. KÄLLKRITISKT: konstnärlig tolkning,
// ej historisk källa → caveat visas i bildtexten. Hotlänk (Commons, PD-Art).
async function fetchHistoryPaintings(): Promise<ArchiveImage[]> {
  const { data, error } = await sb
    .from('history_paintings')
    .select('id, title, artist, year, image_url, descr_url, license_code, depicts_event, caveat')
    .not('image_url', 'is', null)
    .limit(200);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    id: string; title: string; artist: string; year: number | null; image_url: string;
    descr_url: string | null; license_code: string | null; depicts_event: string | null; caveat: string | null;
  }>;
  return rows.flatMap((r) => {
    if (!r.image_url) return [];
    const license = licenseFromCode(r.license_code) ?? { label: 'Public domain', url: LICENSE_URLS['PD'], status: 'free' as const };
    return [{
      id: r.id,
      category: 'history_painting' as const,
      kind: 'image' as const,
      src: r.image_url,
      href: r.descr_url,
      title: r.title,
      // Källkritik i bildtexten: motiv + varning (konstnärlig tolkning).
      caption: [`${r.artist}${r.year ? ` (${r.year})` : ''}`, r.depicts_event, r.caveat ? `⚠ ${r.caveat}` : null].filter(Boolean).join(' — '),
      credit: r.artist,
      license,
      sourceUrl: r.descr_url,
      region: null,
    }];
  });
}

export interface ImageArchiveData {
  items: ArchiveImage[];
  counts: Record<ImageCategory, number>;
}

export const useImageArchive = () =>
  useQuery({
    queryKey: ['image-archive'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ImageArchiveData> => {
      const results = await Promise.allSettled([
        fetchRunestones(),
        fetchHistoricalDrawings(),
        fetchHistoricalDepictions(),
        fetchChurchArt(),
        fetchModels3D(),
        fetchCoins(),
        fetchHistoryPaintings(),
      ]);
      const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
      const counts: Record<ImageCategory, number> = {
        runestone: 0, historical_drawing: 0, historical_depiction: 0, manuscript: 0, church_art: 0, model3d: 0, coin: 0, history_painting: 0,
      };
      for (const it of items) counts[it.category] += 1;
      return { items, counts };
    },
  });
