import { useState, useRef, useCallback } from 'react';

// Återanvändbar legend-state för valfri kartsida. Hanterar tänt/släckt per lager +
// BASKARTE-CAP (default 1 / max 2 samtidigt) och en engångs-seed för Gå/Cykla-läge.
// Följer legend-invarianten: presets tvingar ALDRIG på per render — cap är ren maskning
// vid tändning, och "tänd alla" är en engångs-seed med ref-vakt.

export interface LegendLayerDef {
  key: string;
  label: string;
  color?: string;
  group?: 'layer' | 'basemap'; // 'basemap' = cappad grupp (kartor)
  defaultOn?: boolean;
}

export function useMapLegendState(defs: LegendLayerDef[], opts?: { maxBaseMaps?: number }) {
  const maxBase = opts?.maxBaseMaps ?? 2;
  const seeded = useRef(false);

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const e: Record<string, boolean> = {};
    let baseOn = 0;
    for (const d of defs) {
      if (d.group === 'basemap') {
        // Respektera taket redan vid init (default 1 rekommenderas per sida).
        const on = !!d.defaultOn && baseOn < maxBase;
        if (on) baseOn++;
        e[d.key] = on;
      } else {
        e[d.key] = !!d.defaultOn;
      }
    }
    return e;
  });

  const toggle = useCallback((key: string) => {
    setEnabled((prev) => {
      const def = defs.find((d) => d.key === key);
      const turningOn = !prev[key];
      const next = { ...prev, [key]: turningOn };
      // Baskarte-cap: tänder man en karta och redan har maxBase på → släck den äldsta.
      if (def?.group === 'basemap' && turningOn) {
        const otherOn = defs.filter((d) => d.group === 'basemap' && d.key !== key && next[d.key]);
        while (otherOn.length >= maxBase) {
          next[otherOn.shift()!.key] = false; // släck i def-ordning (äldsta först)
        }
      }
      return next;
    });
  }, [defs, maxBase]);

  // Engångs-seed (Gå/Cykla): tänd alla tematiska lager, håll baskartor cappade till 1.
  const seedAllLayers = useCallback(() => {
    if (seeded.current) return;
    seeded.current = true;
    setEnabled((prev) => {
      const next = { ...prev };
      let baseOn = 0;
      for (const d of defs) {
        if (d.group === 'basemap') { next[d.key] = baseOn < 1; if (next[d.key]) baseOn++; }
        else next[d.key] = true;
      }
      return next;
    });
  }, [defs]);

  return { enabled, toggle, seedAllLayers };
}
