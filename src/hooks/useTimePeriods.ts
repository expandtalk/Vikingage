import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tidsperiod-skalan (TimePeriodSelector) ur DB (time_periods). Fallback = hårdkodad lista
// nedan så väljaren aldrig blir tom. Ordnas på sort_order.
export interface TimePeriod {
  id: string;
  name: string;
  nameEn: string;
  startYear: number;
  endYear: number;
  description: string;
  descriptionEn: string;
}

export const FALLBACK_TIME_PERIODS: TimePeriod[] = [
  { id: 'paleolithic', name: 'Paleolitikum', nameEn: 'Paleolithic', startYear: -45000, endYear: -8000, description: 'Äldre stenåldern med jägar-samlargrupper under istiden.', descriptionEn: 'Old Stone Age with hunter-gatherer groups during ice age.' },
  { id: 'mesolithic', name: 'Mesolitikum', nameEn: 'Mesolithic', startYear: -8000, endYear: -4000, description: 'Mellanstenålder efter istidens slut.', descriptionEn: 'Middle Stone Age after end of ice age.' },
  { id: 'neolithic', name: 'Neolitikum', nameEn: 'Neolithic', startYear: -4000, endYear: -1700, description: 'Yngre stenåldern med jordbruk och megalitgravar.', descriptionEn: 'New Stone Age with agriculture and megalithic tombs.' },
  { id: 'bronze_age', name: 'Bronsålder', nameEn: 'Bronze Age', startYear: -1700, endYear: -500, description: 'Nordisk bronsålderkultur med rik metallkonst.', descriptionEn: 'Nordic Bronze Age culture with rich metalwork.' },
  { id: 'pre_roman_iron', name: 'Förromersk järnålder', nameEn: 'Pre-Roman Iron Age', startYear: -500, endYear: 1, description: 'Tidiga germanska stammar bildas.', descriptionEn: 'Early Germanic tribes form.' },
  { id: 'roman_iron', name: 'Romersk järnålder', nameEn: 'Roman Iron Age', startYear: 1, endYear: 400, description: 'Kontakt med romerska riket.', descriptionEn: 'Contact with Roman Empire.' },
  { id: 'migration_period', name: 'Folkvandringstid', nameEn: 'Migration Period', startYear: 400, endYear: 550, description: 'Stora folkvandringar och germanska riken.', descriptionEn: 'Great migrations and Germanic kingdoms.' },
  { id: 'vendel_period', name: 'Vendeltid', nameEn: 'Vendel Period', startYear: 550, endYear: 793, description: 'Förvikingatid med rika krigargravfynd.', descriptionEn: 'Pre-Viking period with rich warrior graves.' },
  { id: 'viking_age', name: 'Vikingatid', nameEn: 'Viking Age', startYear: 793, endYear: 1066, description: 'Nordisk expansion och handelsutveckling.', descriptionEn: 'Nordic expansion and trade development.' },
];

interface Row {
  id: string; name: string; name_en: string | null; start_year: number | null; end_year: number | null;
  description: string | null; description_en: string | null;
}

export const useTimePeriods = () => {
  const q = useQuery({
    queryKey: ['time-periods'],
    queryFn: async (): Promise<TimePeriod[]> => {
      const { data, error } = await supabase.from('time_periods').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) return FALLBACK_TIME_PERIODS;
      return (data as Row[]).map((r) => ({
        id: r.id, name: r.name, nameEn: r.name_en ?? r.name, startYear: r.start_year ?? 0, endYear: r.end_year ?? 0,
        description: r.description ?? '', descriptionEn: r.description_en ?? '',
      }));
    },
    staleTime: 30 * 60 * 1000,
  });
  return { ...q, data: q.data ?? FALLBACK_TIME_PERIODS };
};
