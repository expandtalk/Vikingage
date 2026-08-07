import React, { useState } from 'react';
import { MapPinPlus, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Tomt söktillstånd → föreslå en plats som saknas. VIKTIGT: förslaget går till en GRANSKNINGSKÖ
// (place_suggestions), ALDRIG direkt in i forskningsdatat. Dokumentation krävs; koordinaten är bara
// ett förslag som admin verifierar mot källa innan promotion (INGEN GISSNING).
export const SuggestPlaceForm: React.FC<{ query: string; sv: boolean }> = ({ query, sv }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(query);
  const [note, setNote] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!name.trim() || !documentation.trim()) {
      setErr(sv ? 'Namn och dokumentation/källa krävs.' : 'Name and documentation/source are required.');
      return;
    }
    const latN = lat.trim() ? Number(lat.replace(',', '.')) : null;
    const lngN = lng.trim() ? Number(lng.replace(',', '.')) : null;
    if ((lat.trim() && !Number.isFinite(latN)) || (lng.trim() && !Number.isFinite(lngN))) {
      setErr(sv ? 'Koordinater måste vara tal (t.ex. 57.12, 16.34).' : 'Coordinates must be numbers.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await (supabase.from('place_suggestions') as any).insert({
        name: name.trim(),
        note: note.trim() || null,
        documentation: documentation.trim(),
        proposed_lat: latN,
        proposed_lng: lngN,
        submitter_email: email.trim() || null,
        query_context: query,
      });
      if (error) throw error;
      setDone(true);
    } catch {
      setErr(sv ? 'Kunde inte skicka just nu — försök igen.' : 'Could not submit right now — try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto mt-3 max-w-md rounded-lg border border-emerald-700/50 bg-emerald-950/20 p-4 text-center text-sm text-emerald-100">
        <Check className="mx-auto mb-1 h-5 w-5" />
        {sv
          ? 'Tack! Förslaget har skickats till granskning. Det verifieras mot källa innan det läggs in.'
          : 'Thank you! Your suggestion was sent for review. It is verified against a source before being added.'}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
      >
        <MapPinPlus className="h-3.5 w-3.5" />
        {sv ? 'Föreslå denna plats' : 'Suggest this place'}
      </button>
    );
  }

  const inputCls = 'w-full rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none';
  return (
    <div className="mx-auto mt-3 max-w-md rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-left">
      <p className="mb-2 text-xs leading-relaxed text-slate-400">
        {sv
          ? 'Förslaget går till granskning och verifieras mot källa innan det läggs in — inget publiceras overifierat.'
          : 'Suggestions go to review and are verified against a source before being added — nothing is published unverified.'}
      </p>
      <div className="space-y-2">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={sv ? 'Platsens namn *' : 'Place name *'} />
        <textarea className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder={sv ? 'Vad är det för plats? (valfritt)' : 'What kind of place? (optional)'} />
        <textarea className={inputCls} value={documentation} onChange={(e) => setDocumentation(e.target.value)} rows={2}
          placeholder={sv ? 'Dokumentation / källa * (t.ex. RAÄ-nr, Fornsök-länk, litteratur)' : 'Documentation / source *'} />
        <div className="flex gap-2">
          <input className={inputCls} value={lat} onChange={(e) => setLat(e.target.value)}
            placeholder={sv ? 'Latitud (valfritt)' : 'Latitude (optional)'} inputMode="decimal" />
          <input className={inputCls} value={lng} onChange={(e) => setLng(e.target.value)}
            placeholder={sv ? 'Longitud (valfritt)' : 'Longitude (optional)'} inputMode="decimal" />
        </div>
        <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} type="email"
          placeholder={sv ? 'Din e-post (valfritt, för återkoppling)' : 'Your email (optional)'} />
        {err && <p className="text-xs text-rose-300">{err}</p>}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">
            {sv ? 'Avbryt' : 'Cancel'}
          </button>
          <button onClick={submit} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-50">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {sv ? 'Skicka förslag' : 'Send suggestion'}
          </button>
        </div>
      </div>
    </div>
  );
};
