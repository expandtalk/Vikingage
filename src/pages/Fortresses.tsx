
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { MapPin, Calendar, Castle, Shield, Users, Ruler, Building, Anchor, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { useVikingFortresses } from '../hooks/useVikingFortresses';
import { useVikingCities, getCategoryColor, getCategoryLabel } from '../hooks/useVikingCities';
import { useSwedishHillforts } from '../hooks/useSwedishHillforts';
import { useFornborgInge } from '../hooks/useFornborgInge';
import { useBeaconSites } from '../hooks/useBeaconSites';
import { useMedievalCastles } from '../hooks/useMedievalCastles';
import { useFortificationFinds } from '../hooks/useFortificationFinds';
import { FortressesCitiesMap } from '../components/fortresses/FortressesCitiesMap';
import { FortificationTypology } from '../components/fortresses/FortificationTypology';
import { FingerprintDialog } from '../components/forensics/FingerprintDialog';
import { FortGoldTerritoryCard } from '../components/fortresses/FortGoldTerritoryCard';
import { useLanguage } from '@/contexts/LanguageContext';

const Fortresses = () => {
  const { t, language } = useLanguage();
  const sv = language === 'sv';
  const L = sv
    ? {
        allTypes: 'Alla typer', ringForts: 'Ringborgar', hillforts: 'Fornborgar', longphorts: 'Longphorts',
        royalCentres: 'Kungliga centra', coastalDef: 'Kustförsvar', fortTrade: 'Befästa handelsplatser', linearDef: 'Linjära försvar',
        allCategories: 'Alla kategorier', estCities: 'Etablerade städer', tradingPosts: 'Handelsplatser',
        relCentres: 'Religiösa centrum', gotlandicCentres: 'Gotländska centrum', kopings: 'Köpingar',
        loadError: 'Fel vid laddning', swedishHillforts: 'Svenska fornborgar', vikingFortifications: 'Vikingatida befästningar',
        cities: 'Centra', hillfortsDesc: 'Fornborgar från hela Sverige med RAÄ-nummer och historisk dokumentation',
        total: 'Totalt antal', landscapeN: 'Landskap', confirmedN: 'Bekräftade', municipalities: 'Kommuner',
        importing: 'Importerar…', importOlandSmaland: 'Importera Öland & Småland', importNarkeUppland: 'Importera Närke & Uppland',
        allLandscapes: 'Alla landskap', namelessHillfort: 'Namnlös fornborg', confirmed: 'Bekräftad',
        period: 'Period', culturalSig: 'Kulturell betydelse', noHillforts: 'Inga fornborgar hittades',
        noHillfortsDesc: 'Inga fornborgar från det valda landskapet hittades.',
        fortsOverview: 'Befästningar översikt', excavatedN: 'Utgrävda', unescoSites: 'UNESCO-platser', countries: 'Länder',
        unescoBadge: 'UNESCO', excavated: 'Utgrävd', diameter: 'Diameter', area: 'Yta', hectares: 'hektar',
        historicalSig: 'Historisk betydelse', noForts: 'Inga befästningar hittades',
        noFortsDesc: 'Inga befästningar av den valda typen hittades.',
        citiesOverview: 'Centra översikt', population: 'Befolkning', noCities: 'Inga centra hittades',
        noCitiesDesc: 'Inga centra av den valda kategorin hittades.',
      }
    : {
        allTypes: 'All types', ringForts: 'Ring fortresses', hillforts: 'Hillforts', longphorts: 'Longphorts',
        royalCentres: 'Royal centres', coastalDef: 'Coastal defence', fortTrade: 'Fortified trading posts', linearDef: 'Linear defences',
        allCategories: 'All categories', estCities: 'Established cities', tradingPosts: 'Trading posts',
        relCentres: 'Religious centres', gotlandicCentres: 'Gotlandic centres', kopings: 'Market towns',
        loadError: 'Error loading', swedishHillforts: 'Swedish hillforts', vikingFortifications: 'Viking Age fortifications',
        cities: 'Centres', hillfortsDesc: 'Hillforts from across Sweden with RAÄ numbers and historical documentation',
        total: 'Total', landscapeN: 'Provinces', confirmedN: 'Confirmed', municipalities: 'Municipalities',
        importing: 'Importing…', importOlandSmaland: 'Import Öland & Småland', importNarkeUppland: 'Import Närke & Uppland',
        allLandscapes: 'All provinces', namelessHillfort: 'Unnamed hillfort', confirmed: 'Confirmed',
        period: 'Period', culturalSig: 'Cultural significance', noHillforts: 'No hillforts found',
        noHillfortsDesc: 'No hillforts found for the selected province.',
        fortsOverview: 'Fortifications overview', excavatedN: 'Excavated', unescoSites: 'UNESCO sites', countries: 'Countries',
        unescoBadge: 'UNESCO', excavated: 'Excavated', diameter: 'Diameter', area: 'Area', hectares: 'hectares',
        historicalSig: 'Historical significance', noForts: 'No fortifications found',
        noFortsDesc: 'No fortifications of the selected type found.',
        citiesOverview: 'Centres overview', population: 'Population', noCities: 'No centres found',
        noCitiesDesc: 'No centres of the selected category found.',
      };
  const { fortresses, isLoading: fortressesLoading, error: fortressesError } = useVikingFortresses(true);
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useVikingCities(true);
  const { hillforts, isLoading: hillfortsLoading, error: hillfortsError } = useSwedishHillforts(true);
  const { ingeByFort } = useFornborgInge(true);
  const { beacons } = useBeaconSites(true);
  const { castles: medievalCastles } = useMedievalCastles(true);
  const { findsByFort } = useFortificationFinds(true);
  // Kastal-antal ur heritage_sites (raa_type='kastal') → typologin visade "under uppbyggnad" fast datan
  // finns (Daniel: "ser ut som vi inte har några kastaler"). Tunn täckning (få kurerade) — ärlig siffra.
  const { data: kastalCount = 0 } = useQuery({
    queryKey: ['kastal-count'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<number> => {
      const { count } = await (supabase as any).from('heritage_sites').select('id', { count: 'exact', head: true }).eq('raa_type', 'kastal');
      return count ?? 0;
    },
  });
  const [selectedFortressType, setSelectedFortressType] = useState<string>('all');
  const [selectedCityCategory, setSelectedCityCategory] = useState<string>('all');
  const [selectedLandscape, setSelectedLandscape] = useState<string>('all');
  const [selectedFortressRegion, setSelectedFortressRegion] = useState<string>('all');
  const [selectedCityRegion, setSelectedCityRegion] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showHillforts, setShowHillforts] = useState(true);
  const [hillfortSort, setHillfortSort] = useState<'landscape' | 'age' | 'runestones' | 'inge' | 'height'>('landscape');
  const [onlyNearInge, setOnlyNearInge] = useState(false);
  const [fortFunc, setFortFunc] = useState<string>('all');            // funktionsfacet
  const [soilFilter, setSoilFilter] = useState<string>('all');        // jordmånsfacet
  const [onlyOnHeight, setOnlyOnHeight] = useState(false);            // läge: byggd på höjd
  const [periodRange, setPeriodRange] = useState<[number, number]>([-3000, 1400]); // tidsslider (år)
  const [includeUndated, setIncludeUndated] = useState(true);

  // Grov åldersrank ur period-texten (odaterade sist). Neolitikum → medeltid.
  const eraRank = (p?: string): number => {
    const s = (p || '').toLowerCase();
    if (!s) return 999999;
    if (s.includes('neolit') || s.includes('bondesten') || s.includes('stenålder') || s.includes('f.kr')) return -2800;
    if (s.includes('brons')) return -1000;
    if (s.includes('folkvandring')) return 400;
    if (s.includes('vendel')) return 550;
    if (s.includes('vikinga')) return 800;
    if (s.includes('medeltid')) return 1100;
    if (s.includes('romersk') || s.includes('äldre järn') || /(före|omkring).*\b100\b/.test(s)) return 50;
    if (s.includes('järn')) return 300;
    return 999998;
  };
  const sortHillforts = (arr: typeof hillforts) => {
    if (hillfortSort === 'age') return [...arr].sort((a, b) => eraRank(a.period) - eraRank(b.period) || a.name.localeCompare(b.name));
    if (hillfortSort === 'runestones') return [...arr].sort((a, b) => (b.nearby_runestones ?? -1) - (a.nearby_runestones ?? -1) || a.name.localeCompare(b.name));
    if (hillfortSort === 'inge') return [...arr].sort((a, b) => {
      const da = ingeByFort.get(a.id)?.inge_distance_m ?? Infinity;
      const db = ingeByFort.get(b.id)?.inge_distance_m ?? Infinity;
      return da - db || a.name.localeCompare(b.name);
    });
    if (hillfortSort === 'height') return [...arr].sort((a, b) =>
      (b.rel_height_m ?? -Infinity) - (a.rel_height_m ?? -Infinity) || a.name.localeCompare(b.name));
    return arr; // 'landscape' = hookens ordning (landskap, namn)
  };

  // Fornborgslistans filter: landskap + -inge + funktion + tidsperiod (odaterade via toggle).
  const yearFmt = (y: number) => (y < 0 ? `${Math.abs(y)} f.Kr.` : `${y} e.Kr.`);
  const overlapsPeriod = (h: typeof hillforts[number]) => {
    if (h.period_start == null) return includeUndated;
    const end = h.period_end ?? h.period_start;
    return h.period_start <= periodRange[1] && end >= periodRange[0];
  };
  const matchesFunction = (h: typeof hillforts[number]) =>
    fortFunc === 'all' ? true : fortFunc === 'none' ? !h.fort_function : h.fort_function === fortFunc;
  const visibleHillforts = sortHillforts(
    hillforts
      .filter(h => selectedLandscape === 'all' || h.landscape === selectedLandscape)
      .filter(h => !onlyNearInge || ((ingeByFort.get(h.id)?.inge_distance_m ?? Infinity) <= 2000))
      .filter(matchesFunction)
      .filter(h => soilFilter === 'all' || h.soil_fertility === soilFilter)
      .filter(h => !onlyOnHeight || h.on_height === true)
      .filter(overlapsPeriod)
  );

  // Gruppera fornborgslistan i hopfällbara ÅLDERS-era-sektioner (Daniel: "ålderskategoriserat").
  // Åldern läses ur period-texten via eraRank; odaterade = egen synlig hink (fejka ej ålder; TYP≠ÅLDER).
  const ERA_BUCKETS: { key: string; label: string; test: (r: number) => boolean }[] = [
    { key: 'bronze',     label: sv ? 'Bronsålder & äldre' : 'Bronze Age & earlier',         test: (r) => r <= -1000 },
    { key: 'early_iron', label: sv ? 'Äldre / romersk järnålder' : 'Early / Roman Iron Age', test: (r) => r > -1000 && r < 400 },
    { key: 'migration',  label: sv ? 'Folkvandringstid' : 'Migration Period',                test: (r) => r >= 400 && r < 550 },
    { key: 'vendel',     label: sv ? 'Vendeltid' : 'Vendel Period',                           test: (r) => r >= 550 && r < 800 },
    { key: 'viking',     label: sv ? 'Vikingatid' : 'Viking Age',                             test: (r) => r >= 800 && r < 1100 },
    { key: 'medieval',   label: sv ? 'Medeltid' : 'Medieval',                                 test: (r) => r >= 1100 && r < 999998 },
    { key: 'undated',    label: sv ? 'Odaterade' : 'Undated',                                 test: (r) => r >= 999998 },
  ];
  const hillfortGroups = ERA_BUCKETS
    .map((b) => ({ ...b, items: visibleHillforts.filter((h) => b.test(eraRank(h.period))) }))
    .filter((g) => g.items.length > 0);
  // Default: alla grupper öppna (översikt); användaren kan fälla ihop en era.
  const [closedEras, setClosedEras] = useState<Set<string>>(new Set());
  const toggleEra = (k: string) => setClosedEras((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Map state
  const [showFortresses, setShowFortresses] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showMedieval, setShowMedieval] = useState(true);
  const [showBeacons, setShowBeacons] = useState(false);
  const [highlightedLocation, setHighlightedLocation] = useState<{ id: string; type: 'fortress' | 'city' | 'hillfort' } | null>(null);

  const fortressTypes = [
    { value: 'all', label: L.allTypes },
    { value: 'ring_fortress', label: L.ringForts },
    { value: 'hillfort', label: L.hillforts },
    { value: 'longphort', label: L.longphorts },
    { value: 'royal_center', label: L.royalCentres },
    { value: 'coastal_defense', label: L.coastalDef },
    { value: 'trading_post_fortress', label: L.fortTrade },
    { value: 'linear_defense', label: L.linearDef }
  ];

  const cityCategories = [
    { value: 'all', label: L.allCategories },
    { value: 'established_city', label: L.estCities },
    { value: 'trading_post', label: L.tradingPosts },
    { value: 'religious_center', label: L.relCentres },
    { value: 'gotlandic_center', label: L.gotlandicCentres },
    { value: 'koping', label: L.kopings }
  ];

  const filteredFortresses = fortresses
    .filter(f => selectedFortressType === 'all' || f.fortress_type === selectedFortressType)
    .filter(f => selectedFortressRegion === 'all' || (f.region || f.country) === selectedFortressRegion);

  const filteredCities = (cities || [])
    .filter(c => selectedCityCategory === 'all' || c.category === selectedCityCategory)
    .filter(c => selectedCityRegion === 'all' || (c.region || c.country) === selectedCityRegion);

  // Regioner för filterrader (fästningar/centra saknar svenska landskap → region ⇒ land som fallback).
  const fortressRegions = Array.from(new Set(fortresses.map(f => f.region || f.country).filter(Boolean))).sort();
  const cityRegions = Array.from(new Set((cities || []).map(c => c.region || c.country).filter(Boolean))).sort();

  const toggleExpanded = (id: string) => setExpandedCard(prev => (prev === id ? null : id));

  const getFortressTypeLabel = (type: string) => {
    const typeInfo = fortressTypes.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  const getFortressTypeIcon = (type: string) => {
    switch (type) {
      case 'ring_fortress': return <Shield className="h-4 w-4" />;
      case 'royal_center': return <Crown className="h-4 w-4" />;
      case 'trading_post_fortress': return <Anchor className="h-4 w-4" />;
      case 'hillfort': return <Castle className="h-4 w-4" />;
      case 'longphort': return <Building className="h-4 w-4" />;
      default: return <Castle className="h-4 w-4" />;
    }
  };

  const getCityIcon = (category: string) => {
    switch (category) {
      case 'established_city': return <Building className="h-4 w-4" />;
      case 'trading_post': return <Anchor className="h-4 w-4" />;
      case 'religious_center': return <Crown className="h-4 w-4" />;
      case 'gotlandic_center': return <Shield className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  // Map interaction handlers
  const handleLocationClick = (location: any, type: 'fortress' | 'city' | 'hillfort') => {
    setHighlightedLocation({ id: location.id, type });
    
    // Scroll to corresponding card
    const element = document.getElementById(`${type}-${location.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (locationId: string, type: 'fortress' | 'city') => {
    setHighlightedLocation({ id: locationId, type });
  };

  const handleCardLeave = () => {
    setHighlightedLocation(null);
  };

  const isLoading = fortressesLoading || citiesLoading;
  const hasError = fortressesError || citiesError;

  if (isLoading) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground">{t('loadingFortressesCities')}</div>
        </main>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400">
            {L.loadError}: {String(fortressesError || citiesError)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Borgar & fornborgar"
        titleEn="Fortresses"
        description="Utforska vikingatida borgar, handelscentra och fornborgar i Skandinavien. Interaktiva kartor med detaljerad information om varje plats."
        descriptionEn="Explore Viking Age fortresses, trade centres and hillforts in Scandinavia. Interactive maps with detailed information about each location."
        keywords="vikingaborgar, fornborgar, vikingastäder, vikingatid, arkeologi, skandinavisk historia"
      />
      <Header />
      <Breadcrumbs />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Castle className="h-8 w-8 text-gold" />
            {t('fortressesCitiesTitle')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('fortressesCitiesDescription')}
          </p>
          {/* Forensiskt fingerprint-verktyg för fornborgar: beskrivning (+ bild) → typologi/datering/funktion. */}
          <div className="mt-4">
            <FingerprintDialog kind="fornborg" />
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              {language === 'sv'
                ? 'Skicka en beskrivning (och valfritt en bild) av en fornborg → forensisk fingerprint: typologi, byggnadstradition, trolig datering och funktion. Forskningsstöd — kontrollera mot källor.'
                : 'Submit a description (and optionally an image) of a hillfort → a forensic fingerprint: typology, construction tradition, likely dating and function. A research aid — verify against sources.'}
            </p>
          </div>
        </div>

        {/* Källförd typologi-ryggrad: fornborg → vikingaborg → kastal → riksborg → adelsborg/fast hus → fästning */}
        <FortificationTypology
          sv={sv}
          counts={{ fornborg: hillforts.length, vikingaborg: fortresses.length, kastal: kastalCount, riksborg: medievalCastles.length }}
        />

        {/* Hybrid Layout: Map on top */}
        <div className="mb-8">
          <FortressesCitiesMap
            fortresses={fortresses}
            cities={cities || []}
            hillforts={visibleHillforts}
            medievalCastles={medievalCastles}
            beacons={beacons}
            onLocationClick={handleLocationClick}
            highlightedLocation={highlightedLocation}
            showFortresses={showFortresses}
            showCities={showCities}
            showHillforts={showHillforts}
            showMedieval={showMedieval}
            showBeacons={showBeacons}
            onToggleFortresses={() => setShowFortresses(!showFortresses)}
            onToggleCities={() => setShowCities(!showCities)}
            onToggleHillforts={() => setShowHillforts(!showHillforts)}
            onToggleMedieval={() => setShowMedieval(!showMedieval)}
            onToggleBeacons={() => setShowBeacons(!showBeacons)}
          />
        </div>

        <Tabs defaultValue="hillforts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="hillforts" className="flex items-center gap-2">
              <Castle className="h-4 w-4" />
              {L.swedishHillforts} ({hillforts.length})
            </TabsTrigger>
            <TabsTrigger value="fortresses" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {L.vikingFortifications} ({fortresses.length})
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {L.cities} ({cities?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hillforts" className="space-y-6">
            <FortGoldTerritoryCard sv={sv} />
            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Castle className="h-5 w-5 text-gold" />
                  {L.swedishHillforts}
                </CardTitle>
                <CardDescription>
                  {L.hillfortsDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">{hillforts.length}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {new Set(hillforts.map(h => h.landscape)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.landscapeN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {hillforts.filter(h => h.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.confirmedN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {new Set(hillforts.map(h => h.municipality)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.municipalities}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {['all', ...Array.from(new Set(hillforts.map(h => h.landscape))).sort()].map((landscape) => (
                <Button
                  key={landscape}
                  variant={selectedLandscape === landscape ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLandscape(landscape)}
                  className="text-sm"
                >
                  {landscape === 'all' ? L.allLandscapes : landscape}
                  {landscape !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {hillforts.filter(h => h.landscape === landscape).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">{sv ? 'Sortera:' : 'Sort:'}</span>
              {([['landscape', sv ? 'Landskap' : 'Landscape'], ['age', sv ? 'Ålder' : 'Age'], ['runestones', sv ? 'Runstenar i närheten' : 'Nearby runestones'], ['inge', sv ? '-inge-bygd' : '-inge settlement'], ['height', sv ? 'Läge (höjd)' : 'Position (height)']] as const).map(([key, label]) => (
                <Button key={key} variant={hillfortSort === key ? 'default' : 'outline'} size="sm" onClick={() => setHillfortSort(key)}>{label}</Button>
              ))}
              <Button
                variant={onlyNearInge ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOnlyNearInge(v => !v)}
                title={sv ? 'Visa bara fornborgar inom 2 km från ett -inge-namn (gammal bebyggelse)' : 'Show only hillforts within 2 km of an -inge name'}
              >
                {sv ? 'Endast nära -inge (≤2 km)' : 'Only near -inge (≤2 km)'}
              </Button>
            </div>

            {/* Funktionsfacet (försvar vs handel & skatt). Evidensbaserad — mestadels oklassificerad än. */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">{sv ? 'Funktion:' : 'Function:'}</span>
              {([['all', sv ? 'Alla' : 'All'], ['defense', sv ? 'Försvar' : 'Defense'], ['control_trade', sv ? 'Handel & skatt' : 'Trade & tax'], ['none', sv ? 'Oklassificerad' : 'Unclassified']] as const).map(([key, label]) => {
                const n = key === 'all' ? hillforts.length : key === 'none' ? hillforts.filter(h => !h.fort_function).length : hillforts.filter(h => h.fort_function === key).length;
                return (
                  <Button key={key} variant={fortFunc === key ? 'default' : 'outline'} size="sm" onClick={() => setFortFunc(key)}>
                    {label}<Badge variant="secondary" className="ml-1">{n}</Badge>
                  </Button>
                );
              })}
            </div>

            {/* Jordmån & läge (SGU-jordart + DEM-prominens). Fylls av sample-fort-terrain.mjs. */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">{sv ? 'Jordmån:' : 'Soil:'}</span>
              {([['all', sv ? 'Alla' : 'All'], ['bördig', sv ? 'Bördig' : 'Fertile'], ['moderat', sv ? 'Moderat' : 'Moderate'], ['mager', sv ? 'Mager' : 'Poor'], ['våtmark', sv ? 'Våtmark' : 'Wetland']] as const).map(([key, label]) => {
                const n = key === 'all' ? hillforts.length : hillforts.filter(h => h.soil_fertility === key).length;
                return (
                  <Button key={key} variant={soilFilter === key ? 'default' : 'outline'} size="sm" onClick={() => setSoilFilter(key)}>
                    {label}<Badge variant="secondary" className="ml-1">{n}</Badge>
                  </Button>
                );
              })}
              <Button
                variant={onlyOnHeight ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOnlyOnHeight(v => !v)}
                title={sv ? 'Byggd på höjd (prominens ≥12 m över omgivningen, DEM)' : 'Built on a height (≥12 m prominence, DEM)'}
              >
                {sv ? 'På höjd' : 'On height'}<Badge variant="secondary" className="ml-1">{hillforts.filter(h => h.on_height === true).length}</Badge>
              </Button>
            </div>

            {/* Tidsslider — baserad på belagda dateringar (C14/typologi). */}
            <div className="mt-3 p-3 rounded border border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{sv ? 'Tidsperiod' : 'Time period'}: {yearFmt(periodRange[0])} – {yearFmt(periodRange[1])}</span>
                <Button variant={includeUndated ? 'default' : 'outline'} size="sm" onClick={() => setIncludeUndated(v => !v)}>
                  {sv ? 'Inkl. odaterade' : 'Incl. undated'}
                </Button>
              </div>
              <Slider min={-3000} max={1400} step={10} value={periodRange} onValueChange={(v) => setPeriodRange([v[0], v[1]])} className="w-full" />
              <p className="text-[11px] text-muted-foreground mt-1">
                {sv
                  ? 'Bygger på belagda dateringar (C14/typologi) — endast ~23 borgar är daterade; övriga räknas som odaterade och styrs av knappen ovan.'
                  : 'Based on documented datings (C14/typology) — only ~23 forts are dated; the rest count as undated, toggled above.'}
              </p>
            </div>

            {hillfortGroups.map((grp) => (
              <section key={grp.key} className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleEra(grp.key)}
                  aria-expanded={!closedEras.has(grp.key)}
                  className="flex w-full items-center gap-2 text-left border-b border-border/60 pb-2 mb-4"
                >
                  {closedEras.has(grp.key) ? <ChevronRight className="h-4 w-4 text-gold" /> : <ChevronDown className="h-4 w-4 text-gold" />}
                  <span className="text-lg font-semibold text-foreground">{grp.label}</span>
                  <span className="text-sm text-muted-foreground">({grp.items.length})</span>
                </button>
                {!closedEras.has(grp.key) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grp.items.map((hillfort) => (
                <Card
                  key={hillfort.id}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    expandedCard === `hillfort-${hillfort.id}` ? 'ring-2 ring-gold' : ''
                  }`}
                  onClick={() => toggleExpanded(`hillfort-${hillfort.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      <Castle className="h-4 w-4" />
                      {hillfort.name || L.namelessHillfort}
                    </CardTitle>
                    <a href={`/fortresses/${hillfort.id}`} onClick={(e) => e.stopPropagation()}
                       className="text-xs text-gold hover:underline w-fit">
                      {sv ? 'Detaljvy — karta, geologi, fakta →' : 'Detail view — map, geology, facts →'}
                    </a>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedLandscape(hillfort.landscape); }}
                        title={sv ? `Visa alla i ${hillfort.landscape}` : `Show all in ${hillfort.landscape}`}
                      >
                        <Badge variant="secondary" className="text-xs hover:bg-gold/30 transition-colors">
                          {hillfort.landscape}
                        </Badge>
                      </button>
                      <Badge variant="outline" className="text-xs">
                        {hillfort.raa_number}
                      </Badge>
                      {hillfort.status === 'confirmed' && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          {L.confirmed}
                        </Badge>
                      )}
                      {ingeByFort.get(hillfort.id)?.nearest_inge && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500/40 text-amber-200"
                          title={sv
                            ? 'Närmaste -inge-namn (gammal bebyggelse, ofta äldre järnålder). Bygdkoppling — samlokalisering ≤2 km är en hypotes, inte en datering av borgen.'
                            : 'Nearest -inge settlement name (often Early Iron Age). Landscape association — co-location ≤2 km is a hypothesis, not a dating of the fort.'}
                        >
                          -inge: {ingeByFort.get(hillfort.id)!.nearest_inge} ({Math.round(ingeByFort.get(hillfort.id)!.inge_distance_m ?? 0)} m)
                        </Badge>
                      )}
                      {hillfort.fort_function && (
                        <Badge
                          variant="outline"
                          className="text-xs border-sky-500/40 text-sky-200"
                          title={sv ? 'Belagd funktion (evidensbaserad klassning)' : 'Documented function (evidence-based)'}
                        >
                          {hillfort.fort_function === 'defense' ? (sv ? 'Försvar' : 'Defense')
                            : hillfort.fort_function === 'control_trade' ? (sv ? 'Handel & skatt' : 'Trade & tax')
                            : hillfort.fort_function}
                        </Badge>
                      )}
                      {hillfort.soil_fertility && !['ingen_täckning', 'okänd'].includes(hillfort.soil_fertility) && (
                        <Badge
                          variant="outline"
                          className="text-xs border-lime-600/40 text-lime-200"
                          title={hillfort.soil_jordart ? `SGU jordart: ${hillfort.soil_jordart}` : undefined}
                        >
                          {hillfort.soil_fertility}
                        </Badge>
                      )}
                      {hillfort.on_height && (
                        <Badge
                          variant="outline"
                          className="text-xs border-stone-500/40 text-stone-200"
                          title={hillfort.rel_height_m != null ? `+${Math.round(hillfort.rel_height_m)} m över omgivningen (DEM-prominens)` : undefined}
                        >
                          {sv ? 'På höjd' : 'On height'}{hillfort.rel_height_m != null ? ` +${Math.round(hillfort.rel_height_m)} m` : ''}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hillfort.description && (
                      <p className="text-sm text-muted-foreground">
                        {hillfort.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {hillfort.parish && `${hillfort.parish}, `}
                          {hillfort.municipality}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">
                          {hillfort.coordinates ? `${hillfort.coordinates.lat.toFixed(5)}°N ${hillfort.coordinates.lng.toFixed(5)}°E` : '—'}
                        </span>
                      </div>
                    </div>

                    {(hillfort.cultural_significance || hillfort.period) && (
                      <div className="pt-2 border-t border-border">
                        {hillfort.period && (
                          <p className="text-xs text-muted-foreground mb-1">
                            <strong>{L.period}:</strong> {hillfort.period}
                            {hillfort.dating_confidence && (
                              <span
                                className={`ml-2 px-1.5 py-0.5 rounded border text-[10px] align-middle ${
                                  hillfort.dating_confidence === 'belagd' ? 'border-emerald-500 text-emerald-300'
                                    : hillfort.dating_confidence === 'omtvistad' ? 'border-rose-500 text-rose-300'
                                    : 'border-amber-500 text-amber-300'
                                }`}
                                title={hillfort.dating_basis || undefined}
                              >
                                {hillfort.dating_confidence}
                              </span>
                            )}
                          </p>
                        )}
                        {hillfort.cultural_significance && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{L.culturalSig}:</strong> {hillfort.cultural_significance}
                          </p>
                        )}
                      </div>
                    )}

                    {expandedCard === `hillfort-${hillfort.id}` && (
                      <div className="pt-2 border-t border-border space-y-2">
                        {(findsByFort.get(hillfort.id)?.length ?? 0) > 0 && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-1">{sv ? 'Fynd & datering' : 'Finds & dating'}:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {findsByFort.get(hillfort.id)!.map((f, i) => (
                                <li key={i}>
                                  <span className="text-sky-300">{f.find_type}</span>
                                  {f.c14_raw ? ` ${f.c14_raw}` : ''}
                                  {f.label ? ` — ${f.label}` : ''}
                                  {f.description ? `: ${f.description}` : ''}
                                  {f.source_ref ? ` (${f.source_ref})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {hillfort.dating_basis && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{sv ? 'Dateringsgrund' : 'Dating basis'}:</strong> {hillfort.dating_basis}
                            {hillfort.dating_source ? ` — ${hillfort.dating_source}` : ''}
                          </p>
                        )}
                        {(hillfort.parish || hillfort.municipality) && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{sv ? 'Socken' : 'Parish'}:</strong> {[hillfort.parish, hillfort.municipality, hillfort.landscape].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {hillfort.nearby_runestones != null && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{sv ? 'Runstenar inom 3 km' : 'Runestones within 3 km'}:</strong> {hillfort.nearby_runestones}
                          </p>
                        )}
                        {hillfort.raa_number && (
                          <p className="text-xs text-muted-foreground"><strong>RAÄ:</strong> {hillfort.raa_number}</p>
                        )}
                        <a
                          href={hillfort.coordinates ? `/explore?center=${hillfort.coordinates.lat},${hillfort.coordinates.lng}&zoom=14` : '/fortresses'}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          {sv ? 'Utforska i kartan' : 'Explore on map'}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {(selectedLandscape === 'all' ? hillforts : hillforts.filter(h => h.landscape === selectedLandscape)).length === 0 && (
              <Card className="viking-card">
                <CardContent className="text-center py-8">
                  <Castle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{L.noHillforts}</h3>
                  <p className="text-muted-foreground">
                    {L.noHillfortsDesc}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fortresses" className="space-y-6">
            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Castle className="h-5 w-5 text-gold" />
                  {L.fortsOverview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">{fortresses.length}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {fortresses.filter(f => f.excavated).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.excavatedN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {fortresses.filter(f => f.unesco_site).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.unescoSites}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {new Set(fortresses.map(f => f.country)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.countries}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {fortressTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedFortressType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFortressType(type.value)}
                  className="text-sm"
                >
                  {type.label}
                  {type.value !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {fortresses.filter(f => f.fortress_type === type.value).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Regionfilter — klick på en region visar bara dess befästningar. */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFortressRegion === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFortressRegion('all')}
                className="text-sm"
              >
                {L.allLandscapes}
              </Button>
              {fortressRegions.map((region) => (
                <Button
                  key={region}
                  variant={selectedFortressRegion === region ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFortressRegion(region)}
                  className="text-sm"
                >
                  {region}
                  <Badge variant="secondary" className="ml-2">
                    {fortresses.filter(f => (f.region || f.country) === region).length}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFortresses.map((fortress) => (
                <Card
                  key={fortress.id}
                  id={`fortress-${fortress.id}`}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    (highlightedLocation?.id === fortress.id && highlightedLocation?.type === 'fortress') ||
                    expandedCard === `fortress-${fortress.id}`
                      ? 'ring-2 ring-gold'
                      : ''
                  }`}
                  onMouseEnter={() => handleCardHover(fortress.id, 'fortress')}
                  onMouseLeave={handleCardLeave}
                  onClick={() => toggleExpanded(`fortress-${fortress.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      {getFortressTypeIcon(fortress.fortress_type)}
                      {fortress.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {getFortressTypeLabel(fortress.fortress_type)}
                      </Badge>
                      {fortress.unesco_site && (
                        <Badge variant="default" className="text-xs bg-accent">
                          UNESCO
                        </Badge>
                      )}
                      {fortress.excavated && (
                        <Badge variant="outline" className="text-xs">
                          {L.excavated}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {fortress.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedFortressRegion(fortress.region || fortress.country); }}
                          className="hover:text-gold hover:underline transition-colors"
                          title={sv ? 'Visa alla i regionen' : 'Show all in region'}
                        >
                          {fortress.country}{fortress.region && `, ${fortress.region}`}
                        </button>
                      </div>

                      {fortress.construction_period && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{fortress.construction_period}</span>
                        </div>
                      )}
                      
                      {fortress.diameter_meters && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ruler className="h-4 w-4" />
                          <span>{L.diameter}: {fortress.diameter_meters}m</span>
                        </div>
                      )}
                      
                      {fortress.area_hectares && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ruler className="h-4 w-4" />
                          <span>{L.area}: {fortress.area_hectares} {L.hectares}</span>
                        </div>
                      )}
                    </div>

                    {/* Klickbar → borgens egen sida (Daniel: kunna läsa mer). /fortresses/:id resolvar
                        viking_fortresses via FortressDetails fallback. */}
                    <a
                      href={`/fortresses/${fortress.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
                    >
                      {sv ? 'Läs mer om borgen' : 'Read more'} →
                    </a>

                    {fortress.historical_significance && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <strong>{L.historicalSig}:</strong> {fortress.historical_significance}
                        </p>
                      </div>
                    )}

                    {expandedCard === `fortress-${fortress.id}` && (
                      <div className="pt-2 border-t border-border space-y-2">
                        {(fortress.construction_start || fortress.construction_end) && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{L.period}:</strong> {fortress.construction_start ?? '?'}–{fortress.construction_end ?? '?'}
                          </p>
                        )}
                        {fortress.status && (
                          <p className="text-xs text-muted-foreground"><strong>Status:</strong> {fortress.status}</p>
                        )}
                        <span className="block text-xs font-mono text-muted-foreground">
                          {fortress.coordinates ? `${fortress.coordinates.lat.toFixed(5)}°N ${fortress.coordinates.lng.toFixed(5)}°E` : '—'}
                        </span>
                        <a
                          href={fortress.coordinates ? `/explore?lat=${fortress.coordinates.lat}&lng=${fortress.coordinates.lng}` : '/fortresses'}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          {sv ? 'Utforska i kartan' : 'Explore on map'}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFortresses.length === 0 && (
              <Card className="viking-card">
                <CardContent className="text-center py-8">
                  <Castle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{L.noForts}</h3>
                  <p className="text-muted-foreground">
                    {L.noFortsDesc}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cities" className="space-y-6">
            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5 text-gold" />
                  {L.citiesOverview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">{cities?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {cities?.filter(c => c.unesco_site).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.unescoSites}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {cities?.filter(c => c.category === 'trading_post').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.tradingPosts}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">
                      {new Set(cities?.map(c => c.country) || []).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.countries}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {cityCategories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCityCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCityCategory(category.value)}
                  className="text-sm"
                >
                  {category.label}
                  {category.value !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {(cities || []).filter(c => c.category === category.value).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Regionfilter — klick på en region visar bara dess centra. */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCityRegion === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCityRegion('all')}
                className="text-sm"
              >
                {L.allLandscapes}
              </Button>
              {cityRegions.map((region) => (
                <Button
                  key={region}
                  variant={selectedCityRegion === region ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCityRegion(region)}
                  className="text-sm"
                >
                  {region}
                  <Badge variant="secondary" className="ml-2">
                    {(cities || []).filter(c => (c.region || c.country) === region).length}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => (
                <Card
                  key={city.id}
                  id={`city-${city.id}`}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    (highlightedLocation?.id === city.id && highlightedLocation?.type === 'city') ||
                    expandedCard === `city-${city.id}`
                      ? 'ring-2 ring-gold'
                      : ''
                  }`}
                  onMouseEnter={() => handleCardHover(city.id, 'city')}
                  onMouseLeave={handleCardLeave}
                  onClick={() => toggleExpanded(`city-${city.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      {getCityIcon(city.category)}
                      {city.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: getCategoryColor(city.category) + '20', color: getCategoryColor(city.category) }}
                      >
                        {getCategoryLabel(city.category)}
                      </Badge>
                      {city.unesco_site && (
                        <Badge variant="default" className="text-xs bg-accent">
                          UNESCO
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {city.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedCityRegion(city.region || city.country); }}
                          className="hover:text-gold hover:underline transition-colors"
                          title={sv ? 'Visa alla i regionen' : 'Show all in region'}
                        >
                          {city.country}{city.region && `, ${city.region}`}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{city.period_start} - {city.period_end}</span>
                      </div>
                      
                      {city.population_estimate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{L.population}: ~{city.population_estimate}</span>
                        </div>
                      )}
                    </div>

                    {city.historical_significance && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <strong>{L.historicalSig}:</strong> {city.historical_significance}
                        </p>
                      </div>
                    )}

                    {expandedCard === `city-${city.id}` && (
                      <div className="pt-2 border-t border-border space-y-2">
                        <span className="block text-xs font-mono text-muted-foreground">
                          {city.coordinates ? `${city.coordinates.lat.toFixed(5)}°N ${city.coordinates.lng.toFixed(5)}°E` : '—'}
                        </span>
                        <a
                          href={city.coordinates ? `/explore?lat=${city.coordinates.lat}&lng=${city.coordinates.lng}` : '/fortresses'}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          {sv ? 'Utforska i kartan' : 'Explore on map'}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCities.length === 0 && (
              <Card className="viking-card">
                <CardContent className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{L.noCities}</h3>
                  <p className="text-muted-foreground">
                    {L.noCitiesDesc}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Fortresses;
