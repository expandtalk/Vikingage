// src/domain/dating/refinementTypes.ts

/** Slutet årsintervall (inklusivt). Negativt år = f.Kr. (ej relevant för runstenar men tillåtet). */
export interface YearInterval {
  from: number;
  to: number;
}

/** Osäkerhet uttrycks som klass — inga numeriska sannolikheter i DP1. */
export type ConfidenceClass = 'high' | 'medium' | 'low';

/** Vilken sorts villkor ett dateringsintervall kommer ifrån. */
export type ConstraintKind =
  | 'style'        // stilkronologi (Gräslund) — mjukt kuvert
  | 'carver'       // ristarens aktiva fönster
  | 'event'        // daterbar händelse (Ingvarståget m.fl.)
  | 'terminus'     // terminus post/ante quem (kyrka/ting)
  | 'absolute';    // externt absolut daterad (dating_methods.gives_absolute)

/** Ett enskilt dateringsvillkor på en nod. */
export interface DatingConstraint {
  kind: ConstraintKind;
  interval: YearInterval;
  confidence: ConfidenceClass;
  /** Språkligt villkor får ej ingå i non_linguistic-läget (cirkularitetsväggen). */
  isLinguistic: boolean;
  /** Absolut ankare väger tyngst och kan inte skalas bort. */
  isAbsolute: boolean;
  /** Källhänvisning för proveniens (t.ex. "Gräslund Pr2", "SRDB U 344", "Ingvarståget ~1041"). */
  source: string;
}

export type RefineMode = 'all' | 'non_linguistic';

/** Vad som bidrog till ett förfinat datum — spårbarhet. */
export interface Provenance {
  kind: ConstraintKind;
  source: string;
  interval: YearInterval;
}

/** Motorns utdata per nod och läge. */
export interface RefinedDating {
  inscriptionId: string;
  mode: RefineMode;
  interval: YearInterval;
  confidence: ConfidenceClass;
  /** True om villkoren var motstridiga (tomt snitt) → bredaste kuvertet behölls. */
  conflict: boolean;
  provenance: Provenance[];
}
