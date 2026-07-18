
interface ArchaeologicalFind {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  period: 'paleolithic' | 'mesolithic' | 'neolithic' | 'bronze_age' | 'iron_age' | 'migration_period' | 'vendel_period' | 'viking_age';
  culture: string;
  significance: string;
  description: string;
  startYear: number;
  endYear: number;
  country: string;
  findType: 'settlement' | 'burial' | 'artifacts' | 'human_remains' | 'weapons' | 'boats' | 'cave' | 'workshop' | 'trade' | 'ritual' | 'city' | 'boat_graves' | 'royal_burial' | 'metalwork' | 'trading_post' | 'trading_city' | 'raid';
}

export const ARCHAEOLOGICAL_FINDS: ArchaeologicalFind[] = [
  {
    id: 'birka_grave_750',
    name: 'Birka krigargrav 750',
    nameEn: 'Birka Warrior Grave 750',
    lat: 59.4033,
    lng: 17.5431,
    period: 'viking_age',
    culture: 'Viking',
    description: 'En av de mest välbevarade vikingatida krigargravarna med vapen och smycken.',
    significance: 'Visar på krigarkulturen under tidig vikingatid',
    startYear: 750,
    endYear: 900,
    country: 'Sweden',
    findType: 'burial'
  },
  {
    id: 'gotland_silver_hoard',
    name: 'Gotlands silverskattar',
    nameEn: 'Gotland Silver Hoards',
    lat: 57.4684,
    lng: 18.4867,
    period: 'viking_age',
    culture: 'Viking',
    description: 'Över 700 silverskattar från vikingatiden har hittats på Gotland.',
    significance: 'Vittnar om Gotlands roll som handelscentrum',
    startYear: 800,
    endYear: 1100,
    country: 'Sweden',
    findType: 'artifacts'
  },
  {
    id: 'uppakra_settlement',
    name: 'Uppåkra centrumplats',
    nameEn: 'Uppåkra Central Place',
    lat: 55.7206,
    lng: 13.0761,
    period: 'vendel_period',
    culture: 'Vendel',
    description: 'En av Skandinaviens största järnålders- och vikingatida centrumplatser.',
    significance: 'Viktig handels- och kultplats under vendel- och vikingatid',
    startYear: 550,
    endYear: 800,
    country: 'Sweden',
    findType: 'settlement'
  },
  {
    id: 'gamla_uppsala_temple',
    name: 'Gamla Uppsala tempel',
    nameEn: 'Old Uppsala Temple',
    lat: 59.8985,
    lng: 17.6320,
    period: 'vendel_period',
    culture: 'Vendel',
    description: 'Platsen för det berömda templet som beskrevs av Adam av Bremen.',
    significance: 'Centralt religiöst centrum för fornnordisk religion',
    startYear: 550,
    endYear: 800,
    country: 'Sweden',
    findType: 'ritual'
  },
  {
    id: 'oseberg_ship',
    name: 'Osebergsskeppet',
    nameEn: 'Oseberg Ship',
    lat: 59.4167,
    lng: 10.4167,
    period: 'viking_age',
    culture: 'Viking',
    description: 'Ett av de mest välbevarade vikingaskeppen, begravt omkring 834 e.Kr.',
    significance: 'Ger unik inblick i vikingatidens skeppsbyggnad och begravningsritualer',
    startYear: 834,
    endYear: 834,
    country: 'Norway',
    findType: 'boat_graves'
  },
  {
    id: 'hedeby_settlement',
    name: 'Hedeby handelsplats',
    nameEn: 'Hedeby Trading Post',
    lat: 54.4914,
    lng: 9.5658,
    period: 'viking_age',
    culture: 'Viking',
    description: 'En av Nordeuropas viktigaste handelsplatser under vikingatiden.',
    significance: 'Knutpunkt för handel mellan Nord- och Centraleuropa',
    startYear: 808,
    endYear: 1066,
    country: 'Germany',
    findType: 'trading_city'
  },
  // --- Historiska museet-material (Daniel 2026-07-18, CC BY 4.0). Koordinater approx. ---
  {
    id: 'haga_mound_uppsala',
    name: 'Hågahögen (Kung Björns hög)',
    nameEn: "Håga Mound (King Björn's Mound)",
    lat: 59.8375,
    lng: 17.5789,
    period: 'bronze_age',
    culture: 'Bronsålder',
    significance: 'Nordens guldrikaste grav från bronsåldern',
    description: 'Stor gravhög väster om Uppsala, utgrävd 1902–1903 av Oscar Almgren. Daterad till ca 1100–1000 f.Kr. Innehöll bl.a. ett svärd med guldbelagt handtag, rakknivar, guldknappar och ett glasögonspänne av brons täckt med guld. Den begravde tros ha varit en hövding eller småkung. Fynden visas i Guldrummet, Historiska museet.',
    startYear: -1100,
    endYear: -1000,
    country: 'Sweden',
    findType: 'royal_burial'
  },
  {
    id: 'fullero_warrior_grave',
    name: 'Fullerögraven (Fulleröringen)',
    nameEn: 'Fullerö Warrior Grave (the Fullerö Ring)',
    lat: 59.9280,
    lng: 17.6560,
    period: 'iron_age',
    culture: 'Romersk järnålder',
    significance: 'Rik krigargrav med romersk guldring — trolig hemvändande romersk legosoldat/officer',
    description: 'Plundrad kammargrav norr om Gamla Uppsala. Fulleröringen är en massiv guldfingerring (61,18 g) med infattad karneol — trolig romersk hedersgåva (dona militaria) till en nordbo som tjänat som officer i romerska armén under 300-talet e.Kr. Graven innehöll även guldhänge, romerskt guldmynt och vapen. Historiska museet, Guldrummet.',
    startYear: 200,
    endYear: 400,
    country: 'Sweden',
    findType: 'burial'
  },
  {
    id: 'eskelhem_horse_gear',
    name: 'Eskelhem hästutrustning',
    nameEn: 'Eskelhem Horse Gear',
    lat: 57.3019,
    lng: 18.3072,
    period: 'bronze_age',
    culture: 'Bronsålder',
    significance: 'En av Sveriges tidigaste hästutrustningar; trolig offergåva kopplad till gudinnekult (Nerthus)',
    description: 'Depåfynd vid Eskelhems prästgård, Gotland (nedlagt ca 500 f.Kr.). Betsel med kindstänger, tolv seltygsbucklor, ringar med rasselbleck och en genombruten bronsskiva (soltolkning) samt en bälteskål ur kvinnodräkt — utrustning för ett tvåspann, importerad från Mellaneuropa. Kopplas till fruktbarhetsgudinnan Nerthus. Historiska museet.',
    startYear: -900,
    endYear: -500,
    country: 'Sweden',
    findType: 'ritual'
  },
  {
    id: 'stockhult_hoard',
    name: 'Stockhultsfyndet (halskrage)',
    nameEn: 'Stockhult Hoard (neck collar)',
    lat: 56.4200,
    lng: 14.0300,
    period: 'bronze_age',
    culture: 'Bronsålder',
    significance: 'Praktfull halskrage av Stockhultstyp; stort bronsåldersfynd',
    description: 'Fynd vid Stockhult, Loshult socken, nordöstra Skåne, daterat 1500–1300 f.Kr. Innehöll en spiraldekorerad halskrage av Stockhultstyp, två små mansstatyetter, smycken och vapen. Historiska museet.',
    startYear: -1500,
    endYear: -1300,
    country: 'Sweden',
    findType: 'metalwork'
  },
  {
    id: 'manjarv_ochre_grave',
    name: 'Rödockragrav, Manjärv',
    nameEn: 'Red Ochre Grave, Manjärv',
    lat: 65.5800,
    lng: 20.7500,
    period: 'mesolithic',
    culture: 'Mesolitikum (jägare–fiskare)',
    significance: 'Bland Sveriges äldsta gravmonument — stensättning med rödockra',
    description: 'Stenålderns rödockragrav i Manjärv, Älvsby socken, Norrbotten, utgrävd 1991–1992. Rund stensättning (~4 m) med rödockrafylld grop och minst två skelett; ett skifferavslag som gravgåva. Daterad till ca 5200–5000 f.Kr. En av ett tjugotal rödockragravar längs Pite-, Lule- och Kalixälven. Historiska museet.',
    startYear: -5200,
    endYear: -5000,
    country: 'Sweden',
    findType: 'burial'
  },
  {
    id: 'oden_lindby_statuette',
    name: 'Oden från Lindby (statyett)',
    nameEn: 'Odin from Lindby (statuette)',
    lat: 55.6800,
    lng: 13.3700,
    period: 'iron_age',
    culture: 'Järnålder',
    significance: 'Bronsstatyett som tolkats som Oden (ena ögat markerat/deformerat)',
    description: 'Gjuten mansfigur av brons med toppig huvudbonad, funnen i grustag vid Lindby, Svenstorp socken, Skåne. Vissa tolkar det deformerade ögat som en anspelning på Oden som pantsatte ett öga i Mimers brunn för vishet. Historiska museet, Guldrummet.',
    startYear: 400,
    endYear: 800,
    country: 'Sweden',
    findType: 'ritual'
  },
  {
    id: 'frej_rallinge_statuette',
    name: 'Frej från Rällinge (statyett)',
    nameEn: 'Freyr from Rällinge (statuette)',
    lat: 59.0500,
    lng: 17.1500,
    period: 'viking_age',
    culture: 'Vikingatid',
    significance: 'Bronsstatyett av vanaguden Frej — fruktbarhet/välgång',
    description: 'Sittande bronsfigur med toppig huvudbonad och erigerad fallos, funnen 1904 på Rällinge gård, Lunda socken, Södermanland. Tolkas som vanaguden Frej och påminner om Adam av Bremens beskrivning av Frej i Uppsalatemplet. Historiska museet, Guldrummet.',
    startYear: 800,
    endYear: 1100,
    country: 'Sweden',
    findType: 'ritual'
  },
  {
    id: 'freja_aska_pendant',
    name: 'Freja-hänget från Aska',
    nameEn: 'Freyja Pendant from Aska',
    lat: 58.5200,
    lng: 14.8600,
    period: 'viking_age',
    culture: 'Vikingatid',
    significance: 'Silverhänge tolkat som gudinnan Freja (havande kvinnogestalt)',
    description: 'Runt silverhänge i form av en havande kvinnogestalt med mantel, ryggknappsspänne och sexradig pärluppsättning, ur gravfynd från Aska, Hagebyhöga socken, Östergötland. Tolkas ofta som Freja, åkallad vid havandeskap och födsel. Historiska museet.',
    startYear: 800,
    endYear: 1100,
    country: 'Sweden',
    findType: 'ritual'
  }
];

export const getFindsInPeriod = (finds: ArchaeologicalFind[], period: string): ArchaeologicalFind[] => {
  if (period === 'all') return finds;
  
  return finds.filter(find => find.period === period);
};

export const getFindsByType = (finds: ArchaeologicalFind[], type: string): ArchaeologicalFind[] => {
  return finds.filter(find => find.findType === type);
};

// Export types and functions needed by other modules
export type { ArchaeologicalFind };
export { getFindIcon, getFindColor } from './archaeologicalFinds/helpers';
export { clusterFinds, getClusterIcon, type FindCluster } from './archaeologicalFinds/clustering';
