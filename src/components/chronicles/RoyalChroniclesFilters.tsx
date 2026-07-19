
import React from 'react';
import { Crown, Users, PersonStanding } from 'lucide-react';
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
  selectedRegion,
  selectedRulerType,
  selectedGender,
  onRegionChange,
  onRulerTypeChange,
  onGenderChange,
}) => {
  const { language } = useLanguage();

  const regionOptions = [
    { value: 'Sweden', label: 'Sverige' },
    { value: 'Denmark', label: 'Danmark' },
    { value: 'Norway', label: 'Norge' },
    { value: 'Kievrus', label: 'Kievrus' },
  ];

  const rulerTypeOptions = [
    { value: 'kings', label: language === 'en' ? 'Kings only' : 'Endast Kungar' },
    { value: 'jarls', label: language === 'en' ? 'Jarls only' : 'Endast Jarlar' },
  ];

  const genderOptions = [
    { value: 'male', label: language === 'en' ? 'Male rulers' : 'Manliga härskare' },
    { value: 'female', label: language === 'en' ? 'Female rulers' : 'Kvinnliga härskare' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <SelectFilter
        label={
          <div className="flex items-center gap-1 text-sm font-medium text-white">
            <Crown className="h-4 w-4" />
            {language === 'en' ? 'Region' : 'Region'}
          </div>
        }
        value={selectedRegion}
        onValueChange={onRegionChange}
        options={regionOptions}
        placeholder={language === 'en' ? 'Select region' : 'Välj region'}
        showAllOption={{ 
          value: 'all', 
          label: language === 'en' ? 'All regions' : 'Alla regioner' 
        }}
        triggerClassName="bg-slate-800/60 border-slate-600 text-white"
        contentClassName="bg-slate-800 border-slate-600"
        itemClassName="text-white hover:bg-slate-700"
      />
      
      <SelectFilter
        label={
          <div className="flex items-center gap-1 text-sm font-medium text-white">
            <Users className="h-4 w-4" />
            {language === 'en' ? 'Ruler Type' : 'Typ av härskare'}
          </div>
        }
        value={selectedRulerType}
        onValueChange={onRulerTypeChange}
        options={rulerTypeOptions}
        placeholder={language === 'en' ? 'Select ruler type' : 'Välj typ av härskare'}
        showAllOption={{ 
          value: 'all', 
          label: language === 'en' ? 'All rulers' : 'Alla härskare' 
        }}
        triggerClassName="bg-slate-800/60 border-slate-600 text-white"
        contentClassName="bg-slate-800 border-slate-600"
        itemClassName="text-white hover:bg-slate-700"
      />

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
