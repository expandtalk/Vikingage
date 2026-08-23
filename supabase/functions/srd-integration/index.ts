import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SRDInscription {
  inscription_id: string;
  signum1: string;
  signum2: string;
  position?: {
    geometry?: {
      type: string;
      coordinates: [number, number];
    };
  };
  provenance?: {
    country?: {
      country_code: string;
      sv: string;
      en: string;
    };
  };
}

interface SRDMapPoint {
  inscription_id: string;
  signum: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  country_code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceKey
    );

    // AUKTORISERING: denna funktion skriver till kärntabellen (runic_inscriptions) via
    // service-role (bypassar RLS). Endast service-role-nyckel (ops) ELLER inloggad admin
    // får anropa — ALDRIG den publika anon-nyckeln. Samma gate som embed-search.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    let authorized = token.length > 0 && token === serviceKey;
    if (!authorized && token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles').select('role').eq('user_id', user.id);
        authorized = (roles ?? []).some((r) => r.role === 'admin');
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, signum } = await req.json();
    console.log(`🔄 SRD Integration: ${action}${signum ? ` for ${signum}` : ''}`);

    switch (action) {
      case 'validate_signum': {
        const result = await validateSingleSignum(signum);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'enrich_coordinates': {
        const result = await enrichCoordinates(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'validate_geography': {
        const result = await validateGeography(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_check': {
        const result = await performSyncCheck(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'signum_typeahead': {
        const { searchText } = await req.json();
        const result = await getSignumTypeahead(searchText);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk_import_missing': {
        const result = await bulkImportMissingInscriptions(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_signum_formats': {
        const result = await syncSignumFormats(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'enrich_metadata': {
        const result = await enrichMetadata(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('❌ SRD Integration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateSingleSignum(signum: string) {
  console.log(`🔍 Validating signum: ${signum}`);
  
  try {
    // Search for exact signum match
    const searchResponse = await fetch(
      `http://runor.test.uu.se/rest/search?edition_id=latest&search_field=SIGNUM&matching_text=${encodeURIComponent(signum)}`
    );
    
    if (!searchResponse.ok) {
      console.log(`⚠️ SRD API returned ${searchResponse.status} for ${signum}`);
      return { 
        signum, 
        found: false, 
        error: `API returned ${searchResponse.status}` 
      };
    }
    
    const results = await searchResponse.json();
    console.log(`📊 Found ${results.length} results for ${signum}`);
    
    if (results.length > 0) {
      const inscription = results[0];
      const currentPos = inscription.position?.current;
      const coordinates = currentPos?.coordinates;
      const provenance = inscription.provenance;
      
      return {
        signum,
        found: true,
        inscription_id: inscription.inscription_id,
        coordinates: coordinates ? {
          lng: coordinates[0],
          lat: coordinates[1]
        } : null,
        country_code: provenance?.country?.country_code,
        country_name: provenance?.country?.sv || provenance?.country?.en,
        full_signum: `${inscription.signum1} ${inscription.signum2}`.trim(),
        place: provenance?.place?.place,
        parish: provenance?.parish?.parish,
        province: provenance?.province?.province,
        municipality: provenance?.municipality?.municipality,
        extant: inscription.extant,
        uri: inscription.uri
      };
    }
    
    return { signum, found: false };
  } catch (error) {
    console.error(`❌ Error validating ${signum}:`, error);
    return { 
      signum, 
      found: false, 
      error: error.message 
    };
  }
}

async function enrichCoordinates(supabase: any) {
  console.log('🗺️ Starting coordinate enrichment...');
  
  try {
    // Get inscriptions without coordinates
    const { data: inscriptionsWithoutCoords, error } = await supabase
      .from('runic_inscriptions')
      .select('id, signum, coordinates')
      .is('coordinates', null)
      .limit(50); // Process in batches
    
    if (error) throw error;
    
    console.log(`📊 Found ${inscriptionsWithoutCoords.length} inscriptions without coordinates`);
    
    const enrichmentResults = [];
    let enrichedCount = 0;
    
    for (const inscription of inscriptionsWithoutCoords) {
      try {
        const validation = await validateSingleSignum(inscription.signum);
        
        if (validation.found && validation.coordinates) {
          // Update coordinates in database using the point type format
          const { error: updateError } = await supabase
            .from('runic_inscriptions')
            .update({
              coordinates: `(${validation.coordinates.lng},${validation.coordinates.lat})`
            })
            .eq('id', inscription.id);
          
          if (!updateError) {
            enrichedCount++;
            enrichmentResults.push({
              signum: inscription.signum,
              status: 'enriched',
              coordinates: validation.coordinates
            });
            console.log(`✅ Enriched coordinates for ${inscription.signum}`);
          } else {
            console.error(`❌ Failed to update ${inscription.signum}:`, updateError);
            enrichmentResults.push({
              signum: inscription.signum,
              status: 'update_failed',
              error: updateError.message
            });
          }
        } else {
          enrichmentResults.push({
            signum: inscription.signum,
            status: 'not_found_in_srd'
          });
        }
        
        // Small delay to avoid overwhelming the SRD API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing ${inscription.signum}:`, error);
        enrichmentResults.push({
          signum: inscription.signum,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return {
      processed: inscriptionsWithoutCoords.length,
      enriched: enrichedCount,
      results: enrichmentResults
    };
    
  } catch (error) {
    console.error('❌ Coordinate enrichment failed:', error);
    throw error;
  }
}

async function validateGeography(supabase: any) {
  console.log('🌍 Starting geography validation...');
  
  try {
    // Get sample of inscriptions to validate
    const { data: inscriptions, error } = await supabase
      .from('runic_inscriptions')
      .select('id, signum, country')
      .not('country', 'is', null)
      .limit(20);
    
    if (error) throw error;
    
    const validationResults = [];
    let mismatchCount = 0;
    
    for (const inscription of inscriptions) {
      try {
        const validation = await validateSingleSignum(inscription.signum);
        
        if (validation.found && validation.country_name) {
          const currentCountry = inscription.country?.toLowerCase();
          const srdCountry = validation.country_name.toLowerCase();
          
          const isMatch = currentCountry === srdCountry || 
                         (currentCountry === 'denmark' && srdCountry === 'danmark') ||
                         (currentCountry === 'sweden' && srdCountry === 'sverige') ||
                         (currentCountry === 'norway' && srdCountry === 'norge');
          
          if (!isMatch) {
            mismatchCount++;
            console.log(`🚨 Geography mismatch for ${inscription.signum}: ${currentCountry} vs ${srdCountry}`);
          }
          
          validationResults.push({
            signum: inscription.signum,
            current_country: inscription.country,
            srd_country: validation.country_name,
            srd_country_code: validation.country_code,
            match: isMatch
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error validating geography for ${inscription.signum}:`, error);
      }
    }
    
    return {
      validated: inscriptions.length,
      mismatches: mismatchCount,
      results: validationResults
    };
    
  } catch (error) {
    console.error('❌ Geography validation failed:', error);
    throw error;
  }
}

async function getSignumTypeahead(searchText: string) {
  console.log(`🔍 Typeahead search for: ${searchText}`);
  
  if (!searchText || searchText.length < 2) {
    return { results: [], error: 'Search text must be at least 2 characters' };
  }
  
  try {
    const response = await fetch(
      `http://runor.test.uu.se/rest/signa?edition_id=latest&matching_text=${encodeURIComponent(searchText)}`
    );
    
    if (!response.ok) {
      throw new Error(`SRD API returned ${response.status}`);
    }
    
    const results = await response.json();
    
    return {
      results: results.map((item: any) => ({
        signum: item.signum,
        inscription_ids: item.inscriptions
      })),
      count: results.length
    };
  } catch (error) {
    console.error('❌ Typeahead search failed:', error);
    return { results: [], error: error.message };
  }
}

async function enrichMetadata(supabase: any) {
  console.log('📚 Starting metadata enrichment...');
  
  try {
    let totalProcessed = 0;
    let totalEnriched = 0;
    let allResults: any[] = [];
    let batchNumber = 1;
    
    // Continue processing until no more records need enrichment
    while (true) {
      console.log(`📊 Starting batch ${batchNumber}...`);
      
      // Get inscriptions with minimal metadata
      const { data: inscriptions, error } = await supabase
        .from('runic_inscriptions')
        .select('id, signum, province, municipality, parish')
        .or('province.is.null,municipality.is.null,parish.is.null')
        .limit(100); // Increased batch size
      
      if (error) throw error;
      
      // If no more inscriptions to process, break the loop
      if (inscriptions.length === 0) {
        console.log('✅ No more inscriptions need metadata enrichment');
        break;
      }
      
      console.log(`📊 Batch ${batchNumber}: Found ${inscriptions.length} inscriptions needing metadata enrichment`);
      
      let batchEnriched = 0;
      
      for (const inscription of inscriptions) {
        try {
          const validation = await validateSingleSignum(inscription.signum);
          
          if (validation.found) {
            const updates: any = {};
            let hasUpdates = false;
            
            // Update missing fields
            if (!inscription.province && validation.province) {
              updates.province = validation.province;
              hasUpdates = true;
            }
            if (!inscription.municipality && validation.municipality) {
              updates.municipality = validation.municipality;
              hasUpdates = true;
            }
            if (!inscription.parish && validation.parish) {
              updates.parish = validation.parish;
              hasUpdates = true;
            }
            
            if (hasUpdates) {
              const { error: updateError } = await supabase
                .from('runic_inscriptions')
                .update(updates)
                .eq('id', inscription.id);
              
              if (!updateError) {
                batchEnriched++;
                allResults.push({
                  signum: inscription.signum,
                  status: 'enriched',
                  updates: Object.keys(updates),
                  batch: batchNumber
                });
                console.log(`✅ Batch ${batchNumber}: Enriched metadata for ${inscription.signum}: ${Object.keys(updates).join(', ')}`);
              } else {
                allResults.push({
                  signum: inscription.signum,
                  status: 'update_failed',
                  error: updateError.message,
                  batch: batchNumber
                });
              }
            } else {
              allResults.push({
                signum: inscription.signum,
                status: 'no_new_data',
                batch: batchNumber
              });
            }
          } else {
            allResults.push({
              signum: inscription.signum,
              status: 'not_found_in_srd',
              batch: batchNumber
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 150)); // Optimized delay
          
        } catch (error) {
          console.error(`❌ Error processing metadata for ${inscription.signum}:`, error);
          allResults.push({
            signum: inscription.signum,
            status: 'error',
            error: error.message,
            batch: batchNumber
          });
        }
      }
      
      totalProcessed += inscriptions.length;
      totalEnriched += batchEnriched;
      
      console.log(`✅ Batch ${batchNumber} completed: ${batchEnriched}/${inscriptions.length} enriched`);
      
      // If we processed less than the limit, we're likely done
      if (inscriptions.length < 100) {
        console.log('✅ Final batch completed - all metadata enrichment finished');
        break;
      }
      
      batchNumber++;
      
      // Safety limit to prevent infinite loops
      if (batchNumber > 50) {
        console.log('⚠️ Reached maximum batch limit (50) - stopping to prevent infinite loop');
        break;
      }
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
      processed: totalProcessed,
      enriched: totalEnriched,
      batches: batchNumber - 1,
      results: allResults.slice(-20) // Return last 20 results for display
    };
    
  } catch (error) {
    console.error('❌ Metadata enrichment failed:', error);
    throw error;
  }
}

async function performSyncCheck(supabase: any) {
  console.log('🔄 Performing sync check with SRD...');
  
  try {
    // Get total count from our database
    const { count: localCount, error: countError } = await supabase
      .from('runic_inscriptions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Get sample from SRD to estimate their total
    // Note: SRD API doesn't seem to have a direct count endpoint, so we estimate
    const sampleResponse = await fetch(
      'http://runor.test.uu.se/rest/map?edition_id=latest&bbox=10,55,25,70'
    );
    
    if (!sampleResponse.ok) {
      throw new Error(`SRD API returned ${sampleResponse.status}`);
    }
    
    const sampleData = await sampleResponse.json();
    console.log(`📊 SRD sample contains ${sampleData.length} inscriptions`);
    
    // Check specific problematic cases
    const bh42Validation = await validateSingleSignum('BH 42');
    
    return {
      local_count: localCount,
      srd_sample_size: sampleData.length,
      sync_status: localCount > 2000 ? 'good' : 'needs_review',
      bh42_validation: bh42Validation,
      recommendations: [
        localCount < 2000 ? 'Consider enriching with more SRD data' : null,
        !bh42Validation.found ? 'BH 42 not found in SRD - verify signum format' : null,
        bh42Validation.found && bh42Validation.country_code !== 'DK' ? 'BH 42 geography mismatch detected' : null
      ].filter(Boolean)
    };
    
  } catch (error) {
    console.error('❌ Sync check failed:', error);
    throw error;
  }
}

async function syncSignumFormats(supabase: any) {
  console.log('🔄 Starting signum format synchronization...');
  
  try {
    // Get all inscriptions from local database
    const { data: localInscriptions, error } = await supabase
      .from('runic_inscriptions')
      .select('id, signum, location, country')
      .limit(100); // Process in batches
    
    if (error) throw error;
    
    console.log(`📊 Processing ${localInscriptions.length} local inscriptions`);
    
    const mappingResults = [];
    let updatedCount = 0;
    let mappedCount = 0;
    
    for (const inscription of localInscriptions) {
      try {
        // Try to find matching inscription in SRD by various methods
        let srdMatch = null;
        
        // First, try exact signum match
        srdMatch = await validateSingleSignum(inscription.signum);
        
        if (!srdMatch.found) {
          // Try alternative signum formats
          const alternativeFormats = [];
          
          // For KJ series, try N format (Norwegian newer stones)
          if (inscription.signum.startsWith('KJ ')) {
            alternativeFormats.push(inscription.signum.replace('KJ ', 'N '));
          }
          
          // For Bergen series, try other formats
          if (inscription.signum.startsWith('Bergen ')) {
            const number = inscription.signum.replace('Bergen ', '');
            alternativeFormats.push(`N ${number}`);
            alternativeFormats.push(`Nr ${number}`);
            alternativeFormats.push(`B ${number}`);
          }
          
          // For B series, try N format
          if (inscription.signum.match(/^B \d+/)) {
            const number = inscription.signum.replace('B ', '');
            alternativeFormats.push(`N ${number}`);
            alternativeFormats.push(`Nr ${number}`);
          }
          
          // Try each alternative format
          for (const altFormat of alternativeFormats) {
            srdMatch = await validateSingleSignum(altFormat);
            if (srdMatch.found) {
              console.log(`📝 Found mapping: ${inscription.signum} → ${altFormat}`);
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        if (!srdMatch.found) {
          // Try location-based matching for Swedish stones
          if (inscription.location && inscription.country === 'Sweden') {
            const locationTerms = inscription.location.split(/[,\s]+/).filter(term => term.length > 3);
            for (const term of locationTerms.slice(0, 2)) { // Try first 2 significant terms
              try {
                const searchResponse = await fetch(
                  `http://runor.test.uu.se/rest/search?edition_id=latest&search_field=PLACE&matching_text=${encodeURIComponent(term)}`
                );
                if (searchResponse.ok) {
                  const results = await searchResponse.json();
                  if (results.length > 0) {
                    const match = results[0];
                    srdMatch = {
                      found: true,
                      signum: `${match.signum1} ${match.signum2}`.trim(),
                      inscription_id: match.inscription_id
                    };
                    console.log(`🎯 Found by location: ${inscription.signum} → ${srdMatch.signum} (via ${term})`);
                    break;
                  }
                }
              } catch (searchError) {
                console.log(`⚠️ Location search failed for ${term}:`, searchError.message);
              }
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
        
        if (srdMatch.found && srdMatch.signum !== inscription.signum) {
          // Update the signum in local database
          const { error: updateError } = await supabase
            .from('runic_inscriptions')
            .update({
              signum: srdMatch.signum,
              // Add SRD reference if available
              ...(srdMatch.inscription_id && { k_samsok_uri: `http://kulturarvsdata.se/uu/srdb/${srdMatch.inscription_id}` })
            })
            .eq('id', inscription.id);
          
          if (!updateError) {
            updatedCount++;
            mappingResults.push({
              old_signum: inscription.signum,
              new_signum: srdMatch.signum,
              status: 'updated',
              method: 'srd_mapping'
            });
            console.log(`✅ Updated signum: ${inscription.signum} → ${srdMatch.signum}`);
          } else {
            mappingResults.push({
              old_signum: inscription.signum,
              new_signum: srdMatch.signum,
              status: 'update_failed',
              error: updateError.message
            });
          }
        } else if (srdMatch.found) {
          mappedCount++;
          mappingResults.push({
            old_signum: inscription.signum,
            new_signum: srdMatch.signum,
            status: 'already_correct',
            method: 'exact_match'
          });
        } else {
          mappingResults.push({
            old_signum: inscription.signum,
            status: 'no_match_found'
          });
        }
        
        // Rate limiting to avoid overwhelming SRD API
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.error(`❌ Error processing ${inscription.signum}:`, error);
        mappingResults.push({
          old_signum: inscription.signum,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return {
      processed: localInscriptions.length,
      updated: updatedCount,
      already_mapped: mappedCount,
      not_found: mappingResults.filter(r => r.status === 'no_match_found').length,
      results: mappingResults.slice(0, 20) // Return sample results
    };
    
  } catch (error) {
    console.error('❌ Signum format sync failed:', error);
    throw error;
  }
}

async function bulkImportMissingInscriptions(supabase: any) {
  console.log('📥 Starting comprehensive bulk import from SRD...');
  
  try {
    // Get all existing signums from local database to avoid duplicates
    const { data: existingInscriptions, error: existingError } = await supabase
      .from('runic_inscriptions')
      .select('signum');
    
    if (existingError) throw existingError;
    
    const existingSignums = new Set(existingInscriptions.map((i: any) => i.signum));
    console.log(`📊 Found ${existingSignums.size} existing inscriptions in local database`);
    
    // Use comprehensive search strategy combining signum prefixes and geographic terms
    // Get all inscriptions by searching for common signum prefixes
    const signumPrefixes = [
      'U', 'Sö', 'Vg', 'Ög', 'Sm', 'Öl', 'G', 'DR', 'N', 'M', 'Vs', 'Hs', 'Vr', 'Bo', 'Nä',
      'FI', 'IS', 'GR', 'RU', 'A', 'B', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'L', 'P', 'R', 'S', 'T', 'V', 'W', 'Y',
      // Additional signum series for better coverage
      'BN', 'ATA', 'Fv', 'KALM', 'KJ', 'Bergen', 'Br', 'Jr', 'Lye', 'Mp', 'Np', 'Sp', 'Or',
      // Complex format variations for Småland and Gotland
      'Sm ATA', 'Sm KALM', 'Sm Fv', 'G ', 'Öl ATA', 'Öl Fv', 'Öl KALM',
      'U ATA', 'U Fv', 'U KALM', 'Sö ATA', 'Sö Fv', 'Sö KALM',
      'Vg ATA', 'Vg Fv', 'Vg KALM', 'Ög ATA', 'Ög Fv', 'Ög KALM'
    ];
    
    // Geographic terms to ensure comprehensive coverage
    const geographicTerms = [
      'Öland', 'Blekinge', 'Skåne', 'Göteborg', 'Dalarna', 'Gotland', 'Uppland', 'Södermanland',
      'Västergötland', 'Östergötland', 'Småland', 'Halland', 'Bohuslän', 'Dalsland', 'Värmland',
      'Närke', 'Västmanland', 'Gästrikland', 'Hälsingland', 'Medelpad', 'Ångermanland', 'Jämtland',
      'Härjedalen', 'Lappland', 'Finland', 'Norge', 'Danmark', 'Island', 'Grönland', 'Ryssland',
      'Bornholm', 'Färöarna', 'England', 'Irland', 'Skottland'
    ];
    
    // Additional län (counties/provinces) and kommuner (municipalities)
    const additionalGeographicTerms = [
      // Län
      'Blekinge', 'Dalarna', 'Gävleborg', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg',
      'Norrbotten', 'Skåne', 'Stockholm', 'Södermanland', 'Uppsala', 'Värmland', 'Västerbotten',
      'Västernorrland', 'Västmanland', 'Västra Götaland', 'Örebro', 'Östergötland',
      
      // Norwegian fylker
      'Agdenes', 'Alstahaug', 'Andebu', 'Askim', 'Audnedal', 'Aurskog-Høland', 'Balestrand',
      'Bergen', 'Bindal', 'Bjugn', 'Bygland', 'Bykle', 'Dovre', 'Eid', 'Eidfjord', 'Eidsberg',
      'Eigersund', 'Etne', 'Evje og Hornnes', 'Farsund', 'Finnøy', 'Flekkefjord', 'Flora',
      'Flå', 'Froland', 'Frosta', 'Fyresdal', 'Førde', 'Gaular', 'Gausdal', 'Giske', 'Gloppen',
      'Gol', 'Gran', 'Granvin', 'Grimstad', 'Hamar', 'Hamarøy', 'Harstad', 'Hemne', 'Hitra',
      'Hjartdal', 'Hjelmeland', 'Hole', 'Holtålen', 'Horten', 'Hurum', 'Hvaler', 'Hå',
      'Inderøy', 'Jondal', 'Karmøy', 'Klepp', 'Klæbu', 'Kristiansand', 'Kvam', 'Larvik',
      'Leikanger', 'Lenvik', 'Lesja', 'Lier', 'Lillehammer', 'Lindås', 'Lom', 'Lund',
      'Luster', 'Lyngdal', 'Lærdal', 'Mandal', 'Meland', 'Meldal', 'Melhus', 'Molde',
      'Namdalseid', 'Nannestad', 'Nes', 'Nesset', 'Nittedal', 'Nome', 'Nord-Aurdal',
      'Nord-Fron', 'Nore og Uvdal', 'Notodden', 'Odda', 'Orkdal', 'Os', 'Osterøy',
      'Overhalla', 'Porsgrunn', 'Radøy', 'Rakkestad', 'Randaberg', 'Rauma', 'Rendalen',
      'Rennebu', 'Rennesøy', 'Ringebu', 'Ringerike', 'Ringsaker', 'Rissa', 'Rollag',
      'Sande', 'Sandefjord', 'Sandnes', 'Sarpsborg', 'Sauherad', 'Selbu', 'Selje',
      'Seljord', 'Sigdal', 'Sirdal', 'Skaun', 'Skien', 'Sokndal', 'Sola', 'Stavanger',
      'Steigen', 'Steinkjer', 'Stjørdal', 'Stord', 'Strand', 'Stryn', 'Sunndal',
      'Tinn', 'Tjøme', 'Tokke', 'Tydal', 'Tynset', 'Tysnes', 'Tønsberg', 'Ullensaker',
      'Ullensvang', 'Valle', 'Vang', 'Vega', 'Vegårshei', 'Vestre Slidre', 'Vevelstad',
      'Vik', 'Vindafjord', 'Vinje', 'Voss', 'Vågan', 'Vågå', 'Våler', 'Åfjord', 'Ål',
      'Ålesund', 'Åmli', 'Årdal', 'Øystre Slidre', 'Ørsta', 'Østre Toten', 'Øvre Eiker',
      
      // Danish kommuner
      'Aabenraa', 'Aalborg', 'Aarhus', 'Allerød', 'Assens', 'Ballerup', 'Billund',
      'Bornholm', 'Brønderslev', 'Egedal', 'Esbjerg', 'Faaborg-Midtfyn', 'Favrskov',
      'Faxe', 'Fredericia', 'Frederiksberg', 'Frederikssund', 'Fredrikstad', 'Furesø',
      'Glostrup', 'Greve', 'Gribskov', 'Guldborgsund', 'Gørlev', 'Haderslev',
      'Halsnæs', 'Herlev', 'Hillerød', 'Hjørring', 'Holbæk', 'Holstebro', 'Horsens',
      'Høje-Taastrup', 'Ikast-Brande', 'Jammerbugt', 'Kalundborg', 'Kerteminde',
      'Kolding', 'København', 'Køge', 'Langeland', 'Lejre', 'Lolland', 'Lyngby-Tårbæk',
      'Mariagerfjord', 'Morsø', 'Næstved', 'Norddjurs', 'Nordfyn', 'Nyborg', 'Odder',
      'Odense', 'Odsherred', 'Randers', 'Rebild', 'Ringkøbing-Skjern', 'Ringsted',
      'Roskilde', 'Silkeborg', 'Skanderborg', 'Skive', 'Slagelse', 'Solrød', 'Sorø',
      'Stevn', 'Struer', 'Svendborg', 'Syddjurs', 'Sønderborg', 'Thisted', 'Tønder',
      'Vejen', 'Vejle', 'Vesthimmerland', 'Viborg', 'Vordingborg',
      
      // Swedish kommuner (major ones)
      'Ale', 'Alingsås', 'Alvesta', 'Aneby', 'Arboga', 'Arjeplog', 'Arvidsjaur', 'Arvika',
      'Askersund', 'Avesta', 'Bengtsfors', 'Berg', 'Bjurholm', 'Bjuv', 'Boden',
      'Bollebygd', 'Bollnäs', 'Borgholm', 'Borlänge', 'Borås', 'Botkyrka', 'Boxholm',
      'Bromölla', 'Bräcke', 'Burlöv', 'Båstad', 'Dals-Ed', 'Danderyd', 'Degerfors',
      'Dorotea', 'Eda', 'Ekerö', 'Eksjö', 'Emmaboda', 'Enköping', 'Eskilstuna',
      'Eslöv', 'Essunga', 'Fagersta', 'Falkenberg', 'Falköping', 'Falu', 'Filipstad',
      'Finspång', 'Flen', 'Forshaga', 'Färgelanda', 'Gagnef', 'Gislaved', 'Gnesta',
      'Gnosjö', 'Gotland', 'Grums', 'Grästorp', 'Gullspång', 'Gällivare', 'Gävle',
      'Göteborg', 'Götene', 'Habo', 'Hagfors', 'Hallsberg', 'Hallstahammar',
      'Halmstad', 'Hamarö', 'Haninge', 'Haparanda', 'Hedemora', 'Helsingborg',
      'Herrljunga', 'Hjo', 'Hofors', 'Huddinge', 'Hudiksvall', 'Hultsfred',
      'Hylte', 'Håbo', 'Hällefors', 'Härjedalen', 'Härnösand', 'Härryda',
      'Hässleholm', 'Höganäs', 'Högsby', 'Hörby', 'Höör', 'Jokkmokk', 'Järfälla',
      'Jönköping', 'Kalix', 'Kalmar', 'Karlsborg', 'Karlshamn', 'Karlskoga',
      'Karlskrona', 'Karlstad', 'Katrineholm', 'Kil', 'Kinda', 'Kiruna', 'Klippan',
      'Knivsta', 'Kramfors', 'Kristianstad', 'Kristinehamn', 'Krokom', 'Kumla',
      'Kungsbacka', 'Kungsör', 'Kungälv', 'Kävlinge', 'Köping', 'Laholm',
      'Landskrona', 'Laxå', 'Lekeberg', 'Leksand', 'Lerum', 'Lessebo', 'Lidingö',
      'Lidköping', 'Lilla Edet', 'Lindesberg', 'Linköping', 'Ljungby', 'Ljusdal',
      'Ljusnarsberg', 'Lomma', 'Ludvika', 'Luleå', 'Lund', 'Lycksele', 'Lysekil',
      'Malmö', 'Malung-Sälen', 'Malå', 'Mariestad', 'Mark', 'Markaryd', 'Mellerud',
      'Mjölby', 'Mora', 'Motala', 'Mullsjö', 'Munkedal', 'Munkfors', 'Mölndal',
      'Mönsterås', 'Mörbylånga', 'Nacka', 'Nora', 'Norberg', 'Nordanstig',
      'Nordmaling', 'Norrköping', 'Norrtälje', 'Norsjö', 'Nybro', 'Nykvarn',
      'Nyköping', 'Nynäshamn', 'Nässjö', 'Ockelbo', 'Olofström', 'Orust', 'Osby',
      'Oskarshamn', 'Ovanåker', 'Oxelösund', 'Pajala', 'Partille', 'Perstorp',
      'Piteå', 'Ragunda', 'Robertsfors', 'Ronneby', 'Rättvik', 'Sala', 'Salem',
      'Sandviken', 'Sigtuna', 'Simrishamn', 'Sjöbo', 'Skara', 'Skellefteå',
      'Skinnskatteberg', 'Skurup', 'Skövde', 'Smedjebacken', 'Sollefteå',
      'Sollentuna', 'Solna', 'Sorsele', 'Sotenäs', 'Staffanstorp', 'Stenungsund',
      'Storfors', 'Storuman', 'Strängnäs', 'Strömstad', 'Strömsund',
      'Sundbyberg', 'Sundsvall', 'Sunne', 'Surahammar', 'Svalöv', 'Svedala',
      'Svenljunga', 'Säffle', 'Säter', 'Sävsjö', 'Söderhamn', 'Söderköping',
      'Södertälje', 'Sölvesborg', 'Tanum', 'Tibro', 'Tidaholm', 'Tierp', 'Timrå',
      'Tingsryd', 'Tjörn', 'Tomelilla', 'Torsby', 'Torsås', 'Tranemo', 'Tranås',
      'Trelleborg', 'Trollhättan', 'Trosa', 'Tyresö', 'Täby', 'Töreboda',
      'Uddevalla', 'Ulricehamn', 'Umeå', 'Upplands-Bro', 'Upplands-Väsby',
      'Uppsala', 'Uppvidinge', 'Vadstena', 'Vaggeryd', 'Valdemarsvik', 'Vallentuna',
      'Vansbro', 'Vara', 'Varberg', 'Vaxholm', 'Vellinge', 'Vetlanda', 'Vilhelmina',
      'Vimmerby', 'Vindeln', 'Vingåker', 'Vänersborg', 'Vännäs', 'Värmdö',
      'Värnamo', 'Västervik', 'Västerås', 'Växjö', 'Ydre', 'Ystad', 'Åmål',
      'Ånge', 'Åre', 'Årjäng', 'Åsele', 'Åstorp', 'Åtvidaberg', 'Älmhult',
      'Älvdalen', 'Älvkarleby', 'Ängelholm', 'Öckerö', 'Ödeshög', 'Örebro',
      'Örkelljunga', 'Örnsköldsvik', 'Östersund', 'Österåker', 'Östhammar',
      'Östra Göinge', 'Överkalix', 'Övertorneå',
      
      // Finnish places
      'Hirvensalmi', 'Kimitoön', 'Åbo',
      
      // Faroese places
      'Eiðis', 'Eystur', 'Skúvoyar', 'Tórshavnar', 'Tvøroyrar', 'Vága',
      
      // Greenlandic places
      'Kujalleq', 'Qaasuitsup', 'Qeqqata', 'Sermersooq',
      
      // German places
      'Busdorf', 'Eckernförde', 'Geltorf', 'Hürup', 'Lübeck', 'Norderbrarup',
      'Oldenburg', 'Ralswiek', 'Schleswig', 'Selk', 'Süderbrarup', 'Tönning'
    ];
    
    // Key parishes from regions missing runestones
    const parishTerms = [
      // Öland parishes
      'Algutsrums', 'Bredsätra', 'Gräsgårds', 'Gårdby', 'Gärdslösa', 'Möckleby', 'Runstens', 'Slättbo', 'Åkerbo',
      'Alböke', 'Böda', 'Högby', 'Kastlösa', 'Källa', 'Köpings', 'Långlöts', 'Löts', 'Norra Möckleby', 'Räpplinge',
      'Sandby', 'Segerstads', 'Smedby', 'Södra Möckleby', 'Stenåsa', 'Resmo',
      // Blekinge parishes  
      'Augerums', 'Bräkne', 'Listers', 'Medelstads', 'Östra', 'Gammalstorps', 'Listerby', 'Mjällby', 'Sturkö',
      // Skåne parishes
      'Allerums', 'Baldringe', 'Bjäresjö', 'Fosie', 'Glemminge', 'Torna', 'Oxie', 'Onsjö', 'Annelövs', 
      'Brösarps', 'Dalby', 'Fjelie', 'Flädie', 'Fuglie', 'Hyby', 'Håstads', 'Hällestads', 'Hörups',
      'Ingelstads', 'Järestads', 'Lilla Harrie', 'Lilla Isie', 'Lockarps', 'Lyngsjö', 'Rönnebergs',
      'Skabersjö', 'Skårby', 'Simris', 'Skivarps', 'Slimminge', 'Solberga', 'Stora Harrie', 'Stora Herrestads',
      'Stora Köpinge', 'Stävie', 'Svedala', 'Svenstorps', 'Södervidinge', 'Sövestads', 'Västra Göinge',
      // Gotland parishes
      'Akebäcks', 'Alskogs', 'Ardre', 'Atlingbo', 'Boge', 'Bro', 'Bunge', 'Burs', 'Buttle',
      'Dalhem', 'Endre', 'Eskelhems', 'Etelhems', 'Fardhems', 'Fide', 'Fleringe', 'Fole',
      'Follingbo', 'Fröjels', 'Gammelgarns', 'Ganthems', 'Gerums', 'Gothems', 'Grötlingbo',
      'Guldrupe', 'Hablingbo', 'Hemse', 'Kräklinge', 'Lina', 'Lummelunda', 'Stenkumla',
      'Ala', 'Barlingbo', 'Björke', 'Ekeby', 'Eke', 'Eksta', 'Fårö', 'Hörsne', 'Källunge',
      'Klinte', 'Lau', 'Levide', 'Linde', 'Lojsta', 'Lokrume', 'Lye', 'Lärbro', 'Martebo',
      'Mästerby', 'Närs', 'Näs', 'Norrlanda', 'Othems', 'Roma', 'Rone', 'Rute', 'Sanda',
      'Silte', 'Sjonhems', 'Sproge', 'Stenkyrka', 'Sundre', 'Stånga',
      // Swedish parishes from missing regions
      'Husaby', 'Jelling', 'Julita', 'Jumkils', 'Järfälla', 'Järpås', 'Kjula', 'Knutby',
      'Kumla', 'Källa', 'Källby', 'Källstorps', 'Källunge', 'Kävlinge', 'Lackalänga',
      'Lagga', 'Leksands', 'Lena', 'Lillkyrka', 'Linköping', 'Litslena', 'Ljungby',
      'Lunda', 'Lundby', 'Långtora', 'Läby', 'Löts', 'Malsta', 'Mora', 'Norrtälje',
      'Nysätra', 'Närtuna', 'Odensala', 'Orlunda', 'Rasbokils', 'Rasbo', 'Riala',
      'Rimbo', 'Simtuna', 'Skuttunge', 'Sollentuna', 'Sorunda', 'Sparrsätra', 'Stavby',
      'Svinnegarns', 'Sånga', 'Uppsala', 'Vallentuna', 'Västerås', 'Örebro',
      // Finnish parishes/localities
      'Harjula', 'Egentliga Finland', 'Åboland',
      // Norwegian parishes
      'Bergen', 'Avaldsnes', 'Borgund', 'Balestrand', 'Etne', 'Beitstad', 'Bore', 'Bygland',
      'Eidfjord', 'Egersund', 'Finnøy', 'Frosta', 'Gausdal', 'Granvin', 'Grimstad', 'Kaupanger',
      'Kinn', 'Kinsarvik', 'Kvam', 'Leikanger', 'Mandal', 'Manger', 'Meldal', 'Melhus',
      'Molde', 'Moster', 'Oslo', 'Randaberg', 'Rennesøy', 'Ringsaker', 'Stavanger', 'Stedje',
      'Stord', 'Strand', 'Sunndal', 'Sola', 'Søgne',
      // Danish parishes
      'Bodilsker', 'Bjolderup', 'Bov', 'Brøns', 'Tønder', 'Aggersborg', 'Allerslev', 'Alsted',
      'Aversi', 'Bjæverskov', 'Boeslunde', 'Dalby', 'Egtved', 'Fakse', 'Fjenneslev', 'Glim',
      'Jelling', 'Karise', 'København', 'Køge', 'Roskilde', 'Slagelse', 'Viborg',
      // Bornholm parishes
      'Bodilsker', 'Ibsker', 'Klemensker', 'Knudsker', 'Nyker', 'Ny Larsker', 'Pedersker', 
      'Poulsker', 'Povlsker', 'Rutsker', 'Rønne', 'Rø', 'Nørre', 'Sønder', 'Vester', 'Øster',
      // Additional parishes
      'Søstrup', 'Talgje', 'Tangen', 'Tanums', 'Teda', 'Tengene', 'Tensta', 'Thisted', 'Tibro',
      'Tidavads', 'Tierps', 'Tillinge', 'Tillitse', 'Time', 'Timmele', 'Timrå', 'Tingstads',
      'Tingstäde', 'Tingsås', 'Tingvoll', 'Tirsted', 'Tjæreby', 'Tjølling', 'Tjøme', 'Tofta',
      'Tolfta', 'Tolgs', 'Tonstad', 'Toresunds', 'Tornby', 'Torpa', 'Torpo', 'Torshälla',
      'Torslunda', 'Torsnes', 'Torstuna', 'Torsvi', 'Torsåkers', 'Torsö', 'Tortuna', 'Torup',
      'Tossene', 'Tranemo', 'Transtrands', 'Tranås', 'Trolle-Ljungby', 'Trollhättan', 'Trondenes',
      'Trondheim', 'Trosa', 'Trönö', 'Tuddal', 'Tullstorps', 'Tumbergs', 'Tumbo', 'Tuna', 'Tune',
      'Tuns', 'Turinge', 'Tutaryds', 'Tveid', 'Tveta', 'Tvøroyri', 'Tydal', 'Tyresö', 'Tysnes',
      'Tystberga', 'Tåby', 'Tågerup', 'Tånnö', 'Tårnborg', 'Täby', 'Tängs', 'Tönning', 'Törnevalla',
      'Tømmerup', 'Tønder', 'Tønjum', 'Tønsberg', 'Udby', 'Udenes', 'Ugglums', 'Ukna', 'Ulbølle',
      'Ullensaker', 'Ullensvang', 'Ullerup', 'Ulricehamn', 'Ununge', 'Upernavik', 'Uppsala',
      'Uppåkra', 'Uråsa', 'Utrecht', 'Útskálar', 'Utvik', 'Uvdal', 'Uvereds', 'Vada', 'Vadsbro',
      'Vadstena', 'Vagnhärads', 'Vaksala', 'Valbo', 'Valla', 'Vallby', 'Valleberga', 'Vallentuna',
      'Vallerstads', 'Valle', 'Vallkärra', 'Vallsjö', 'Valls', 'Vallstena', 'Valstads', 'Valtorps',
      'Valö', 'Vamdrup', 'Vamlingbo', 'Vang', 'Vanse', 'Vansö', 'Vapnö', 'Varnhems', 'Varnums',
      'Vartdal', 'Vartofta-Åsaka', 'Vassunda', 'Veckholms', 'Vederslövs', 'Vedslet', 'Veflinge',
      'Vega', 'Veggerby', 'Vegårshei', 'Vejby', 'Vejerslev', 'Vejlby', 'Vejleby', 'Vejle',
      'Velinga', 'Vendels', 'Vennebjerg', 'Vereid', 'Vesløs', 'Vesterborg', 'Vester Marie',
      'Vestervig', 'Veta', 'Vetlanda', 'Veum', 'Vevelstad', 'Viborg', 'Viby', 'Vickleby',
      'Vidbo', 'Vikingstads', 'Viklau', 'Vik', 'Viksta', 'Vikøy', 'Villberga', 'Villie',
      'Vilske-Kleva', 'Vimmerby', 'Winchester', 'Vindum', 'Vinje', 'Vinköls', 'Vinnerstads',
      'Vintrosa', 'Virring', 'Visby', 'Visingsö', 'Vistdal', 'Vists', 'Vittaryds', 'Vittinge',
      'Vokslev', 'Wolin', 'Vordingborg', 'Voss', 'Voxtorps', 'Vrangstrup', 'Vrejlev', 'Vrena',
      'Vreta klosters', 'Vrigstads', 'Vågå', 'Våler', 'Våmhus', 'Vårdsbergs', 'Vårfrukyrka',
      'Vårkumla', 'Väckelsångs', 'Väddö', 'Väderstads', 'Vänersnäs', 'Väne-Åsaka', 'Vänge',
      'Värmdö', 'Värnamo', 'Värsås', 'Väsby', 'Väse', 'Väskinde', 'Vä', 'Västerfärnebo',
      'Västergarns', 'Västerhaninge', 'Västerhejde', 'Västerljungs', 'Västerlösa', 'Västerlövsta',
      'Västermo', 'Västertälje', 'Västeråkers', 'Västerås', 'Västlands', 'Västra Eds',
      'Västra Eneby', 'Västra Frölunda', 'Västra Gerums', 'Västra Karaby', 'Västra Nöbbelövs',
      'Västra Ryds', 'Västra Sallerups', 'Västra Stenby', 'Västra Strö', 'Västra Tollstads',
      'Västra Vingåkers', 'Väte', 'Väversunda', 'Växjö', 'Værløse', 'Værnes', 'Ydby', 'Ytterby',
      'Ytterenhörna', 'Yttergrans', 'Ytterjärna', 'Ytterselö', 'Åbo', 'Åby', 'Ådum', 'Åfjord',
      'Åhus', 'Åkerby', 'Åker', 'Åkers', 'Ålands', 'Ålborg', 'Ålen', 'Ål', 'Ålum', 'Åmli',
      'Åmotsdal', 'Årdala', 'Årdal', 'Århus', 'Års', 'Årsunda', 'Åryds', 'Åsane', 'Åsbo',
      'Åsele', 'Å', 'Ås', 'Åstrup', 'Älgarås', 'Älghults', 'Älvdalens', 'Älvestads',
      'Älvkarleby', 'Älvsereds', 'Ärentuna', 'Ärla', 'Ödeshögs', 'Öja', 'Ölme', 'Önums',
      'Örberga', 'Örby', 'Örebro', 'Öreryds', 'Örja', 'Örsjö', 'Örtofta', 'Ösmo',
      'Össeby-Garns', 'Österbitterna', 'Österfärnebo', 'Österhaninge', 'Österlövsta',
      'Österplana', 'Östertälje', 'Österunda', 'Östervåla', 'Österåkers', 'Östra Eneby',
      'Östra Hargs', 'Östra Herrestads', 'Östra Hoby', 'Östra Husby', 'Östra Ingelstads',
      'Östra Ny', 'Östra Ryds', 'Östra Skrukeby', 'Östra Stenby', 'Östra Sönnarslövs',
      'Östra Torsås', 'Östra Vemmenhög', 'Östra Vemmerlövs', 'Östuna', 'Överenhörna',
      'Övergrans', 'Överhogdals', 'Överjärna', 'Överselö', 'Övre Ulleruds', 'Øifjelds',
      'Ølen', 'Ølgod', 'Øls', 'Ølst', 'Ørbæk', 'Ørsted', 'Ørum', 'Øster Alling',
      'Øster Bjerregrav', 'Øster Brønderslev', 'Øster Egesborg', 'Øster Larsker', 'Øster Løgum',
      'Øster Marie', 'Øster Velling', 'Øvre Rendal', 'Øye'
    ];
    
    const allSrdInscriptions = [];
    
    // First collect by signum prefixes
    for (const prefix of signumPrefixes) {
      try {
        console.log(`🔍 Searching for ${prefix} inscriptions...`);
        const searchResponse = await fetch(
          `http://runor.test.uu.se/rest/search?edition_id=latest&search_field=SIGNUM&matching_text=${encodeURIComponent(prefix)}`
        );
        
        if (searchResponse.ok) {
          const results = await searchResponse.json();
          allSrdInscriptions.push(...results);
          console.log(`📊 Found ${results.length} ${prefix} inscriptions`);
        }
        
        // Rate limiting between prefix searches
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`⚠️ Failed to search for ${prefix} inscriptions:`, error);
      }
    }
    
    // Then search by geographic terms to catch missing regional stones
    for (const geoTerm of geographicTerms) {
      try {
        console.log(`🗺️ Searching for ${geoTerm} inscriptions...`);
        const searchResponse = await fetch(
          `http://runor.test.uu.se/rest/search?edition_id=latest&search_field=PROVINCE&matching_text=${encodeURIComponent(geoTerm)}`
        );
        
        if (searchResponse.ok) {
          const results = await searchResponse.json();
          allSrdInscriptions.push(...results);
          console.log(`📊 Found ${results.length} inscriptions in ${geoTerm}`);
        }
        
        // Rate limiting between geographic searches
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.log(`⚠️ Failed to search for ${geoTerm} inscriptions:`, error);
      }
    }
    
    // Finally search by key parish names from missing regions
    for (const parishTerm of parishTerms) {
      try {
        console.log(`⛪ Searching for ${parishTerm} parish inscriptions...`);
        const searchResponse = await fetch(
          `http://runor.test.uu.se/rest/search?edition_id=latest&search_field=PARISH&matching_text=${encodeURIComponent(parishTerm)}`
        );
        
        if (searchResponse.ok) {
          const results = await searchResponse.json();
          allSrdInscriptions.push(...results);
          console.log(`📊 Found ${results.length} inscriptions in ${parishTerm} parish`);
        }
        
        // Rate limiting between parish searches
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`⚠️ Failed to search for ${parishTerm} parish inscriptions:`, error);
      }
    }
    
    // Remove duplicates by inscription_id
    const uniqueInscriptions = allSrdInscriptions.reduce((acc, inscription) => {
      const key = inscription.inscription_id;
      if (!acc.has(key)) {
        acc.set(key, inscription);
      }
      return acc;
    }, new Map());
    
    const totalSrdInscriptions = Array.from(uniqueInscriptions.values());
    console.log(`📊 Found ${totalSrdInscriptions.length} unique inscriptions from SRD`);
    
    // Process inscriptions and import missing ones
    const importResults = [];
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process in batches
    const batchSize = 15;
    const maxToProcess = Math.min(totalSrdInscriptions.length, 500); // Increased limit
    
    for (let i = 0; i < maxToProcess; i += batchSize) {
      const batch = totalSrdInscriptions.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(maxToProcess/batchSize)}`);
      
      for (const inscription of batch) {
        try {
          const fullSignum = `${inscription.signum1} ${inscription.signum2}`.trim();
          
          // Skip if already exists
          if (existingSignums.has(fullSignum)) {
            skippedCount++;
            importResults.push({
              signum: fullSignum,
              status: 'already_exists'
            });
            continue;
          }
          
          // Use the inscription data we already have from the search
          const provenance = inscription.provenance || {};
          const currentPos = inscription.position?.current;
          const coordinates = currentPos?.coordinates;
          
          // Prepare inscription data for insert
          const newInscription = {
            signum: fullSignum,
            location: provenance.place?.place || 'Okänd plats',
            parish: provenance.parish?.parish || null,
            municipality: provenance.municipality?.municipality || null,
            province: provenance.province?.province || null,
            country: mapCountryCode(provenance.country?.country_code),
            coordinates: coordinates ? `(${coordinates[0]},${coordinates[1]})` : null,
            transliteration: inscription.text?.transliteration || null,
            translation_en: inscription.text?.translation?.en || null,
            translation_sv: inscription.text?.translation?.sv || null,
            object_type: inscription.object?.type || null,
            material: inscription.object?.material || null,
            dating_text: inscription.dating?.text || null,
            k_samsok_uri: `http://kulturarvsdata.se/uu/srdb/${inscription.inscription_id}`,
            data_source: 'SRD_Import'
          };
          
          // Insert into database
          const { error: insertError } = await supabase
            .from('runic_inscriptions')
            .insert(newInscription);
          
          if (!insertError) {
            importedCount++;
            importResults.push({
              signum: fullSignum,
              status: 'imported',
              country: newInscription.country,
              location: newInscription.location
            });
            console.log(`✅ Imported ${fullSignum} from ${newInscription.location}, ${newInscription.country}`);
          } else {
            errorCount++;
            importResults.push({
              signum: fullSignum,
              status: 'import_failed',
              error: insertError.message
            });
            console.error(`❌ Failed to import ${fullSignum}:`, insertError.message);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing ${inscription.signum1} ${inscription.signum2}:`, error);
          importResults.push({
            signum: `${inscription.signum1} ${inscription.signum2}`.trim(),
            status: 'processing_error',
            error: error.message
          });
        }
      }
      
      // Pause between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      total_srd_inscriptions: totalSrdInscriptions.length,
      processed: maxToProcess,
      imported: importedCount,
      skipped: skippedCount,
      errors: errorCount,
      sample_results: importResults.slice(0, 10) // Show sample of results
    };
    
  } catch (error) {
    console.error('❌ Bulk import failed:', error);
    throw error;
  }
}

function mapCountryCode(countryCode: string): string {
  switch (countryCode?.toUpperCase()) {
    case 'NO': return 'Norway';
    case 'SE': return 'Sweden';
    case 'DK': return 'Denmark';
    case 'IS': return 'Iceland';
    case 'FO': return 'Faroe Islands';
    case 'FI': return 'Finland';
    case 'DE': return 'Germany';
    case 'GB': return 'United Kingdom';
    case 'GL':
    case 'GR': return 'Greenland';
    case 'RU': return 'Russia';
    default: return countryCode || 'Unknown';
  }
}