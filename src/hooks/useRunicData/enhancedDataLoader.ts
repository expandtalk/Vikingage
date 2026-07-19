
import { supabase } from "@/integrations/supabase/client";
import { getEnhancedCoordinates } from '../../utils/coordinateMappingEnhanced';
import { parseCoordinates } from './coordinateUtils';
import { sanitizeFilterValue } from '@/utils/searchFilter';
import { getCountryFromSignum, getRegionFromSignum } from '@/utils/signumValidator';
import type { UseRunicDataProps, RunicInscription } from './types';

/** A row from the `runic_with_coordinates` view (only the fields we read). */
interface RunicWithCoordinatesRow {
  signum?: string | null;
  original_coordinates?: string | null;
  coordinates?: string | null;
  coordinates_latitude?: number | null;
  coordinates_longitude?: number | null;
  additional_latitude?: number | null;
  additional_longitude?: number | null;
  coordinate_source?: string | null;
  confidence?: string | null;
  coord_confidence?: string | null;
  coord_source?: string | null;
  location?: string | null;
  parish?: string | null;
  country?: string | null;
}

/** A standalone row from `additional_coordinates` (inscription_id IS NULL). */
interface StandaloneCoordinateRow {
  id: string | number;
  signum?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source?: string | null;
  confidence?: string | null;
}

/**
 * Hämtar ALLA rader från en PostgREST-query genom att paginera med .range().
 * PostgREST kapar varje svar vid `db-max-rows` (1000 hos oss) OAVSETT .limit(),
 * så en enda query gav bara 1000 av 3067 inskrifter. Vi loopar i sidor om 1000
 * tills en sida kommer tillbaka kort (färre än PAGE_SIZE = sista sidan).
 *
 * OBS: .order() måste appliceras EN gång före loopen (stabil sortering krävs för
 * korrekt paginering). .range() använder searchParams.set för offset/limit i
 * supabase-js v2, så samma builder kan återanvändas per sida (overwrite, inte append).
 */
