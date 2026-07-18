
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Castle, Shield, Users, Ruler, Building, Anchor, Crown } from "lucide-react";
import { useVikingFortresses } from '../hooks/useVikingFortresses';
import { useVikingCities, getCategoryColor, getCategoryLabel } from '../hooks/useVikingCities';
import { useSwedishHillforts } from '../hooks/useSwedishHillforts';
import { FortressesCitiesMap } from '../components/fortresses/FortressesCitiesMap';
import { bulkImportSwedishHillforts } from '../utils/swedishHillfortsBulkImport';
import { bulkImportExtendedSwedishHillforts } from '../utils/swedishHillfortsBulkImportExtended';
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
        cities: 'Städer', hillfortsDesc: 'Fornborgar från hela Sverige med RAÄ-nummer och historisk dokumentation',
        total: 'Totalt antal', landscapeN: 'Landskap', confirmedN: 'Bekräftade', municipalities: 'Kommuner',
        importing: 'Importerar…', importOlandSmaland: 'Importera Öland & Småland', importNarkeUppland: 'Importera Närke & Uppland',
        allLandscapes: 'Alla landskap', namelessHillfort: 'Namnlös fornborg', confirmed: 'Bekräftad',
        period: 'Period', culturalSig: 'Kulturell betydelse', noHillforts: 'Inga fornborgar hittades',
        noHillfortsDesc: 'Inga fornborgar från det valda landskapet hittades.',
        fortsOverview: 'Befästningar översikt', excavatedN: 'Utgrävda', unescoSites: 'UNESCO-platser', countries: 'Länder',
        unescoBadge: 'UNESCO', excavated: 'Utgrävd', diameter: 'Diameter', area: 'Yta', hectares: 'hektar',
        historicalSig: 'Historisk betydelse', noForts: 'Inga befästningar hittades',
        noFortsDesc: 'Inga befästningar av den valda typen hittades.',
        citiesOverview: 'Städer översikt', population: 'Befolkning', noCities: 'Inga städer hittades',
        noCitiesDesc: 'Inga städer av den valda kategorin hittades.',
      }
    : {
        allTypes: 'All types', ringForts: 'Ring fortresses', hillforts: 'Hillforts', longphorts: 'Longphorts',
        royalCentres: 'Royal centres', coastalDef: 'Coastal defence', fortTrade: 'Fortified trading posts', linearDef: 'Linear defences',
        allCategories: 'All categories', estCities: 'Established cities', tradingPosts: 'Trading posts',
        relCentres: 'Religious centres', gotlandicCentres: 'Gotlandic centres', kopings: 'Market towns',
        loadError: 'Error loading', swedishHillforts: 'Swedish hillforts', vikingFortifications: 'Viking Age fortifications',
        cities: 'Cities', hillfortsDesc: 'Hillforts from across Sweden with RAÄ numbers and historical documentation',
        total: 'Total', landscapeN: 'Provinces', confirmedN: 'Confirmed', municipalities: 'Municipalities',
        importing: 'Importing…', importOlandSmaland: 'Import Öland & Småland', importNarkeUppland: 'Import Närke & Uppland',
        allLandscapes: 'All provinces', namelessHillfort: 'Unnamed hillfort', confirmed: 'Confirmed',
        period: 'Period', culturalSig: 'Cultural significance', noHillforts: 'No hillforts found',
        noHillfortsDesc: 'No hillforts found for the selected province.',
        fortsOverview: 'Fortifications overview', excavatedN: 'Excavated', unescoSites: 'UNESCO sites', countries: 'Countries',
        unescoBadge: 'UNESCO', excavated: 'Excavated', diameter: 'Diameter', area: 'Area', hectares: 'hectares',
        historicalSig: 'Historical significance', noForts: 'No fortifications found',
        noFortsDesc: 'No fortifications of the selected type found.',
        citiesOverview: 'Cities overview', population: 'Population', noCities: 'No cities found',
        noCitiesDesc: 'No cities of the selected category found.',
      };
  const { fortresses, isLoading: fortressesLoading, error: fortressesError } = useVikingFortresses(true);
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useVikingCities(true);
  const { hillforts, isLoading: hillfortsLoading, error: hillfortsError } = useSwedishHillforts(true);
  const [selectedFortressType, setSelectedFortressType] = useState<string>('all');
  const [selectedCityCategory, setSelectedCityCategory] = useState<string>('all');
  const [selectedLandscape, setSelectedLandscape] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [showHillforts, setShowHillforts] = useState(true);
  
  // Map state
  const [showFortresses, setShowFortresses] = useState(true);
  const [showCities, setShowCities] = useState(true);
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

  const filteredFortresses = selectedFortressType === 'all' 
    ? fortresses 
    : fortresses.filter(f => f.fortress_type === selectedFortressType);

  const filteredCities = selectedCityCategory === 'all' 
    ? (cities || [])
    : (cities || []).filter(c => c.category === selectedCityCategory);

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
        title="Vikingaborgar"
        titleEn="Viking Fortresses"
        description="Utforska vikingatida borgar, städer och fornborgar i Skandinavien. Interaktiva kartor med detaljerad information om varje plats."
        descriptionEn="Explore Viking Age fortresses, cities and hillforts in Scandinavia. Interactive maps with detailed information about each location."
        keywords="vikingaborgar, fornborgar, vikingastäder, vikingatid, arkeologi, skandinavisk historia"
      />
      <Header />
      <Breadcrumbs />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Castle className="h-8 w-8 text-accent" />
            {t('fortressesCitiesTitle')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('fortressesCitiesDescription')}
          </p>
        </div>

        {/* Hybrid Layout: Map on top */}
        <div className="mb-8">
          <FortressesCitiesMap
            fortresses={fortresses}
            cities={cities || []}
            hillforts={hillforts}
            onLocationClick={handleLocationClick}
            highlightedLocation={highlightedLocation}
            showFortresses={showFortresses}
            showCities={showCities}
            showHillforts={showHillforts}
            onToggleFortresses={() => setShowFortresses(!showFortresses)}
            onToggleCities={() => setShowCities(!showCities)}
            onToggleHillforts={() => setShowHillforts(!showHillforts)}
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
            <Card className="viking-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Castle className="h-5 w-5 text-accent" />
                  {L.swedishHillforts}
                </CardTitle>
                <CardDescription>
                  {L.hillfortsDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{hillforts.length}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {new Set(hillforts.map(h => h.landscape)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.landscapeN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {hillforts.filter(h => h.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.confirmedN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {new Set(hillforts.map(h => h.municipality)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.municipalities}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={async () => {
                      setIsImporting(true);
                      try {
                        const result = await bulkImportSwedishHillforts();
                        console.log('Import result:', result);
                      } catch (error) {
                        console.error('Import error:', error);
                      } finally {
                        setIsImporting(false);
                      }
                    }}
                    disabled={isImporting}
                    variant="outline"
                    size="sm"
                  >
                    {isImporting ? L.importing : L.importOlandSmaland}
                  </Button>
                  <Button 
                    onClick={async () => {
                      setIsImporting(true);
                      try {
                        const result = await bulkImportExtendedSwedishHillforts();
                        console.log('Extended import result:', result);
                      } catch (error) {
                        console.error('Extended import error:', error);
                      } finally {
                        setIsImporting(false);
                      }
                    }}
                    disabled={isImporting}
                    variant="default"
                    size="sm"
                  >
                    {isImporting ? L.importing : L.importNarkeUppland}
                  </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedLandscape === 'all' ? hillforts : hillforts.filter(h => h.landscape === selectedLandscape)).map((hillfort) => (
                <Card key={hillfort.id} className="viking-card hover:bg-card/80 transition-colors animate-fade-in">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      <Castle className="h-4 w-4" />
                      {hillfort.name || L.namelessHillfort}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {hillfort.landscape}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {hillfort.raa_number}
                      </Badge>
                      {hillfort.status === 'confirmed' && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          {L.confirmed}
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
                          {hillfort.coordinates.lat.toFixed(5)}°N {hillfort.coordinates.lng.toFixed(5)}°E
                        </span>
                      </div>
                    </div>

                    {(hillfort.cultural_significance || hillfort.period) && (
                      <div className="pt-2 border-t border-border">
                        {hillfort.period && (
                          <p className="text-xs text-muted-foreground mb-1">
                            <strong>{L.period}:</strong> {hillfort.period}
                          </p>
                        )}
                        {hillfort.cultural_significance && (
                          <p className="text-xs text-muted-foreground">
                            <strong>{L.culturalSig}:</strong> {hillfort.cultural_significance}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

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
                  <Castle className="h-5 w-5 text-accent" />
                  {L.fortsOverview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{fortresses.length}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {fortresses.filter(f => f.excavated).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.excavatedN}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {fortresses.filter(f => f.unesco_site).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.unescoSites}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFortresses.map((fortress) => (
                <Card 
                  key={fortress.id} 
                  id={`fortress-${fortress.id}`}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    highlightedLocation?.id === fortress.id && highlightedLocation?.type === 'fortress' 
                      ? 'ring-2 ring-accent' 
                      : ''
                  }`}
                  onMouseEnter={() => handleCardHover(fortress.id, 'fortress')}
                  onMouseLeave={handleCardLeave}
                  onClick={() => handleLocationClick(fortress, 'fortress')}
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
                        <span>{fortress.country}{fortress.region && `, ${fortress.region}`}</span>
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

                    {fortress.historical_significance && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <strong>{L.historicalSig}:</strong> {fortress.historical_significance}
                        </p>
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
                  <Building className="h-5 w-5 text-accent" />
                  {L.citiesOverview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{cities?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">{L.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {cities?.filter(c => c.unesco_site).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.unescoSites}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {cities?.filter(c => c.category === 'trading_post').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{L.tradingPosts}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => (
                <Card 
                  key={city.id} 
                  id={`city-${city.id}`}
                  className={`viking-card hover:bg-card/80 transition-colors animate-fade-in cursor-pointer ${
                    highlightedLocation?.id === city.id && highlightedLocation?.type === 'city' 
                      ? 'ring-2 ring-accent' 
                      : ''
                  }`}
                  onMouseEnter={() => handleCardHover(city.id, 'city')}
                  onMouseLeave={handleCardLeave}
                  onClick={() => handleLocationClick(city, 'city')}
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
                        <span>{city.country}{city.region && `, ${city.region}`}</span>
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
