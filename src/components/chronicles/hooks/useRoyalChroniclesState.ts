
import { useState } from 'react';

type ViewMode = 'cards' | 'table';

export const useRoyalChroniclesState = () => {
  // Visa ALLA regioner som standard (Daniel 2026-07-26) — hemregion-default (detectHomeRegion)
  // dolde alla icke-svenska härskare (Danmark/Norge/Kievrus/England ≈ 114 av 213) och gav
  // intrycket att kungar försvunnit. Användaren kan fortfarande filtrera per region i UI:t.
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
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
