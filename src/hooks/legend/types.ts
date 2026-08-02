
export interface RunicInscription {
  id: string;
  signum: string;
  country?: string;
  status?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
}

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
}

export interface LegendManagerConfig {
  inscriptions: RunicInscription[];
  isVikingMode: boolean;
  selectedTimePeriod: string;
}
