import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CorpusThemePage, type ThemeRow } from '@/components/research/CorpusThemePage';

const parsePt = (v: unknown): [number, number] | null => {
  if (!v) return null;
  if (typeof v === 'object' && v !== null && 'x' in v && 'y' in v) { const o = v as { x: number; y: number }; return [o.y, o.x]; }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/); return m ? [+m[2], +m[1]] : null;
};

export default function Langbardaland() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('runic_inscriptions') as any)
        .select('signum, translation_sv, translation_en, coordinates, landscape')
        .or('translation_sv.ilike.%langbar%,translation_en.ilike.%lombard%,normalization.ilike.%langbar%');
      const rs: ThemeRow[] = (data ?? []).map((d: any) => {
        const pt = parsePt(d.coordinates);
        return { signum: d.signum, label: (d.translation_sv || d.translation_en || '').slice(0, 140), lat: pt?.[0] ?? null, lng: pt?.[1] ?? null, note: d.landscape ?? null };
      });
      setRows(rs);
    })();
  }, []);
  return (
    <CorpusThemePage
      title="Langbardaland" titleEn="Lombardy on the runestones"
      description="Runstenar som nämner Langbardaland (Italien/Lombardiet) — och frågan om langobardernas nordiska ursprung."
      center={[59.4, 17.0]} zoom={6}
      stats={[{ label: 'Langbardaland-stenar', value: rows.length }]}
      intro={<>
        <p><strong className="text-foreground">Langbardaland</strong> (Lombardiet, norra Italien) nämns på ett fåtal svenska runstenar — män som dog där på österleden, bl.a. <strong>Sö 65</strong> (Olov, "österut plöjde med stäven och ändades i Langbardaland") och <strong>U 133 / U 141</strong> (Holmi, "died in Lombardy").</p>
        <p><strong className="text-foreground">Viktig åtskillnad:</strong> dessa stenar (1000-tal) visar <em>resor</em> till Italien — inte langobardernas ursprung. Enligt tradition (Paulus Diaconus) skulle langobarderna ha utvandrat från Skandinavien, men det vore i så fall folkvandringstid (~500-tal), ~500 år <em>före</em> runstenarna. Kontakt, inte härkomst.</p>
      </>}
      footerNote="Källa: Rundata. Langobard-migrationshypotesen (Scadinavia → Italien, 400–500-tal) hör till folkvandringstiden och kan inte beläggas av runstenar; den diskuteras separat under folkgrupper/genetik."
      rows={rows}
    />
  );
}
