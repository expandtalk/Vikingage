import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Feather } from "lucide-react";

// Skaldiskt = hovmetrik (dróttkvätt m.fl.); eddiskt = fornyrðislag/ljóðaháttr m.fl.
const isSkaldic = (m: string) => /dr[oó]ttkv[aä]tt|hrynhent/i.test(m);
const isEddic = (m: string) => /fornyr[ðd]islag|lj[oó][ðd]ah[aá]ttr|m[aá]lah[aá]ttr|kvi[ðd]uh[aá]ttr/i.test(m);

/** Klassificerar och etiketterar ett versmått. Returnerar null för tomt värde. */
export function meterInfo(meter?: string | null, sv = true): { label: string; skaldic: boolean } | null {
  if (!meter) return null;
  const m = meter.trim();
  if (!m) return null;
  const skaldic = isSkaldic(m);
  const klass = skaldic ? (sv ? 'Skaldiskt' : 'Skaldic')
    : isEddic(m) ? (sv ? 'Eddiskt' : 'Eddic')
    : null;
  return { label: klass ? `${klass} · ${m}` : m, skaldic };
}

interface MeterBadgeProps {
  meter?: string | null;
  sv?: boolean;
  className?: string;
}

/**
 * Badge för versmått (meter) på en runinskrift. Skaldisk hovmetrik (dróttkvätt)
 * lyfts fram i guld; eddisk metrik (fornyrðislag m.fl.) neutralt.
 */
export const MeterBadge: React.FC<MeterBadgeProps> = ({ meter, sv = true, className = '' }) => {
  const info = meterInfo(meter, sv);
  if (!info) return null;
  return (
    <Badge
      className={`text-xs border-0 ${info.skaldic ? 'bg-gold text-black' : 'bg-secondary text-secondary-foreground'} ${className}`}
      title={sv ? 'Versmått' : 'Poetic metre'}
    >
      <Feather className="h-3 w-3 mr-1" aria-hidden="true" />
      {info.label}
    </Badge>
  );
};
