import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

const translations = {
  en: {
    selectLanguage: 'Select Language',
    runicInscriptions: 'Runic Inscriptions',
    searchPlaceholder: 'Search inscriptions...',
    search: 'Search',
    exploreRunicInscriptions: 'Explore Runic Inscriptions',
    searchAndFilter: 'Search and filter through',
    inscriptionsAvailable: 'inscriptions available',
    noResultsFound: 'No Results Found',
    noInscriptionsMatched: 'No inscriptions matched your search criteria.',
    clearAllFilters: 'Clear All Filters',
    readyToExplore: 'Ready to Explore?',
    useSearchOrFilters: 'Start by using the search bar or applying filters.',
    databaseStatistics: 'Database Statistics',
    totalInscriptions: 'Total Inscriptions',
    totalAnalyses: 'Total Analyses',
    totalNotes: 'Total Notes',
    landscape: 'Landscape',
    country: 'Country',
    period: 'Period',
    status: 'Status',
    objectType: 'Object Type',
    all: 'All',
    resetFilters: 'Reset Filters',
    activeFilters: 'Active Filters',
    selected: 'Selected',
    unknownLocation: 'Unknown location',
    vikingAge: 'Viking Age',
    modernGeography: 'Modern Geography',
    vikingGeography: 'Viking Geography',
    vikingMode: 'Viking Mode',
    filterByVikingCategory: 'Filter by Viking Category',
    ringFortresses: 'Ring Fortresses',
    hillforts: 'Hillforts',
    longphorts: 'Longphorts',
    royalCenters: 'Royal Centers',
    coastalDefense: 'Coastal Defense',
    tradingPosts: 'Trading Posts',
    linearDefenses: 'Linear Defenses',
    tradingPlaces: 'Trading Places',
    koping: 'Köping',
    establishedCities: 'Established Cities',
    gotlandicCenters: 'Gotlandic Centers',
    vikingSettlements: 'Viking Settlements',
    adaptedFortresses: 'Adapted Fortresses',
    religiousCenters: 'Religious Centers',
    valdemarsRoute: 'Valdemar\'s Route',
    vikingRivers: 'Viking Rivers',
    vikingWaterways: 'Viking Waterways',
    swedishRivers: 'Swedish Rivers',
    europeanRivers: 'European Rivers',
    tradeRoutes: 'Trade Routes (Viking trade)',
    royalRoutes: 'Royal Routes',
    eriksgatan: 'Eriksgatan',
    beaconSites: 'Beacon sites (vårdkasar)',
    pilgrimRoutes: 'Pilgrim Routes',
    olavsRoutes: 'St. Olav Routes',
    erikRoute: 'St. Erik Route',
    sigfridRoute: 'St. Sigfrid Route',
    jamesRoute: 'St. James Route',
    ancientTradeRoutes: 'Ancient Trade Routes',
    northernTradeRoutes: 'Northern Trade Routes',
    balticTradeRoute: 'Baltic Trade Route',
    southernTradeRoute: 'Southern Trade Route',
    westernTradeRoute: 'Western Trade Route',
    paganGods: 'Pagan Gods',
    christianCenters: 'Christian Centers',
    archbishopSeats: 'Archbishop Seats',
    bishopSeats: 'Bishop Seats',
    missionSites: 'Mission Sites',
    franciscanMonasteries: 'Franciscan Monasteries',
    dominicanMonasteries: 'Dominican Monasteries',
    birgittineMonasteries: 'Birgittine Monasteries',
    peoples: 'Peoples',
    realms: 'Realms',
    cities: 'Cities',
    religious: 'Religious',
    discoveries: 'Discoveries',
    underwater: 'Underwater',
    mapLegend: 'Map Legend',
    searchResults: 'Search Results',
    vikingWorld: 'Viking World',
    showAll: 'Show All',
    hideAll: 'Hide All',
    authenticVikingColors: 'Authentic Viking Age colors • Earth tones • Historically accurate shades',
    swedishRunestones: 'Swedish Runestones',
    runestonesInOtherCountries: 'Runestones in Other Countries',
    vikingCenters: 'Viking Centers',
    valdemarsRoute1230s: 'Valdemar\'s Route (1230s)',
    importantWaterways: 'Important Waterways',
    eskerRoads: 'Esker Roads (main roads)',
    hollowWays: 'Hollow Ways',
    winterRoads: 'Winter Roads/Ice Roads',
    bridgesAndFords: 'Bridges and Fords',
    vikingAgeRoads: 'Viking Age Roads',
    fortresses: 'Fortresses',
    paganCultSites: 'Pagan Cult Sites',
    thorCultSites: 'Thor/Tor Cult Sites',
    odinCultSites: 'Odin Cult Sites',
    freyCultSites: 'Frey Cult Sites',
    ullCultSites: 'Ull Cult Sites',
    njordCultSites: 'Njord Cult Sites',
    friggCultSites: 'Frigg Cult Sites',
    otherCultSites: 'Other Cult Sites',
    germanicPeoples: 'Germanic Peoples',
    barrierDefenses: 'Barrier Defenses',
    vikingRegiments: 'Viking Regiments',
    wellPreserved: 'Well Preserved',
    damaged: 'Damaged',
    fragmentary: 'Fragmentary',
    sweden: 'Sweden',
    norway: 'Norway',
    denmark: 'Denmark',
    iceland: 'Iceland',
    finland: 'Finland',
    estonia: 'Estonia',
    russia: 'Russia',
    ukraine: 'Ukraine',
    england: 'England',
    ireland: 'Ireland',
    scotland: 'Scotland',
    faroeIslands: 'Faroe Islands',
    greenland: 'Greenland',
    earlyChristianity: 'Early Christianity (800-1100)',
    medievalMonasteries: 'Medieval Monasteries (1100-1400)',
    lateMiddleAgeMonasteries: 'Late Middle Age Monasteries (1400-1500)',
    cistercianMonasteries: 'Cistercian Monasteries',
    franciscanOrder: 'Franciscan (Grey Friars)',
    dominicanOrder: 'Dominican (Black Friars)',
    birgittineOrder: 'Birgittine Order',
    monasticOrders: 'Monastic Orders',
    holySites: 'Holy Sites',
    monasteriesAndChristianSites: 'Monasteries and Christian Sites',
    // Artefacts page
    artefactsTitle: 'Artefacts',
    artefactsDescription: 'Discover various types of artefacts from the Viking Age and Middle Ages with categorization',
    searchArtefacts: 'Search artefacts...',
    allCategories: 'All categories',
    loadingArtefacts: 'Loading artefacts...',
    errorLoadingArtefacts: 'Error loading artefacts',
    noMatchingArtefacts: 'No matching artefacts',
    noArtefactsFound: 'No artefacts found',
    tryChangingCriteria: 'Try changing your search criteria',
    noArtefactsLoaded: 'No artefacts could be loaded from the database.',
    artefactId: 'Artefact ID',
    systemId: 'System ID',
    metadata: 'Metadata',
    language: 'Language',
    category: 'Category',
    created: 'Created',
    copyName: 'Copy name',
    close: 'Close',
    copied: 'Copied!',
    copiedToClipboard: 'has been copied to clipboard',
    artefactsOf: 'of',
    artefactsCount: 'artefacts',
    // Fortresses page
    fortressesCitiesTitle: 'Fortresses and Centres',
    fortressesCitiesDescription: 'Explore Viking Age and medieval fortifications, hillforts and trade centres from Nordic history.',
    loadingFortressesCities: 'Loading fortresses and centres...',
    swedishHillforts: 'Swedish Hillforts',
    vikingAgeFortresses: 'Viking Age Fortresses',
    fortressesOverview: 'Fortresses Overview',
    totalCount: 'Total count',
    excavated: 'Excavated',
    unescoSites: 'UNESCO Sites',
    countries: 'Countries',
    landscapes: 'Landscapes',
    confirmed: 'Confirmed',
    municipalities: 'Municipalities',
    allTypes: 'All types',
    allLandscapes: 'All landscapes',
    noNamedFort: 'Unnamed hillfort',
    culturalSignificance: 'Cultural Significance',
    noHillfortsFound: 'No hillforts found',
    noHillfortsFromLandscape: 'No hillforts from the selected landscape were found.',
    // Folk groups page
    historicalFolkGroupsTitle: 'Historical Folk Groups',
    historicalFolkGroupsDescription: 'Explore the historical folk groups that shaped the history of Scandinavia and Europe',
    searchFolkGroups: 'Search folk groups...',
    loadingFolkGroups: 'Loading historical folk groups...',
    interactiveMap: 'Interactive map',
    folkGroupsMapDescription: 'To see historical folk groups on the map, go to the main map and activate "Folk Groups" in the legend. The map shows the geographical distribution of folk groups during different time periods.',
    openInteractiveMap: 'Open interactive map',
    allFolkGroups: 'All folk groups',
    geographicPosition: 'Geographic position documented',
    languageFamily: 'Language family',
    historicalSignificance: 'Historical significance',
    noFolkGroupsFound: 'No folk groups found for your search',
    showing: 'Showing',
    groups: 'groups',
  },
  sv: {
    selectLanguage: 'Välj Språk',
    runicInscriptions: 'Runinskrifter',
    searchPlaceholder: 'Sök inskrifter...',
    search: 'Sök',
    exploreRunicInscriptions: 'Utforska Runinskrifter',
    searchAndFilter: 'Sök och filtrera bland',
    inscriptionsAvailable: 'inskrifter tillgängliga',
    noResultsFound: 'Inga Resultat Funna',
    noInscriptionsMatched: 'Inga inskrifter matchade dina sökkriterier.',
    clearAllFilters: 'Rensa Alla Filter',
    readyToExplore: 'Redo att Utforska?',
    useSearchOrFilters: 'Börja med att använda sökfältet eller tillämpa filter.',
    databaseStatistics: 'Databasstatistik',
    totalInscriptions: 'Totalt Inskrifter',
    totalAnalyses: 'Totalt Analyser',
    totalNotes: 'Totalt Noter',
    landscape: 'Landskap',
    country: 'Land',
    period: 'Period',
    status: 'Status',
    objectType: 'Objekttyp',
    all: 'Alla',
    resetFilters: 'Återställ Filter',
    activeFilters: 'Aktiva Filter',
    selected: 'Vald',
    unknownLocation: 'Okänd plats',
    vikingAge: 'Vikingatiden',
    modernGeography: 'Modern Geografi',
    vikingGeography: 'Viking Geografi',
    vikingMode: 'Vikingläge',
    filterByVikingCategory: 'Filtrera efter Vikingakategori',
    ringFortresses: 'Ringborgar',
    hillforts: 'Bergsfästen',
    longphorts: 'Longphorts',
    royalCenters: 'Kungliga Center',
    coastalDefense: 'Kustförsvar',
    tradingPosts: 'Handelsplatser',
    linearDefenses: 'Linjära Försvar',
    tradingPlaces: 'Handelsplatser',
    koping: 'Köping',
    establishedCities: 'Etablerade Städer',
    gotlandicCenters: 'Gotländska Center',
    vikingSettlements: 'Vikingabosättningar',
    adaptedFortresses: 'Anpassade Fästningar',
    religiousCenters: 'Religiösa Center',
    valdemarsRoute: 'Valdemars Segelled',
    vikingRivers: 'Vikingafloder',
    vikingWaterways: 'Vikingaleder (vatten)',
    swedishRivers: 'Svenska älvar & åar',
    europeanRivers: 'Europeiska floder',
    tradeRoutes: 'Handelsrutter (vikingaleder)',
    royalRoutes: 'Kungliga rutter',
    eriksgatan: 'Eriksgatan',
    beaconSites: 'Vårdkasar',
    pilgrimRoutes: 'Pilgrimsleder',
    olavsRoutes: 'Olavslederna',
    erikRoute: 'Eriksleden',
    sigfridRoute: 'Sigfridsleden',
    jamesRoute: 'Jakobsleden',
    ancientTradeRoutes: 'Uråldriga handelsleder',
    northernTradeRoutes: 'Norrländska leder',
    balticTradeRoute: 'Östersjöleden',
    southernTradeRoute: 'Sydsvenska leder',
    westernTradeRoute: 'Västliga leder',
    paganGods: 'Hedniska gudar',
    christianCenters: 'Kristna centrum',
    archbishopSeats: 'Ärkebiskopssäten',
    bishopSeats: 'Biskopssäten',
    missionSites: 'Missionsplatser',
    franciscanMonasteries: 'Franciskanerkloster',
    dominicanMonasteries: 'Dominikanerkloster',
    birgittineMonasteries: 'Birgittinerkloster',
    peoples: 'Folk',
    realms: 'Riken',
    cities: 'Städer',
    religious: 'Religiösa',
    discoveries: 'Upptäckter',
    underwater: 'Undervattens',
    mapLegend: 'Kartförklaring',
    searchResults: 'Sökresultat',
    vikingWorld: 'Viking Värld',
    showAll: 'Visa alla',
    hideAll: 'Dölj alla',
    authenticVikingColors: 'Autentiska vikingatidsfärger • Jordnära toner • Historiskt korrekta nyanser',
    swedishRunestones: 'Svenska runstenar',
    runestonesInOtherCountries: 'Runstenar i andra länder',
    vikingCenters: 'Vikingacentra',
    valdemarsRoute1230s: 'Valdemars segelled (1230-talet)',
    importantWaterways: 'Viktiga vattenvägar',
    eskerRoads: 'Rullstensåsar (huvudvägar)',
    hollowWays: 'Hålvägar',
    winterRoads: 'Vintervägar/isvägar',
    bridgesAndFords: 'Broar och vadställen',
    vikingAgeRoads: 'Vikingatida vägar',
    fortresses: 'Fornborgar',
    paganCultSites: 'Hedniska kultplatser',
    thorCultSites: 'Thor/Tor-kultplatser',
    odinCultSites: 'Oden/Odin-kultplatser',
    freyCultSites: 'Frej/Frey-kultplatser',
    ullCultSites: 'Ull-kultplatser',
    njordCultSites: 'Njord/Njärd-kultplatser',
    friggCultSites: 'Frigg-kultplatser',
    otherCultSites: 'Andra kultplatser',
    germanicPeoples: 'Germanska folkgrupper',
    barrierDefenses: 'Spärrbarriärer',
    vikingRegiments: 'Vikingaregementer',
    wellPreserved: 'Välbevarade',
    damaged: 'Skadade',
    fragmentary: 'Fragmentariska',
    sweden: 'Sverige',
    norway: 'Norge',
    denmark: 'Danmark',
    iceland: 'Island',
    finland: 'Finland',
    estonia: 'Estland',
    russia: 'Ryssland',
    ukraine: 'Ukraina',
    england: 'England',
    ireland: 'Irland',
    scotland: 'Skottland',
    faroeIslands: 'Färöarna',
    greenland: 'Grönland',
    earlyChristianity: 'Tidig kristendom (800-1100)',
    medievalMonasteries: 'Medeltida kloster (1100-1400)',
    lateMiddleAgeMonasteries: 'Senmedeltida kloster (1400-1500)',
    cistercianMonasteries: 'Cistercienskloster',
    franciscanOrder: 'Franciskaner (Gråbröder)',
    dominicanOrder: 'Dominikaner (Svartbröder)',
    birgittineOrder: 'Birgittinkloster',
    monasticOrders: 'Klosterordnar',
    holySites: 'Heliga platser',
    monasteriesAndChristianSites: 'Kloster och kristna platser',
    // Artefacts page
    artefactsTitle: 'Artefakter',
    artefactsDescription: 'Upptäck olika typer av artefakter från vikingatiden och medeltiden med kategorisering',
    searchArtefacts: 'Sök artefakter...',
    allCategories: 'Alla kategorier',
    loadingArtefacts: 'Laddar artefakter...',
    errorLoadingArtefacts: 'Fel vid laddning av artefakter',
    noMatchingArtefacts: 'Inga matchande artefakter',
    noArtefactsFound: 'Inga artefakter hittades',
    tryChangingCriteria: 'Försök ändra dina sökkriterier',
    noArtefactsLoaded: 'Inga artefakter kunde laddas från databasen.',
    artefactId: 'Artefakt ID',
    systemId: 'System ID',
    metadata: 'Metadata',
    language: 'Språk',
    category: 'Kategori',
    created: 'Skapad',
    copyName: 'Kopiera namn',
    close: 'Stäng',
    copied: 'Kopierat!',
    copiedToClipboard: 'har kopierats till urklipp',
    artefactsOf: 'av',
    artefactsCount: 'artefakter',
    // Fortresses page
    fortressesCitiesTitle: 'Befästningar och Centra',
    fortressesCitiesDescription: 'Utforska vikingatida och medeltida befästningar, fornborgar och handelscentra från den nordiska historien.',
    loadingFortressesCities: 'Laddar befästningar och centra...',
    swedishHillforts: 'Svenska Fornborgar',
    vikingAgeFortresses: 'Vikingatida Befästningar',
    fortressesOverview: 'Befästningar översikt',
    totalCount: 'Totalt antal',
    excavated: 'Utgrävda',
    unescoSites: 'UNESCO-platser',
    countries: 'Länder',
    landscapes: 'Landskap',
    confirmed: 'Bekräftad',
    municipalities: 'Kommuner',
    allTypes: 'Alla typer',
    allLandscapes: 'Alla landskap',
    noNamedFort: 'Namnlös fornborg',
    culturalSignificance: 'Kulturell betydelse',
    noHillfortsFound: 'Inga fornborgar hittades',
    noHillfortsFromLandscape: 'Inga fornborgar från det valda landskapet hittades.',
    // Folk groups page
    historicalFolkGroupsTitle: 'Historiska Folkgrupper',
    historicalFolkGroupsDescription: 'Utforska de historiska folkgrupperna som präglat Skandinaviens och Europas historia',
    searchFolkGroups: 'Sök folkgrupper...',
    loadingFolkGroups: 'Laddar historiska folkgrupper...',
    interactiveMap: 'Interaktiv karta',
    folkGroupsMapDescription: 'För att se historiska folkgrupper på kartan, gå till huvudkartan och aktivera "Folkgrupper" i legenden. Kartan visar folkgruppernas geografiska spridning under olika tidsperioder.',
    openInteractiveMap: 'Öppna interaktiv karta',
    allFolkGroups: 'Alla folkgrupper',
    geographicPosition: 'Geografisk position dokumenterad',
    languageFamily: 'Språkfamilj',
    historicalSignificance: 'Historisk betydelse',
    noFolkGroupsFound: 'Inga folkgrupper hittades för din sökning',
    showing: 'Visar',
    groups: 'grupper',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Check URL first, then localStorage, then default to 'en'
  const [language, setLanguage] = useState(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/sv/')) {
        return 'sv';
      }
    }
    
    try {
      return localStorage.getItem('language') || 'en';
    } catch (error) {
      console.warn('Failed to read language from localStorage:', error);
      return 'en';
    }
  });

  useEffect(() => {
    // Update language based on URL path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/sv/') && language !== 'sv') {
        setLanguage('sv');
      } else if (!path.startsWith('/sv/') && path !== '/auth' && path !== '/admin' && path !== '/profile' && language !== 'en') {
        // Only auto-switch to English for content pages, not auth/admin/profile
        const isContentPage = path !== '/' && path !== '/welcome' && !path.startsWith('/sv/');
        if (isContentPage) {
          setLanguage('en');
        }
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }, [language]);

  const t = (key: string) => {
    const translation = translations[language as keyof typeof translations]?.[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.error('useLanguage must be used within a LanguageProvider. Make sure your component is wrapped with LanguageProvider.');
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
