
import { LegendItem } from './types';

export const sortLegendItems = (items: LegendItem[]): LegendItem[] => {
  // Define priority order for specific legend items
  const priorityOrder: { [key: string]: number } = {
    // Runstenar först
    'swedish_runestones': 1,
    'foreign_runestones': 2,
    
    // Vattenvägar före vikingavägar
    'river_routes': 10,
    'water_routes': 11,
    'valdemar_route': 12,

    // Vikingavägar efter vattenvägar
    'viking_roads': 20,

    // Andra kategorier
    'viking_cities': 30,
    'fortifications': 31,
    'religious_items': 40,
    'underwater_finds': 50
  };

  return items.sort((a, b) => {
    // First sort by enabled status (enabled items first)
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1;
    }
    
    // Then sort by priority (lower numbers first)
    const aPriority = priorityOrder[a.id] || 999;
    const bPriority = priorityOrder[b.id] || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Finally sort by count (higher counts first for same priority)
    return b.count - a.count;
  });
};

export const createLegendToggleHandler = (
  setEnabledLegendItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
) => {
  return (itemId: string) => {
    console.log(`Toggling legend item: ${itemId}`);
    setEnabledLegendItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
};
