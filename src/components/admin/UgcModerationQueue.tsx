import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, X, RefreshCw, Inbox, MapPin } from 'lucide-react';

// UGC-modereringskö (admin) — VERIFIERA-steget i bryggan→verifiera→reindex. Granska förslag från
// samtalslagret (place_suggestions) + fältfynd (field_observations). Godkänn/avslå med not. Att SKAPA
// den kanoniska posten kräver VERIFIERADE koordinater → görs med befintliga admin-verktyg (koordinat
// aldrig ur minnet); därefter körs reindex nedan (rebuild_search_document) så posten blir sökbar.

interface Suggestion {
  id: string; name: string; note: string | null; documentation: string;
  proposed_lat: number | null; proposed_lng: number | null;
  submitter_email: string | null; query_context: string | null; status: string; created_at: string;
}
interface FieldObs {
  id: string; name: string; feature_type: string; description: string | null;
  submitter_email: string | null; status: string; created_at: string;
}
interface GlossaryPost {
  id: string; entity_key: string; display_name: string | null; body: string; created_at: string;
}

const REINDEX_TYPES = ['place', 'place_name', 'heritage_site', 'content_page'];

export const UgcModerationQueue: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [fieldObs, setFieldObs] = useState<FieldObs[]>([]);
  const [glossaryPosts, setGlossaryPosts] = useState<GlossaryPost[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [coords, setCoords] = useState<Record<string, { lat: string; lng: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Reindex-verktyg
  const [rType, setRType] = useState('place');
  const [rId, setRId] = useState('');
  const [reindexing, setReindexing] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [s, f, g] = await Promise.all([
      (supabase as any).from('place_suggestions')
        .select('id, name, note, documentation, proposed_lat, proposed_lng, submitter_email, query_context, status, created_at')
        .eq('status', 'pending').order('created_at', { ascending: true }),
      (supabase as any).from('field_observations')
        .select('id, name, feature_type, description, submitter_email, status, created_at')
        .eq('status', 'submitted').order('created_at', { ascending: true }),
      (supabase as any).from('discussion_posts')
        .select('id, entity_key, display_name, body, created_at')
        .eq('entity_type', 'glossary_term').eq('status', 'published').order('created_at', { ascending: true }),
    ]);
    const sugg = (s.data ?? []) as Suggestion[];
    setSuggestions(sugg);
    // Förifyll koordinatfälten från förslagets (obekräftade) koordinat, om någon.
    setCoords(Object.fromEntries(sugg.map((x) => [x.id, {
      lat: x.proposed_lat != null ? String(x.proposed_lat) : '',
      lng: x.proposed_lng != null ? String(x.proposed_lng) : '',
    }])));
    setFieldObs((f.data ?? []) as FieldObs[]);
    setGlossaryPosts((g.data ?? []) as GlossaryPost[]);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const decide = async (
    table: 'place_suggestions' | 'field_observations', id: string, status: string,
  ) => {
    setBusy(id);
    const { error } = await (supabase as any).from(table)
      .update({ status, admin_notes: notes[id]?.trim() || null }).eq('id', id);
    setBusy(null);
    if (error) { toast({ title: 'Kunde inte spara', description: error.message, variant: 'destructive' }); return; }
    toast({ title: status === 'rejected' ? 'Avslaget' : 'Godkänt', description: status === 'accepted' ? 'Skapa kanonisk post med verifierade koordinater, kör sedan reindex.' : undefined });
    fetchAll();
  };

  // (b) Befordra: skapa en kanonisk, renderbar plats (heritage_sites + place_slug) med VERIFIERAD
  // koordinat och reindexera — i ett steg via RPC. Renderas på /sv/plats/:slug + sökbar.
  const promote = async (s: Suggestion) => {
    const cc = coords[s.id] ?? { lat: '', lng: '' };
    const lat = Number(cc.lat), lng = Number(cc.lng);
    if (!cc.lat.trim() || !cc.lng.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      toast({ title: 'Verifierad koordinat krävs', description: 'Ange lat/lng du kontrollerat.', variant: 'destructive' }); return;
    }
    setBusy(s.id);
    const { data, error } = await (supabase as any).rpc('promote_suggestion_to_place', { p_suggestion_id: s.id, p_lat: lat, p_lng: lng });
    setBusy(null);
    if (error) { toast({ title: 'Kunde inte befordra', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Plats skapad & indexerad', description: `/sv/plats/${data} — nu sökbar.` });
    fetchAll();
  };

  // Befordra ett ordliste-bidrag (discussion_posts) → kanonisk definition + reindex (RPC, admin-grind).
  const promotePost = async (p: GlossaryPost) => {
    setBusy(p.id);
    const { data, error } = await (supabase as any).rpc('promote_post_to_glossary', { p_post_id: p.id });
    setBusy(null);
    if (error) { toast({ title: 'Kunde inte befordra', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Bidrag befordrat', description: `Definition uppdaterad — /sv/ordlista/${data}.` });
    fetchAll();
  };

  const reindex = async () => {
    if (!rId.trim()) { toast({ title: 'Ange entitets-id (uuid)', variant: 'destructive' }); return; }
    setReindexing(true);
    const { error } = await (supabase as any).rpc('rebuild_search_document', { p_type: rType, p_id: rId.trim() });
    setReindexing(false);
    if (error) { toast({ title: 'Reindex misslyckades', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Reindexerat', description: `${rType} ${rId.trim()} är nu i sökindexet.` });
    setRId('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6 space-y-8 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Inbox className="h-5 w-5" /> UGC-förslag (verifiera-kö)</h2>
        <Button size="sm" variant="outline" onClick={fetchAll} className="border-white/20 text-white">
          <RefreshCw className="h-4 w-4 mr-1" /> Uppdatera
        </Button>
      </div>
      <p className="text-xs text-slate-400 -mt-6">
        Bryggan → <strong>verifiera</strong> (här) → skapa kanon med verifierade koordinater → reindex (nedan).
        Godkännande skapar INTE kanon automatiskt — koordinater tas aldrig ur minnet.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Hämtar…</div>
      ) : (
        <>
          {/* Platsförslag */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Platsförslag ur diskussion ({suggestions.length})</h3>
            {suggestions.length === 0 && <p className="text-sm text-slate-400">Inga väntande förslag.</p>}
            {suggestions.map((s) => (
              <div key={s.id} className="rounded-lg border border-white/15 bg-white/5 p-3 space-y-2">
                <div className="font-medium">{s.name}</div>
                {s.note && <p className="text-sm text-slate-300 whitespace-pre-wrap">{s.note}</p>}
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3">
                  <span>{s.documentation}</span>
                  {(s.proposed_lat != null) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.proposed_lat}, {s.proposed_lng} (obekräftad)</span>}
                  {s.query_context && <span>{s.query_context}</span>}
                </div>
                <Input value={notes[s.id] ?? ''} onChange={(e) => setNotes((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white text-sm" placeholder="Admin-not (valfri)" />
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block">Verifierad lat</label>
                    <Input value={coords[s.id]?.lat ?? ''} onChange={(e) => setCoords((p) => ({ ...p, [s.id]: { lat: e.target.value, lng: p[s.id]?.lng ?? '' } }))}
                      className="bg-white/10 border-white/20 text-white text-sm w-28" placeholder="59.33" inputMode="decimal" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">lng</label>
                    <Input value={coords[s.id]?.lng ?? ''} onChange={(e) => setCoords((p) => ({ ...p, [s.id]: { lat: p[s.id]?.lat ?? '', lng: e.target.value } }))}
                      className="bg-white/10 border-white/20 text-white text-sm w-28" placeholder="18.06" inputMode="decimal" />
                  </div>
                  <Button size="sm" disabled={busy === s.id} onClick={() => promote(s)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4 mr-1" /> Skapa plats & indexera
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy === s.id} onClick={() => decide('place_suggestions', s.id, 'rejected')} className="border-white/20 text-white">
                    <X className="h-4 w-4 mr-1" /> Avslå
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">Koordinaten måste vara kontrollerad (RAÄ/Wikidata/karta) — aldrig ur minnet.</p>
              </div>
            ))}
          </div>

          {/* Fältfynd */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Fältfynd ({fieldObs.length})</h3>
            {fieldObs.length === 0 && <p className="text-sm text-slate-400">Inga väntande fältfynd.</p>}
            {fieldObs.map((f) => (
              <div key={f.id} className="rounded-lg border border-white/15 bg-white/5 p-3 space-y-2">
                <div className="font-medium">{f.name} <span className="text-xs text-slate-400">· {f.feature_type}</span></div>
                {f.description && <p className="text-sm text-slate-300 whitespace-pre-wrap">{f.description}</p>}
                <Input value={notes[f.id] ?? ''} onChange={(e) => setNotes((p) => ({ ...p, [f.id]: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white text-sm" placeholder="Admin-not (valfri)" />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy === f.id} onClick={() => decide('field_observations', f.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4 mr-1" /> Godkänn
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy === f.id} onClick={() => decide('field_observations', f.id, 'rejected')} className="border-white/20 text-white">
                    <X className="h-4 w-4 mr-1" /> Avslå
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Ordliste-bidrag → befordra till kanonisk definition */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Ordliste-bidrag ({glossaryPosts.length})</h3>
            {glossaryPosts.length === 0 && <p className="text-sm text-slate-400">Inga väntande bidrag.</p>}
            {glossaryPosts.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/15 bg-white/5 p-3 space-y-2">
                <div className="text-[11px] text-slate-400">
                  <a href={`/sv/ordlista/${p.entity_key}`} className="text-amber-300 hover:underline">/sv/ordlista/{p.entity_key}</a>
                  {p.display_name && <> · {p.display_name}</>}
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{p.body}</p>
                <Button size="sm" disabled={busy === p.id} onClick={() => promotePost(p)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4 mr-1" /> Befordra till definition
                </Button>
                <p className="text-[11px] text-slate-500">Skriver bidraget till termens kanoniska definition (verified) + reindexerar.</p>
              </div>
            ))}
          </div>

          {/* Reindex-verktyg */}
          <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Reindex (rebuild_search_document)</h3>
            <p className="text-xs text-slate-400">Kör efter att du skapat/uppdaterat en kanonisk post — då blir den sökbar och kan lyfta svaren.</p>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Typ</label>
                <select value={rType} onChange={(e) => setRType(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white">
                  {REINDEX_TYPES.map((t) => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs text-slate-300 block mb-1">Entitets-id (uuid)</label>
                <Input value={rId} onChange={(e) => setRId(e.target.value)} className="bg-white/10 border-white/20 text-white text-sm" placeholder="00000000-0000-0000-0000-000000000000" />
              </div>
              <Button size="sm" disabled={reindexing} onClick={reindex} className="bg-gold/90 text-black hover:bg-gold">
                {reindexing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />} Reindexera
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UgcModerationQueue;
