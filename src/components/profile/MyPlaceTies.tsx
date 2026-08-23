import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Trash2, Plus, Search, Loader2, Lock } from 'lucide-react';

// "Mina platser" — Fas 2 UI ovanpå user_place_ties. Användaren knyter orter till sig med relationstyp
// och synlighet. Samtyckesmodell: default 'aggregate' (anonym räknare, k-anonymt), härkomst/förälder
// defaultar till 'private' och matchas ALDRIG i v1 (DB-check). Ett consent_event loggas vid första add.
const sb = supabase as unknown as { from: (t: string) => any };

const TIE_TYPES: { v: string; label: string; sensitive?: boolean }[] = [
  { v: 'born', label: 'Född här' },
  { v: 'raised', label: 'Uppväxt här' },
  { v: 'school', label: 'Gått i skola här' },
  { v: 'university', label: 'Studerat här (universitet)' },
  { v: 'work', label: 'Arbetat här' },
  { v: 'friend', label: 'Vän härifrån' },
  { v: 'interest', label: 'Intresserad av platsen' },
  { v: 'parent_mother', label: 'Mors ursprung', sensitive: true },
  { v: 'parent_father', label: 'Fars ursprung', sensitive: true },
  { v: 'ancestry_maternal', label: 'Morföräldrars ursprung', sensitive: true },
  { v: 'ancestry_paternal', label: 'Farföräldrars ursprung', sensitive: true },
];
const TIE_LABEL: Record<string, string> = Object.fromEntries(TIE_TYPES.map((t) => [t.v, t.label]));
const isSensitive = (v: string) => TIE_TYPES.find((t) => t.v === v)?.sensitive === true;

const VIS: { v: string; label: string }[] = [
  { v: 'aggregate', label: 'Anonym — bidrar till räknare, röjer inte mig' },
  { v: 'private', label: 'Privat — bara jag' },
  { v: 'connections', label: 'Mina kopplingar' },
  { v: 'members', label: 'Inloggade medlemmar' },
  { v: 'public', label: 'Alla (även utloggade)' },
];

interface Tie { id: string; place_ref: string; tie_type: string; label: string | null; visibility: string }
interface PlaceHit { id: string; name: string; province: string | null; feature_type: string | null }

