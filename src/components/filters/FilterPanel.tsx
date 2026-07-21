
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterPanelProps {
  selectedLandscape: string;
  selectedCountry: string;
  selectedPeriod: string;
  selectedStatus: string;
  selectedObjectType: string;
  onLandscapeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onObjectTypeChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

// value = filter key (must stay stable); sv/en = display labels only.
type Opt = { value: string; sv: string; en: string };

// Swedish province names are proper nouns kept identical in both languages.
const PROVINCES = [
  'Uppland', 'Södermanland', 'Västergötland', 'Östergötland', 'Småland', 'Skåne',
  'Gotland', 'Öland', 'Västmanland', 'Närke', 'Värmland', 'Dalarna', 'Gästrikland',
  'Hälsingland', 'Medelpad', 'Ångermanland', 'Västerbotten', 'Norrbotten',
];

const LANDSCAPES: Opt[] = [
  { value: 'all', sv: 'Alla landskap', en: 'All provinces' },
  ...PROVINCES.map((p) => ({ value: p, sv: p, en: p })),
];

const COUNTRIES: Opt[] = [
  { value: 'all', sv: 'Alla länder', en: 'All countries' },
  { value: 'Sweden', sv: 'Sverige', en: 'Sweden' },
  { value: 'Norway', sv: 'Norge', en: 'Norway' },
  { value: 'Denmark', sv: 'Danmark', en: 'Denmark' },
  { value: 'Iceland', sv: 'Island', en: 'Iceland' },
  { value: 'Finland', sv: 'Finland', en: 'Finland' },
  { value: 'Estonia', sv: 'Estland', en: 'Estonia' },
  { value: 'Russia', sv: 'Ryssland', en: 'Russia' },
  { value: 'Ukraine', sv: 'Ukraina', en: 'Ukraine' },
  { value: 'England', sv: 'England', en: 'England' },
  { value: 'Ireland', sv: 'Irland', en: 'Ireland' },
  { value: 'Scotland', sv: 'Skottland', en: 'Scotland' },
  { value: 'Faroe Islands', sv: 'Färöarna', en: 'Faroe Islands' },
  { value: 'Greenland', sv: 'Grönland', en: 'Greenland' },
];

const PERIODS: Opt[] = [
  { value: 'all', sv: 'Alla perioder', en: 'All periods' },
  { value: 'early_iron_age', sv: 'Förromersk järnålder (500-1 f.Kr.)', en: 'Pre-Roman Iron Age (500-1 BCE)' },
  { value: 'roman_iron_age', sv: 'Romersk järnålder (1-400 e.Kr.)', en: 'Roman Iron Age (1-400 CE)' },
  { value: 'migration_period', sv: 'Folkvandringstid (400-550 e.Kr.)', en: 'Migration Period (400-550 CE)' },
  { value: 'vendel_period', sv: 'Vendeltid (550-790 e.Kr.)', en: 'Vendel Period (550-790 CE)' },
  { value: 'viking_age', sv: 'Vikingatid (790-1066 e.Kr.)', en: 'Viking Age (790-1066 CE)' },
  { value: 'middle_ages', sv: 'Medeltid (1066-1520 e.Kr.)', en: 'Middle Ages (1066-1520 CE)' },
];

const STATUSES: Opt[] = [
  { value: 'all', sv: 'Alla status', en: 'All statuses' },
  { value: 'well_preserved', sv: 'Välbevarad', en: 'Well preserved' },
  { value: 'damaged', sv: 'Skadad', en: 'Damaged' },
  { value: 'fragmentary', sv: 'Fragmentarisk', en: 'Fragmentary' },
  { value: 'lost', sv: 'Förlorad', en: 'Lost' },
  { value: 'underwater', sv: 'Under vatten', en: 'Underwater' },
];

const OBJECT_TYPES: Opt[] = [
  { value: 'all', sv: 'Alla objekttyper', en: 'All object types' },
  { value: 'runestone', sv: 'Runsten', en: 'Runestone' },
  { value: 'rune_stick', sv: 'Runpinne', en: 'Rune stick' },
  { value: 'coin', sv: 'Mynt', en: 'Coin' },
  { value: 'bracteate', sv: 'Brakteat', en: 'Bracteate' },
  { value: 'weapon', sv: 'Vapen', en: 'Weapon' },
  { value: 'jewelry', sv: 'Smycke', en: 'Jewelry' },
  { value: 'tool', sv: 'Verktyg', en: 'Tool' },
  { value: 'bone', sv: 'Ben', en: 'Bone' },
  { value: 'wood', sv: 'Trä', en: 'Wood' },
  { value: 'metal', sv: 'Metall', en: 'Metal' },
  { value: 'stone', sv: 'Sten', en: 'Stone' },
  { value: 'other', sv: 'Annat', en: 'Other' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedLandscape,
  selectedCountry,
  selectedPeriod,
  selectedStatus,
  selectedObjectType,
  onLandscapeChange,
  onCountryChange,
  onPeriodChange,
  onStatusChange,
  onObjectTypeChange,
  onClearFilters,
  activeFiltersCount,
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const labelOf = (o: Opt) => (sv ? o.sv : o.en);

  const t = sv
    ? { landscape: 'Landskap', country: 'Land', period: 'Tidsperiod', status: 'Status', objectType: 'Objekttyp',
        activeFilters: (n: number) => `${n} aktiva filter`, clearAll: 'Rensa alla' }
    : { landscape: 'Province', country: 'Country', period: 'Time period', status: 'Status', objectType: 'Object type',
        activeFilters: (n: number) => `${n} active filters`, clearAll: 'Clear all' };

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: Opt[],
  ) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-white text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="bg-slate-700/60 border-slate-600 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-white hover:bg-slate-700">
              {labelOf(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      {activeFiltersCount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">{t.activeFilters(activeFiltersCount)}</span>
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700/50 flex items-center gap-2"
          >
            <X className="h-3 w-3" />
            {t.clearAll}
          </Button>
        </div>
      )}

      {renderSelect('filter-country', t.country, selectedCountry, onCountryChange, COUNTRIES)}
      {renderSelect('filter-landscape', t.landscape, selectedLandscape, onLandscapeChange, LANDSCAPES)}
      {renderSelect('filter-period', t.period, selectedPeriod, onPeriodChange, PERIODS)}
      {renderSelect('filter-status', t.status, selectedStatus, onStatusChange, STATUSES)}
      {renderSelect('filter-object-type', t.objectType, selectedObjectType, onObjectTypeChange, OBJECT_TYPES)}
    </div>
  );
};
