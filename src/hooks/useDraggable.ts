import { useState, useRef, useEffect, useCallback } from 'react';

// Säker gissning på panelstorlek innan elementet hunnit mätas (första render, innan rootRef
// satts) — bara använd som klipp-fallback, inte som faktisk layout.
const FALLBACK_WIDTH = 384; // motsvarar Tailwind w-96 (Near me-panelens desktopbredd)
const FALLBACK_HEIGHT = 300;

/**
 * Gör ett flytande overlay-element flyttbart med muspekaren.
 *
 * Mekaniken är densamma som DraggablePanel (som fungerar): mousemove/mouseup läggs på
 * DOCUMENT under pågående drag — INTE på handtaget. De gamla kontrollerna
 * (ChurchYearControl m.fl.) lyssnade med onPointerMove på själva handtaget, så snabba
 * musrörelser lämnade den lilla ytan och draget "fastnade". Document-lyssnare följer
 * pekaren överallt, även över Leaflet-kartan.
 *
 * Användning:
 *   const { rootRef, dragHandleProps, style } = useDraggable();
 *   <div ref={rootRef} style={style} className="absolute top-4 right-4 ...">
 *     <div {...dragHandleProps} className="cursor-grab">…handtag…</div>
 *   </div>
 *
 * `style` är tomt tills elementet dragits (då gäller CSS-klassernas hörnposition).
 * Efter första draget blir det position:fixed med left/top (right/bottom nollas).
 * Klick på knappar/inputs i handtaget startar INTE drag (så de fortsätter fungera).
 */
export function useDraggable(persistKey?: string) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Läs ev. sparad position (localStorage) → panelen minns var du la den mellan besök.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    if (!persistKey || typeof window === 'undefined') return null;
    try { const raw = localStorage.getItem(persistKey); return raw ? (JSON.parse(raw) as { x: number; y: number }) : null; } catch { return null; }
  });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // Spara positionen när ett drag släpps.
  useEffect(() => {
    if (!dragging && persistKey && pos) { try { localStorage.setItem(persistKey, JSON.stringify(pos)); } catch { /* privat läge */ } }
  }, [dragging, persistKey, pos]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = rootRef.current;
    if (!el) return;
    // Låt interaktiva element i handtaget bete sig normalt (ingen drag).
    if ((e.target as HTMLElement).closest('button, input, a, select, textarea, [role="slider"]')) return;
    const rect = el.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      if (typeof window === 'undefined') return;
      const el = rootRef.current;
      const w = el?.offsetWidth ?? 0;
      const h = el?.offsetHeight ?? 0;
      const x = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - w));
      const y = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - h));
      setPos({ x, y });
    };
    const up = () => setDragging(false);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [dragging]);

  // Klipp EN SPARAD position mot aktuell viewport på VARJE render — inte bara under aktivt
  // drag (rad ~54–55 ovan). En position sparad på en bred skärm (t.ex. en gammal desktop-session)
  // kan annars hamna mitt i bilden på en smalare/annorlunda viewport (bilplatta, liggande mobil)
  // tills nästa gång användaren drar panelen. Elementets riktiga mått används när kända; annars
  // en säker fallback (aldrig 0, som skulle tillåta klipp ända ut i kanten och dölja panelen).
  const clampedPos = (() => {
    if (!pos || typeof window === 'undefined') return pos;
    const el = rootRef.current;
    const w = el?.offsetWidth || FALLBACK_WIDTH;
    const h = el?.offsetHeight || FALLBACK_HEIGHT;
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);
    return { x: Math.min(Math.max(0, pos.x), maxX), y: Math.min(Math.max(0, pos.y), maxY) };
  })();

  const style: React.CSSProperties = clampedPos
    ? { position: 'fixed', left: clampedPos.x, top: clampedPos.y, right: 'auto', bottom: 'auto' }
    : {};

  return {
    rootRef,
    dragHandleProps: { onMouseDown },
    style,
    dragging,
  };
}
