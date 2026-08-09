import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Resultatsektion: klustertest av Agneta Nyholms tre ångermanländska centralplatser
// (kult-/maktled kombinerat) mot landskapets namnbakgrund, + -sjö-nollkontroll. LIVE-beräknad
// via onomastic_radial_profile så siffrorna aldrig blir inaktuella. Attribution + förbehåll.

const CULT = ['frö', 'sal', 'ross', 'hammar', 'hov', 'tor'];
const RINGS = [5, 10, 15, 20, 30];
const NODES = [
  { name: 'Torsåker', lat: 63.07926, lng: 17.74385 },
  { name: 'Nora', lat: 62.87227, lng: 18.08104 },
  { name: 'Härnösand–Säbrå', lat: 62.63226, lng: 17.93823 },
];

interface Ring { ring_from_km: string; ring_to_km: string; total_n: number; target_n: number; frac: number | null; exp_frac: number; over_band: boolean; }
interface Row { name: string; edgeKm: number | null; anyOver: boolean; pct: number; t: number; n: number; }

const rpc = async (lat: number, lng: number, elements: string[]): Promise<Ring[]> => {
  const { data } = await (supabase.rpc as unknown as (fn: string, a: Record<string, unknown>) => Promise<{ data: unknown }>)(
    'onomastic_radial_profile',
    { p_lat: lat, p_lng: lng, p_element_keys: elements, p_ring_edges_km: RINGS, p_exclude_home: null, p_province: 'Ångermanland' },
  );
  return Array.isArray(data) ? (data as Ring[]) : [];
};

// Skarp kant = yttersta ring i den sammanhängande över-bandet-sviten FRÅN CENTRUM.
const analyze = (name: string, rings: Ring[]): Row => {
  const ordered = [...rings].sort((a, b) => Number(a.ring_from_km) - Number(b.ring_from_km));
  let edgeKm: number | null = null;
  for (const r of ordered) { if (r.over_band) edgeKm = Number(r.ring_to_km); else break; }
  const inner = ordered[0];
  return { name, edgeKm, anyOver: rings.some((r) => r.over_band), pct: (inner?.frac ?? 0) * 100, t: inner?.target_n ?? 0, n: inner?.total_n ?? 0 };
};

const AngermanlandClusterResults: React.FC<{ sv?: boolean }> = ({ sv = true }) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [neg, setNeg] = useState<Row | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await Promise.all(NODES.map(async (n) => analyze(n.name, await rpc(n.lat, n.lng, CULT))));
      const negRings = await rpc(62.87227, 18.08104, ['sjö']); // Nora -sjö, nollkontroll
      if (!alive) return;
      setRows(res);
      setNeg(analyze('Nora → -sjö (kontroll)', negRings));
    })();
    return () => { alive = false; };
  }, []);

  if (!rows) return null;

  return (
    <Card className="viking-card mb-4 border-cyan-700/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2" style={{ color: '#22d3ee' }}>
          <Target className="h-5 w-5" /> {sv ? 'Resultat: kluster kring Agnetas centralplatser (Ångermanland)' : 'Result: clustering around Agneta’s central places (Ångermanland)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="text-xs">
          {sv
            ? 'Den kombinerade kult-/maktuppsättningen (frö, sal, ross, hammar, hov, tor) testad mot hela Ångermanlands namnbakgrund, ring för ring. "Skarp kant" = yttersta ringen i den sammanhängande anrikningen från centrum.'
            : 'The combined cult/power set tested against the full Ångermanland name background, ring by ring.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-slate-700/50">
                <th className="py-1.5 pr-3">{sv ? 'Centralplats' : 'Central place'}</th>
                <th className="py-1.5 pr-3">{sv ? 'Kärna 0–5 km' : 'Core 0–5 km'}</th>
                <th className="py-1.5 pr-3">{sv ? 'Skarp kant' : 'Sharp edge'}</th>
                <th className="py-1.5">{sv ? 'Utfall' : 'Verdict'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-slate-800/60">
                  <td className="py-1.5 pr-3 text-foreground font-medium">{r.name}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{r.pct.toFixed(1)}% ({r.t}/{r.n})</td>
                  <td className="py-1.5 pr-3 tabular-nums text-gold">{r.edgeKm != null ? `≈ ${r.edgeKm} km` : '—'}</td>
                  <td className="py-1.5">{r.edgeKm != null ? <span className="text-gold">{sv ? 'skarp kant' : 'sharp edge'}</span> : r.anyOver ? <span className="text-amber-300">{sv ? 'diffus' : 'diffuse'}</span> : <span className="text-slate-400">{sv ? 'inget kluster' : 'no cluster'}</span>}</td>
                </tr>
              ))}
              {neg && (
                <tr className="border-b border-slate-800/60 opacity-80">
                  <td className="py-1.5 pr-3 text-slate-300">{neg.name}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{neg.pct.toFixed(1)}% ({neg.t}/{neg.n})</td>
                  <td className="py-1.5 pr-3 tabular-nums">{neg.edgeKm != null ? `≈ ${neg.edgeKm} km` : '—'}</td>
                  <td className="py-1.5">{neg.edgeKm != null ? <span className="text-amber-300">{sv ? 'oväntat kluster' : 'unexpected'}</span> : <span className="text-emerald-300">{sv ? 'platt (väntat)' : 'flat (expected)'}</span>}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs">
          {sv
            ? 'Alla tre noderna visar en inre anrikning av kult-/maktnamn över landskapsbakgrunden med en falsifierbar kant — konsekvent med hypotesen att de är kult-/maktnoder. Topografi-kontrollen (-sjö) ligger platt på bakgrunden, vilket visar att metoden inte bara mäter namntäthet.'
            : 'All three nodes show an inner enrichment of cult/power names over the background with a falsifiable edge. The topographic control (-sjö) is flat, showing the method does not merely measure name density.'}
        </p>
        <p className="text-[11px] flex items-start gap-1.5 text-amber-300/90">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {sv
            ? 'Förbehåll: hypotesstöd, inte bevis. Absoluttalen är små (2–3 kärnträffar per nod); kult-leden är fåtaliga i det sent kristnade, glesa Ångermanland; epicentra är Agneta Nyholms förregistrerade lägen (hypotes). Ett par namn hit eller dit påverkar Härnösand–Säbrå mest (n=2 i kärnan).'
            : 'Caveat: hypothesis support, not proof. Absolute counts are small; epicentres are Agneta Nyholm’s pre-registered locations (hypothesis).'}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          {sv ? 'Epicentra & fältmaterial: Agneta Nyholm (ortnamnskluster, Ångermanland). Metod: onomastic_radial_profile (anrikning mot binomialt bakgrundsband).' : 'Epicentres & field material: Agneta Nyholm.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default AngermanlandClusterResults;
