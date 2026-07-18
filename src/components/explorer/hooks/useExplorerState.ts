
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

  const handleResultClick = (inscription: RunicInscription) => {
    console.log('🖱️ [useExplorerState] handleResultClick triggered for:', inscription.signum);

    // Använd ENBART den kanoniska koordinaten (nu ifylld i DB, 98% täckning).
    // Ingen klick-tids-geokodning mot Nominatim längre — den gav icke-deterministiska
    // träffar (fel socken/land) och nätverksberoende + rate-limit-risk. Saknas koord
    // helt → toast, ingen gissning.
    const enhancedCoords = getEnhancedCoordinates(inscription, false);

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
