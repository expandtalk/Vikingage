
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useMapInitialization } from "@/hooks/useMapInitialization";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import { useVikingFortresses } from "@/hooks/useVikingFortresses";
import { useVikingCities } from "@/hooks/useVikingCities";
import { MapHeader } from "./MapHeader";
import { MapInfoPanel } from "./MapInfoPanel";
import { MapContainer } from "./MapContainer";
import { useMapData } from "./hooks/useMapData";
import { useMapCounts } from "./hooks/useMapCounts";
import { useMapValidation } from "./hooks/useMapValidation";
import { useMapNavigation } from "./hooks/useMapNavigation";
import { useMapLayers } from "./hooks/useMapLayers";
import { MapLegend } from "../MapLegend";
import { VikingRoadsRenderer } from "./layers/VikingRoadsRenderer";
import { TradeRoutesLayer } from "./layers/TradeRoutesLayer";
import { PlaceNamesLayer } from "./layers/PlaceNamesLayer";
import { PaleoShorelinesLayer } from "./layers/PaleoShorelinesLayer";
import { useTradeRoutes } from "@/hooks/useTradeRoutes";
import { InteractiveMapProps } from './types';
import 'leaflet/dist/leaflet.css';

export const MapCore: React.FC<InteractiveMapProps> = ({
  inscriptions,
  onMarkerClick,
  className = "",
  isVikingMode = false,
  enabledLegendItems = { runic_inscriptions: true },
  selectedPeriod = 'all',
  selectedTimePeriod = 'viking_age',
  onLegendDataChange,
  onMapNavigate,
  legendItems = [],
  onLegendToggle
}) => {

  useMapValidation({ selectedTimePeriod });

  // Trade routes integration - use timeline year
  const [tradeRoutesYear, setTradeRoutesYear] = React.useState(850);
  const { activeRoutes } = useTradeRoutes(tradeRoutesYear);

  const shouldLoadVikingData = selectedTimePeriod === 'viking_age';
  const { fortresses: vikingFortresses, isLoading: fortressesLoading } = useVikingFortresses(shouldLoadVikingData);
  const { data: vikingCities = [], isLoading: citiesLoading } = useVikingCities(shouldLoadVikingData);

  const {
    inscriptionsWithCoords,
    vikingRegions,
    germanicGroups,
    archaeologicalFinds,
    filteredCities,
    historicalEvents,
    eventsLoading
  } = useMapData({
    inscriptions,
    isVikingMode,
    selectedPeriod,
    selectedTimePeriod,
    shouldLoadVikingData,
    vikingCities
  });

  const { mapContainer, map, isMapReady } = useMapInitialization({
    isVikingMode,
    enabledLegendItems,
    selectedPeriod,
    selectedTimePeriod,
    inscriptions: inscriptionsWithCoords
  });

  const shouldShowTradeRoutes = enabledLegendItems.trade_routes !== false;
  
  console.log('🚢 Trade Routes MapCore:', {
    tradeRoutesYear,
    activeRoutesCount: activeRoutes.length,
    shouldShowTradeRoutes,
    trade_routes_enabled: enabledLegendItems.trade_routes,
    water_routes_enabled: enabledLegendItems.water_routes,
    selectedTimePeriod,
    isMapReady
  });

  useMapNavigation({ map, onMapNavigate });

  const { findCount } = useMapLayers({
    map,
    selectedTimePeriod,
    enabledLegendItems,
    isMapReady
  });
  
  const { generateLegendData } = useMapMarkers(
    map, 
    inscriptionsWithCoords, 
    onMarkerClick, 
    isVikingMode, 
    vikingFortresses,
    enabledLegendItems,
    selectedPeriod,
    selectedTimePeriod,
    historicalEvents,
    vikingCities
  );

  useMemo(() => {
    if (onLegendDataChange) {
      const legendData = generateLegendData();
      onLegendDataChange(legendData);
    }
  }, [generateLegendData, onLegendDataChange]);

  const { totalLocations, geoCount } = useMapCounts({
    inscriptionsWithCoords,
    germanicGroups,
    findCount,
    selectedTimePeriod,
    vikingFortresses,
    filteredCities,
    vikingRegions,
    isVikingMode
  });

  console.log(`InteractiveMap render: ${inscriptions.length} total inscriptions, ${inscriptionsWithCoords.length} with coordinates, ${vikingFortresses.length} fortresses, ${filteredCities.length}/${vikingCities.length} cities, ${vikingRegions.length} regions, ${germanicGroups.length} Germanic groups (chronologically validated), ${findCount} archaeological finds for period ${selectedTimePeriod}`);

  return (
    <div className="relative">
      <Card className={`bg-white/10 backdrop-blur-md border-white/20 ${className}`}>
        <MapHeader 
          isVikingMode={isVikingMode}
          totalLocations={totalLocations}
          geoCount={geoCount}
          selectedTimePeriod={selectedTimePeriod}
          totalInscriptions={inscriptions.length}
        />
        
        <CardContent className="p-0">
          <MapContainer mapContainer={mapContainer} />
          
          {/* Viking Roads Layer */}
          <VikingRoadsRenderer
            map={map}
            enabledLegendItems={enabledLegendItems}
            selectedTimePeriod={selectedTimePeriod}
            isMapReady={isMapReady}
          />

          {/* Trade Routes Layer */}
          <TradeRoutesLayer
            map={map}
            routes={activeRoutes}
            isVisible={shouldShowTradeRoutes && isMapReady}
          />

          {/* Place Names Layer (ortnamnslager / GIS-pilot) */}
          <PlaceNamesLayer
            map={map}
            enabledLegendItems={enabledLegendItems}
            isVisible={isMapReady}
          />

          {/* Dåtida strandlinje (SGU strandförskjutningsmodell) */}
          <PaleoShorelinesLayer
            map={map}
            enabledLegendItems={enabledLegendItems}
            selectedTimePeriod={selectedTimePeriod}
            isVisible={isMapReady}
          />

          <MapInfoPanel
            isVikingMode={isVikingMode}
            inscriptionsCount={inscriptionsWithCoords.length}
            fortressesCount={selectedTimePeriod === 'viking_age' ? vikingFortresses.length : 0}
            citiesCount={selectedTimePeriod === 'viking_age' ? filteredCities.length : 0}
            totalInscriptions={inscriptions.length}
            fortressesLoading={fortressesLoading}
            citiesLoading={citiesLoading}
          />
        </CardContent>
      </Card>

      {/* Legend is now handled by FloatingPanels - remove duplicate */}
    </div>
  );
};
