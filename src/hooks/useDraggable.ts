import { useState, useRef, useEffect, useCallback } from 'react';

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
export function useDraggable() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

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

  const style: React.CSSProperties = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {};

  return {
    rootRef,
    dragHandleProps: { onMouseDown },
    style,
    dragging,
  };
}
