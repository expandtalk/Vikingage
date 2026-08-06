
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const hexToBytea = (hex: string) => `\\x${hex}`;

export interface SourceWithUris {
  sourceid: string;
  title: string | null;
  author: string | null;
  publication_year: number | null;
  uris: string[];
}

export interface Translation {
  text: string;
  teitext: string | null;
  language: string;
  translation: string;
}

// Foto med bildtext — så modalen kan visa "vad som står" på varje bild (inte bara URL).
export interface InscriptionMediaItem {
  url: string;
  description: string | null;
  photographer: string | null;
}

// Forskare KOPPLADE till just denna inskrift (via object_source → sources.scholar_id →
// research_scholars) — inte hela forskarlistan.
export interface LinkedScholar {
  id: string;
  name: string;
  affiliation: string | null;
  role_title: string | null;
  active_period: string | null;
}

// Proveniens: en runsten kan ha flyttats — ursprunglig (role='original') vs nuvarande
// (role='current') plats. Källa: inscription_locations (jfr runestone-location-history).
export interface InscriptionLocationRow {
  role: string;
  place_name: string | null;
  parish: string | null;
  lat: number | null;
  lng: number | null;
  certainty: string | null;
  moved_year: number | null;
  note: string | null;
}

// Rika visningsfält som inte alltid följer med huvudlistans inscription-objekt (ristare,
// korsform/ikonografi, kristen formel, dateringstermini, k-samsök) → hämtas per id.
export interface InscriptionRich {
  carver: string | null;
  carver_attribution: string | null;
  cross_forms: string | null;
  has_cross: boolean | null;
  cross_count: number | null;
  christian_invocation: string | null;
  dating_tpq: number | null;
  dating_taq: number | null;
  k_samsok_uri: string | null;
  socken: string | null;
  harad: string | null;
  // Textfält som ofta saknas i det objekt modalen öppnas med (kart-popup/sök ger partiell
  // projektion) → hämtas alltid per id så modalen kan visa dem oavsett ingång.
  transliteration: string | null;
  translation_sv: string | null;
  translation_en: string | null;
  normalization: string | null;
  also_known_as: string[] | null;
}

