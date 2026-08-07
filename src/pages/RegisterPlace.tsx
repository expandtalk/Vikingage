import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LocateFixed, Loader2, Check, MapPinPlus } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Fält-registrering för INLOGGADE (t.ex. arkeologer). Fas 1 = enpunkts-GPS. Förslaget går till en
// GRANSKNINGSKÖ (field_observations, status='submitted') — admin verifierar och promotar till
// heritage_sites (INGEN GISSNING: fält-GPS ger exakt läge, men uppgiften granskas före publicering).
const TYPES = ['ruin', 'kyrka', 'försvarsverk', 'stadsmur', 'gravfält', 'runsten', 'offerplats', 'annat'];

const RegisterPlace = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [pos, setPos] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('ruin');
  const [description, setDescription] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const locate = () => {
    if (!('geolocation' in navigator)) { setErr(sv ? 'Platstjänst stöds inte.' : 'Geolocation not supported.'); return; }
    setLocating(true); setErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }); setLocating(false); },
      () => { setErr(sv ? 'Kunde inte hämta position — tillåt plats.' : 'Could not get location — allow it.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async () => {
    setErr(null);
    if (!pos) { setErr(sv ? 'Fånga din position först.' : 'Capture your position first.'); return; }
    if (!name.trim()) { setErr(sv ? 'Namn krävs.' : 'Name required.'); return; }
    setBusy(true);
    try {
      const { error } = await (supabase as any).rpc('submit_field_observation', {
        p_lat: pos.lat, p_lng: pos.lng, p_accuracy: pos.acc,
        p_type: type, p_name: name.trim(),
        p_description: description.trim() || null, p_documentation: documentation.trim() || null,
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || (sv ? 'Kunde inte skicka.' : 'Could not submit.'));
    } finally { setBusy(false); }
  };

  const inputCls = 'w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none';

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title="Registrera plats" titleEn="Register a place"
        description="Fält-registrering av fornlämningar för inloggade bidragsgivare — fånga GPS-position och skicka till granskning."
        descriptionEn="Field registration of ancient sites for logged-in contributors — capture GPS and submit for review." />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-2xl font-bold text-gold mb-2 flex items-center gap-2">
          <MapPinPlus className="h-6 w-6" />{sv ? 'Registrera en plats' : 'Register a place'}
        </h1>

        {!user ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
            {sv ? 'Du måste vara inloggad för att registrera platser i fält.' : 'You must be logged in to register places in the field.'}
            <Link to="/auth" className="mt-3 inline-block rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400">
              {sv ? 'Logga in' : 'Log in'}
            </Link>
          </div>
        ) : done ? (
          <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/20 p-4 text-center text-sm text-emerald-100">
            <Check className="mx-auto mb-1 h-6 w-6" />
            {sv ? 'Tack! Platsen skickades till granskning. En admin verifierar mot källa innan den publiceras.'
                : 'Thank you! The place was submitted for review before publication.'}
            <button onClick={() => { setDone(false); setPos(null); setName(''); setDescription(''); setDocumentation(''); }}
              className="mt-3 block w-full rounded-lg border border-slate-600 px-3 py-2 text-slate-200 hover:border-amber-500/50">
              {sv ? 'Registrera en till' : 'Register another'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              {sv ? 'Fånga din GPS-position på plats (t.ex. vid en ruin, kyrka, mur eller försvarsverk) och beskriv fyndet. Förslaget granskas mot källa innan det läggs in.'
                  : 'Capture your GPS position on site and describe the find. Your submission is reviewed against a source before being added.'}
            </p>
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <button onClick={locate} disabled={locating}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-3 disabled:opacity-60" style={{ minHeight: 48 }}>
                {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
                {sv ? 'Fånga min position' : 'Capture my position'}
              </button>
              {pos && (
                <p className="mt-2 text-center text-xs text-emerald-300 tabular-nums">
                  {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} · ±{Math.round(pos.acc)} m
                </p>
              )}
            </div>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={sv ? 'Namn på platsen *' : 'Place name *'} />
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={sv ? 'Beskrivning (valfritt)' : 'Description (optional)'} />
            <textarea className={inputCls} rows={2} value={documentation} onChange={(e) => setDocumentation(e.target.value)} placeholder={sv ? 'Dokumentation / källa (RAÄ-nr, litteratur, foto…)' : 'Documentation / source'} />
            {err && <p className="text-xs text-rose-300">{err}</p>}
            <button onClick={submit} disabled={busy || !pos}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-slate-900 font-semibold hover:bg-amber-400 disabled:opacity-50" style={{ minHeight: 48 }}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}{sv ? 'Skicka till granskning' : 'Submit for review'}
            </button>
            <p className="text-[11px] text-slate-500">
              {sv ? 'Fas 1: en punkt. Flerpunkts-markering (mur/ruin som linje eller yta) kommer i nästa steg.'
                  : 'Phase 1: a single point. Multi-point outlines (walls/ruins) coming next.'}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPlace;
