import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Layers, ScrollText, MapPin, AlertTriangle, X, Landmark } from 'lucide-react';

// SÖK ETT NAMN → dess TVÅAXEL (Daniel: "se tvåaxeln efter jag skrivit in").
//   AXEL A (belägg): NÄR namnet först SKREVS — år + belagd form + källa/källtyp.
//   AXEL B (skikt): namnleden (ortnamn_element_config) + namnTYPS-skiktet (ortnamn_typ_referens:
//     system A/B/C, bildningsskikt, teofor-risk, homonym, konfidens). Belägg ≠ namnålder.
// Källkritik: teofor-risk/homonym surfas som varning — ledet ensamt avgör ALDRIG gudakoppling.

interface Stratum { key: string; label: string; lang: string | null; activity: string | null; stratum: string | null; strength: string | null }
interface TypRef {
  typ_key: string; label: string; system: string; funktion: string | null;
  bildningsskikt: string | null; datering_konfidens: string; requires_human: boolean;
  teofor_risk: string; homonym_note: string | null; kalla: string;
}
interface Row {
  id: string; name: string; province: string | null; socken: string | null; lat: number | null; lng: number | null;
  year: number | null; attested_form: string | null; attestation_source: string | null; source_type: string | null;
  source: string | null; attribution: string | null; source_license: string | null;
  element_keys: string[] | null; strata: Stratum[]; typ_ref: TypRef[];
}

