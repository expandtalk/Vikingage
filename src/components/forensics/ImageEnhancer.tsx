import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

// Fas 1: bildförbättring i WEBBLÄSAREN (canvas) för att få fram inristningar/baslinjer ur ett foto
// INNAN någon läsning/AI-analys. Presets efterliknar det man annars gör i Photoshop. VIKTIGT (hederlighet):
// förbättring AVSLÖJAR det som finns i pixlarna — den SKAPAR inte data. Ett platt foto har begränsad
// djupinfo; släpljus/RTI (flera bilder) är starkare. Resultatet är underlag att verifiera, ej en läsning.

interface Preset {
  key: string;
  label: string;
  how: string; // Photoshop-motsvarighet
  apply: (d: Uint8ClampedArray, w: number, h: number) => void;
}

const toGray = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

// Kontrastkurva runt 128.
const contrast = (v: number, f: number) => Math.max(0, Math.min(255, (v - 128) * f + 128));

// Konvolution på gråskala (emboss/sobel) — behöver en kopia av gråvärdena.
function grayCopy(d: Uint8ClampedArray, w: number, h: number): Float32Array {
  const g = new Float32Array(w * h);
  for (let p = 0, i = 0; p < w * h; p++, i += 4) g[p] = toGray(d, i);
  return g;
}

const PRESETS: Preset[] = [
  {
    key: 'gray', label: 'Gråskala + kontrast',
    how: 'Photoshop: Bild → Justeringar → Svartvitt, sedan Nivåer/Kurvor för hårdare kontrast.',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const v = contrast(toGray(d, i), 1.7);
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    },
  },
  {
    key: 'raking', label: 'Släpljus (emboss)',
    how: 'Photoshop: duplicera lagret → Filter → Stilisera → Relief (emboss); simulerar sidoljus så fåror kastar skugga.',
    apply: (d, w, h) => {
      const g = grayCopy(d, w, h);
      // Emboss-kärna (riktat ljus uppifrån-vänster) → baslinjernas kanter poppar.
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const p = y * w + x, i = p * 4;
        const nw = g[(Math.max(0, y - 1)) * w + Math.max(0, x - 1)];
        const se = g[(Math.min(h - 1, y + 1)) * w + Math.min(w - 1, x + 1)];
        const v = Math.max(0, Math.min(255, 128 + (se - nw) * 1.6));
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    },
  },
  {
    key: 'sobel', label: 'Kantlinjer (Sobel)',
    how: 'Photoshop: Filter → Stilisera → Sök kanter (Find Edges), sedan invertera vid behov.',
    apply: (d, w, h) => {
      const g = grayCopy(d, w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const gx =
          -g[(Math.max(0, y - 1)) * w + Math.max(0, x - 1)] + g[(Math.max(0, y - 1)) * w + Math.min(w - 1, x + 1)]
          - 2 * g[y * w + Math.max(0, x - 1)] + 2 * g[y * w + Math.min(w - 1, x + 1)]
          - g[(Math.min(h - 1, y + 1)) * w + Math.max(0, x - 1)] + g[(Math.min(h - 1, y + 1)) * w + Math.min(w - 1, x + 1)];
        const gy =
          -g[(Math.max(0, y - 1)) * w + Math.max(0, x - 1)] - 2 * g[(Math.max(0, y - 1)) * w + x] - g[(Math.max(0, y - 1)) * w + Math.min(w - 1, x + 1)]
          + g[(Math.min(h - 1, y + 1)) * w + Math.max(0, x - 1)] + 2 * g[(Math.min(h - 1, y + 1)) * w + x] + g[(Math.min(h - 1, y + 1)) * w + Math.min(w - 1, x + 1)];
        const m = Math.min(255, Math.hypot(gx, gy));
        const i = (y * w + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = m;
      }
    },
  },
  {
    key: 'dstretch', label: 'Färgsträckning (DStretch-lite)',
    how: 'Photoshop: ungefär "Auto-nivåer per kanal" + Livlighet/Mättnad max. Riktiga DStretch (ImageJ-plugin) gör en dekorrelationssträckning (PCA på RGB → sträck → tillbaka).',
    apply: (d) => {
      // Per-kanal min/max-sträckning (dekorrelation-approximation) + mättnadsboost → svaga färgskillnader
      // (lav vs sten vs ristning) överdrivs. INTE äkta PCA-DStretch, men samma anda.
      const mn = [255, 255, 255], mx = [0, 0, 0];
      for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) {
        if (d[i + c] < mn[c]) mn[c] = d[i + c];
        if (d[i + c] > mx[c]) mx[c] = d[i + c];
      }
      const rng = [Math.max(1, mx[0] - mn[0]), Math.max(1, mx[1] - mn[1]), Math.max(1, mx[2] - mn[2])];
      for (let i = 0; i < d.length; i += 4) {
        for (let c = 0; c < 3; c++) d[i + c] = ((d[i + c] - mn[c]) / rng[c]) * 255;
        // mättnadsboost runt luminansen
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, lum + (d[i + c] - lum) * 1.8));
      }
    },
  },
  {
    key: 'invert', label: 'Invertera',
    how: 'Photoshop: Bild → Justeringar → Invertera (Ctrl+I). Ibland ser man fåror bättre inverterat.',
    apply: (d) => { for (let i = 0; i < d.length; i += 4) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; } },
  },
];

