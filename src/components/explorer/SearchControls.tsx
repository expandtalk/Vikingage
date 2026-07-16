
import React from 'react';
import { CompactSearchBox } from '../search/CompactSearchBox';
import { GodNameSearch } from '../search/GodNameSearch';
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  totalInscriptions: number;
  isVikingMode: boolean;
  showGodNameSearch?: boolean;
  onGodNameSearch?: (godName: string) => void;
  onLegendToggle?: (id: string) => void;
}

// Unified on the canonical CompactSearchBox (real suggestions, bilingual,
// injection-sanitized) instead of a separate plain <Input>, so every search
// surface behaves the same.
export const SearchControls: React.FC<SearchControlsProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  totalInscriptions,
  showGodNameSearch = false,
  onGodNameSearch,
  onLegendToggle,
}) => {
  const { language } = useLanguage();

  const handleCompactSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };

  const handleResultSelect = (result: { signum?: string }) => {
    if (result.signum) {
      setSearchQuery(result.signum);
      handleSearch();
    }
  };

  const total = totalInscriptions.toLocaleString(language === 'sv' ? 'sv-SE' : 'en-US');

  return (
    <div className="space-y-4">
      <CompactSearchBox
        onSearch={handleCompactSearch}
        onResultSelect={handleResultSelect}
        currentQuery={searchQuery}
      />

      {showGodNameSearch && onGodNameSearch && onLegendToggle && (
        <GodNameSearch onGodNameSearch={onGodNameSearch} onLegendToggle={onLegendToggle} />
      )}

      <div className="text-white/80 text-sm">
        {language === 'sv'
          ? `Totalt ${total} runstenar att utforska`
          : `${total} runestones to explore`}
      </div>
    </div>
  );
};