const PAGE_SIZE = 1000;
async function fetchAllPages<T>(
  builder: { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }> }
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  // Skyddsvakt mot oändlig loop (max 100 000 rader).
  for (let guard = 0; guard < 100; guard++) {
    const { data, error } = await builder.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = data || [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export const loadEnhancedRunicDataWithBetterCoordinates = async (filters: UseRunicDataProps) => {
  console.log('🔄 Loading enhanced runic data with improved coordinate system...');
  console.log('🔍 FULL FILTER DEBUG:', JSON.stringify(filters, null, 2));

  try {
    // DEBUGGING: Let's see what's happening with the limit
    console.log('🔧 DEBUG: About to query runic_with_coordinates view');
    
    // Use the runic_with_coordinates view that contains all coordinate data
    let query = supabase
      .from('runic_with_coordinates')
      .select('*');

    // Also fetch standalone coordinates from additional_coordinates table
    // for inscriptions that don't exist in the main table (like Icelandic ones)
    console.log('🔍 ICELAND DEBUG: Fetching standalone coordinates from additional_coordinates...');
    let standaloneCoords: StandaloneCoordinateRow[] = [];
    try {
      // Paginerad (PostgREST kapar vid 1000) — ordna på 'id' för stabil sidindelning.
      const standaloneQuery = supabase
        .from('additional_coordinates')
        .select('*')
        .is('inscription_id', null)
        .order('id', { ascending: true });
      standaloneCoords = await fetchAllPages<StandaloneCoordinateRow>(standaloneQuery as never);
      console.log(`📍 Found ${standaloneCoords.length} standalone coordinate entries`);
      // Debug: Log any Icelandic entries
      const icelandicEntries = standaloneCoords.filter(coord => coord.signum?.startsWith('IS '));
      console.log(`🇮🇸 ICELAND DEBUG: Found ${icelandicEntries.length} Icelandic entries:`, icelandicEntries.map(e => e.signum));
    } catch (standaloneError) {
      console.error('❌ Error fetching standalone coordinates:', standaloneError);
    }

    // VIKTIGT: Hantera problematiska söktermer som orsakar SQL-fel
    console.log('🔍 Checking for searchQuery filter:', filters.searchQuery);
    console.log('🔍 Checking for godNameSearch filter:', filters.godNameSearch);
    
    // KRITISKT: Endast applicera filter om de verkligen har värden
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.trim();
      const safeSearch = sanitizeFilterValue(searchTerm);
      console.log('🔍 Search query detected:', searchTerm);
      
      // Check if searching for countries/regions that might have standalone coordinates
      const searchTermLower = searchTerm.toLowerCase();
      const searchesIsland = searchTermLower.includes('island') || searchTermLower.includes('iceland');
      const searchesVärmland = searchTermLower.includes('värmland');
      
      if (searchesIsland || searchesVärmland) {
        console.log(`🌍 Search includes regions with standalone coordinates: Island=${searchesIsland}, Värmland=${searchesVärmland}`);
      }
      
      // Lista över problematiska termer som orsakar SQL-parsningsfel
      const problematicTerms = ['rök', 'rö', 'å', 'ö'];
      const isProblematic = problematicTerms.some(term => 
        searchTerm.toLowerCase().includes(term.toLowerCase())
      );
      
      if (isProblematic) {
        console.log('⚠️ Using safe search for problematic term:', searchTerm);
        // Använd enkel ILIKE-sökning för problematiska termer - inkludera landskap, kommun och socken
        query = query.or(`signum.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%,landscape.ilike.%${safeSearch}%,municipality.ilike.%${safeSearch}%,parish.ilike.%${safeSearch}%,transliteration.ilike.%${safeSearch}%,translation_en.ilike.%${safeSearch}%,translation_sv.ilike.%${safeSearch}%`);
      } else {
        // FIXAD: Hantera exakta signum-sökningar först (t.ex. "G 1", "U 370")
        // Kolla om det är en exakt signum-sökning (kort term som kan vara ett signum)
        const isLikelySignum = searchTerm.length <= 10 && /^[A-Za-z]+\s*\d+/.test(searchTerm);
        
        if (isLikelySignum) {
          console.log(`🎯 Likely signum search detected: "${searchTerm}" - checking for exact match first`);
          
          // Försök exakt match först
          const exactQuery = supabase
            .from('runic_with_coordinates')
            .select('*')
            .eq('signum', searchTerm);
            
          const { data: exactData, error: exactError } = await exactQuery;
          
          if (!exactError && exactData && exactData.length > 0) {
            console.log(`✅ Found exact signum match: ${searchTerm}`);
            query = query.eq('signum', searchTerm);
          } else {
            // Ingen exakt match, använd RPC för fuzzy search
            console.log(`🔍 No exact match for "${searchTerm}", using RPC search`);
            
            try {
              const { data: rpcData, error } = await supabase.rpc('search_inscriptions_flexible', { 
                p_search_term: searchTerm 
              });
              
              if (error) {
                console.error('❌ RPC search failed, falling back to simple search:', error);
                query = query.or(`signum.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%,landscape.ilike.%${safeSearch}%,municipality.ilike.%${safeSearch}%,parish.ilike.%${safeSearch}%,transliteration.ilike.%${safeSearch}%,translation_en.ilike.%${safeSearch}%,translation_sv.ilike.%${safeSearch}%`);
              } else if (rpcData && rpcData.length > 0) {
                console.log(`✅ RPC search returned ${rpcData.length} results`);
                
                // Få signum från RPC-resultaten och använd dem för att filtrera huvudfrågan
                const signumList = rpcData.map((item: any) => item.signum);
                console.log(`🔍 Filtering main query by signums:`, signumList);
                
                // Applicera signum-filter på huvudfrågan istället för att returnera direkt
                query = query.in('signum', signumList);
              } else {
                // Inga resultat från RPC, använd omöjlig condition för att returnera tom lista
                console.log(`🔍 RPC search returned no results`);
                query = query.eq('signum', 'IMPOSSIBLE_SIGNUM_THAT_WONT_EXIST');
              }
            } catch (error) {
              console.error('❌ RPC search error, using fallback:', error);
              query = query.or(`signum.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%,transliteration.ilike.%${safeSearch}%,translation_en.ilike.%${safeSearch}%,translation_sv.ilike.%${safeSearch}%`);
            }
          }
        } else {
          // Inte ett signum, använd RPC-funktionen för icke-problematiska söktermer
          try {
            const { data: rpcData, error } = await supabase.rpc('search_inscriptions_flexible', { 
              p_search_term: searchTerm 
            });
            
            if (error) {
              console.error('❌ RPC search failed, falling back to simple search:', error);
              query = query.or(`signum.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%,landscape.ilike.%${safeSearch}%,municipality.ilike.%${safeSearch}%,parish.ilike.%${safeSearch}%,transliteration.ilike.%${safeSearch}%,translation_en.ilike.%${safeSearch}%,translation_sv.ilike.%${safeSearch}%`);
            } else if (rpcData && rpcData.length > 0) {
              console.log(`✅ RPC search returned ${rpcData.length} results`);
              
              // Få signum från RPC-resultaten och använd dem för att filtrera huvudfrågan
              const signumList = rpcData.map((item: any) => item.signum);
              console.log(`🔍 Filtering main query by signums:`, signumList);
              
              // Applicera signum-filter på huvudfrågan istället för att returnera direkt
              query = query.in('signum', signumList);
            } else {
              // Inga resultat från RPC, använd omöjlig condition för att returnera tom lista
              console.log(`🔍 RPC search returned no results`);
              query = query.eq('signum', 'IMPOSSIBLE_SIGNUM_THAT_WONT_EXIST');
            }
          } catch (error) {
            console.error('❌ RPC search error, using fallback:', error);
            query = query.or(`signum.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%,transliteration.ilike.%${safeSearch}%,translation_en.ilike.%${safeSearch}%,translation_sv.ilike.%${safeSearch}%`);
          }
        }
      }
    }

    // KRITISKT: Hantera godNameSearch - applicera endast om det verkligen finns ett värde
    if (filters.godNameSearch && filters.godNameSearch.trim()) {
      const godSearchTerm = filters.godNameSearch.trim();
      const safeGodSearch = sanitizeFilterValue(godSearchTerm);
      console.log('🔍 God name search detected:', godSearchTerm);
      query = query.or(`transliteration.ilike.%${safeGodSearch}%,translation_en.ilike.%${safeGodSearch}%,translation_sv.ilike.%${safeGodSearch}%,historical_context.ilike.%${safeGodSearch}%`);
    }

    // Övriga filter
    if (filters.selectedLandscape !== 'all') {
      query = query.ilike('landscape', `%${filters.selectedLandscape}%`);
    }
    
    if (filters.selectedCountry !== 'all') {
      query = query.ilike('country', `%${filters.selectedCountry}%`);
    }

    // ✅ Användning av den förbättrade sorteringen via signum.
    // PAGINERAT: PostgREST kapar svaret vid 1000 rader (db-max-rows) oavsett .limit(),
    // så tidigare laddades bara 1000 av 3067 inskrifter. fetchAllPages loopar .range()
    // tills alla rader hämtats. .order() appliceras EN gång (stabil sidindelning).
    console.log('✅ Fetching inscriptions with improved sorting and landscape filtering (paginated)');
    let data: RunicWithCoordinatesRow[];
    try {
      const orderedQuery = query.order('signum', { ascending: true });
      data = await fetchAllPages<RunicWithCoordinatesRow>(orderedQuery as never);
    } catch (error) {
      console.error('❌ Error loading runic data:', error);
      throw error;
    }

    console.log(`📊 SUCCESS: Loaded ${data.length} inscriptions from database (paginated, page size ${PAGE_SIZE})`);
    
    // ✅ Special debug for Iceland and Denmark
    const icelandicCount = data?.filter(d => d.signum?.startsWith('IS ') || d.country?.toLowerCase()?.includes('island')).length || 0;
    const danishCount = data?.filter(d => d.signum?.startsWith('DR ') || d.country?.toLowerCase()?.includes('danmark')).length || 0;
    console.log(`🇮🇸 ICELAND: Found ${icelandicCount} Icelandic inscriptions in main data`);
    console.log(`🇩🇰 DENMARK: Found ${danishCount} Danish inscriptions in main data`);
    
    // Process data with enhanced coordinate system  
    const enhancedData = ((data || []) as RunicWithCoordinatesRow[]).map((inscription) => {
      let finalCoordinates = null;
      
      // DEBUG: Log Öland inscriptions specifically
      if (inscription.signum && inscription.signum.startsWith('Öl ')) {
        console.log(`🔍 ÖLAND DEBUG - Processing ${inscription.signum}:`, {
          original_coordinates: inscription.original_coordinates,
          additional_latitude: inscription.additional_latitude,
          additional_longitude: inscription.additional_longitude,
          coordinate_source: inscription.coordinate_source,
          confidence: inscription.confidence,
          location: inscription.location,
          parish: inscription.parish
        });
      }
      
      // PRIORITY 1: Try original_coordinates from runic_inscriptions table (main source)
      if (inscription.original_coordinates) {
        finalCoordinates = parseCoordinates(inscription.original_coordinates);
        if (finalCoordinates) {
          console.log(`🎯 Using original_coordinates for ${inscription.signum}: [${finalCoordinates.lat}, ${finalCoordinates.lng}]`);
        }
      }
      // PRIORITY 2: Try coordinates from coordinates table (where object_id matches inscription id)
      else if (inscription.coordinates_latitude && inscription.coordinates_longitude) {
        finalCoordinates = {
          lat: inscription.coordinates_latitude,
          lng: inscription.coordinates_longitude
        };
        console.log(`📍 Using coordinates table for ${inscription.signum}: [${finalCoordinates.lat}, ${finalCoordinates.lng}]`);
      }
      // PRIORITY 3: Try additional coordinates from additional_coordinates table
      else if (inscription.additional_latitude && inscription.additional_longitude) {
        finalCoordinates = {
          lat: inscription.additional_latitude,
          lng: inscription.additional_longitude
        };
        console.log(`📍 Using additional coordinates for ${inscription.signum}: [${finalCoordinates.lat}, ${finalCoordinates.lng}]`);
      }
      // PRIORITY 4: Try coordinates field as fallback (for legacy compatibility)
      else if (inscription.coordinates) {
        finalCoordinates = parseCoordinates(inscription.coordinates);
        if (finalCoordinates) {
          console.log(`📍 Using coordinates field for ${inscription.signum}: [${finalCoordinates.lat}, ${finalCoordinates.lng}]`);
        }
      }
      // Fallback: Try enhanced mapping
      else {
        const enhanced = getEnhancedCoordinates(inscription as unknown as RunicInscription, false);
        if (enhanced) {
          finalCoordinates = { lat: enhanced.lat, lng: enhanced.lng };
          console.log(`🔧 Using enhanced mapping for ${inscription.signum}: [${finalCoordinates.lat}, ${finalCoordinates.lng}]`);
        }
      }
      
      // DEBUG: Log final result for Öland inscriptions
      if (inscription.signum && inscription.signum.startsWith('Öl ')) {
        console.log(`🎯 ÖLAND FINAL RESULT - ${inscription.signum}: coordinates =`, finalCoordinates);
      }
      
      // Föredra huvudtabellens auktoritativa coord_confidence/coord_source (rundata
      // = 'high') framför gamla additional_coordinates-fälten. Används av kartan för
      // att tona osäkra markörer (verifierat vs approximativt).
      const confidence = inscription.coord_confidence || inscription.confidence || 'unknown';
      const source = inscription.coord_source || inscription.coordinate_source || 'original';
      return {
        ...inscription,
        coordinates: finalCoordinates,
        coordinate_source: source,
        coordinate_confidence: confidence,
        coord_confidence: confidence,
        coord_source: source
      };
    });

    // Add standalone coordinates as virtual inscriptions.
    // DEDUP: additional_coordinates innehåller ~1393 rader vars signum REDAN finns i
    // huvudtabellen (skulle ge dubbla markörer på kartan + felräkning i legenden).
    // Lägg bara till de som saknas i huvuddatan (normaliserat signum) och har koordinat.
    const normSignum = (s?: string | null) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
    const mainSigna = new Set(enhancedData.map((i) => normSignum(i.signum)));
    const newStandalone = standaloneCoords.filter((coord) => {
      const n = normSignum(coord.signum);
      const hasCoord = coord.latitude != null && coord.longitude != null;
      return n !== '' && hasCoord && !mainSigna.has(n);
    });
    console.log(`🌍 Standalone coords: ${standaloneCoords.length} total, ${standaloneCoords.length - newStandalone.length} redan i huvuddatan (dedup), ${newStandalone.length} nya virtuella`);

    if (newStandalone.length > 0) {
      const virtualInscriptions = newStandalone.map((coord) => {
        // Guard against null signum/notes on standalone coordinate rows
        const signum = coord.signum ?? '';
        const notes = coord.notes ?? '';
        // Extract basic info from the notes field
        const location = notes ? notes.split(',')[0] : signum;
        const description = notes;
        const yearMatch = notes.match(/\d{4}/);

        // Debug for Icelandic entries
        if (signum.startsWith('IS ')) {
          console.log(`🇮🇸 ICELAND VIRTUAL: Creating virtual inscription for ${signum} at [${coord.latitude}, ${coord.longitude}]`);
        }

        // Land/region från signum-prefix (samma logik som huvudinskrifterna),
        // så Sö/U/Öl m.fl. klassas som svenska istället för 'Unknown' (→ tidigare
        // felräknade som utländska i legenden). IS = Island (saknas i prefix-mappen).
        const isIceland = signum.startsWith('IS ');
        const country = isIceland ? 'Island' : getCountryFromSignum(signum);
        const region = isIceland ? 'Island' : getRegionFromSignum(signum);

        return {
          id: `virtual-${coord.id}`,
          signum: coord.signum,
          location: location,
          country,
          coordinates: {
            lat: coord.latitude,
            lng: coord.longitude
          },
          translation_en: description.includes('gravsten') ? 'Gravestone inscription' :
                         description.includes('kyrkdörr') ? 'Church door inscription' :
                         'Runic inscription',
          object_type: description.includes('runsten') ? 'runsten' :
                      description.includes('kyrkdörr') ? 'kyrkdörr' :
                      description.includes('sländtrissa') ? 'sländtrissa' : 'okänd',
          dating_text: yearMatch ? `${yearMatch[0]}-talet` : (notes ? 'medeltid' : 'okänd'),
          period_start: 1200,
          period_end: 1500,
          coordinate_source: coord.source,
          coordinate_confidence: coord.confidence,
          coord_confidence: coord.confidence || 'low', // socken-centroid → approximativ
          coord_source: coord.source,
          province: region,
          landscape: region,
          virtual_inscription: true
        };
      });
      
      enhancedData.push(...virtualInscriptions);
      console.log(`✅ Total inscriptions after adding virtual ones: ${enhancedData.length}`);
    }

    console.log(`✅ Enhanced ${enhancedData.length} inscriptions with coordinates (including ${newStandalone.length} virtual standalone)`);
    return enhancedData;

  } catch (error) {
    console.error('❌ Error in loadEnhancedRunicDataWithBetterCoordinates:', error);
    throw error;
  }
};