const MAX_DIM = 1100; // nedskala stora foton för snabb bearbetning

export const ImageEnhancer: React.FC<{ src: string; onUseEnhanced?: (dataUrl: string) => void }> = ({ src, onUseEnhanced }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<ImageData | null>(null);
  const [preset, setPreset] = useState<string>('orig');
  const [ready, setReady] = useState(false);

  // Ladda bilden → nedskala → spara basen.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = canvasRef.current; if (!c) return;
      c.width = w; c.height = h;
      const ctx = c.getContext('2d', { willReadFrequently: true }); if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      baseRef.current = ctx.getImageData(0, 0, w, h);
      setReady(true); setPreset('orig');
    };
    img.src = src;
  }, [src]);

  // Applicera valt preset på en färsk kopia av basen.
  useEffect(() => {
    const c = canvasRef.current, base = baseRef.current; if (!c || !base || !ready) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const copy = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
    const pre = PRESETS.find((p) => p.key === preset);
    if (pre) pre.apply(copy.data, copy.width, copy.height);
    ctx.putImageData(copy, 0, 0);
  }, [preset, ready]);

  const active = PRESETS.find((p) => p.key === preset);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setPreset('orig')}
          className={`rounded border px-2 py-1 text-xs ${preset === 'orig' ? 'bg-gold/20 border-gold/50 text-gold' : 'hover:bg-muted'}`}>Original</button>
        {PRESETS.map((p) => (
          <button key={p.key} onClick={() => setPreset(p.key)}
            className={`rounded border px-2 py-1 text-xs ${preset === p.key ? 'bg-gold/20 border-gold/50 text-gold' : 'hover:bg-muted'}`}>{p.label}</button>
        ))}
      </div>
      <canvas ref={canvasRef} className="max-h-64 w-full rounded-md border object-contain bg-black/20" />
      {active && (
        <p className="text-[11px] text-muted-foreground/80 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{active.how}</span>
        </p>
      )}
      {onUseEnhanced && preset !== 'orig' && (
        <button
          onClick={() => { const c = canvasRef.current; if (c) onUseEnhanced(c.toDataURL('image/png')); }}
          className="text-xs font-medium text-gold hover:underline">
          Använd den förbättrade bilden för analys →
        </button>
      )}
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
        Förbättring avslöjar det som finns i pixlarna — den skapar inte data. Ett platt foto har begränsad
        djupinfo; <strong>släpljus i mörker eller RTI (flera bilder)</strong> ger mycket mer. Resultatet är
        underlag att verifiera, inte en läsning.
      </p>
    </div>
  );
};
