import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CorpusThemePage, type ThemeRow } from '@/components/research/CorpusThemePage';

const parsePt = (v: unknown): [number, number] | null => {
  if (!v) return null;
  if (typeof v === 'object' && v !== null && 'x' in v && 'y' in v) { const o = v as { x: number; y: number }; return [o.y, o.x]; }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/); return m ? [+m[2], +m[1]] : null;
};

const CAT_SV: Record<string, string> = {
  honorific: 'hederstitel', rank: 'rang', craft: 'hantverk', guild: 'gille',
  naval: 'sjöfart', landholding: 'jordägo', cultic: 'kult', administrative: 'förvaltning', servile: 'ofri',
};

export default function Titlar() {
  const [raw, setRaw] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('inscription_titles') as any)
        .select('signum, title_code, label_sv, category, runic_inscriptions(coordinates)');
      setRaw(data ?? []);
    })();
  }, []);

  const rows = useMemo<ThemeRow[]>(() => raw.map((d) => {
    const pt = parsePt(d.runic_inscriptions?.coordinates);
    return { signum: d.signum, label: `${d.label_sv} · ${CAT_SV[d.category] ?? d.category}`, lat: pt?.[0] ?? null, lng: pt?.[1] ?? null };
  }).sort((a, b) => a.label.localeCompare(b.label)), [raw]);

  const stats = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const d of raw) byCat.set(d.category, (byCat.get(d.category) ?? 0) + 1);
    return [...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ label: CAT_SV[c] ?? c, value: n }));
  }, [raw]);

  return (
    <CorpusThemePage
      title="Titlar & yrken i runcorpusen" titleEn="Titles & occupations on the runestones"
      description="Belagda titlar, befattningar och yrken på skandinaviska runstenar — disambiguerat ur normaliseringen."
      center={[59.3, 17.2]} zoom={5}
      stats={stats}
      intro={<>
        <p>Runstenar hyllar <strong className="text-foreground">status, släkt och resor</strong> — sällan yrken. Bara ~3 % av korpusen bär en titel. Dominerar gör hederstitlarna <strong>þegn</strong> och <strong>drengr</strong> (danskt/sydsvenskt, sent 900-tal) och rangen <strong>jarl</strong> (Uppland/Norge). Hantverk = nästan bara <strong>smiðr</strong> (smed). <strong>Slavar</strong> (þræll) är i stort osynliga — men undantag finns: Sö 133 nämner "Atte, Spinkas träl". Förvaltaren <strong>bryti</strong> (3 stenar) är föregångaren till det medeltida fogdesystemet.</p>
        <p className="text-[12px]">Disambiguerat: goði (kult) skildes från adjektivet "god", bryti från verbet "bryter". Inga lagmän/jurister, lotsar eller kaptener förekommer — styrman (stýrimaðr) är högsta skeppsbefattning.</p>
      </>}
      footerNote="Källa: Rundata (normalisering). Tabell: inscription_titles. Punkterna = stenens plats. Titlar med osäker läsning är utelämnade."
      rows={rows}
    />
  );
}
