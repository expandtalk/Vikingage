import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Landmark, ScrollText, Scale, Users } from 'lucide-react';

// GUSTAV VASAS GODS & ARV — källkritisk PROVENANSANALYS (samma modell som BjalboEstates). Grupperat på
// provenansklass A–F, inte nivå 1–4: "arv och eget" (1531) blandar arv, köp, pant och indraget kyrkogods.
// KÄRNPRINCIP: "arv och eget" ≠ "ärvt". Data ur person_place_claims (person_name='Gustav I'). Fyra sakfel i
// underlaget korrigerade mot källa. Gård-för-gård kräver jordeböckerna 1502/1531 (ej ingestade) — markeras ärligt.

type Row = {
  place_label: string; relation_type: string; evidence_grade: string; coord_status: string;
  provenance_class: string | null; event: string | null; inheritance_chain: string | null;
  primary_source: string | null; secondary_source: string | null; uncertain: boolean;
  notes: string | null; analysis_source: string | null;
};

const CLASS: Record<string, { sv: string; en: string; hint_sv: string }> = {
  A: { sv: 'A — Fädernearv', en: 'A — Paternal inheritance', hint_sv: 'Ärvt från fadern Erik Johansson Vasa.' },
  B: { sv: 'B — Mödernearv', en: 'B — Maternal inheritance', hint_sv: 'Från moderns/mormoderns linje (Eka / Sigrid Eskilsdotter Banér).' },
  C: { sv: 'C — Äldre ättegods', en: 'C — Older family estate', hint_sv: 'Vasa/Sture-släktgods där arvskedjan behöver rekonstrueras.' },
  D: { sv: 'D — Sture/Banér-arv', en: 'D — Sture/Banér inheritance', hint_sv: 'Kom in genom släktkopplingen till Sture- och Banérätterna.' },
  E: { sv: 'E — Förvärv under Gustav', en: 'E — Acquired by Gustav', hint_sv: 'Köp, byte, pantinlösen.' },
  F: { sv: 'F — Kyrko-/kronoreduktion', en: 'F — Church/crown reduction', hint_sv: 'Indraget kloster-, biskops-, domkyrko- eller konfiskerat gods (Västerås recess 1527).' },
};
const ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];
const GRADE: Record<string, string> = { 'A+': '#10b981', 'A': '#f59e0b', 'B': '#60a5fa', 'C': '#94a3b8', 'D': '#64748b' };

