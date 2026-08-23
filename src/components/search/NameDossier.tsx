import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { BookOpen, CalendarDays, Users, TrendingUp, Landmark, Sparkles, ExternalLink, BookMarked } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// NAMN-DOSSIER: leder på en bar förnamns-query (t.ex. "anna", "daniel") i stället för att kollapsa
// till en slumpperson. Läser name_authority (tre axlar: ursprung/tradition/svenskt-bruk-lager) +
// namnsdag + statistik + name_birthyear_stats + kända bärare ur persons.
// RÄTTIGHET: bara PD/CC-porträtt av VERKLIGA personer (persons.image_url är licenskollad); reception
// (t.ex. "Star Wars 1977") är FAKTATEXT, aldrig reproduktion av skyddad figur/verk.
export interface NameRow {
  id: string; canonical: string; gender: string | null;
  meaning: string | null; etymology: string | null; origin_language: string | null;
  tradition_layer: string | null; theophoric: boolean | null;
  swedish_usage_layer: string | null; first_attestation_year: number | null; first_attestation_source: string | null;
  on_runestone: boolean | null; runestone_inscriptions: number | null;
  sdhk_first_year: number | null; persons_first_year: number | null;
  name_day_text: string | null; total_bearers: number | null; modern_birth_count: number | null;
  birthyear_peak_decade: string | null; popularization: string | null;
}

const LAYER_LABEL: Record<string, string> = {
  'runsvenskt (belagt vikingatid)': 'Runsvenskt — belagt på runsten (vikingatid)',
  'sent runbelägg (kristet/medeltida — ej vikingatida namnskatt)': 'Sent runbelägg (kristet/medeltida)',
  'sagobelagt/legendariskt (kunga-/sagobelägg)': 'Sago-/kungalängdsbelagt',
  'medeltida (SDHK-belägg)': 'Medeltida — belagt i medeltidsbrev (SDHK)',
  'äldre belägg (personregister)': 'Äldre belägg (personregister)',
  'endast modernt belägg': 'Modernt bruk',
  'obelagt i våra korpusar': 'Obelagt i våra källor',
};

const KIND_LABEL_SV: Record<string, string> = {
  biblical: 'biblisk gestalt', literary: 'litterär figur (fiktion)',
  mythological: 'mytologisk gestalt', legendary: 'legendarisk', historical: 'historisk',
};
const KIND_LABEL_EN: Record<string, string> = {
  biblical: 'biblical figure', literary: 'literary figure (fiction)',
  mythological: 'mythological figure', legendary: 'legendary', historical: 'historical',
};

