
export interface LegendItem {
  id: string;
  label: string;
  // color/count/enabled är valfria: link-typen (extern länk, t.ex. spökvandringen)
  // har varken switch, räknare eller lagerfärg — bara etikett + href.
  color?: string;
  count?: number;
  enabled?: boolean;
  type?: 'primary' | 'category' | 'subcategory' | 'link';
  href?: string;
  children?: LegendItem[];
  parentId?: string;
}

export interface MapLegendProps {
  isVikingMode: boolean;
  legendItems: LegendItem[];
  onToggleItem: (id: string) => void;
  className?: string;
  onShowAll?: () => void;
  onHideAll?: () => void;
  // Anropas efter att ett färdsätt valts (Gå/Cykla/Kör) → låter mobilpanelen stänga sig
  // så kartan syns direkt ("map-first"). Sätts bara på mobil; odefinierad på desktop.
  onModeSelected?: () => void;
}
