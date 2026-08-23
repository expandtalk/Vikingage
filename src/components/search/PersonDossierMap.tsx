import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, Loader2 } from 'lucide-react';

// PERSON-DOSSIERKARTA: en persons LIVSGEOGRAFI & MAKTNÄTVERK ur den källkritiska person_place_claims
// (evidensgrad A+…D, coord_status, LAGER 1 = personen själv / LAGER 2 = ättens gods & arv, BJI-heuristik).
// Faller tillbaka på persons-kolumnerna (P19/P20/P119) för de personer som saknar claims.
// INGEN GISSNING: bara coord_status verified/approx plottas; disputed/none listas i text, aldrig påhittad pin.

type Claim = {
  place_label: string; lat: number | null; lng: number | null; coord_status: string;
  relation_type: string; evidence_grade: string; layer: number; event: string | null;
  inheritance_chain: string | null; primary_source: string | null; period_from: number | null;
  period_to: number | null; bji: number | null; uncertain: boolean; notes: string | null;
};
type FallbackRow = {
  birthplace_label: string | null; birthplace_lat: number | null; birthplace_lng: number | null;
  death_place_label: string | null; death_place_lat: number | null; death_place_lng: number | null;
  burial_place_label: string | null; burial_place_lat: number | null; burial_place_lng: number | null;
};

const GRADE: Record<string, { color: string; border: string }> = {
  'A+': { color: '#10b981', border: '#065f46' },
  'A':  { color: '#f59e0b', border: '#78350f' },
  'B':  { color: '#60a5fa', border: '#1e3a8a' },
  'C':  { color: '#94a3b8', border: '#334155' },
  'D':  { color: '#64748b', border: '#1e293b' },
};
const REL_SV: Record<string, string> = {
  birth: 'född', death: 'död', grave: 'grav', residence: 'residens', estate: 'gods', inheritance: 'arv',
  mint: 'myntning', battle: 'slag', council: 'möte', charter_issued: 'brev utfärdat', donation: 'donation',
  purchase: 'köp', exchange: 'byte', office_property: 'ämbetsgods', campaign: 'fälttåg', tradition: 'tradition', uncertain: 'osäkert',
};
const period = (a: number | null, b: number | null) => a && b && a !== b ? `${a}–${b}` : (a ? `${a}` : '');

