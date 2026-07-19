// Hnefatafl-spelmotor — ren logik, portad från navertavla/index.html (vanilla JS).
// Alla funktioner är rena och parameteriserade på storlek (size) + alternativregler (opt).

export type Cell = 'A' | 'D' | 'K' | null;
export type Board = Cell[][];
export type Side = 'attacker' | 'defender';

export interface Opt {
  vapenfor: boolean;        // kungen deltar i slag
  maxKingMove: boolean;     // kungen max 3 steg
  easyKingCapture: boolean; // kungen slås som vanlig pjäs (2 sidor räcker)
}

export const DEFAULT_OPT: Opt = { vapenfor: false, maxKingMove: false, easyKingCapture: false };
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

export function setup(size: number): Board {
  const b: Board = Array.from({ length: size }, () => Array<Cell>(size).fill(null));
  const c = (size - 1) / 2;
  b[c][c] = 'K';
  if (size === 9) {
    ([[4, 2], [4, 3], [4, 5], [4, 6], [2, 4], [3, 4], [5, 4], [6, 4]] as const).forEach(([r, q]) => (b[r][q] = 'D'));
    ([[0, 3], [0, 4], [0, 5], [1, 4], [8, 3], [8, 4], [8, 5], [7, 4],
      [3, 0], [4, 0], [5, 0], [4, 1], [3, 8], [4, 8], [5, 8], [4, 7]] as const).forEach(([r, q]) => (b[r][q] = 'A'));
  } else {
    ([[3, 5], [4, 4], [4, 5], [4, 6], [5, 3], [5, 4], [5, 6], [5, 7],
      [6, 4], [6, 5], [6, 6], [7, 5]] as const).forEach(([r, q]) => (b[r][q] = 'D'));
    ([[0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 5],
      [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [9, 5],
      [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [5, 1],
      [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [5, 9]] as const).forEach(([r, q]) => (b[r][q] = 'A'));
  }
  return b;
}

export const isCorner = (r: number, c: number, size: number) => { const n = size - 1; return (r === 0 || r === n) && (c === 0 || c === n); };
export const isThrone = (r: number, c: number, size: number) => { const m = (size - 1) / 2; return r === m && c === m; };
export const onBoard = (r: number, c: number, size: number) => r >= 0 && c >= 0 && r < size && c < size;
export const sideOf = (p: Cell): Side | null => (p === 'A' ? 'attacker' : p === 'D' || p === 'K' ? 'defender' : null);
export const enemyOf = (s: Side): Side => (s === 'attacker' ? 'defender' : 'attacker');

export function legalMoves(bd: Board, r: number, c: number, size: number, opt: Opt): [number, number][] {
  const p = bd[r][c]; if (!p) return [];
  const king = p === 'K';
  const maxStep = king && opt.maxKingMove ? 3 : size;
  const out: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    let step = 1;
    while (step <= maxStep) {
      const nr = r + dr * step, nc = c + dc * step;
      if (!onBoard(nr, nc, size)) break;
      if (bd[nr][nc] !== null) break;
      if (isCorner(nr, nc, size)) { if (king) out.push([nr, nc]); step++; continue; }
      if (isThrone(nr, nc, size)) { step++; continue; }
      out.push([nr, nc]); step++;
    }
  }
  return out;
}

function hostileSupport(bd: Board, r: number, c: number, size: number): boolean {
  if (!onBoard(r, c, size)) return false;
  if (isCorner(r, c, size)) return true;
  if (isThrone(r, c, size) && bd[r][c] === null) return true;
  return false;
}

export function findKing(bd: Board, size: number): [number, number] | null {
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (bd[r][c] === 'K') return [r, c];
  return null;
}

export function kingCaptured(bd: Board, size: number, opt: Opt): boolean {
  const k = findKing(bd, size); if (!k) return true;
  const [kr, kc] = k;
  if (opt.easyKingCapture) {
    const pairs = [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]] as const;
    for (const [[dr1, dc1], [dr2, dc2]] of pairs) {
      const r1 = kr + dr1, c1 = kc + dc1, r2 = kr + dr2, c2 = kc + dc2;
      const h1 = (onBoard(r1, c1, size) && bd[r1][c1] === 'A') || hostileSupport(bd, r1, c1, size);
      const h2 = (onBoard(r2, c2, size) && bd[r2][c2] === 'A') || hostileSupport(bd, r2, c2, size);
      if (h1 && h2 && ((onBoard(r1, c1, size) && bd[r1][c1] === 'A') || (onBoard(r2, c2, size) && bd[r2][c2] === 'A'))) return true;
    }
    return false;
  }
  let attackers = 0;
  for (const [dr, dc] of DIRS) {
    const nr = kr + dr, nc = kc + dc;
    if (!onBoard(nr, nc, size)) continue;
    const cell = bd[nr][nc];
    if (cell === 'A') { attackers++; continue; }
    if (isCorner(nr, nc, size)) continue;
    if (isThrone(nr, nc, size) && cell === null) continue;
    return false;
  }
  return attackers >= 2;
}

export interface MoveResult { board: Board; captured: [number, number][]; escaped: boolean; kingDead: boolean; }

export function simulate(bd: Board, fr: number, fc: number, tr: number, tc: number, size: number, opt: Opt): MoveResult {
  const nb = bd.map((row) => row.slice());
  const piece = nb[fr][fc];
  const mover = sideOf(piece);
  nb[fr][fc] = null; nb[tr][tc] = piece;
  const captured: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const ar = tr + dr, ac = tc + dc;
    if (!onBoard(ar, ac, size)) continue;
    const t = nb[ar][ac];
    if (t === null || sideOf(t) === mover || t === 'K') continue;
    const br = tr + 2 * dr, bc = tc + 2 * dc;
    const back = onBoard(br, bc, size) ? nb[br][bc] : null;
    const friend = !!back && sideOf(back) === mover && (back !== 'K' || opt.vapenfor);
    if (friend || hostileSupport(nb, br, bc, size)) { captured.push([ar, ac]); nb[ar][ac] = null; }
  }
  const escaped = piece === 'K' && isCorner(tr, tc, size);
  const kingDead = mover === 'attacker' && kingCaptured(nb, size, opt);
  return { board: nb, captured, escaped, kingDead };
}

