
import React from 'react';
import { PersonStanding } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SelectFilter } from '../filters/SelectFilter';

interface RoyalChroniclesFiltersProps {
  selectedRegion: string;
  selectedRulerType: string;
  selectedGender: string;
  onRegionChange: (value: string) => void;
  onRulerTypeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

export const RoyalChroniclesFilters: React.FC<RoyalChroniclesFiltersProps> = ({
  selectedGender,
  onGenderChange,
}) => {
  const { language } = useLanguage();

  // Region- och Ruler Type-filtren borttagna (Daniel: "det räcker med Kort och Tabell").
  // Region-state finns kvar (defaultar till hemregion) men styrs ej längre via UI här.
  // Gender behålls — analytiskt värdefullt (kvinnligt arv/Sturesläkten m.m.).
  const genderOptions = [
    { value: 'male', label: language === 'en' ? 'Male rulers' : 'Manliga härskare' },
    { value: 'female', label: language === 'en' ? 'Female rulers' : 'Kvinnliga härskare' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <SelectFilter
        label={
          <div className="flex items-center gap-1 text-sm font-medium text-white">
            <PersonStanding className="h-4 w-4" />
            {language === 'en' ? 'Gender' : 'Kön'}
          </div>
        }
        value={selectedGender}
        onValueChange={onGenderChange}
        options={genderOptions}
        placeholder={language === 'en' ? 'Select gender' : 'Välj kön'}
        showAllOption={{ 
          value: 'all', 
          label: language === 'en' ? 'All genders' : 'Alla kön' 
        }}
        triggerClassName="bg-slate-800/60 border-slate-600 text-white"
        contentClassName="bg-slate-800 border-slate-600"
        itemClassName="text-white hover:bg-slate-700"
      />
    </div>
  );
};
