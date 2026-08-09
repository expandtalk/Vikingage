import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords, GitBranch, AlertTriangle, Info, Hammer, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// /sv/legendstenar — figurativa "legendstenar" (Sigurd/Gunnar/Tor) och den forensiska
// motiv-fingeravtrycks-klustringen ur motif_attestation + motif_vocabulary. Hederlighet:
// klustren är HYPOTESER, varje motiv bär confidence + källa (DB-påtvingat), Gs 2 = rekonstruktion.

interface Insc { signum: string; name: string | null; name_en: string | null; carver: string | null; style_group: string | null; province: string | null; coordinates: string | { x: number; y: number } | null; }
interface Att { motif_cycle: string; motif_key: string; confidence: string; is_hypothesis: boolean; source: string; runic_inscriptions: Insc | null; }
interface Vocab { motif_cycle: string; motif_key: string; label_sv: string; label_en: string; }

const CYCLE: Record<string, { label: string; color: string }> = {
  sigurd: { label: 'Sigurdscykeln', color: '#d4a63c' },
  gunnar: { label: 'Gunnarscykeln (ormgropen)', color: '#a24b4b' },
  thors_fiske: { label: 'Tors fiskefärd', color: '#4d6fa6' },
  board_game: { label: 'Brädspel (hnefatafl)', color: '#5c8a5a' },
};
const cyc = (k: string) => CYCLE[k] ?? { label: k, color: '#5b6976' };
const CONF: Record<string, string> = { certain: 'belagt', probable: 'sannolikt', possible: 'möjligt', disputed: 'omtvistat' };

const parsePoint = (v: Insc['coordinates']): [number, number] | null => {
  if (!v) return null;
  if (typeof v === 'object') { const x = Number(v.x), y = Number(v.y); return Number.isFinite(x) && Number.isFinite(y) ? [y, x] : null; }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/);
  return m ? [+m[2], +m[1]] : null; // point = (lng,lat) → [lat,lng]
};

interface Stone { signum: string; name: string; cycle: string; carver: string | null; style: string | null; province: string | null; pt: [number, number] | null; motifs: { key: string; label: string; confidence: string; hyp: boolean }[]; }

const LegendMap: React.FC<{ stones: Stone[] }> = ({ stones }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { preferCanvas: true, center: [59.8, 16.9], zoom: 7, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    const pts: [number, number][] = [];
    stones.forEach((s) => {
      if (!s.pt) return;
      pts.push(s.pt);
      const color = cyc(s.cycle).color;
      const motifHtml = s.motifs.map((m) => `<li style="margin:1px 0">${m.label} <span style="color:#888;font-size:10px">(${CONF[m.confidence] ?? m.confidence}${m.hyp ? ', hypotes' : ''})</span></li>`).join('');
      L.circleMarker(s.pt, { radius: 7, color, weight: 2, fillColor: color, fillOpacity: 0.6 })
        .bindTooltip(s.name, { direction: 'top', offset: [0, -8], className: 'ang-clabel' })
        .bindPopup(`<b>${s.name}</b> <span style="font-size:10px;color:#888">${s.signum}</span><br/><span style="font-size:11px;color:${color}">${cyc(s.cycle).label}</span>${s.carver ? `<br/><span style="font-size:11px">ristare: ${s.carver}</span>` : ''}<ul style="margin:4px 0 0 0;padding-left:16px;font-size:11px">${motifHtml}</ul>`)
        .addTo(layer);
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 9 });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [stones]);
  return <div ref={ref} className="w-full h-[440px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 440 }} />;
};