export const PersonDossierMap: React.FC<{
  personId: string; personName: string; birthYear: number | null; deathYear: number | null;
  sv: boolean; onQuery?: (q: string) => void;
}> = ({ personId, personName, birthYear, deathYear, sv, onQuery }) => {
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['person-place-claims', personName],
    enabled: personName.trim().length >= 2,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Claim[]> => {
      const { data } = await (supabase as any).from('person_place_claims')
        .select('place_label,lat,lng,coord_status,relation_type,evidence_grade,layer,event,inheritance_chain,primary_source,period_from,period_to,bji,uncertain,notes')
        .ilike('person_name', personName.trim()).order('bji', { ascending: false });
      return (data ?? []) as Claim[];
    },
  });
  // Fallback: persons P19/P20/P119 (för de utan claims — de allra flesta av 41k).
  const { data: fb } = useQuery({
    queryKey: ['person-dossier-fallback', personId],
    enabled: !!personId && !isLoading && claims.length === 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Claim[]> => {
      const { data } = await (supabase as any).from('persons')
        .select('birthplace_label,birthplace_lat,birthplace_lng,death_place_label,death_place_lat,death_place_lng,burial_place_label,burial_place_lat,burial_place_lng')
        .eq('id', personId).limit(1);
      const r = (data ?? [])[0] as FallbackRow | undefined;
      if (!r) return [];
      const mk = (label: string | null, lat: number | null, lng: number | null, rel: string, grade: string): Claim | null =>
        label ? { place_label: label, lat, lng, coord_status: lat != null ? 'verified' : 'none', relation_type: rel, evidence_grade: grade, layer: 1, event: null, inheritance_chain: null, primary_source: rel === 'grave' ? 'Wikidata P119' : rel === 'birth' ? 'Wikidata P19' : 'Wikidata P20', period_from: null, period_to: null, bji: null, uncertain: false, notes: null } : null;
      return [mk(r.birthplace_label, r.birthplace_lat, r.birthplace_lng, 'birth', 'A'),
        mk(r.death_place_label, r.death_place_lat, r.death_place_lng, 'death', 'B'),
        mk(r.burial_place_label, r.burial_place_lat, r.burial_place_lng, 'grave', 'A')].filter(Boolean) as Claim[];
    },
  });
  const rows = claims.length ? claims : (fb ?? []);
  const mapped = rows.filter((r) => (r.coord_status === 'verified' || r.coord_status === 'approx') && r.lat != null && r.lng != null);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!mapped.length || !mapEl.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapRef.current);
    }
    const m = mapRef.current;
    m.eachLayer((l) => { if (l instanceof L.Marker) m.removeLayer(l); });
    const bounds: [number, number][] = [];
    mapped.forEach((r) => {
      const g = GRADE[r.evidence_grade] ?? GRADE.C;
      const dashed = r.coord_status === 'approx';
      // LAGER 1 = cirkel, LAGER 2 = romb (gods/arv). Färg = evidensgrad. approx = streckad kant.
      const html = r.layer === 2
        ? `<div style="width:16px;height:16px;background:${g.color};border:2px ${dashed ? 'dashed' : 'solid'} ${g.border};transform:rotate(45deg);box-shadow:0 0 0 1px rgba(255,255,255,.5)"></div>`
        : `<div style="width:16px;height:16px;border-radius:50%;background:${g.color};border:2px ${dashed ? 'dashed' : 'solid'} ${g.border};box-shadow:0 0 0 1px rgba(255,255,255,.5)"></div>`;
      L.marker([r.lat!, r.lng!], { icon: L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9], html }) })
        .bindPopup(`<b>${r.place_label}</b><br/><span style="font-size:11px;color:#64748b">${(sv ? REL_SV[r.relation_type] : r.relation_type) ?? r.relation_type} · ${r.evidence_grade}${r.coord_status === 'approx' ? ' · ~approx' : ''}${period(r.period_from, r.period_to) ? ' · ' + period(r.period_from, r.period_to) : ''}</span>${r.event ? `<br/><span style="font-size:11px">${r.event}</span>` : ''}`)
        .addTo(m);
      bounds.push([r.lat!, r.lng!]);
    });
    if (bounds.length === 1) m.setView(bounds[0], 8);
    else m.fitBounds(bounds, { padding: [36, 36], maxZoom: 9 });
    setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, 60);
  }, [personName, mapped.length]);

  if (isLoading) return (
    <div className="px-5 pb-3"><div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin text-amber-400" />{sv ? 'Bygger livskartan…' : 'Building the life map…'}</div></div>
  );
  if (!rows.length) return null;

  const l1 = rows.filter((r) => r.layer === 1);
  const l2 = rows.filter((r) => r.layer === 2);
  const rich = claims.length > 0;

  const RowLine: React.FC<{ r: Claim }> = ({ r }) => {
    const g = GRADE[r.evidence_grade] ?? GRADE.C;
    return (
      <button type="button" onClick={() => onQuery?.(r.place_label)}
        className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-slate-800/50">
        <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0" style={{ background: g.color, border: `1px solid ${g.border}`, borderRadius: r.layer === 2 ? 0 : '50%', transform: r.layer === 2 ? 'rotate(45deg)' : undefined }} />
        <span className="min-w-0">
          <span className="font-medium text-slate-100">{r.place_label}</span>
          <span className="text-slate-400"> · {(sv ? REL_SV[r.relation_type] : r.relation_type) ?? r.relation_type}</span>
          {period(r.period_from, r.period_to) && <span className="text-slate-500"> · {period(r.period_from, r.period_to)}</span>}
          <span className="ml-1.5 rounded border border-slate-600 px-1 text-[10px] text-slate-300">{r.evidence_grade}</span>
          {(r.coord_status === 'disputed' || r.coord_status === 'none') && <span className="ml-1 text-[10px] text-amber-300/70">{r.coord_status === 'disputed' ? (sv ? 'läge omtvistat' : 'disputed') : (sv ? 'ej på karta' : 'no coord')}</span>}
          {r.event && <span className="block text-[11px] leading-snug text-slate-400">{r.event}</span>}
          {r.inheritance_chain && <span className="block text-[10px] leading-snug text-slate-500">↳ {r.inheritance_chain}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="border-t border-slate-800 px-5 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <Milestone className="h-3.5 w-3.5" /> {sv ? (rich ? 'Maktgeografi' : 'Livsgeografi') : 'Life geography'}
        {(birthYear || deathYear) && <span className="ml-1 font-normal text-slate-500">{birthYear ?? '?'}–{deathYear ?? '?'}</span>}
      </div>

      {mapped.length > 0 && <div ref={mapEl} className="mb-2 h-52 w-full overflow-hidden rounded-lg border border-slate-700" />}

      <div className="flex flex-col gap-2">
        {l1.length > 0 && (
          <div>
            {rich && <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{sv ? 'Personen själv' : 'The person'}</div>}
            {l1.map((r) => <RowLine key={`${r.place_label}-${r.relation_type}`} r={r} />)}
          </div>
        )}
        {l2.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{sv ? 'Ättens gods & arv' : 'Estates & inheritance'}</div>
            {l2.map((r) => <RowLine key={`${r.place_label}-${r.relation_type}`} r={r} />)}
          </div>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        {sv
          ? `Källkritisk maktgeografi för ${personName}: evidensgrad A+…D, koordinat verifierad/approx/omtvistad (aldrig gissad). ${rich ? 'Färg = evidensgrad; romb = ättens gods/arv. BJI är en jämförelseheuristik, inte ett historiskt faktum.' : 'Ur Wikidata P19/P20/P119.'}`
          : `Source-critical power geography for ${personName}: evidence grade A+…D, coordinates verified/approx/disputed (never guessed).`}
      </p>
    </div>
  );
};
