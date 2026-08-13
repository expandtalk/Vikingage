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

// Jacobi-egenvärdesuppdelning av symmetrisk 3×3 → {values, vectors} (vectors[rad][kol] = komponent).
function jacobiEigen3(a11: number, a22: number, a33: number, a12: number, a13: number, a23: number) {
  const A = [[a11, a12, a13], [a12, a22, a23], [a13, a23, a33]];
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 12; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
      if (Math.abs(A[p][q]) < 1e-9) continue;
      const phi = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]);
      const c = Math.cos(phi), s = Math.sin(phi);
      for (let k = 0; k < 3; k++) { const kp = A[k][p], kq = A[k][q]; A[k][p] = c * kp - s * kq; A[k][q] = s * kp + c * kq; }
      for (let k = 0; k < 3; k++) { const pk = A[p][k], qk = A[q][k]; A[p][k] = c * pk - s * qk; A[q][k] = s * pk + c * qk; }
      for (let k = 0; k < 3; k++) { const vp = V[k][p], vq = V[k][q]; V[k][p] = c * vp - s * vq; V[k][q] = s * vp + c * vq; }
    }
  }
  return { values: [A[0][0], A[1][1], A[2][2]], vectors: V };
}

// Äkta dekorrelationssträckning (DStretch, Fas 2): PCA på RGB → sträck varje huvudkomponent till samma
// varians → rotera tillbaka. Överdriver de svagaste, dekorrelerade färgskillnaderna (lav vs sten vs fåra).
function dstretchPCA(d: Uint8ClampedArray, _w: number, _h: number) {
  const n = d.length / 4;
  let mr = 0, mg = 0, mb = 0;
  for (let i = 0; i < d.length; i += 4) { mr += d[i]; mg += d[i + 1]; mb += d[i + 2]; }
  mr /= n; mg /= n; mb /= n;
  let crr = 0, cgg = 0, cbb = 0, crg = 0, crb = 0, cgb = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] - mr, g = d[i + 1] - mg, b = d[i + 2] - mb;
    crr += r * r; cgg += g * g; cbb += b * b; crg += r * g; crb += r * b; cgb += g * b;
  }
  crr /= n; cgg /= n; cbb /= n; crg /= n; crb /= n; cgb /= n;
  const { values, vectors: V } = jacobiEigen3(crr, cgg, cbb, crg, crb, cgb);
  const target = 55; // mål-std per komponent efter sträckning
  const g0 = target / Math.sqrt(Math.max(1, values[0])), g1 = target / Math.sqrt(Math.max(1, values[1])), g2 = target / Math.sqrt(Math.max(1, values[2]));
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] - mr, g = d[i + 1] - mg, b = d[i + 2] - mb;
    const p0 = (V[0][0] * r + V[1][0] * g + V[2][0] * b) * g0;
    const p1 = (V[0][1] * r + V[1][1] * g + V[2][1] * b) * g1;
    const p2 = (V[0][2] * r + V[1][2] * g + V[2][2] * b) * g2;
    d[i] = Math.max(0, Math.min(255, mr + V[0][0] * p0 + V[0][1] * p1 + V[0][2] * p2));
    d[i + 1] = Math.max(0, Math.min(255, mg + V[1][0] * p0 + V[1][1] * p1 + V[1][2] * p2));
    d[i + 2] = Math.max(0, Math.min(255, mb + V[2][0] * p0 + V[2][1] * p1 + V[2][2] * p2));
  }
}

const PRESETS: Preset[] = [
  {
    key: 'dstretch-pca', label: 'DStretch (dekorrelation)',
    how: 'Äkta dekorrelationssträckning (som ImageJ-pluginet DStretch): PCA på färgerna → sträck → tillbaka. Photoshop har ingen exakt motsvarighet; närmast är kanalmixer + extrem mättnad.',
    apply: (d, w, h) => dstretchPCA(d, w, h),
  },
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
    key: 'dstretch', label: 'Färgsträckning (snabb)',
    how: 'Snabb approximation: per-kanal auto-nivåer + mättnad. Photoshop: Auto-nivåer per kanal + Livlighet max. (Se "DStretch (dekorrelation)" för den riktiga PCA-varianten.)',
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
