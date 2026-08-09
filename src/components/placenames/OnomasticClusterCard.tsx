import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Info, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Ortnamns-klusterverktyg (/sv/ortnamn). Testar om ett namnled anrikas kring ett FÖRREGISTRERAT
// epicentrum, mot en analytisk null (global bakgrundsandel + binomialt band per ring). "Skarp kant"
// = yttersta ring över bandet innan profilen faller tillbaka. Löser Moment 22:et (råa antal → alltid
// kluster) genom att testa anrikning ÖVER bakgrund, inte förekomst. Data: RPC onomastic_radial_profile.

interface Ring {
  ring_idx: number; ring_from_km: string; ring_to_km: string;
  total_n: number; target_n: number; frac: number | null;
  exp_frac: number; band_lo: number; band_hi: number; over_band: boolean;
}

interface Case {
  id: string; label: string; lat: number; lng: number;
  elements: string[]; exclude: string | null; kind: 'positiv' | 'negativ';
  note: string;
}

// Pilot-fall ur filolog-specen (Öland). Två positiva + två negativa kontroller.
const CASES: Case[] = [
  { id: 'h1', kind: 'positiv', label: 'Sandby borg → -by (bebyggelse)', lat: 56.55253, lng: 16.63926, elements: ['by'], exclude: 'sandby',
    note: 'Fornborg i SE Ölands tätaste agrarbygd. Väntad: skarp -by-kant. Hemorten "Sandby" utesluts (borgen är uppkallad efter byn → cirkelvakt).' },
  { id: 'h2', kind: 'positiv', label: 'Gråborg → -torp (röjningsskikt)', lat: 56.66642, lng: 16.60399, elements: ['torp'], exclude: 'graborg',
    note: 'Borgens medeltida fas (marknad + S:t Knuts kapell) drog sekundär -torp-kolonisation. -torp daterar det MEDELTIDA skedet, ej 500-talsborgen.' },
  { id: 'n1', kind: 'negativ', label: 'Ismantorps borg → -by (NEGATIV kontroll)', lat: 56.74544, lng: 16.64268, elements: ['by'], exclude: null,
    note: 'Kult-/tillflyktsborg i alvar-/skogsbältet UTAN omgivande agrarbygd. Väntat: inget kluster — beviset att metoden kan säga nej.' },
  { id: 'n2', kind: 'negativ', label: 'Gärdslösa kyrka → -by (NEGATIV kontroll)', lat: 56.7935, lng: 16.73792, elements: ['by'], exclude: null,
    note: 'Sockenkyrka. Kyrkor är jämnt utlagda (en per socken) → speglar bygdebrus, ingen namnbildande process. Väntat: svag/ingen anrikning.' },
];

const RINGS_KM = [2.5, 5, 7.5, 10, 15];
const R_PX = 120;