export const MyPlaceTies: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ties, setTies] = useState<Tie[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // add-form
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<PlaceHit | null>(null);
  const [tieType, setTieType] = useState('born');
  const [label, setLabel] = useState('');
  const [visibility, setVisibility] = useState('aggregate');
  const [busy, setBusy] = useState(false);

  // Härkomst/förälder → default privat (känsligt, tredjepart).
  useEffect(() => { if (isSensitive(tieType)) setVisibility('private'); }, [tieType]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await sb.from('user_place_ties')
      .select('id,place_ref,tie_type,label,visibility').eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const rows = (data ?? []) as Tie[];
    setTies(rows);
    const refs = [...new Set(rows.map((r) => r.place_ref))];
    if (refs.length) {
      const { data: pn } = await sb.from('place_names').select('id,name').in('id', refs);
      setNames(Object.fromEntries((pn ?? []).map((p: any) => [p.id, p.name])));
    }
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  // Ortssök (place_names, prefix). Debounce via enkel timeout.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      setSearching(true);
      const { data } = await sb.from('place_names')
        .select('id,name,province,feature_type')
        .ilike('name', `${term}%`).eq('exclude_from_search', false)
        .order('wikidata_sitelinks', { ascending: false, nullsFirst: false }).limit(8);
      if (alive) { setHits((data ?? []) as PlaceHit[]); setSearching(false); }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const add = async () => {
    if (!user || !picked) return;
    setBusy(true);
    // Logga samtycke (bevisbart) — idempotent nog; en rad per add är OK som ledger.
    await sb.from('consent_events').insert({ user_id: user.id, scope: 'place_ties', version: '1.0', granted: true });
    const { error } = await sb.from('user_place_ties').insert({
      user_id: user.id, place_ref: picked.id, place_kind: 'place_name',
      tie_type: tieType, label: label.trim() || null, visibility,
      // härkomst/förälder aldrig matchbar i v1 (DB-check hårdstoppar dessutom)
      matchable: isSensitive(tieType) ? false : true,
    });
    setBusy(false);
    if (error) { toast({ title: 'Kunde inte spara', description: error.message, variant: 'destructive' }); return; }
    setQ(''); setPicked(null); setLabel(''); setHits([]);
    toast({ title: 'Plats tillagd', description: `${TIE_LABEL[tieType]} · ${picked.name}` });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await sb.from('user_place_ties').delete().eq('id', id);
    if (error) { toast({ title: 'Kunde inte ta bort', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const grouped = useMemo(() => {
    const g: Record<string, Tie[]> = {};
    for (const t of ties) (g[t.tie_type] ??= []).push(t);
    return g;
  }, [ties]);

  if (!user) return null;

  return (
    <div className="text-white">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><MapPin className="h-5 w-5 text-amber-300" /> Mina platser</h3>
      <p className="mb-4 text-xs text-slate-400">
        Knyt orter till dig — var du är född, uppväxt, gått i skola, arbetat, varifrån släkt och vänner kommer.
        Allt är <b>opt-in</b>; standard är <b>anonym</b> (bidrar bara till räknare). Härkomst är privat och matchas inte.
        Se <a href="/privacy" className="text-amber-300 hover:underline">integritetspolicyn</a>.
      </p>

      {/* Add-form */}
      <div className="rounded-lg border border-white/15 bg-white/5 p-3">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={picked ? picked.name : q}
              onChange={(e) => { setPicked(null); setQ(e.target.value); }}
              placeholder="Sök ort (t.ex. Mora, Kalmar, Sigtuna)…"
              className="w-full bg-transparent py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {searching && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
          {!picked && hits.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-white/20 bg-slate-800 shadow-xl">
              {hits.map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => { setPicked(h); setHits([]); }}
                    className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm hover:bg-white/10">
                    <span>{h.name}</span>
                    <span className="text-xs text-slate-400">{[h.province, h.feature_type].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select value={tieType} onChange={(e) => setTieType(e.target.value)}
            className="rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white">
            {TIE_TYPES.map((t) => <option key={t.v} value={t.v} className="bg-slate-800">{t.label}</option>)}
          </select>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Etikett (valfri, t.ex. skola)"
            className="rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white placeholder:text-slate-500" />
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
            className="rounded-md border border-white/20 bg-white/10 px-2 py-2 text-sm text-white">
            {VIS.map((v) => <option key={v.v} value={v.v} className="bg-slate-800">{v.label}</option>)}
          </select>
        </div>
        {isSensitive(tieType) && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300/90">
            <Lock className="h-3.5 w-3.5" /> Härkomst lagras som din egen uppgift, matchas inte i v1, och exponerar aldrig tredje part.
          </p>
        )}
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={add} disabled={!picked || busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Lägg till
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-4">
        {loading && <p className="text-sm text-slate-400">Laddar…</p>}
        {!loading && ties.length === 0 && <p className="text-sm text-slate-400">Inga platser tillagda än.</p>}
        {Object.keys(grouped).map((tt) => (
          <div key={tt} className="mb-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-300/70">{TIE_LABEL[tt] ?? tt}</div>
            <ul className="space-y-1">
              {grouped[tt].map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                  <span>
                    {names[t.place_ref] ?? '(okänd plats)'}
                    {t.label && <span className="text-slate-400"> · {t.label}</span>}
                    <span className="ml-2 text-[10px] text-slate-500">{VIS.find((v) => v.v === t.visibility)?.v}</span>
                  </span>
                  <button type="button" onClick={() => remove(t.id)} className="text-slate-400 hover:text-rose-300" title="Ta bort">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPlaceTies;
