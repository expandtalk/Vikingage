
import { useMemo } from 'react';

interface LegendItem {
  id: string;
  label: string;
  color: string;
  count: number;
  enabled: boolean;
}

interface RunicInscription {
  id?: string;
  signum?: string;
  country?: string;
}

export const useLegendData = (
  inscriptions: RunicInscription[],
  isVikingMode: boolean,
  fortresses: any[] = [],
  enabledLegendItems: { [key: string]: boolean } = {},
  selectedTimePeriod: string = 'viking_age'
) => {
  const generateLegendData = useMemo(() => {
    return (): LegendItem[] => {
      const items: LegendItem[] = [];

      // Runic inscriptions - always show
      items.push({
        id: 'runic_inscriptions',
        label: 'Runstenar',
        color: '#ef4444',
        count: inscriptions.length,
        enabled: enabledLegendItems.runic_inscriptions !== false
      });

      // Religious places - now visible by default
      items.push({
        id: 'religious_places',
        label: 'Hedniska kultplatser',
        color: '#8b5cf6',
        count: 45,
        enabled: enabledLegendItems.religious_places !== false
      });

      // Germanic timeline - show in both modes but with different labels
      items.push({
        id: 'germanic_timeline',
        label: isVikingMode ? 'Germanska folkgrupper' : 'Germanska grupper',
        color: '#8b5cf6',
        count: 50, // Approximate
        enabled: enabledLegendItems.germanic_timeline !== false,
      });

      // River routes - only for Viking Age and Vendel Period
      if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period') {
        items.push({
          id: 'river_routes',
          label: 'Viktiga vattenvägar',
          color: '#1e40af',
          count: 12,
          enabled: enabledLegendItems.river_routes !== false
        });
      }

      // River systems from admin - always available
      items.push({
        id: 'river_systems',
        label: 'Flodsystem (Admin)',
        color: '#0ea5e9',
        count: 25,
        enabled: enabledLegendItems.river_systems !== false
      });

      // Archaeological finds - always show as option
      items.push({
        id: 'archaeological_finds',
        label: 'Arkeologiska fynd',
        color: '#059669',
        count: 25, // Approximate
        enabled: enabledLegendItems.archaeological_finds !== false
      });

      // Stake barriers - show as option for viking age
      if (selectedTimePeriod === 'viking_age') {
        items.push({
          id: 'stake_barriers',
          label: 'Spärrbarriärer',
          color: '#dc2626',
          count: 8,
          enabled: enabledLegendItems.stake_barriers !== false
        });
      }

      // Viking-specific items - only in Viking mode AND Viking Age
      if (isVikingMode && selectedTimePeriod === 'viking_age') {
        // Fortress types
        const fortressTypes = [
          { id: 'ring_fortress', label: 'Ringborgar', color: '#dc2626' },
          { id: 'hillfort', label: 'Bergfästen', color: '#ea580c' },
          { id: 'longphort', label: 'Longphorts', color: '#ca8a04' },
          { id: 'royal_center', label: 'Kungliga centra', color: '#16a34a' },
          { id: 'coastal_defense', label: 'Kustförsvar', color: '#0891b2' }
        ];

        fortressTypes.forEach(type => {
          const count = fortresses.filter(f => f.fortress_type === type.id).length;
          items.push({
            id: type.id,
            label: type.label,
            color: type.color,
            count: Math.max(count, 3), // Show at least 3 to indicate availability
            enabled: enabledLegendItems[type.id] !== false
          });
        });

        // Viking cities
        items.push({
          id: 'viking_cities',
          label: 'Vikingastäder',
          color: '#16a34a',
          count: 15,
          enabled: enabledLegendItems.viking_cities !== false
        });

        // Viking regions
        items.push({
          id: 'viking_regions',
          label: 'Vikingaregementer',
          color: '#7c3aed',
          count: 45,
          enabled: enabledLegendItems.viking_regions !== false
        });

        // Valdemar's route
        items.push({
          id: 'valdemar_route',
          label: 'Valdemars segelled',
          color: '#1e3a8a',
          count: 1,
          enabled: enabledLegendItems.valdemar_route !== false
        });
      } else {
        // Modern mode specific items
        if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period') {
          items.push({
            id: 'valdemar_route',
            label: 'Valdemars segelled',
            color: '#1e3a8a',
            count: 1,
            enabled: enabledLegendItems.valdemar_route !== false
          });
        }

        // Show additional discoverable options in modern mode
        items.push({
          id: 'viking_fortresses',
          label: 'Vikingabefästningar',
          color: '#dc2626',
          count: 25,
          enabled: enabledLegendItems.viking_fortresses !== false
        });

        items.push({
          id: 'trade_routes',
          label: 'Handelsrutter',
          color: '#059669',
          count: 18,
          enabled: enabledLegendItems.trade_routes !== false
        });
      }

      // Historical events - show for all time periods
      items.push({
        id: 'historical_events',
        label: 'Historiska händelser',
        color: '#FF6B6B',
        count: 0, // Will be updated when events are loaded
        enabled: enabledLegendItems?.historical_events || false
      });

      return items;
    };
  }, [inscriptions, isVikingMode, fortresses, enabledLegendItems, selectedTimePeriod]);

  return { generateLegendData };
};
