import React from 'react';
// Roterande kompass: nålen pekar norr; kortet roterar -headingDeg så norr hamnar rätt
// relativt färdriktningen. headingDeg = grader medurs från norr (fieldNav.resolveHeading).
export const Compass: React.FC<{ headingDeg: number | null; className?: string }> = ({ headingDeg, className }) => {
  const rot = headingDeg == null ? 0 : -headingDeg;
  return (
    <div className={`relative h-11 w-11 rounded-full border border-slate-500 bg-slate-900/80 ${className ?? ''}`}
         role="img" aria-label={headingDeg == null ? 'Kompass (ingen kurs)' : `Kompass, kurs ${Math.round(headingDeg)}°`}>
      <div className="absolute inset-0 transition-transform" style={{ transform: `rotate(${rot}deg)` }}>
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[10px] font-bold text-amber-400">N</span>
        <span className="absolute left-1/2 top-1 -translate-x-1/2 h-4 w-0.5 bg-amber-400" />
      </div>
    </div>
  );
};
