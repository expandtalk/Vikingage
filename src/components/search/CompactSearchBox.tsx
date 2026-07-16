
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { sanitizeFilterValue } from "@/utils/searchFilter";

interface CompactSearchBoxProps {
  onSearch: (query: string) => void;
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
  currentQuery?: string;
}

export const CompactSearchBox: React.FC<CompactSearchBoxProps> = ({
  onSearch,
  onResultSelect,
  placeholder,
  className = "",
  currentQuery = ""
}) => {
  const { language } = useLanguage();
  const c = language === 'sv'
    ? { placeholder: 'Sök runstenar, platser, translitterationer...', search: 'Sök', searching: 'Söker...', noResults: 'Inga förslag hittades för' }
    : { placeholder: 'Search runestones, places, transliterations...', search: 'Search', searching: 'Searching...', noResults: 'No suggestions found for' };
  const resolvedPlaceholder = placeholder ?? c.placeholder;
  const [query, setQuery] = useState(currentQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local query when currentQuery changes
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const safe = sanitizeFilterValue(query);
        if (!safe) {
          setSuggestions([]);
          return;
        }
        // Real, lightweight autocomplete against the inscriptions table.
        const { data, error } = await supabase
          .from('runic_inscriptions')
          .select('id, signum, location, object_type')
          .or(`signum.ilike.%${safe}%,location.ilike.%${safe}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data ?? []);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsExpanded(false);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsExpanded(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.signum);
    setIsExpanded(false);
    setSuggestions([]);
    if (onResultSelect) {
      onResultSelect(suggestion);
    }
    onSearch(suggestion.signum);
  };

  const clearSearch = () => {
    setQuery('');
    setIsExpanded(false);
    setSuggestions([]);
    onSearch('');
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(query.length > 0)}
            placeholder={resolvedPlaceholder}
            className="pl-12 pr-20 py-3 text-base bg-slate-700/60 border-2 border-amber-500/30 text-white placeholder-gray-300 rounded-full shadow-sm hover:border-amber-500/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0 hover:bg-amber-500/20 rounded-full text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full"
              disabled={!query.trim()}
            >
              {c.search}
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isExpanded && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-amber-500/30 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-amber-400" />
              <span className="text-sm text-amber-200">{c.searching}</span>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 hover:bg-amber-500/20 border-b border-amber-500/20 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-100">{suggestion.signum}</div>
                    <div className="text-sm text-amber-300">{suggestion.location}</div>
                  </div>
                </div>
              </button>
            ))
          )}
          
          {!isLoadingSuggestions && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-amber-300 text-sm">
              {c.noResults} "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
