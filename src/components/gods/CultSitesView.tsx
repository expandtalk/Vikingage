import React, { useMemo, useState } from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { type ReligiousPlace } from '@/utils/religiousLocations/religiousPlacesData';
import { useCultSites } from '@/hooks/useCultSites';
import { PLACE_TYPE_LABEL } from '@/components/excursions/nearbyLabels';

// Heliga källor & kultplatser (focus=cultSites): PLATSERNA i fokus — lista grupperad
// per gudom med Frej/Freja/Frigg först (fruktbarhetskulten är Mälardalens signum),
// klick zoomar kartan dit. Gudakorten (focus=gods) är en annan vy.

interface Props {
  onNavigate?: (lat: number, lng: number, zoom?: number) => void;
}

const DEITY_ORDER = ['frey', 'frigg', 'odin', 'thor', 'ull', 'njord', 'other', 'christian'] as const;

const DEITY_LABEL: Record<string, { sv: string; en: string }> = {
  frey: { sv: 'Frej & Freja', en: 'Frey & Freyja' },
  frigg: { sv: 'Frigg', en: 'Frigg' },
  odin: { sv: 'Oden', en: 'Odin' },
  thor: { sv: 'Tor', en: 'Thor' },
  ull: { sv: 'Ull', en: 'Ull' },
  njord: { sv: 'Njord', en: 'Njörd' },
  other: { sv: 'Övriga & blandade', en: 'Other & mixed' },
  christian: { sv: 'Kristna platser', en: 'Christian sites' },
};

const EVIDENCE_LABEL: Record<string, { sv: string; en: string }> = {
  runestone: { sv: 'runsten', en: 'runestone' },
  archaeological: { sv: 'arkeologi', en: 'archaeology' },
  place_name: { sv: 'ortnamn', en: 'place name' },
  church_foundation: { sv: 'kyrkgrund', en: 'church foundation' },
  historical_record: { sv: 'historisk källa', en: 'historical record' },
  cathedral: { sv: 'katedral', en: 'cathedral' },
};

export const CultSitesView: React.FC<Props> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [deityFilter, setDeityFilter] = useState<string | null>(null);
  const { data: places = [] } = useCultSites();

  const groups = useMemo(() => {
    const byDeity = new Map<string, ReligiousPlace[]>();
    for (const p of places) {
      if (!byDeity.has(p.deity)) byDeity.set(p.deity, []);
      byDeity.get(p.deity)!.push(p);
    }
    return DEITY_ORDER
      .filter((d) => byDeity.has(d))
      .map((d) => ({ deity: d, places: byDeity.get(d)!.sort((a, b) => a.name.localeCompare(b.name, 'sv')) }));
  }, [places]);

  const total = places.length;
  const shown = deityFilter ? groups.filter((g) => g.deity === deityFilter) : groups;

  return (
    <div className="viking-card rounded-lg border border-border p-4 mb-4">
      {/* Hero: Freja (fruktbarhetskulten är sektionens signum). Källbilden är 608px —
          oskarpt cover-lager ger atmosfär, skarp porträttpanel behåller detaljerna. */}
      <div className="relative h-52 md:h-64 -m-4 mb-4 overflow-hidden rounded-t-lg bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950">
        <img
          src="/excursion-photos/gudar/ungdom-freja.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-45 saturate-150"
        />
        <img
          src="/excursion-photos/gudar/ungdom-freja.jpg"
          alt="Freja"
          className="absolute right-0 top-0 h-full object-contain [mask-image:linear-gradient(to_left,black_70%,transparent_100%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-5 bottom-4 max-w-[60%]">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-50 drop-shadow flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold shrink-0" />
            {sv ? 'Heliga källor & kultplatser' : 'Holy springs & cult sites'}
          </h2>
          <p className="text-sm text-amber-100/80 mt-1 drop-shadow">
            {sv
              ? `${total} platser där forntidens kult möter landskapet — offerkällor, lundar och vi.`
              : `${total} places where ancient cult meets the landscape — springs, groves and sanctuaries.`}
          </p>
        </div>
        <span className="absolute right-2 bottom-1.5 text-[10px] text-white/50">Freja</span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setDeityFilter(null)}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${deityFilter === null ? 'border-gold text-gold' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {sv ? 'Alla' : 'All'}
          </button>
          {groups.map((g) => (
            <button
              key={g.deity}
              onClick={() => setDeityFilter(deityFilter === g.deity ? null : g.deity)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${deityFilter === g.deity ? 'border-gold text-gold' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              {DEITY_LABEL[g.deity]?.[sv ? 'sv' : 'en'] ?? g.deity} ({g.places.length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
        {shown.map((g) => (
          <div key={g.deity}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              {DEITY_LABEL[g.deity]?.[sv ? 'sv' : 'en'] ?? g.deity}
              <span className="text-muted-foreground/50"> · {g.places.length}</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {g.places.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigate?.(p.coordinates.lat, p.coordinates.lng, 12)}
                    className="w-full text-left rounded px-1.5 py-1 hover:bg-gold/10 transition-colors"
                    title={p.description}
                  >
                    <span className="text-sm text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-gold shrink-0" />
                      <span className="truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        · {(PLACE_TYPE_LABEL[p.type]?.[sv ? 'sv' : 'en']) ?? p.type}
                      </span>
                    </span>
                    <span className="ml-[18px] flex flex-wrap gap-1">
                      <span className="text-[11px] text-muted-foreground/70">{p.region}</span>
                      {p.evidence.slice(0, 3).map((e) => (
                        <Badge key={e} variant="outline" className="text-[9px] px-1 py-0">
                          {(EVIDENCE_LABEL[e]?.[sv ? 'sv' : 'en']) ?? e}
                        </Badge>
                      ))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        {sv
          ? 'Klicka på en plats för att zooma dit på kartan nedanför.'
          : 'Click a place to zoom to it on the map below.'}
      </p>
    </div>
  );
};