export const VasaEstates: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: rows = [] } = useQuery({
    queryKey: ['vasa-estates'],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data } = await (supabase as any).from('person_place_claims')
        .select('place_label,relation_type,evidence_grade,coord_status,provenance_class,event,inheritance_chain,primary_source,secondary_source,uncertain,notes,analysis_source')
        .ilike('person_name', 'Gustav I')
        .order('provenance_class', { ascending: true });
      return (data ?? []) as Row[];
    },
  });
  if (!rows.length) return null;
  const aiSource = rows.find((r) => r.analysis_source)?.analysis_source;
  const byClass = (cls: string) => rows.filter((r) => r.provenance_class === cls);

  return (
    <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-left">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
        <Landmark className="h-4 w-4" /> {sv ? 'Gustav Vasas gods & arv — provenansanalys' : "Gustav Vasa's estates & inheritance"}
      </div>
      <p className="mb-3 max-w-3xl text-sm leading-relaxed text-slate-300">
        {sv
          ? '"Arv och eget" i 1531 års jordebok är INTE liktydigt med "ärvt". Godsmassan växte enormt genom köp, byten, pantinlösen och kyrkoreduktion (Västerås recess 1527). Vi klassar därför varje dokumenterat gods per proveniens (A–F) — aldrig som "arv" i klump.'
          : '"Inheritance and own" in the 1531 land register is NOT the same as "inherited". The estate mass grew through purchase, exchange and church reduction. Each documented estate is graded by provenance (A–F).'}
      </p>

      {/* STAL HAN GÅRDARNA? — källkritisk ram, inte en dom */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[13px] leading-relaxed text-slate-300">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p>
          {sv
            ? 'Stal Gustav gårdarna? Förvärven bar RÄTTSLIG form — riksrådsdomen 1528 (Sturegods) och Västerås recess 1527 (kyrkogods). Men legitimiteten i de instrumenten är omtvistad: Gustav dominerade rådet och reduktionen skedde under tvång. Varken "stöld" eller "legitimt arv" som platt faktum — en dokumenterad maktförskjutning vars rättsgrund är källkritiskt omstridd. Och greppet löper genom hela kedjan: Sven Ulric Palme (1968) tecknar Sten Sture d.ä. själv som jordspekulant och "änkoplundrare" som drog in stormäns län — den heroiska Sturebilden var delvis ett självporträtt, vidarefört av Gustav Vasa och Johannes Magnus.'
            : 'Did Gustav steal the estates? The acquisitions had legal form (1528 council judgment; 1527 Västerås recess), but the legitimacy of those instruments is contested. Neither "theft" nor "legitimate inheritance" as flat fact — a documented power shift whose legal basis is debated. And the pattern runs through the whole chain: Palme (1968) portrays Sten Sture the Elder himself as a land speculator and "widow-plunderer".'}
        </p>
      </div>

      {ORDER.map((cls) => {
        const items = byClass(cls);
        if (!items.length) return null;
        return (
          <div key={cls} className="mb-4 last:mb-0">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {sv ? CLASS[cls].sv : CLASS[cls].en} <span className="font-normal normal-case text-slate-500">— {CLASS[cls].hint_sv}</span>
            </div>
            <ul className="space-y-2">
              {items.map((r) => (
                <li key={r.place_label} className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: GRADE[r.evidence_grade] ?? '#94a3b8' }} />
                    <span className="font-semibold text-slate-100">{r.place_label}</span>
                    <span className="rounded border border-slate-600 px-1.5 text-[10px] text-slate-300">{r.evidence_grade}</span>
                    {r.uncertain && <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 text-[10px] text-red-200">{sv ? 'hypotes' : 'hypothesis'}</span>}
                    {r.coord_status === 'none' && <span className="text-[10px] text-slate-500">{sv ? 'ej kartlagd' : 'not mapped'}</span>}
                    {r.coord_status === 'verified' && <span className="text-[10px] text-emerald-400/70">{sv ? 'koord ✓' : 'coord ✓'}</span>}
                  </div>
                  {r.event && <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{r.event}</p>}
                  {r.inheritance_chain && <p className="mt-1 text-[11px] leading-snug text-amber-200/80">↳ {r.inheritance_chain}</p>}
                  {r.notes && <p className="mt-1 text-[11px] leading-snug text-slate-400">{r.notes}</p>}
                  {(r.primary_source || r.secondary_source) && (
                    <p className="mt-0.5 text-[10px] text-slate-500">{sv ? 'Källa' : 'Source'}: {[r.primary_source, r.secondary_source].filter(Boolean).join(' · ')}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* STURE-KOPPLING */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-[12px] leading-relaxed text-slate-400">
        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
        <div>
          <p>
            {sv
              ? 'Kopplingen till Stureätten är central och dubbel: en stor del av godsmassan kom via Sten Sture d.ä:s KÖPEGODS (riksrådsdomen 1528, klass D; farmodern Birgitta Gustavsdotter Sture är den genealogiska grunden) OCH via Sten Sture d.y:s änka Kristina Gyllenstierna (Gustavs moster) vid arvskiftet 1528. Det dynastiska hotet var konkret: Kristinas son Nils Stensson Sture (1512–27), Gustavs kusin och Sture-arvinge, blev fokus för Daljunkern-upproret 1527 — en dokumenterad TRONPRETENDENT (om Daljunkern verkligen var Nils är omstritt; Larsson 2002 / Harrison 2010 lutar åt ja). Men LAGLIG arvsrätt fanns inte: Sverige var valrike (arvrike i Vasa-ätten först genom Västerås arvförening 1544). Alltså fruktad rival och pretendent — inte "legitim kronarvinge". Sten Sture d.ä. (†1503, sjöbladsätten) och d.y. (†1520, Natt och Dag) var skilda ätter.'
              : "The Sture link is central and twofold: via Sten Sture the Elder's purchased lands (1528 judgment) and via Sten Sture the Younger's widow Kristina Gyllenstierna (Gustav's aunt). Her son Nils Stensson Sture (1512–27), Gustav's cousin, became the figurehead of the 1527 Daljunkern rising — a documented throne pretender, though no legal hereditary right existed (elective kingdom until 1544)."}
          </p>
          <a href={`/?q=${encodeURIComponent('Nils Stensson Sture')}`}
            className="mt-1 inline-block text-[11px] font-medium text-amber-300/90 hover:text-amber-200">
            {sv ? 'Läs mer om Nils Stensson Sture (Daljunkern) →' : 'More on Nils Stensson Sture (the Daljunkern) →'}
          </a>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 border-t border-slate-700 pt-3 text-[11px] leading-relaxed text-slate-500">
        <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          {sv ? 'Analys: ' : 'Analysis: '}{aiSource || 'AI-assisterad; ej slutverifierad av människa.'}{' '}
          {sv ? 'Litteraturens siffror (~526 arv-och-eget-gårdar i Uppland 1531, ~900 köpta, ~5000 totalt) är AGGREGAT — en gård-för-gård-proveniens kräver jordeböckerna 1502/1515/1531 (RA), ännu ej ingestade. Koordinater via Wikidata P625.' : 'Literature figures are aggregates; a plot-by-plot provenance requires the land registers (not yet ingested).'}
        </p>
      </div>
    </section>
  );
};
