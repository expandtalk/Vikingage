
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GeneticSearchControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedComplexity: string;
  setSelectedComplexity: (complexity: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export const GeneticSearchControls: React.FC<GeneticSearchControlsProps> = ({
  searchTerm,
  setSearchTerm,
  selectedComplexity,
  setSelectedComplexity,
  selectedPeriod,
  setSelectedPeriod
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const c = sv ? {
    searchPlaceholder: 'Sök i genetiska data (namn, beskrivning, ursprung...)',
    allPeriods: 'Alla tidsperioder',
    roman: 'Romersk järnålder',
    iron: 'Järnålder',
    migration: 'Folkvandringstid',
    vendel: 'Vendeltid',
    viking: 'Vikingatid',
    medieval: 'Medeltid',
    modern: 'Modern tid',
  } : {
    searchPlaceholder: 'Search genetic data (name, description, origin...)',
    allPeriods: 'All time periods',
    roman: 'Roman Iron Age',
    iron: 'Iron Age',
    migration: 'Migration Period',
    vendel: 'Vendel Period',
    viking: 'Viking Age',
    medieval: 'Medieval',
    modern: 'Modern era',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder={c.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-white/50 pl-10"
        />
      </div>
      <div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
        >
          <option value="all">{c.allPeriods}</option>
          <option value="roman" className="text-black">{c.roman}</option>
          <option value="iron" className="text-black">{c.iron}</option>
          <option value="migration" className="text-black">{c.migration}</option>
          <option value="vendel" className="text-black">{c.vendel}</option>
          <option value="viking" className="text-black">{c.viking}</option>
          <option value="medieval" className="text-black">{c.medieval}</option>
          <option value="modern" className="text-black">{c.modern}</option>
        </select>
      </div>
    </div>
  );
};
