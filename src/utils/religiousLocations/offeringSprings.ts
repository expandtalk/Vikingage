
export interface OfferingSpring {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'offering_spring';
  evidence: ('archaeological' | 'place_name' | 'church_foundation' | 'historical_records')[];
  description: string;
  historicalPeriods: string[];
  establishedPeriod: string;
  region: string;
  sources: string[];
  speciality: string;
  christianized?: boolean;
  associatedSaint?: string;
}

export const OFFERING_SPRINGS: OfferingSpring[] = [
  {
    id: 'edestad_kyrka_blekinge',
    name: 'Edestad kyrka offerkälla',
    coordinates: { lat: 56.2833, lng: 15.0833 },
    type: 'offering_spring',
    evidence: ['church_foundation', 'historical_records'],
    description: 'Offerkälla norr om kyrkan med magiska krafter, särskilt vid midsommartid. Kyrkan blev pilgrimskyrka.',
    historicalPeriods: ['medieval', 'early_modern'],
    establishedPeriod: 'prehistoric',
    region: 'Blekinge',
    sources: ['Visit Blekinge', 'Blekinge släktforskarförening'],
    speciality: 'Kallades "Kornguden" och fördes i procession kring åkrarna för årsväxten',
    christianized: true,
    associatedSaint: 'Lokal helgon'
  },
  {
    id: 'kalla_gamla_kyrka_oland',
    name: 'Källa gamla kyrka offerkälla',
    // Rättad enligt Wikipedia: 57°6′41″N 16°59′11″Ö (Källa socken, norra Öland).
    coordinates: { lat: 57.1114, lng: 16.9864 },
    type: 'offering_spring',
    evidence: ['place_name', 'church_foundation', 'archaeological'],
    description: 'Hednisk offerkälla som kristnades och helgades åt S:t Olof. Socknen har fått sitt namn av källan.',
    historicalPeriods: ['pre_christian', 'medieval'],
    establishedPeriod: 'pre_christian',
    region: 'Öland',
    sources: ['Kulturbilder', 'Wikipedia'],
    speciality: '1960 upptäcktes en raserad brunn i nordvästra delen av kyrkogården',
    christianized: true,
    associatedSaint: 'Sankt Olof'
  },
  {
    id: 'sankt_mans_torhamn_blekinge',
    name: 'Sankt Måns offerkälla, Torhamn',
    coordinates: { lat: 56.1167, lng: 15.8500 },
    type: 'offering_spring',
    evidence: ['place_name', 'historical_records'],
    description: 'Undergörande offerkälla vid Gislevikens strand. Sankt Måns var barnens skyddshelgon.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Blekinge',
    sources: ['PRO'],
    speciality: 'Folk kom långväga för sjuka barn, havande kvinnor och flickor som skulle gifta sig',
    christianized: true,
    associatedSaint: 'Sankt Måns'
  }
];
