import { useEffect, useState } from 'react';

/**
 * Verified IIIF recipe (medeltidsbrev step 1, 2026-08-10):
 * manifest = https://lbiiif.riksarkivet.se/sdhk!<id>/manifest  (IIIF Presentation API v3)
 *   -> items[0] (first canvas) -> items[0] (AnnotationPage) -> items[0] (Annotation).body
 *   -> body.service[0].id + "/full/1200,/0/default.jpg"  (NOT "!1200," — that gives HTTP 501;
 *      the server only advertises profile "level1", no sizeByConfinedWh)
 *   -> fallback: body.id (already a complete full-size default.jpg URL)
 * Non-digitised charters return HTTP 500 (not 404) — treat any non-ok / parse failure as "no image".
 */
async function fetchFirstPageImageUrl(sdhkId: number): Promise<string | null> {
  try {
    const res = await fetch(`https://lbiiif.riksarkivet.se/sdhk!${sdhkId}/manifest`);
    if (!res.ok) return null;
    const manifest = await res.json();
    const body = manifest?.items?.[0]?.items?.[0]?.items?.[0]?.body;
    const serviceId: unknown = body?.service?.[0]?.id;
    if (typeof serviceId === 'string' && serviceId) return `${serviceId}/full/1200,/0/default.jpg`;
    if (typeof body?.id === 'string' && body.id) return body.id;
    return null;
  } catch {
    return null;
  }
}

export interface CharterFacsimileState {
  imageUrl: string | null;
  /** true once the manifest lookup has completed (success or failure) */
  checked: boolean;
}

/**
 * Resolves the scanned-original facsimile image for a charter via Riksarkivet's IIIF
 * service. Fetch runs async and never blocks render; pass `enabled=false` to defer it
 * (e.g. until the containing element is in view).
 */
export function useCharterFacsimile(sdhkId: number | null, enabled: boolean): CharterFacsimileState {
  const [state, setState] = useState<CharterFacsimileState>({ imageUrl: null, checked: false });

  useEffect(() => {
    if (!enabled || sdhkId == null || !Number.isFinite(sdhkId)) return;
    let cancelled = false;
    setState({ imageUrl: null, checked: false });
    fetchFirstPageImageUrl(sdhkId).then((imageUrl) => {
      if (!cancelled) setState({ imageUrl, checked: true });
    });
    return () => {
      cancelled = true;
    };
  }, [sdhkId, enabled]);

  return state;
}