export function allMoves(bd: Board, side: Side, size: number, opt: Opt): [number, number, number, number][] {
  const list: [number, number, number, number][] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (sideOf(bd[r][c]) === side) for (const [tr, tc] of legalMoves(bd, r, c, size, opt)) list.push([r, c, tr, tc]);
  }
  return list;
}

export function count(bd: Board, side: Side, size: number): number {
  let n = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (sideOf(bd[r][c]) === side) n++;
  return n;
}

function evaluate(bd: Board, size: number, opt: Opt): number {
  if (kingCaptured(bd, size, opt)) return 1e6;
  const k = findKing(bd, size);
  if (k && isCorner(k[0], k[1], size)) return -1e6;
  let s = count(bd, 'attacker', size) * 5 - count(bd, 'defender', size) * 6;
  if (k) {
    const [kr, kc] = k, n = size - 1;
    const dist = Math.min(kr + kc, kr + (n - kc), (n - kr) + kc, (n - kr) + (n - kc));
    s += dist * 2;
    s -= legalMoves(bd, kr, kc, size, opt).length * 1.5;
    let adj = 0;
    for (const [dr, dc] of DIRS) { const r = kr + dr, c = kc + dc; if (onBoard(r, c, size) && bd[r][c] === 'A') adj++; }
    s += adj * 9;
  }
  return s;
}

function sideWins(bd: Board, side: Side, size: number, opt: Opt): boolean {
  for (const [r, c, tr, tc] of allMoves(bd, side, size, opt)) {
    const res = simulate(bd, r, c, tr, tc, size, opt);
    if (side === 'attacker' && res.kingDead) return true;
    if (side === 'defender' && res.escaped) return true;
  }
  return false;
}

export function aiPick(bd: Board, side: Side, size: number, opt: Opt): [number, number, number, number] | null {
  const moves = allMoves(bd, side, size, opt);
  if (!moves.length) return null;
  for (const m of moves) {
    const res = simulate(bd, m[0], m[1], m[2], m[3], size, opt);
    if ((side === 'attacker' && res.kingDead) || (side === 'defender' && res.escaped)) return m;
  }
  const sign = side === 'attacker' ? 1 : -1;
  const scored = moves.map((m) => {
    const res = simulate(bd, m[0], m[1], m[2], m[3], size, opt);
    return { m, v: sign * evaluate(res.board, size, opt) + res.captured.length * 40, board: res.board };
  });
  scored.sort((a, b) => b.v - a.v);
  const top = scored.slice(0, Math.min(14, scored.length));
  for (const cand of top) if (sideWins(cand.board, enemyOf(side), size, opt)) cand.v -= 1e5;
  top.sort((a, b) => b.v - a.v);
  const best = top[0].v;
  const ties = top.filter((c) => c.v >= best - 0.001);
  return ties[Math.floor(Math.random() * ties.length)].m;
}