export default function NameDossier({ name, onQuery, sv }: { name: NameRow; onQuery?: (q: string) => void; sv: boolean }) {
  const canon = name.canonical;

  // Kända bärare ur persons (exakt förnamn). RANKNING (Daniel): historiskt värde först — gamla kungar
  // ska ligga högst, inte tryckas ut av moderna kändisar med fler Wikipedia-språk. Hämta brett (40) på
  // sitelinks, re-ranka sen klient-sida: kunglig → förmodern (≤1600) → modern; äldst först bland de
  // historiska (så en vikinga-/medeltidskung slår en nutida namne). En vikingakung ÄR poängen här.
  const ROYAL = /(kung|konung|monark|drottning|regent|jarl|hertig|furste|kejsar|king|queen|monarch|duke|earl|emperor)/i;
  const { data: bearers = [] } = useQuery({
    queryKey: ['name-bearers', canon],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<any[]> => {
      // KÄLLA: persons (Wikidata, mest moderna) + historical_kings (vikinga-/medeltidskungar som INTE
      // finns i persons — det var därför Sven Tveskägg "försvann"). Kungar rankas FÖRST, äldst först.
      const [pRes, kRes] = await Promise.all([
        (supabase as any).from('persons')
          .select('id,name,birth_year,death_year,description_sv,occupations,image_url,image_license,sitelinks,wikidata_qid')
          .or(`name.eq.${canon},name.ilike.${canon} %`)
          .order('sitelinks', { ascending: false, nullsFirst: false }).limit(40),
        (supabase as any).from('historical_kings')
          .select('id,name,birth_year,death_year,description,image_url,image_credit,role,region,reign_start,reign_end')
          .or(`name.eq.${canon},name.ilike.${canon} %,name.ilike.%-${canon}`),
      ]);
      const persons = ((pRes.data ?? []) as any[]).map((p) => ({ ...p, _king: false }));
      const kings = ((kRes.data ?? []) as any[]).map((k) => ({
        id: k.id, name: k.name, birth_year: k.birth_year, death_year: k.death_year,
        occupations: [k.role || k.region || 'regent'].filter(Boolean), description_sv: k.description,
        image_url: k.image_url, image_license: null, image_credit: k.image_credit,
        _king: true, reign_start: k.reign_start, reign_end: k.reign_end,
      }));
      const kingYear = (k: any) => Number(k.death_year ?? k.reign_end ?? k.birth_year ?? k.reign_start ?? 9999);
      kings.sort((a, b) => kingYear(a) - kingYear(b)); // äldst först — vikingakung överst
      // Persons re-rankas: kunglig → förmodern (≤1600) → modern; historiska äldst först.
      const isRoyal = (b: any) => ROYAL.test([...(Array.isArray(b.occupations) ? b.occupations : []), b.description_sv || ''].join(' '));
      const year = (b: any) => Number(b.death_year ?? b.birth_year ?? 9999);
      const tier = (b: any) => isRoyal(b) ? 0 : (year(b) <= 1600 ? 1 : 2);
      persons.sort((a, b) => {
        const ta = tier(a), tb = tier(b);
        if (ta !== tb) return ta - tb;
        if (ta < 2) return year(a) - year(b);
        return Number(b.sitelinks ?? 0) - Number(a.sitelinks ?? 0);
      });
      // Kungar först (historiskt värde), sen personer. Dedupa på namn (kung kan även finnas i persons).
      const seen = new Set<string>();
      return [...kings, ...persons].filter((b) => { const k = b.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
    },
  });

  // Namnet i tradition & kultur: bibliska/litterära gestalter (name_namesakes). Åtskilda
  // från "Kända bärare" (verkliga personer) — varje post bär en kind-etikett.
  const { data: namesakes = [] } = useQuery({
    queryKey: ['name-namesakes', canon],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<any[]> => {
      const { data } = await (supabase as any).from('name_namesakes')
        .select('id,figure_name,kind,summary_sv,summary_en,work_title,work_author,work_year,source_ref,image_url,image_license,image_credit')
        .contains('name_slugs', [canon]).order('sort_order');
      return data ?? [];
    },
  });

  // Födelseårs-serie (SCB TAB615) → decennie-staplar.
  const { data: birthyears = [] } = useQuery({
    queryKey: ['name-birthyears', canon],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<{ birth_year: number; count: number }[]> => {
      const { data } = await (supabase as any).from('name_birthyear_stats')
        .select('birth_year,count').ilike('name', canon).order('birth_year');
      return data ?? [];
    },
  });
  const decades = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of birthyears) { const d = Math.floor(r.birth_year / 10) * 10; m.set(d, (m.get(d) || 0) + r.count); }
    const arr = [...m.entries()].sort((a, b) => a[0] - b[0]);
    const max = Math.max(1, ...arr.map(([, n]) => n));
    return { arr, max };
  }, [birthyears]);

  const usageLabel = name.swedish_usage_layer ? (LAYER_LABEL[name.swedish_usage_layer] ?? name.swedish_usage_layer) : null;

  // Tidslinje-steg (belagda), äldst först.
  const timeline: { label: string; sub: string }[] = [];
  if (name.on_runestone) timeline.push({ label: sv ? 'Runsten' : 'Runestone', sub: name.runestone_inscriptions ? `${name.runestone_inscriptions} ${sv ? 'inskr.' : 'inscr.'}` : (sv ? 'vikingatid' : 'Viking age') });
  if (name.sdhk_first_year) timeline.push({ label: sv ? 'Medeltidsbrev' : 'Medieval charters', sub: `${sv ? 'fr.' : 'from'} ${name.sdhk_first_year} (SDHK)` });
  if (name.persons_first_year) timeline.push({ label: sv ? 'Personregister' : 'Person records', sub: `${sv ? 'tidigast' : 'earliest'} ${name.persons_first_year}` });
  if (name.modern_birth_count) timeline.push({ label: sv ? 'Modernt' : 'Modern', sub: `${name.modern_birth_count} ${sv ? 'nyfödda (senaste år)' : 'newborns (latest)'}` });

  return (
    <div className="border-b border-slate-800 bg-slate-900">
      {/* Rubrik + betydelse */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-white">{canon}</h1>
          {name.gender && <span className="text-xs text-slate-400">{name.gender}</span>}
        </div>
        {name.meaning && <p className="mt-0.5 text-sm text-amber-200/90">{sv ? 'Betydelse' : 'Meaning'}: {name.meaning}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {name.tradition_layer && <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-200">{name.tradition_layer}{name.origin_language ? ` · ${name.origin_language}` : ''}</span>}
          {name.theophoric && <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-200">{sv ? 'teofort (gudanamn)' : 'theophoric'}</span>}
          {usageLabel && <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-300">{usageLabel}</span>}
        </div>
      </div>

      {/* Etymologi (axel 1) */}
      {name.etymology && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <BookOpen className="h-3.5 w-3.5" /> {sv ? 'Ursprung & betydelse' : 'Origin & meaning'}
          </div>
          <p className="text-[15px] leading-relaxed text-slate-200">{name.etymology}</p>
        </div>
      )}

      {/* Svenskt-bruk-tidslinje (axel 3) */}
      {timeline.length > 0 && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <Landmark className="h-3.5 w-3.5" /> {sv ? 'När namnet kom i svenskt bruk' : 'When the name entered Swedish use'}
          </div>
          <div className="flex flex-wrap items-stretch gap-2">
            {timeline.map((t, i) => (
              <div key={i} className="rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1.5">
                <div className="text-xs font-semibold text-slate-100">{t.label}</div>
                <div className="text-[10px] text-slate-400">{t.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">{sv ? 'Härlett ur våra korpusar (runsten → medeltidsbrev → personregister → modern statistik). Belägg ≠ namnets absoluta ålder.' : 'Derived from our corpora; attestation ≠ absolute age of the name.'}</p>
        </div>
      )}

      {/* Namnsdag + statistik */}
      {(name.name_day_text || name.total_bearers != null) && (
        <div className="grid grid-cols-2 gap-px border-t border-slate-800 bg-slate-800/40 sm:grid-cols-3">
          {name.name_day_text && (
            <div className="bg-slate-900 px-4 py-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400"><CalendarDays className="h-3 w-3" />{sv ? 'Namnsdag' : 'Name day'}</div><div className="mt-0.5 text-sm font-semibold text-amber-100">{name.name_day_text}</div></div>
          )}
          {name.total_bearers != null && (
            <div className="bg-slate-900 px-4 py-3"><div className="text-[10px] uppercase tracking-wide text-slate-400">{sv ? 'Antal bärare' : 'Bearers'}</div><div className="mt-0.5 text-sm font-semibold text-amber-100">{name.total_bearers.toLocaleString('sv-SE')}</div></div>
          )}
          {name.birthyear_peak_decade && (
            <div className="bg-slate-900 px-4 py-3"><div className="text-[10px] uppercase tracking-wide text-slate-400">{sv ? 'Populärast' : 'Peak'}</div><div className="mt-0.5 text-sm font-semibold text-amber-100">{name.birthyear_peak_decade}</div></div>
          )}
        </div>
      )}

      {/* Popularitet över tid (decennie-staplar) */}
      {decades.arr.length > 1 && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <TrendingUp className="h-3.5 w-3.5" /> {sv ? 'Popularitet per födelseårtionde' : 'Popularity by birth decade'}
          </div>
          <div className="flex items-end gap-1" style={{ height: 56 }}>
            {decades.arr.map(([d, n]) => (
              <div key={d} className="flex flex-1 flex-col items-center justify-end" title={`${d}-tal: ${n.toLocaleString('sv-SE')}`}>
                <div className="w-full rounded-t bg-amber-500/70" style={{ height: `${Math.max(3, (n / decades.max) * 48)}px` }} />
                <div className="mt-0.5 text-[8px] text-slate-500">{String(d).slice(2)}</div>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-slate-500">{sv ? 'Levande folkbokförda 2021 per födelseår (SCB) — överlevnadsbias för äldsta årtiondena.' : 'Living population 2021 by birth year (SCB); survivor bias in oldest decades.'}</p>
        </div>
      )}

      {/* Kända bärare (verkliga personer, PD/CC-porträtt) */}
      {bearers.length > 0 && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <Users className="h-3.5 w-3.5" /> {sv ? 'Kända bärare' : 'Notable bearers'}
          </div>
          <div className="flex flex-col gap-2">
            {bearers.map((b) => (
              <button key={b.id} type="button" onClick={() => onQuery?.(b.name)}
                className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-800/30 p-2 text-left hover:border-amber-500/40">
                {b.image_url
                  ? <img src={b.image_url} alt={b.name} loading="lazy" className="h-11 w-11 shrink-0 rounded-full border border-slate-700 object-cover object-top" />
                  : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-800 text-sm text-slate-500">{b.name.slice(0, 1)}</span>}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-100">{b.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{[b.birth_year ? `${b.birth_year}${b.death_year ? '–' + b.death_year : ''}` : null, Array.isArray(b.occupations) ? b.occupations[0] : null].filter(Boolean).join(' · ')}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Namnet i tradition & kultur (bibliska/litterära gestalter — tydligt märkt fiktion/tradition) */}
      {namesakes.length > 0 && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <BookMarked className="h-3.5 w-3.5" /> {sv ? 'Namnet i tradition & kultur' : 'The name in tradition & culture'}
          </div>
          <div className="flex flex-col gap-2">
            {namesakes.map((f) => {
              const summary = (sv ? f.summary_sv : f.summary_en) || f.summary_sv;
              const kindLabel = (sv ? KIND_LABEL_SV : KIND_LABEL_EN)[f.kind] ?? f.kind;
              return (
                <div key={f.id} className="rounded-md border border-slate-800 bg-slate-800/30 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{f.figure_name}</span>
                    <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">{kindLabel}</span>
                  </div>
                  {f.image_url && (
                    <img src={f.image_url} alt={f.figure_name} loading="lazy" className="mt-2 max-h-48 rounded border border-slate-700 object-contain" />
                  )}
                  {summary && <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{summary}</p>}
                  {f.work_title && <div className="mt-1 text-[10px] text-slate-500">{[f.work_author, f.work_title, f.work_year].filter(Boolean).join(' · ')}</div>}
                  {f.image_credit && <div className="text-[10px] text-slate-500">{sv ? 'Bild' : 'Image'}: {f.image_credit}{f.image_license ? ` (${f.image_license})` : ''}</div>}
                  {f.source_ref && <div className="mt-0.5 text-[10px] text-slate-500">{sv ? 'Källa' : 'Source'}: {f.source_ref}</div>}
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">{sv ? 'Bibliska och litterära namngestalter — redovisade som tradition/fiktion, åtskilda från verkliga bärare ovan.' : 'Biblical and literary namesakes — shown as tradition/fiction, kept separate from the real bearers above.'}</p>
        </div>
      )}

      {/* Reception / populärkultur (FAKTA — aldrig reproduktion av skyddat verk/figur) */}
      {name.popularization && (
        <div className="border-t border-slate-800 px-5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            <Sparkles className="h-3.5 w-3.5" /> {sv ? 'Spridning & populärkultur' : 'Spread & popular culture'}
          </div>
          <p className="text-[14px] leading-relaxed text-slate-200">{name.popularization}</p>
        </div>
      )}

      <p className="px-5 pb-4 pt-2 text-[11px] text-slate-500">
        {sv
          ? 'Namndata ur egna korpusar (runinskrifter, medeltidsbrev/SDHK, Wikidata-personer, Skatteverket & SCB). Etymologi = källbelagd tolkning, ej fastställd sanning.'
          : 'Name data from our own corpora (runic inscriptions, medieval charters, Wikidata persons, Swedish agencies). Etymology is a sourced interpretation.'}
      </p>
    </div>
  );
}
