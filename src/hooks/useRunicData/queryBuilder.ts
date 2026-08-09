
import { supabase } from "@/integrations/supabase/client";
import { UseRunicDataProps } from './types';

export const buildQuery = (filters: UseRunicDataProps) => {
  let query;

  // Use the improved flexible search function for better place/location search
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const searchTerm = filters.searchQuery.trim();
    console.log('🔍 Using improved flexible search function for:', searchTerm);
    
    // FIXED: Handle landscape code searches like "gotland", "G", etc.
    const landscapeMappings: Record<string, string> = {
      'gotland': 'G',
      'öland': 'Ö', 
      'uppland': 'U',
      'södermanland': 'Sö',
      'östergötland': 'Ög',
      'västergötland': 'Vg',
      'småland': 'Sm',
      'skåne': 'Sk',
      'blekinge': 'Bl',
      'halland': 'Hl',
      'bohuslän': 'Bo',
      'dalsland': 'Dl',
      'värmland': 'Vr',
      'närke': 'Nä',
      'västmanland': 'Vs',
      'dalarna': 'Dl',
      'gävleborg': 'Gs',
      'hälsingland': 'Hs'
    };
    
    // Check if it's a landscape search
    const landscapeCode = landscapeMappings[searchTerm.toLowerCase()];
    if (landscapeCode) {
      console.log(`🏞️ Landscape search detected: ${searchTerm} -> ${landscapeCode}`);
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`signum.like.${landscapeCode} %,signum.like.${landscapeCode}%,landscape.ilike.%${searchTerm}%`);
    }
    // Check if it's already a landscape code like "G", "U", etc.
    else if (searchTerm.length <= 3 && /^[A-ZÅÄÖ]+$/.test(searchTerm)) {
      console.log(`🏷️ Landscape code search detected: ${searchTerm}`);
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`signum.like.${searchTerm} %,signum.like.${searchTerm}%`);
    }
    // Check if it's a specific signum search like "G 200"
    else if (/^[A-ZÅÄÖ]+\s*\d+$/.test(searchTerm)) {
      console.log(`🔢 Specific signum search detected: ${searchTerm}`);
      const normalizedSignum = searchTerm.replace(/\s+/g, ' ').trim();
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`signum.ilike.${normalizedSignum},signum.ilike.${normalizedSignum.replace(' ', '')}%`);
    }
    // Handle problematic search terms that might cause database issues
    else if (['rök', 'rö', 'å', 'ö'].some(term => searchTerm.toLowerCase().includes(term.toLowerCase()))) {
      console.log('⚠️ Detected potentially problematic search term, using safer query');
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`signum.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,transliteration.ilike.%${searchTerm}%,municipality.ilike.%${searchTerm}%,parish.ilike.%${searchTerm}%,socken.ilike.%${searchTerm}%`);
    }
    // Check if it's a time period search
    else if (['paleolithic', 'mesolithic', 'neolithic', 'bronze', 'iron', 'roman', 'migration', 'vendel', 'viking', 'medieval', 'modern'].some(period => searchTerm.toLowerCase().includes(period))) {
      console.log('📅 Time period search detected, searching in dating table');
      query = supabase
        .from('runic_inscriptions')
        .select(`
          *,
          dating!inner(dating, period_start, period_end, parsed_period)
        `)
        .or(`dating_text.ilike.%${searchTerm}%,dating.dating.ilike.%${searchTerm}%,dating.parsed_period.ilike.%${searchTerm}%`);
    }
    // Handle Norwegian search specifically
    else if (searchTerm.toLowerCase() === 'norge' || searchTerm.toLowerCase() === 'norway') {
      console.log('🇳🇴 Norwegian search detected, including signum patterns');
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`country.ilike.%norway%,signum.like.N %,signum.like.N A%,signum.like.N B%,signum.like.N I%,signum.like.NIÆR%,(signum.like.KJ %.and.country.ilike.%norway%)`);
    } else {
      // Handle other searches - use direct table search instead of RPC for better reliability
      let translatedSearchTerm = searchTerm;
      if (searchTerm.toLowerCase() === 'danmark') {
        translatedSearchTerm = 'denmark';
      } else if (searchTerm.toLowerCase() === 'sverige') {
        translatedSearchTerm = 'sweden';
      }
      
      console.log(`🔍 General search using direct table query for: ${translatedSearchTerm}`);
      query = supabase
        .from('runic_inscriptions')
        .select('*')
        .or(`signum.ilike.%${translatedSearchTerm}%,location.ilike.%${translatedSearchTerm}%,landscape.ilike.%${translatedSearchTerm}%,municipality.ilike.%${translatedSearchTerm}%,parish.ilike.%${translatedSearchTerm}%,socken.ilike.%${translatedSearchTerm}%,transliteration.ilike.%${translatedSearchTerm}%,translation_en.ilike.%${translatedSearchTerm}%,translation_sv.ilike.%${translatedSearchTerm}%,country.ilike.%${translatedSearchTerm}%`);
    }
  } else {
    // VIKTIGT: Hämta ALLA inskrifter utan begränsning för att visa alla 2141
    console.log('📊 FIXED: Fetching ALL inscriptions without any limit to show all 2141 runestones');
    query = supabase
      .from('runic_inscriptions')
      .select('*');
  }

  // Apply additional filters on top of the base query
  if (filters.selectedLandscape !== 'all') {
    console.log('🏞️ Applying landscape filter:', filters.selectedLandscape);
    query = query.ilike('landscape', `%${filters.selectedLandscape}%`);
  }
  
  if (filters.selectedCountry !== 'all') {
    console.log('🌍 Applying country filter:', filters.selectedCountry);
    query = query.ilike('country', `%${filters.selectedCountry}%`);
  }

  // KRITISKT: Ingen begränsning alls - visa alla 2141 runstenar
  console.log('✅ NO LIMIT APPLIED - Will show all 2141 runestones');
  return query.order('created_at', { ascending: false });
};