const fetchExtendedData = async (inscriptionId: string | null) => {
  if (!inscriptionId) {
    return { images: [], media: [], datings: [], sources: [], scholars: [], translations: [], additionalCoordinates: [], locations: [], rich: null };
  }

  // UUIDs from the main table need to be converted to a bytea representation 
  // to match the imported Rundata tables.
  const hexId = inscriptionId.replace(/-/g, '');
  const byteaId = hexToBytea(hexId);

  const [imageLinksRes, datingRes, translationsRes, additionalCoordsRes, inscriptionMediaRes, locationsRes, richRes] = await Promise.all([
    supabase.from('imagelinks').select('imagelink').eq('objectid', byteaId),
    supabase.from('dating').select('dating').eq('objectid', byteaId),
    supabase.from('translations').select('text, teitext, language, translation').eq('inscriptionid', byteaId),
    supabase.from('additional_coordinates').select('latitude, longitude, source, notes, confidence').eq('inscription_id', inscriptionId),
    supabase.from('inscription_media').select('media_url, media_type, description, photographer').eq('inscription_id', inscriptionId),
    supabase.from('inscription_locations').select('role, place_name, parish, lat, lng, certainty, moved_year, note').eq('inscription_id', inscriptionId).order('seq'),
    supabase.from('runic_inscriptions').select('carver, carver_attribution, cross_forms, has_cross, cross_count, christian_invocation, dating_tpq, dating_taq, k_samsok_uri, socken, harad, transliteration, translation_sv, translation_en, normalization, also_known_as').eq('id', inscriptionId).maybeSingle()
  ]);

  if (imageLinksRes.error) {
    console.error('Error fetching image links:', imageLinksRes.error);
  }
  if (datingRes.error) {
    console.error('Error fetching dating info:', datingRes.error);
  }
  if (translationsRes.error) {
    console.error('Error fetching translations:', translationsRes.error);
  }
  if (additionalCoordsRes.error) {
    console.error('Error fetching additional coordinates:', additionalCoordsRes.error);
  }
  if (inscriptionMediaRes.error) {
    console.error('Error fetching inscription media:', inscriptionMediaRes.error);
  }

  // Combine images from both imagelinks (legacy) and inscription_media (new)
  const legacyImages = imageLinksRes.data?.map(item => item.imagelink).filter(Boolean) as string[] || [];
  const newImages = inscriptionMediaRes.data?.map(item => item.media_url).filter(Boolean) as string[] || [];
  const images = [...legacyImages, ...newImages];
  const datings = datingRes.data?.map(item => item.dating).filter(Boolean) as string[] || [];
  const translations = translationsRes.data || [];
  const additionalCoordinates = additionalCoordsRes.data || [];
  const mediaFiles = inscriptionMediaRes.data || [];
  const locations = (locationsRes.data || []) as InscriptionLocationRow[];
  const rich = (richRes.data || null) as InscriptionRich | null;

  // Foton MED bildtext (behåll description/photographer) — legacy imagelinks får ingen text.
  const media: InscriptionMediaItem[] = [
    ...legacyImages.map((url) => ({ url, description: null, photographer: null })),
    ...mediaFiles
      .filter((m) => m.media_url)
      .map((m) => ({ url: m.media_url as string, description: m.description ?? null, photographer: m.photographer ?? null })),
  ];

  // --- New logic for sources and URIs ---

  // 1. Get source IDs for the inscription - use UUID format for object_source table
  const { data: objectSources, error: osError } = await supabase
    .from('object_source')
    .select('sourceid')
    .eq('objectid', inscriptionId);

  if (osError) {
    console.error('Error fetching object sources:', osError);
    return { images, media, datings, sources: [], scholars: [], translations, additionalCoordinates, locations, rich };
  }
  if (!objectSources || objectSources.length === 0) {
    return { images, media, datings, sources: [], scholars: [], translations, additionalCoordinates, locations, rich };
  }
  const sourceIds = objectSources.map(os => os.sourceid);

  // 2. Get URIs for the source IDs
  const { data: referenceUris, error: ruError } = await supabase
    .from('reference_uri')
    .select('reference_id, uri_id')
    .in('reference_id', sourceIds);

  if (ruError) {
    console.error('Error fetching reference URIs:', ruError);
  }
  
  const uriIds = referenceUris ? referenceUris.map(ru => ru.uri_id) : [];

  let urisMap: { [key: string]: string } = {};
  if (uriIds.length > 0) {
      const { data: urisData, error: uError } = await supabase
          .from('uris')
          .select('uriid, uri')
          .in('uriid', uriIds);

      if (uError) {
          console.error('Error fetching URIs:', uError);
      } else if (urisData) {
          for (const u of urisData) {
              urisMap[u.uriid] = u.uri;
          }
      }
  }
  
  const sourceIdToUris: { [key: string]: string[] } = {};
  if (referenceUris) {
      for (const ru of referenceUris) {
          if (!sourceIdToUris[ru.reference_id]) {
              sourceIdToUris[ru.reference_id] = [];
          }
          if (urisMap[ru.uri_id]) {
              sourceIdToUris[ru.reference_id].push(urisMap[ru.uri_id]);
          }
      }
  }

  // 3. Get source details (inkl. scholar_id → för att koppla forskare till just denna sten)
  const { data: sourcesData, error: sError } = await (supabase as any)
    .from('sources')
    .select('sourceid, title, author, publication_year, scholar_id')
    .in('sourceid', sourceIds);

  if (sError) {
    console.error('Error fetching sources:', sError);
  }

  const sources: SourceWithUris[] = sourcesData ? sourcesData.map((s: any) => ({
      sourceid: s.sourceid,
      title: s.title,
      author: s.author,
      publication_year: s.publication_year,
      uris: sourceIdToUris[s.sourceid] || []
  })).filter((s: SourceWithUris) => s.uris.length > 0) // Only show sources that have URIs
  : [];

  // 4. Forskare kopplade till stenen (via sources.scholar_id → research_scholars).
  const scholarIds = Array.from(new Set(
    (sourcesData ?? []).map((s: any) => s.scholar_id).filter(Boolean),
  )) as string[];
  let scholars: LinkedScholar[] = [];
  if (scholarIds.length > 0) {
    const { data: scholarData, error: scErr } = await supabase
      .from('research_scholars')
      .select('id, name, affiliation, role_title, active_period')
      .in('id', scholarIds);
    if (scErr) console.error('Error fetching linked scholars:', scErr);
    else scholars = (scholarData ?? []) as LinkedScholar[];
  }

  return { images, media, datings, sources, scholars, translations, additionalCoordinates, locations, rich };
};

export const useInscriptionExtendedData = (inscriptionId: string | null) => {
  return useQuery({
    queryKey: ['inscriptionExtendedData', inscriptionId],
    queryFn: () => fetchExtendedData(inscriptionId),
    enabled: !!inscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
