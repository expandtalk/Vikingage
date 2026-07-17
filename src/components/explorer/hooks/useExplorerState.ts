
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFocusManager } from '@/hooks/useFocusManager';
import { getEnhancedCoordinates } from '@/utils/coordinateMappingEnhanced';
import { RunicInscription } from '@/types/inscription';

export const useExplorerState = () => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [mapNavigate, setMapNavigateState] = useState<((lat: number, lng: number, zoom: number) => void) | null>(null);
  // Store the nav function via an updater. Passing the function straight to a
  // useState setter makes React treat it as a functional update — it invokes
  // the function with prevState and stores the (undefined) return value, so
  // mapNavigate would always be undefined and every result click would toast
  // "kunde inte hitta platsen" even when coordinates exist.
  const setMapNavigate = useCallback(
    (fn: (lat: number, lng: number, zoom: number) => void) =>
      setMapNavigateState(() => fn),
    [],
  );
  const [godNameSearch, setGodNameSearch] = useState<string>('');
  
  // Clear any active filters on initial load to show ALL inscriptions
  useEffect(() => {
    console.log('🔄 ExplorerState: Clearing godNameSearch to show all inscriptions');
    setGodNameSearch('');
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [modalInscription, setModalInscription] = useState<RunicInscription | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentFocus } = useFocusManager();

  useEffect(() => {
    console.log('🗺️ [useExplorerState] mapNavigate state updated. Is function available?', !!mapNavigate);
  }, [mapNavigate]);

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleMarkerClick = (inscription: RunicInscription) => {
    setModalInscription(inscription);
  };

  const handleResultClick = async (inscription: RunicInscription) => {
    console.log('🖱️ [useExplorerState] handleResultClick triggered for:', inscription.signum);
    
    // Always use getEnhancedCoordinates to get the best location info
    let enhancedCoords = getEnhancedCoordinates(inscription, false);
    
    // If no coordinates found but we have location info, try to geocode it
    if (!enhancedCoords && (inscription.location || inscription.parish)) {
      console.log(`🔍 Attempting to geocode location for ${inscription.signum}`);
      
      // Build location string for geocoding
      const locationParts = [
        inscription.location,
        inscription.parish, 
        inscription.province || inscription.landscape,
        inscription.country || 'Sweden'
      ].filter(Boolean);
      
      const locationString = locationParts.join(', ');
      console.log(`📍 Geocoding: "${locationString}"`);
      
      try {
        // Simple Nominatim geocoding request
        const encodedLocation = encodeURIComponent(locationString);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1&countrycodes=se,dk,no,de,is&accept-language=sv,da,no,en`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'RunicResearchApp/1.0 (educational use)'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const result = data[0];
            enhancedCoords = {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              zoom: 14
            };
            console.log(`✅ Geocoded ${inscription.signum} to [${enhancedCoords.lat}, ${enhancedCoords.lng}]`);
          }
        }
      } catch (error) {
        console.log(`❌ Geocoding failed for ${inscription.signum}:`, error);
      }
    }
    
    if (enhancedCoords && mapNavigate) {
      console.log(`   -> Navigating to [${enhancedCoords.lat}, ${enhancedCoords.lng}] with zoom ${enhancedCoords.zoom}`);
      mapNavigate(enhancedCoords.lat, enhancedCoords.lng, enhancedCoords.zoom);
      
    } else {
      console.log('   -> NOT navigating. Missing coordinates or mapNavigate function.');
      toast({
          title: `Kunde inte hitta platsen`,
          description: `Inga koordinater kunde hittas för ${inscription.signum}.`,
          variant: "destructive"
      });
    }
    
    setExpandedCards(new Set([inscription.id]));
    setModalInscription(inscription);
  };

  const handleGodNameSearch = (godName: string) => {
    console.log('God name search triggered:', godName);
    setGodNameSearch(godName);
    setCurrentPage(1);
    
    toast({
      title: `Söker efter ${godName}`,
      description: "Letar efter platser med gudanamn...",
    });
  };

  const handleCloseModal = () => {
    setModalInscription(null);
  };

  return {
    expandedCards,
    mapNavigate,
    godNameSearch,
    currentPage,
    itemsPerPage,
    currentFocus,
    modalInscription,
    setMapNavigate,
    setGodNameSearch,
    setCurrentPage,
    toggleExpanded,
    handleMarkerClick,
    handleResultClick,
    handleGodNameSearch,
    handleCloseModal,
    toast
  };
};
