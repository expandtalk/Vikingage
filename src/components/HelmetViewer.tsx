import React, { useEffect, useState } from 'react';

// Cookie-fri 3D-visare. @google/model-viewer bundlas hos oss (ingen CDN, ingen spårning) och
// registreras som web-komponenten <model-viewer>. GLB-modellerna bor på FTP-webbhotellet under
// /models/ (som kartrastrarna /map, /earth) — EJ i git-repot (de är stora). Basic rendering hämtar
// inget externt (ingen environment-image satt).

// JSX-deklaration för custom-elementet.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string; alt?: string; poster?: string; 'camera-controls'?: boolean; 'auto-rotate'?: boolean;
        'shadow-intensity'?: string; exposure?: string; loading?: string; reveal?: string; 'ar'?: boolean;
      };
    }
  }
}

interface Props {
  src: string;                 // t.ex. "/3d/the_vendel_i_helmet.glb" (FTP)
  alt: string;
  attribution: React.ReactNode; // "Historiska museet/SHM · CC-BY 4.0 · SweDigArch" + länk
  heightClass?: string;
  poster?: string;             // ev. förhandsbild
}

// "Render-först": den tunga GLB:en (kan vara tiotals MB) hämtas INTE förrän användaren trycker
// "Visa i 3D" — då lazy-importeras model-viewer och src sätts. På en hubb med många modeller sparar
// det stora mängder data. poster (om satt) visas som förhandsbild på plattan.
export const HelmetViewer: React.FC<Props> = ({ src, alt, attribution, heightClass = 'h-[420px]', poster }) => {
  const [activated, setActivated] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!activated) return;
    let cancelled = false;
    import('@google/model-viewer').then(() => { if (!cancelled) setReady(true); }).catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, [activated]);

  return (
    <div>
      <div className={`w-full ${heightClass} rounded-lg overflow-hidden border border-border bg-slate-950`}>
        {!activated ? (
          <button type="button" onClick={() => setActivated(true)} aria-label={`Visa ${alt} i 3D`}
            className="group relative w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors"
            style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 text-slate-900 text-2xl shadow-lg group-hover:scale-105 transition-transform">▶</span>
            <span className="text-sm font-medium">Visa i 3D</span>
            <span className="text-[11px] text-slate-400">{alt}</span>
          </button>
        ) : ready ? (
          // @ts-expect-error – web component
          <model-viewer
            src={src} alt={alt} poster={poster}
            camera-controls auto-rotate ar
            shadow-intensity="1" exposure="1.0" reveal="auto"
            style={{ width: '100%', height: '100%', backgroundColor: '#0b1220' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Laddar 3D…</div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/80 mt-1">{attribution}</p>
    </div>
  );
};
