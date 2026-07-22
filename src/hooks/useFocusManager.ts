
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type FocusType = 'inscriptions' | 'coordinates' | 'carvers' | 'rivers' | 'fortresses' | 'gods' | 'cultSites' | 'hundreds' | 'parishes' | 'names' | 'folkGroups' | 'geneticEvents' | null;

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
