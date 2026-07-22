
import { useState } from 'react';
import { detectHomeRegion } from '@/utils/homeRegion';

type ViewMode = 'cards' | 'table';

export const useRoyalChroniclesState = () => {
  // Kortvy som standard (Daniel) + besökarens egen kungakrönika först: svensk visitor → Sweden,
  // dansk → Denmark, norsk → Norway, övriga → Sweden (fallback i detectHomeRegion).
  const [selectedRegion, setSelectedRegion] = useState<string>(() => detectHomeRegion());
  const [selectedRulerType, setSelectedRulerType] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedKing, setSelectedKing] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  return {
    selectedRegion,
    setSelectedRegion,
    selectedRulerType,
    setSelectedRulerType,
    selectedGender,
    setSelectedGender,
    selectedKing,
    setSelectedKing,
    viewMode,
    setViewMode,
  };
};
