
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

const fetchExtendedData = async (inscriptionId: string | null) => {
  if (!inscriptionId) {
    return { images: [], datings: [], sources: [], translations: [], additionalCoordinates: [] };
  }

  // UUIDs from the main table need to be converted to a bytea representation 
  // to match the imported Rundata tables.
  const hexId = inscriptionId.replace(/-/g, '');
  const byteaId = hexToBytea(hexId);

  const [imageLinksRes, datingRes, translationsRes, additionalCoordsRes, inscriptionMediaRes] = await Promise.all([
    supabase.from('imagelinks').select('imagelink').eq('objectid', byteaId),
    supabase.from('dating').select('dating').eq('objectid', byteaId),
    supabase.from('translations').select('text, teitext, language, translation').eq('inscriptionid', byteaId),
    supabase.from('additional_coordinates').select('latitude, longitude, source, notes, confidence').eq('inscription_id', inscriptionId),
    supabase.from('inscription_media').select('media_url, media_type, description, photographer').eq('inscription_id', inscriptionId)
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

  // --- New logic for sources and URIs ---

  // 1. Get source IDs for the inscription - use UUID format for object_source table
  const { data: objectSources, error: osError } = await supabase
    .from('object_source')
    .select('sourceid')
    .eq('objectid', inscriptionId);

  if (osError) {
    console.error('Error fetching object sources:', osError);
    return { images, datings, sources: [], translations, additionalCoordinates };
  }
  if (!objectSources || objectSources.length === 0) {
    return { images, datings, sources: [], translations, additionalCoordinates };
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

  // 3. Get source details
  const { data: sourcesData, error: sError } = await supabase
    .from('sources')
    .select('sourceid, title, author, publication_year')
    .in('sourceid', sourceIds);

  if (sError) {
    console.error('Error fetching sources:', sError);
  }

  const sources: SourceWithUris[] = sourcesData ? sourcesData.map(s => ({
      sourceid: s.sourceid,
      title: s.title,
      author: s.author,
      publication_year: s.publication_year,
      uris: sourceIdToUris[s.sourceid] || []
  })).filter(s => s.uris.length > 0) // Only show sources that have URIs
  : [];

  return { images, datings, sources, translations, additionalCoordinates };
};

export const useInscriptionExtendedData = (inscriptionId: string | null) => {
  return useQuery({
    queryKey: ['inscriptionExtendedData', inscriptionId],
    queryFn: () => fetchExtendedData(inscriptionId),
    enabled: !!inscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