const OnomasticClusterCard: React.FC = () => {
  const [caseId, setCaseId] = useState('h1');
  const [rings, setRings] = useState<Ring[]>([]);
  const [loading, setLoading] = useState(false);
  const c = CASES.find((x) => x.id === caseId)!;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const { data } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>)(
        'onomastic_radial_profile',
        { p_lat: c.lat, p_lng: c.lng, p_element_keys: c.elements, p_ring_edges_km: RINGS_KM, p_exclude_home: c.exclude, p_province: 'Öland' },
      );
      if (!alive) return;
      setRings(Array.isArray(data) ? (data as Ring[]) : []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxKm = RINGS_KM[RINGS_KM.length - 1];
  // Skarp kant = yttersta ring över bandet (innan profilen faller tillbaka in i/under bandet).
  const edgeRing = [...rings].filter((r) => r.over_band).sort((a, b) => Number(b.ring_to_km) - Number(a.ring_to_km))[0];
  const edgeR = edgeRing ? Number(edgeRing.ring_to_km) : null;
  const anyOver = rings.some((r) => r.over_band);
  const underpowered = rings.some((r) => r.total_n > 0 && r.total_n < 12);

  const tier = (r: Ring): string => {
    if (r.over_band) return '#d4a63c';                         // signifikant över bakgrund
    if (r.frac != null && r.frac > r.exp_frac) return '#8a7a5c'; // svagt över (ej signifikant)
    return '#33414d';                                          // bakgrund/under
  };

  return (
    <Card className="viking-card mb-4 border-gold/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Target className="h-5 w-5" /> Ortnamnskluster — pricktavla med skarp kant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Testar om ett namnled <strong>anrikas</strong> kring ett förregistrerat epicentrum (fornborg, kyrka…),
          mätt <strong>mot bakgrunden</strong> (alla ortnamn på Öland) ring för ring. Ett riktigt kluster har en{' '}
          <strong>skarp kant</strong>: inre ringar ligger signifikant över bakgrundsbandet, sedan faller profilen
          tillbaka. Det gör "kluster" till ett falsifierbart påstående — inte ett cirkelbevis via allt större radie.
        </p>

        <select value={caseId} onChange={(e) => setCaseId(e.target.value)}
          className="w-full rounded border border-border bg-slate-900 px-3 py-2 text-sm text-foreground">
          {CASES.map((x) => <option key={x.id} value={x.id}>{x.kind === 'negativ' ? '⊘ ' : '● '}{x.label}</option>)}
        </select>
        <p className="text-xs text-muted-foreground opacity-80">{c.note}</p>

        {loading ? <p className="text-sm text-muted-foreground">Laddar…</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pricktavlan */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 260 260" className="w-full max-w-[260px]">
                {[...rings].sort((a, b) => Number(b.ring_to_km) - Number(a.ring_to_km)).map((r) => (
                  <circle key={r.ring_idx} cx="130" cy="130" r={(Number(r.ring_to_km) / maxKm) * R_PX}
                    fill={tier(r)} fillOpacity="0.55" stroke="#0f172a" strokeWidth="1" />
                ))}
                {edgeR != null && (
                  <circle cx="130" cy="130" r={(edgeR / maxKm) * R_PX} fill="none" stroke="#d4a63c" strokeWidth="3" />
                )}
                <circle cx="130" cy="130" r="4" fill="#fff" stroke="#0f172a" strokeWidth="1" />
                {RINGS_KM.map((km) => (
                  <text key={km} x="130" y={130 - (km / maxKm) * R_PX + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">{km} km</text>
                ))}
              </svg>
              <div className="text-center text-sm mt-1">
                {anyOver ? (
                  <span className="text-gold font-medium">Kluster med kant vid ≈ {edgeR} km</span>
                ) : (
                  <span className="text-slate-400">Inget kluster (inom bakgrundsbandet)</span>
                )}
              </div>
            </div>

            {/* Radiell profil vs bakgrundsband */}
            <div className="space-y-2">
              {rings.map((r) => {
                const frac = r.frac ?? 0;
                return (
                  <div key={r.ring_idx} className="text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{Number(r.ring_from_km)}–{Number(r.ring_to_km)} km</span>
                      <span>{r.target_n}/{r.total_n} · {(frac * 100).toFixed(0)}%{r.over_band ? ' ✓' : ''}</span>
                    </div>
                    <div className="relative h-3 rounded bg-slate-800 overflow-hidden">
                      {/* bakgrundsband (exp ± binomial) */}
                      <div className="absolute top-0 bottom-0 bg-slate-600/50" style={{ left: `${r.band_lo * 100}%`, width: `${Math.max(0, (r.band_hi - r.band_lo)) * 100}%` }} />
                      {/* förväntad bakgrundsandel */}
                      <div className="absolute top-0 bottom-0 w-px bg-slate-300" style={{ left: `${r.exp_frac * 100}%` }} />
                      {/* observerad andel */}
                      <div className="absolute top-0 bottom-0" style={{ width: `${frac * 100}%`, background: r.over_band ? '#d4a63c' : '#8a7a5c', opacity: 0.85 }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-muted-foreground opacity-75 mt-1">
                Guldstapel = andel över bandet (signifikant). Grå ruta = bakgrundens 95%-band; vit linje = förväntad andel.
              </p>
            </div>
          </div>
        )}

        {underpowered && (
          <p className="text-xs text-amber-300/90 flex items-start gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Låg datatäthet i någon ring (&lt;12 namn) → svagt statistiskt underlag. "Inget kluster" kan vara underpowered, inte frånvaro.</p>
        )}
        <p className="text-[11px] text-muted-foreground opacity-75 flex items-start gap-1.5"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Öland: {`395 ortnamn med geometri, 100% OSM/Wikidata utan primärbelägg`} → led-analys kräver SOL 2003 / Isof för
          verifierade äldsta belägg. Bakgrund = alla Ölands ortnamn; epicentret är valt oberoende av namntätheten.</p>
      </CardContent>
    </Card>
  );
};

export default OnomasticClusterCard;
