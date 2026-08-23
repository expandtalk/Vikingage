
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Alla focus-värden som faktiskt hanteras i exploreProfiles.applyFocusOverrides + Explore.tsx.
// Höll tidigare inte 'marine'/'oland'/'churches'/'baths' m.fl. → ExplorerLayout jämförde mot 'marine'
// som saknades i unionen (TS2367, no-overlap). Superset så jämförelserna är typade.
export type FocusType = 'inscriptions' | 'coordinates' | 'carvers' | 'rivers' | 'fortresses' | 'gods'
  | 'cultSites' | 'hundreds' | 'parishes' | 'names' | 'folkGroups' | 'geneticEvents'
  | 'marine' | 'oland' | 'eriksgatan' | 'churches' | 'monasteries' | 'baths' | null;

export const useFocusManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentFocus, setCurrentFocus] = useState<FocusType>(null);

  useEffect(() => {
    const focus = searchParams.get('focus') as FocusType;
    console.log(`🎯 Focus manager: URL focus parameter = "${focus}"`);
    
    if (focus && focus !== currentFocus) {
      setCurrentFocus(focus);
      console.log(`🎯 Focus changed to: ${focus}`);
    } else if (!focus && currentFocus) {
      setCurrentFocus(null);
      console.log(`🎯 Focus cleared`);
    }
  }, [searchParams, currentFocus]);

  const clearFocus = () => {
    setCurrentFocus(null);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('focus');
      return newParams;
    });
  };

  return {
    currentFocus,
    setCurrentFocus,
    clearFocus
  };
};
