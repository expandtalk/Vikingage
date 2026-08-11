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
  src: string;                 // t.ex. "/models/vendel-i.glb" (FTP)
  alt: string;
  attribution: React.ReactNode; // "Historiska museet/SHM · CC-BY 4.0 · SweDigArch" + länk
  heightClass?: string;
  poster?: string;
}

export const HelmetViewer: React.FC<Props> = ({ src, alt, attribution, heightClass = 'h-[420px]', poster }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Lazy: registrera web-komponenten först när en visare faktiskt monteras.
    let cancelled = false;
    import('@google/model-viewer').then(() => { if (!cancelled) setReady(true); }).catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className={`w-full ${heightClass} rounded-lg overflow-hidden border border-border bg-slate-950`}>
        {ready ? (
          // @ts-expect-error – web component
          <model-viewer
            src={src} alt={alt} poster={poster}
            camera-controls auto-rotate ar
            shadow-intensity="1" exposure="1.0" loading="lazy" reveal="auto"
            style={{ width: '100%', height: '100%', backgroundColor: '#0b1220' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Laddar 3D-visare…</div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/80 mt-1">{attribution}</p>
    </div>
  );
};