const SRC: Record<string, { sv: string; en: string; cls: string }> = {
  runsten: { sv: 'Runsten', en: 'Runestone', cls: 'border-amber-500/60 bg-amber-950/40 text-amber-200' },
  sdhk: { sv: 'Medeltidsbrev', en: 'Charter', cls: 'border-violet-500/50 bg-violet-950/30 text-violet-200' },
  isof: { sv: 'Isof', en: 'Isof', cls: 'border-sky-500/50 bg-sky-950/30 text-sky-200' },
  sol: { sv: 'SOL 2003', en: 'SOL 2003', cls: 'border-slate-500/50 bg-slate-800/50 text-slate-200' },
  övrig: { sv: 'Övrigt', en: 'Other', cls: 'border-slate-600 bg-slate-800/40 text-slate-300' },
};
const LANG: Record<string, string> = {
  proto_norse: 'urnordiska', old_norse: 'fornnordiska', pie: 'urindoeuropeiskt', low_german: 'medellågtyska',
  latin: 'latin', sami: 'samiska', finnic: 'finska/meänkieli', baltic: 'baltiskt', slavic: 'slaviskt', unknown: 'okänt',
};
const ACT: Record<string, string> = {
  settlement: 'bebyggelse', cult: 'kult', seafaring: 'sjöfart', shipbuilding: 'skeppsbyggnad',
  administration: 'administration/organisation', topographic: 'topografiskt', communication: 'kommunikation',
  trade: 'handel', defence: 'försvar', agriculture: 'jordbruk', personal_name: 'personnamn',
};
const SYSTEM: Record<string, { sv: string; en: string; cls: string }> = {
  A_centralplats: { sv: 'Centralplats/administrativ', en: 'Central place/administrative', cls: 'border-blue-500/50 bg-blue-950/30 text-blue-200' },
  B_sakral: { sv: 'Sakral/teofor', en: 'Sacral/theophoric', cls: 'border-fuchsia-500/50 bg-fuchsia-950/30 text-fuchsia-200' },
  C_maritim_militar: { sv: 'Maritim/militär', en: 'Maritime/military', cls: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-200' },
  expansion_bebyggelse: { sv: 'Bebyggelse (expansion)', en: 'Settlement (expansion)', cls: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200' },
  natur_hydronym: { sv: 'Natur/hydronym', en: 'Nature/hydronym', cls: 'border-slate-500/50 bg-slate-800/50 text-slate-200' },
};
const KONF: Record<string, { sv: string; en: string }> = {
  belagt: { sv: 'belagt', en: 'attested' }, valetablerad: { sv: 'väletablerad', en: 'well-established' },
  hypotes: { sv: 'hypotes', en: 'hypothesis' }, omtvistad: { sv: 'omtvistad', en: 'contested' },
};
const DEEP = /urnordis|järnålder|vikingat|vendel|folkvandring|förhistor|proto/i;
const isDeep = (s: Stratum) => s.lang === 'proto_norse' || DEEP.test(s.stratum || '');

export const PlaceNameTwoAxisCard: React.FC<{ name: string; sv: boolean; onClose?: () => void }> = ({ name, sv, onClose }) => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['place-name-two-axis', name],
    enabled: !!name,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await (supabase as any).rpc('place_name_two_axis', { p_name: name, p_limit: 12 });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  return (
    <div className="mt-4 rounded-xl border border-gold/50 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Clock className="h-5 w-5 text-gold" />
          {sv ? 'Tvåaxel för ' : 'Two axes for '}<span className="text-gold">{name}</span>
        </h3>
        {onClose && (
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-white" aria-label={sv ? 'Stäng' : 'Close'}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
      {!isLoading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {sv ? 'Ingen tvåaxel-data för det namnet (saknar belägg och taggade namnled i registret).' : 'No two-axis data for that name (no attestation or tagged elements in the register).'}
        </p>
      )}

      <div className="space-y-4">
        {rows.map((r, i) => {
          const s = SRC[r.source_type ?? 'övrig'] ?? SRC.övrig;
          const deep = (r.strata ?? []).some(isDeep);
          const teoforHigh = (r.typ_ref ?? []).some((t) => t.teofor_risk === 'high');
          const teoforMed = (r.typ_ref ?? []).some((t) => t.teofor_risk === 'medium');
          const homonyms = Array.from(new Set((r.typ_ref ?? []).map((t) => t.homonym_note).filter(Boolean) as string[]));
          return (
            <div key={`${r.id}-${i}`} className="rounded-lg border border-border bg-card/40 p-3">
              {/* Ort-huvud */}
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold/80" />
                <span className="font-semibold text-foreground">{r.name}</span>
                {[r.socken && `${r.socken} sn`, r.province].filter(Boolean).join(' · ') && (
                  <span>{[r.socken && `${r.socken} sn`, r.province].filter(Boolean).join(' · ')}</span>
                )}
                {r.lat != null && r.lng != null && (
                  <a href={`/explore?lat=${r.lat}&lng=${r.lng}`} className="ml-auto inline-flex items-center gap-1 text-xs text-gold hover:underline">
                    <MapPin className="h-3 w-3" />{sv ? 'Visa på kartan' : 'Show on map'}
                  </a>
                )}
              </div>

              {/* AXEL A — belägg */}
              <div className="rounded-md border border-amber-800/40 bg-amber-950/10 p-2">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300/80">{sv ? 'Axel A — belägg (när namnet först skrevs)' : 'Axis A — attestation (first written)'}</div>
                {r.year != null ? (
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-xl font-bold tabular-nums text-gold">{r.year}</span>
                    {r.attested_form && <span className="italic text-amber-100/90">”{r.attested_form}”</span>}
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>{sv ? s.sv : s.en}</span>
                    {r.source_type === 'runsten' && (
                      <Link to={`/sv/runinskrifter?q=${encodeURIComponent(r.name)}`} className="inline-flex items-center gap-0.5 text-[11px] text-amber-300 hover:text-amber-100">
                        <ScrollText className="h-3 w-3" /> {sv ? 'stenen' : 'the stone'}
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{sv ? 'Inget daterat belägg i registret ännu.' : 'No dated attestation in the register yet.'}</p>
                )}
                {r.attestation_source && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/80">{r.attestation_source}</p>}
                {!r.attestation_source && (r.attribution || r.source) && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">{sv ? 'Källa' : 'Source'}: {r.attribution || r.source}{r.source_license ? ` · ${r.source_license}` : ''}</p>
                )}
              </div>

              {/* AXEL B — skikt */}
              <div className="mt-2 rounded-md border border-sky-800/40 bg-sky-950/10 p-2">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-300/80">
                  <Layers className="h-3.5 w-3.5" /> {sv ? 'Axel B — skikt (namnets ålder & motiv)' : 'Axis B — stratum (name age & motive)'}
                </div>
                {/* Namnled (element_config) */}
                {(r.strata?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.strata.map((st) => (
                      <span key={st.key} className="rounded-full border border-sky-800/50 bg-sky-950/20 px-2 py-0.5 text-[10px] text-sky-100/90">
                        {st.label}
                        {st.lang && <span className="text-sky-300/70"> · {LANG[st.lang] ?? st.lang}</span>}
                        {st.activity && <span className="text-sky-300/60"> · {ACT[st.activity] ?? st.activity}</span>}
                      </span>
                    ))}
                    {deep && <span className="text-[10px] text-emerald-300/90">{sv ? '→ ledet pekar på ett äldre skikt än belägget' : '→ element points to a stratum older than the attestation'}</span>}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{sv ? 'Inga taggade namnled i registret.' : 'No tagged name elements in the register.'}</p>
                )}

                {/* Namntyps-skikt (referensskiktet) */}
                {(r.typ_ref?.length ?? 0) > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-sky-800/30 pt-2">
                    {r.typ_ref.map((t) => {
                      const sysm = SYSTEM[t.system] ?? SYSTEM.natur_hydronym;
                      const konf = KONF[t.datering_konfidens]?.[sv ? 'sv' : 'en'] ?? t.datering_konfidens;
                      return (
                        <div key={t.typ_key} className="text-[11px] text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <Landmark className="h-3 w-3 text-slate-400" />
                            <span className={`rounded border px-1.5 py-0.5 text-[10px] ${sysm.cls}`}>{sv ? sysm.sv : sysm.en}</span>
                            <span className="text-foreground font-medium">{t.label}</span>
                          </span>
                          {t.bildningsskikt && <span className="text-slate-400"> · {t.bildningsskikt}</span>}
                          <span className="text-slate-500"> · {sv ? 'datering' : 'dating'}: {konf}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Källkritik: teofor-risk / homonym */}
              {(teoforHigh || teoforMed || homonyms.length > 0) && (
                <div className={`mt-2 rounded-md border p-2 text-[11px] ${teoforHigh ? 'border-amber-600/50 bg-amber-950/20 text-amber-100/90' : 'border-slate-600/50 bg-slate-800/30 text-slate-300'}`}>
                  <div className="mb-0.5 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {teoforHigh
                      ? (sv ? 'Teofor-risk: hög — ytformen kan luras' : 'Theophoric risk: high — the surface form can mislead')
                      : (sv ? 'Källkritik' : 'Source criticism')}
                  </div>
                  {(teoforHigh || teoforMed) && (
                    <p className="leading-snug">
                      {sv
                        ? 'Ledet ensamt avgör ALDRIG en gudakoppling — den måste fällas per namn mot källa (jfr Torsvi(d) = Tor + vik, ej vé; Ull = guden eller appellativet ”glans”).'
                        : 'The element alone NEVER settles a divine link — it must be decided per name against a source (cf. Torsvi(d) = Thor + bay, not vé; Ull = the god or the appellative “sheen”).'}
                    </p>
                  )}
                  {homonyms.map((h) => (
                    <p key={h} className="mt-0.5 leading-snug text-slate-400">· {h}</p>
                  ))}
                </div>
              )}

              {/* Referens-källa för typ-skiktet */}
              {(r.typ_ref?.length ?? 0) > 0 && (
                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                  {sv ? 'Typ-skikt: ' : 'Type stratum: '}
                  {Array.from(new Set(r.typ_ref.map((t) => t.kalla))).join(' · ')}
                  {r.typ_ref.some((t) => t.requires_human) && (sv ? ' · förslag, människa-i-loopen' : ' · draft, human-in-the-loop')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/70">
        {sv
          ? 'Axel A (belägg): place_names, tidigast-över-källor. Axel B (skikt): namnled (ortnamn_element_config) + namntyps-referens (ortnamn_typ_referens). Belägg och namnålder hålls isär.'
          : 'Axis A (attestation): place_names, earliest-across-sources. Axis B (stratum): name elements + name-type reference. Attestation and name-age are kept apart.'}
      </p>
    </div>
  );
};

export default PlaceNameTwoAxisCard;
