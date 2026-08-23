import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Loader2, CheckCircle2, HelpCircle, User } from 'lucide-react';
import type { PersonRelation } from '@/utils/search/utilityIntent';

// RELATIONELL locate: "var dog/föddes/begravdes X" → slå upp personen, visa RELATIONSPLATSEN på karta.
//   birth = Wikidata P19, death = P20, burial = P119 (allt CC0). Har vi koordinat → minikarta; har vi
//   bara ortnamn (Wikidata saknar P625) → källförd mening utan karta; saknas helt → ÄRLIG not.
//   Gissar ALDRIG en plats. Det källförda RAG/Fornvännen-svaret visas kvar bredvid (behålls i GlobalSearch).

type Person = {
  id: string; name: string; birth_year: number | null; death_year: number | null;
  birthplace_label: string | null; birthplace_lat: number | null; birthplace_lng: number | null;
  death_place_label: string | null; death_place_lat: number | null; death_place_lng: number | null;
  burial_place_label: string | null; burial_place_lat: number | null; burial_place_lng: number | null;
};

const REL: Record<PersonRelation, { sv: string; en: string; source: string }> = {
  birth: { sv: 'föddes', en: 'was born', source: 'Wikidata P19' },
  death: { sv: 'dog', en: 'died', source: 'Wikidata P20' },
  burial: { sv: 'begravdes', en: 'was buried', source: 'Wikidata P119' },
};

const lifeSpan = (p: Person): string =>
  p.birth_year || p.death_year ? ` (${p.birth_year ?? '?'}–${p.death_year ?? '?'})` : '';

// Plats för relationen (ur rätt kolumnpar).
const placeFor = (p: Person, r: PersonRelation): { label: string | null; lat: number | null; lng: number | null } =>
  r === 'birth' ? { label: p.birthplace_label, lat: p.birthplace_lat, lng: p.birthplace_lng }
    : r === 'death' ? { label: p.death_place_label, lat: p.death_place_lat, lng: p.death_place_lng }
      : { label: p.burial_place_label, lat: p.burial_place_lat, lng: p.burial_place_lng };

export const PersonLocateAnswer: React.FC<{ person: string; relation: PersonRelation; sv: boolean }> = ({ person, relation, sv }) => {
  const { data: hit, isLoading } = useQuery({
    queryKey: ['person-locate', person],
    enabled: person.trim().length >= 2,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Person | null> => {
      const { data } = await (supabase as any).from('persons')
        .select('id,name,birth_year,death_year,birthplace_label,birthplace_lat,birthplace_lng,death_place_label,death_place_lat,death_place_lng,burial_place_label,burial_place_lat,burial_place_lng')
        .ilike('name', person.trim()).order('sitelinks', { ascending: false }).limit(1);
      return (data ?? [])[0] ?? null;
    },
  });

  const place = hit ? placeFor(hit, relation) : null;
  const hasCoord = !!place && place.lat != null && place.lng != null;

  // Minikarta när relationsplatsen har koordinat (birth/death/burial — samma väg).
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!hasCoord || !place || !mapEl.current) return;
    const lat = Number(place.lat), lng = Number(place.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapRef.current);
    }
    const m = mapRef.current;
    m.setView([lat, lng], 8);
    L.marker([lat, lng], {
      icon: L.divIcon({ className: '', iconSize: [26, 34], iconAnchor: [13, 32],
        html: `<svg viewBox="0 0 30 40" width="26" height="34"><path d="M15 39C15 39 27 24 27 14A12 12 0 1 0 3 14C3 24 15 39 15 39Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#fff7ed" stroke="#78350f" stroke-width="1.5"/></svg>` }),
    }).addTo(m);
    setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, 60);
    return () => { try { mapRef.current?.remove(); mapRef.current = null; } catch { /* noop */ } };
  }, [hasCoord, place?.lat, place?.lng]);

  const r = REL[relation];
  const verb = sv ? r.sv : r.en;
  const relPlaceWord = sv ? (relation === 'birth' ? 'födelseplats' : relation === 'death' ? 'dödsplats' : 'gravplats')
    : (relation === 'birth' ? 'birthplace' : relation === 'death' ? 'place of death' : 'burial place');

  return (
    <div className="text-left">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <MapPin className="h-3 w-3" />{sv ? `Var ${r.sv}` : `Where — ${r.en}`} — {person}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />{sv ? 'Slår upp personen…' : 'Looking up the person…'}
        </div>
      )}

      {!isLoading && !hit && (
        <div className="flex items-start gap-2 text-sm text-slate-300">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="leading-relaxed">
            {sv
              ? <>Vi har inte <span className="text-slate-100">”{person}”</span> i persondatabasen ännu. Se det källförda svaret nedan.</>
              : <>We don’t have <span className="text-slate-100">“{person}”</span> in the person database yet. See the sourced answer below.</>}
          </p>
        </div>
      )}

      {/* Plats med koordinat → källförd rad + minikarta. */}
      {!isLoading && hit && place?.label && hasCoord && (
        <div>
          <div className="flex items-start gap-2 text-sm text-slate-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p className="leading-relaxed">
              <span className="font-semibold text-slate-50">{hit.name}</span>{lifeSpan(hit)} {verb} {sv ? 'i' : 'in'} <span className="font-semibold text-slate-50">{place.label}</span>.
              <span className="ml-1 text-[11px] text-slate-500">({r.source})</span>
            </p>
          </div>
          <div ref={mapEl} className="mt-2 h-40 w-full overflow-hidden rounded-lg border border-slate-700" />
        </div>
      )}

      {/* Ortnamn men ingen koordinat (Wikidata saknar P625) → källförd mening, ingen karta. */}
      {!isLoading && hit && place?.label && !hasCoord && (
        <div className="flex items-start gap-2 text-sm text-slate-300">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="leading-relaxed">
            <span className="text-slate-100">{hit.name}</span>{lifeSpan(hit)} {verb} {sv ? 'i' : 'in'} <span className="text-slate-100">{place.label}</span>
            <span className="ml-1 text-[11px] text-slate-500">({r.source})</span> — {sv ? 'men vi saknar koordinat för att sätta ut den på kartan.' : 'but we lack a coordinate to map it.'}
          </p>
        </div>
      )}

      {/* Ingen plats alls → ÄRLIG not, ingen gissning. Källförda svaret nedan behandlar frågan. */}
      {!isLoading && hit && !place?.label && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-300">
          <p className="leading-relaxed">
            {sv
              ? <>Vi har <span className="text-slate-100">{hit.name}</span>{lifeSpan(hit)}, men ingen {relPlaceWord} som belagd data ({r.source} saknas). Vi gissar aldrig en plats — det <span className="text-slate-100">källförda svaret nedan</span> behandlar frågan.</>
              : <>We have <span className="text-slate-100">{hit.name}</span>{lifeSpan(hit)}, but no {relPlaceWord} on record ({r.source} missing). We never guess — the sourced answer below addresses it.</>}
          </p>
        </div>
      )}
    </div>
  );
};
