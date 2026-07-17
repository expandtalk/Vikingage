import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TradeRoute } from '@/data/tradeRoutes';
import { TRADE_GOODS } from '@/data/tradeGoods';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveExploreProfile } from '@/hooks/useExploreProfiles';
import { layerEmphasis, emphasisStyle } from '@/config/exploreProfiles';

interface TradeRoutesLayerProps {
  map: L.Map | null;
  routes: TradeRoute[];
  isVisible: boolean;
  onRouteClick?: (route: TradeRoute) => void;
}

export const TradeRoutesLayer: React.FC<TradeRoutesLayerProps> = ({
  map,
  routes,
  isVisible,
  onRouteClick
}) => {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const { language } = useLanguage();

  const activeProfile = useActiveExploreProfile();
  const emphasis = emphasisStyle(layerEmphasis(activeProfile, 'trade_routes'));

  useEffect(() => {
    if (!map || !isVisible) {
      if (layerGroupRef.current) {
        map?.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
      return;
    }

    console.log('🚢 Trade Routes Layer rendering:', {
      routeCount: routes.length,
      routes: routes.map(r => r.name),
      isVisible
    });

    // Create layer group
    const layerGroup = L.layerGroup();
    
    routes.forEach(route => {
      // Create polyline for route
      const coordinates: [number, number][] = route.coordinates.map(
        coord => [coord.lat, coord.lng]
      );

      const baseOpacity = 0.7;
      const polyline = L.polyline(coordinates, {
        color: route.color,
        weight: 4,
        opacity: baseOpacity * emphasis.opacity,
        className: 'trade-route-line',
        // Add dashed pattern to show direction
        dashArray: '10, 5'
      });

      // Get goods for this route
      const goods = TRADE_GOODS.filter(good => 
        route.goods.some(g => g.toLowerCase().includes(good.id))
      );

      const goodsList = goods.map(good => 
        `<span style="color: ${good.color}; font-weight: 500;">● ${language === 'sv' ? good.name : good.nameEn}</span>`
      ).join(', ');

      // Create popup
      const popupContent = `
        <div style="min-width: 280px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${route.color};">
            → ${language === 'sv' ? route.name : route.nameEn}
          </h3>
          <div style="margin-bottom: 8px; padding: 6px; background: rgba(0,0,0,0.05); border-radius: 4px;">
            <strong>${language === 'sv' ? 'Tidsperiod' : 'Time Period'}:</strong> ${route.period}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>${language === 'sv' ? 'Varor' : 'Goods'}:</strong><br/>
            ${goodsList}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>${language === 'sv' ? 'Destinationer' : 'Destinations'}:</strong><br/>
            ${route.destinations.join(', ')}
          </div>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;">
            ${language === 'sv' ? route.description : route.descriptionEn}
          </p>
        </div>
      `;

      polyline.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'trade-route-popup'
      });

      // Add hover tooltip
      polyline.bindTooltip(
        `→ ${language === 'sv' ? route.name : route.nameEn}`,
        {
          permanent: false,
          sticky: true,
          className: 'trade-route-tooltip'
        }
      );

      // Add click handler
      if (onRouteClick) {
        polyline.on('click', () => onRouteClick(route));
      }

      // Add to layer group
      layerGroup.addLayer(polyline);

      // Add city markers
      route.coordinates.forEach(coord => {
        if (coord.isCity) {
          const marker = L.circleMarker([coord.lat, coord.lng], {
            radius: 6,
            fillColor: route.color,
            color: '#ffffff',
            weight: 2,
            opacity: 1 * emphasis.opacity,
            fillOpacity: 0.8 * emphasis.opacity
          });

          marker.bindTooltip(
            coord.nameEn && language === 'en' ? coord.nameEn : coord.name,
            { permanent: false, direction: 'top' }
          );

          layerGroup.addLayer(marker);
        }

        if (coord.isPortage) {
          const portageMarker = L.circleMarker([coord.lat, coord.lng], {
            radius: 5,
            fillColor: '#f59e0b',
            color: '#ffffff',
            weight: 2,
            opacity: 1 * emphasis.opacity,
            fillOpacity: 0.9 * emphasis.opacity,
            className: 'portage-marker'
          });

          portageMarker.bindTooltip(
            `⚓ ${coord.nameEn && language === 'en' ? coord.nameEn : coord.name}`,
            { permanent: false, direction: 'top' }
          );

          layerGroup.addLayer(portageMarker);
        }
      });
    });

    layerGroup.addTo(map);
    layerGroupRef.current = layerGroup;

    return () => {
      if (layerGroupRef.current && map) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [map, routes, isVisible, onRouteClick, language, emphasis.opacity]);

  return null;
};