const LegendStones = () => {
  const [atts, setAtts] = useState<Att[]>([]);
  const [vocab, setVocab] = useState<Vocab[]>([]);

  useEffect(() => {
    (supabase.from('motif_attestation') as any)
      .select('motif_cycle, motif_key, confidence, is_hypothesis, source, runic_inscriptions(signum,name,name_en,carver,style_group,province,coordinates)')
      .then(({ data }: { data: Att[] | null }) => setAtts(data ?? []));
    (supabase.from('motif_vocabulary') as any).select('motif_cycle,motif_key,label_sv,label_en')
      .then(({ data }: { data: Vocab[] | null }) => setVocab(data ?? []));
  }, []);

  const vmap = useMemo(() => {
    const m = new Map<string, string>();
    vocab.forEach((v) => m.set(`${v.motif_cycle}|${v.motif_key}`, v.label_sv));
    return m;
  }, [vocab]);

  const stones = useMemo<Stone[]>(() => {
    const by = new Map<string, Stone>();
    atts.forEach((a) => {
      const ri = a.runic_inscriptions; if (!ri) return;
      const key = ri.signum;
      if (!by.has(key)) by.set(key, {
        signum: ri.signum, name: ri.name || ri.signum, cycle: a.motif_cycle, carver: ri.carver,
        style: ri.style_group, province: ri.province, pt: parsePoint(ri.coordinates), motifs: [],
      });
      by.get(key)!.motifs.push({ key: a.motif_key, label: vmap.get(`${a.motif_cycle}|${a.motif_key}`) ?? a.motif_key, confidence: a.confidence, hyp: a.is_hypothesis });
    });
    return [...by.values()].sort((a, b) => b.motifs.length - a.motifs.length);
  }, [atts, vmap]);

  // Kluster per cykel
  const byCycle = useMemo(() => {
    const m = new Map<string, Stone[]>();
    stones.forEach((s) => { if (!m.has(s.cycle)) m.set(s.cycle, []); m.get(s.cycle)!.push(s); });
    return [...m.entries()];
  }, [stones]);

  // Forensiskt fingeravtryck: delade motiv per stenpar inom cykel
  const pairs = useMemo(() => {
    const out: { a: string; b: string; shared: string[]; cycle: string }[] = [];
    for (let i = 0; i < stones.length; i++) for (let j = i + 1; j < stones.length; j++) {
      const A = stones[i], B = stones[j]; if (A.cycle !== B.cycle) continue;
      const bk = new Set(B.motifs.map((m) => m.key));
      const shared = A.motifs.filter((m) => bk.has(m.key)).map((m) => m.label);
      if (shared.length >= 2) out.push({ a: A.name, b: B.name, shared, cycle: A.cycle });
    }
    return out.sort((x, y) => y.shared.length - x.shared.length);
  }, [stones]);

  // Ristare tvärs cykler
  const carverCross = useMemo(() => {
    const m = new Map<string, Set<string>>();
    const stonesByCarver = new Map<string, { signum: string; cycle: string }[]>();
    stones.forEach((s) => {
      if (!s.carver) return;
      if (!m.has(s.carver)) { m.set(s.carver, new Set()); stonesByCarver.set(s.carver, []); }
      m.get(s.carver)!.add(s.cycle);
      stonesByCarver.get(s.carver)!.push({ signum: s.signum, cycle: s.cycle });
    });
    return [...m.entries()].filter(([, c]) => c.size >= 2).map(([carver]) => ({ carver, stones: stonesByCarver.get(carver)! }));
  }, [stones]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Legendstenar — Sigurd, Gunnar och Tor i bild, och motiv-forensiken"
        titleEn="Legend stones — Sigurd, Gunnar and Thor in pictures, and motif forensics"
        description="Figurativa vikingatida runstenar som berättar en myt i bild (Sigurdscykeln, Gunnar i ormgropen, Tors fiskefärd) — och en forensisk klustring på motiv-fingeravtryck som binder samman traditioner tvärs ristare. Varje motiv källbelagt med konfidens; klustren redovisade som hypoteser."
        descriptionEn="Figurative Viking Age runestones that tell a myth in pictures (the Sigurd cycle, Gunnar in the snake pit, Thor's fishing expedition) — with a forensic clustering on motif fingerprints binding traditions across carvers."
        keywords="legendstenar, Sigurdstenar, Sigurdsristningen, Ramsund, Gökstenen, Drävlestenen, Altunastenen, Gunnar ormgropen, Tors fiske, ikonografi, runristare, Balle, Livsten"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Swords className="h-8 w-8 text-gold" /> Legendstenar och motiv-forensiken
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Myten i bild — och vad motiven avslöjar om traditionen</p>
          <p className="text-muted-foreground text-lg">
            De flesta runstenar är text + kors + slinga. En liten grupp berättar i stället en <strong>myt i bild</strong>:
            Sigurd som dräper draken Fafnir, Gunnar i ormgropen, Tor som metar Midgårdsormen. Genom att koda varje
            <strong> motiv</strong> strukturerat (med källa och konfidens) kan vi <strong>klustra</strong> stenarna på deras
            gemensamma "fingeravtryck" — och se vilka traditioner som binds samman, tvärs olika <strong>ristare</strong>.
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Legendstenarna i landskapet</CardTitle></CardHeader>
          <CardContent>
            <LegendMap stones={stones} />
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {Object.entries(CYCLE).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1.5"><span style={{ width: 10, height: 10, borderRadius: 9999, background: v.color, display: 'inline-block' }} /> {v.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KLUSTER PER CYKEL */}
        {byCycle.map(([cycleKey, list]) => (
          <Card className="viking-card mb-4" key={cycleKey}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2" style={{ color: cyc(cycleKey).color }}>
                <GitBranch className="h-5 w-5" /> {cyc(cycleKey).label} <span className="text-xs text-muted-foreground">({list.length} stenar)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {list.map((s) => (
                <div key={s.signum} className="border-b border-slate-800/60 last:border-0 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-foreground font-medium text-sm">{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{s.signum}</span>
                    {s.style && <Badge variant="secondary" className="text-[10px]">stil {s.style}</Badge>}
                    {s.carver && <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><Hammer className="h-3 w-3" /> {s.carver}</span>}
                    {s.province && <span className="text-[10px] text-muted-foreground">{s.province}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.motifs.map((m) => (
                      <span key={m.key} className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs" style={{ borderColor: cyc(cycleKey).color + '66' }}>
                        <span className="text-foreground">{m.label}</span>
                        <span className="text-[9px] text-muted-foreground">{CONF[m.confidence] ?? m.confidence}{m.hyp ? '·hyp' : ''}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* FINGERAVTRYCK — DELADE MOTIV */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><GitBranch className="h-5 w-5" /> Fingeravtryck: delade motiv per stenpar</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p className="text-xs opacity-80">Ju fler delade motiv, desto tätare traditionsband. Två undergrupper faller ut: <strong>fullnarrativ</strong> (Ramsund + Gök) och <strong>Sigrdriva/Andvari</strong> (Drävle + Stora Ramsjö).</p>
            {pairs.map((p, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-2 border-b border-slate-800/50 last:border-0 py-1">
                <span className="text-foreground text-sm font-medium">{p.a} ∩ {p.b}</span>
                <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: cyc(p.cycle).color + '22', color: cyc(p.cycle).color }}>{p.shared.length} delade</Badge>
                <span className="text-xs text-muted-foreground">{p.shared.join(', ')}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RISTARE TVÄRS CYKLER */}
        {carverCross.length > 0 && (
          <Card className="viking-card mb-4 border-gold/40">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><Hammer className="h-5 w-5" /> En hand som gör legendstenar</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs opacity-80">Hypotesen som startade allt: finns en ristare som gör figurativa legendstenar tvärs olika myter? Datan säger:</p>
              {carverCross.map((cc) => (
                <div key={cc.carver} className="text-sm">
                  <strong className="text-foreground">{cc.carver}</strong> — {cc.stones.map((s) => <span key={s.signum}>{s.signum} <span style={{ color: cyc(s.cycle).color }}>[{cyc(s.cycle).label}]</span>{' '}</span>)}
                </div>
              ))}
              <p className="text-xs opacity-70">Dvs samma hand tvärs skilda myt-cykler — traditionen bärs av ristare, inte bara av motivet.</p>
            </CardContent>
          </Card>
        )}

        {/* FÖRBEHÅLL */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Så ska det läsas (hederlighet)</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
            <p>• <strong>Klustren är hypoteser</strong>, inte bevis — förslag att testa, inte resultat.</p>
            <p>• <strong>Varje motiv bär confidence + källa</strong> (databas-påtvingat) och kan inte läggas in anonymt. Osäkra/rekonstruerade poster (t.ex. Gs 2, ur en 1690-teckning) är flaggade som hypotes.</p>
            <p>• <strong>Litet urval</strong> och motiven kodade av en hand — en publicerbar studie kräver hela figurstens-corpusen och flera oberoende kodare.</p>
            <p>• Motiv-identifiering ≠ dateringsbevis; stil (Gräslund) och motiv redovisas separat.</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Data: <code>motif_attestation</code> + <code>motif_vocabulary</code> (kontrollerad vokabulär, FK-tvingad) + <code>runic_inscriptions</code>. Motiv källverifierade mot Sigurd stones (Wikipedia) och foto (Ramsund, Altuna). Metoden är samma forensiska ansats som runsten-/fornborgs-fingeravtrycken.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default LegendStones;
