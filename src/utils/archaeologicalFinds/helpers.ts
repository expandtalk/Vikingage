
import { ArchaeologicalFind } from './types';

export const getFindsInPeriod = (finds: ArchaeologicalFind[], period: string): ArchaeologicalFind[] => {
  if (period === 'all') return finds;
  return finds.filter(find => find.period === period);
};

export const getPeriodName = (period: string): string => {
  const periodNames: { [key: string]: string } = {
    'paleolithic': 'Paleolitikum',
    'mesolithic': 'Mesolitikum', 
    'neolithic': 'Neolitikum',
    'bronze_age': 'Bronsålder',
    'iron_age': 'Järnålder',
    'migration_period': 'Folkvandringstid',
    'vendel_period': 'Vendeltid',
    'viking_age': 'Vikingatid'
  };
  return periodNames[period] || period;
};
