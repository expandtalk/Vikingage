
import React from 'react';
import { CompactSearchBox } from '../search/CompactSearchBox';
import { GodNameSearch } from '../search/GodNameSearch';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchModuleProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  totalInscriptions: number;
  isVikingMode: boolean;
  showGodNameSearch?: boolean;
  onGodNameSearch?: (godName: string) => void;
  onLegendToggle?: (id: string) => void;
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isLoading,
  totalInscriptions,
  isVikingMode,
  showGodNameSearch = false,
  onGodNameSearch,
  onLegendToggle,
  isMinimized = false,
  onToggleMinimized
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const handleCompactSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };

  const handleResultSelect = (result: any) => {
    // Handle when user selects a search suggestion
    setSearchQuery(result.signum);
    handleSearch();
  };

  if (isMinimized) {
    return (
      <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Sök</span>
            {searchQuery && (
              <span className="text-amber-400 text-xs">"{searchQuery}"</span>
            )}
          </div>
          <button
            onClick={onToggleMinimized}
            className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-amber-900/20 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium text-lg">{sv ? 'Sök i runstenar' : 'Search runestones'}</h3>
        <button
          onClick={onToggleMinimized}
          className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-amber-900/20 transition-colors"
        >
          −
        </button>
      </div>

      <div className="space-y-4">
        {/* Compact Google-style search */}
        <CompactSearchBox
          onSearch={handleCompactSearch}
          onResultSelect={handleResultSelect}
          placeholder={sv ? `Sök bland ${totalInscriptions.toLocaleString()} runstenar...` : `Search ${totalInscriptions.toLocaleString()} runestones...`}
          currentQuery={searchQuery}
        />

        {/* God name search for Viking mode */}
        {showGodNameSearch && isVikingMode && onGodNameSearch && onLegendToggle && (
          <div className="pt-2 border-t border-white/20">
            <GodNameSearch
              onGodNameSearch={onGodNameSearch}
              onLegendToggle={onLegendToggle}
              compact={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
