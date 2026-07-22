import React from 'react';
import { PanelLayoutSelector } from '../../panels/PanelLayoutSelector';
import { LayoutHeaderProps } from '@/types/explorer';

export const LayoutHeader: React.FC<LayoutHeaderProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  handleSearch,
  totalInscriptions,
}) => {
  return (
    <PanelLayoutSelector
      showSearch
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      totalInscriptions={totalInscriptions}
    />
  );
});

LayoutHeader.displayName = 'LayoutHeader';
