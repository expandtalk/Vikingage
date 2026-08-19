import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

// Rättighets-korrekt IIIF-inbäddning: bilderna hämtas LIVE ur institutionens egen IIIF-bildtjänst
// (vi speglar/lagrar ingenting) och attribution + länk tillbaka visas alltid. Använd för material
// som INTE är fritt att rehosta — t.ex. Vatikanbiblioteket (© BAV), till skillnad från Gallica/Commons-PD.
// Stödjer IIIF Presentation 2 (BAV/digi.vatlib.it). Prev/nästa genom canvas; klick → deras visare.

interface Props {
  manifestUrl: string;
  viewerUrl: string;      // länk till institutionens egen visare
  attribution: string;    // t.ex. "© Biblioteca Apostolica Vaticana"
  startIndex?: number;
}

interface Canvas { label: string; img: string; }

// IIIF Image API-URL ur en canvas: föredra bildtjänsten (service @id) med storleksgräns, annars resource @id.
const canvasImage = (canvas: any, width = 1200): string => {
  const res = canvas?.images?.[0]?.resource;
  const svc = res?.service?.['@id'] || res?.service?.id;
  if (svc) return `${svc.replace(/\/$/, '')}/full/${width},/0/default.jpg`;
  return res?.['@id'] || res?.id || '';
};

export const IiifViewer: React.FC<Props> = ({ manifestUrl, viewerUrl, attribution, startIndex = 0 }) => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [idx, setIdx] = useState(startIndex);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(manifestUrl);
        const m = await r.json();
        const cs = (m?.sequences?.[0]?.canvases ?? []).map((cv: any) => ({
          label: typeof cv.label === 'string' ? cv.label : (cv.label?.['@value'] ?? ''),
          img: canvasImage(cv),
        })).filter((c: Canvas) => c.img);
        if (!cancelled) { setCanvases(cs); setLoading(false); }
      } catch { if (!cancelled) { setErr(true); setLoading(false); } }
    })();
    return () => { cancelled = true; };
  }, [manifestUrl]);

  if (loading) return <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Laddar IIIF-manifest…</div>;
  if (err || !canvases.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300">
        Kunde inte läsa IIIF-manifestet just nu. <a href={viewerUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Öppna hos {attribution.replace(/^©\s*/, '')} →</a>
      </div>
    );
  }
  const cur = canvases[Math.max(0, Math.min(canvases.length - 1, idx))];
  const go = (d: number) => setIdx((i) => Math.max(0, Math.min(canvases.length - 1, i + d)));

  return (
    <div>
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <img src={cur.img} alt={cur.label} loading="lazy" className="mx-auto max-h-[62vh] w-auto object-contain"
          onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
        <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label="Föregående"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/85 p-2 text-slate-100 backdrop-blur disabled:opacity-30 hover:border-gold/60"><ChevronLeft className="h-6 w-6" /></button>
        <button type="button" onClick={() => go(1)} disabled={idx >= canvases.length - 1} aria-label="Nästa"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/85 p-2 text-slate-100 backdrop-blur disabled:opacity-30 hover:border-gold/60"><ChevronRight className="h-6 w-6" /></button>
      </div>
      <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>{cur.label} · {idx + 1} / {canvases.length}</span>
        <span className="flex items-center gap-2">
          <strong className="text-slate-300">{attribution}</strong>
          <a href={viewerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
            Öppna i originalvisaren <ExternalLink className="h-3 w-3" />
          </a>
        </span>
      </div>
      <p className="mx-auto mt-1 max-w-2xl text-[11px] text-slate-500">
        Bilderna hämtas live ur institutionens IIIF-tjänst (inte kopierade hit). Bildrättigheter enligt {attribution}.
      </p>
    </div>
  );
};
