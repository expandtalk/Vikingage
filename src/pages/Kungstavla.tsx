import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './kungstavla.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import {
  type Board, type Cell, type Side, type Opt, DEFAULT_OPT,
  setup, isCorner, isThrone, sideOf, enemyOf, legalMoves, simulate, allMoves, count, aiPick,
} from '@/lib/hnefatafl/engine';

type Theme = 'hall' | 'klippa' | 'sol';
type Mode = 'hotseat' | 'ai-defender' | 'ai-attacker';
type Pos = [number, number];
interface HistoryEntry { winner: Side; reason: string; moves: number; rules: string[]; size: number; }
interface Status { dot: Side | 'over'; node: React.ReactNode; }

const aiSideOf = (m: Mode): Side | null => (m === 'ai-attacker' ? 'attacker' : m === 'ai-defender' ? 'defender' : null);
const whoLabel = (s: Side) => (s === 'attacker' ? 'Anfallaren (mörk)' : 'Försvararen (ljus)');

const Kungstavla = () => {
  const [size, setSize] = useState(9);
  const [mode, setMode] = useState<Mode>('hotseat');
  const [opt, setOpt] = useState<Opt>(DEFAULT_OPT);
  const [theme, setTheme] = useState<Theme>('hall');

  const [board, setBoard] = useState<Board>(() => setup(9));
  const [turn, setTurn] = useState<Side>('attacker');
  const [selected, setSelected] = useState<Pos | null>(null);
  const [legal, setLegal] = useState<Pos[]>([]);
  const [lastMove, setLastMove] = useState<Pos[] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [focus, setFocus] = useState<Pos>([4, 4]);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<Pos[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<Status>({ dot: 'attacker', node: <>Tur: <strong>Anfallaren (mörk)</strong></> });

  const aiSide = aiSideOf(mode);
  const boardRef = useRef<HTMLDivElement>(null);

  const startGame = useCallback((sz: number, md: Mode) => {
    setSize(sz); setMode(md);
    setBoard(setup(sz)); setTurn('attacker'); setGameOver(false);
    setSelected(null); setLegal([]); setLastMove(null); setBusy(false); setFlash([]);
    setFocus([(sz - 1) / 2, (sz - 1) / 2]); setMoveCount(0);
    setStatus({ dot: 'attacker', node: <>Tur: <strong>Anfallaren (mörk)</strong></> });
  }, []);

  const finish = useCallback((winner: Side, reason: string, moves: number) => {
    setGameOver(true); setSelected(null); setLegal([]);
    setStatus({ dot: 'over', node: <><strong>{whoLabel(winner)} vinner.</strong> <span className="msg-sub">{reason}</span></> });
    setHistory((h) => [
      { winner, reason, moves, rules: [
        opt.vapenfor && 'vapenför', opt.maxKingMove && 'max 3 steg', opt.easyKingCapture && 'lätt fångst',
      ].filter(Boolean) as string[], size },
      ...h,
    ].slice(0, 8));
  }, [opt, size]);

  const commitMove = useCallback((bd: Board, fr: number, fc: number, tr: number, tc: number) => {
    const res = simulate(bd, fr, fc, tr, tc, size, opt);
    const mover = sideOf(bd[fr][fc])!;
    const nextCount = moveCount + 1;
    setBoard(res.board); setLastMove([[fr, fc], [tr, tc]]);
    setSelected(null); setLegal([]); setFocus([tr, tc]); setMoveCount(nextCount); setFlash(res.captured);
    if (res.escaped) return finish('defender', 'Kungen nådde ett hörn!', nextCount);
    if (res.kingDead) return finish('attacker', 'Kungen är slagen!', nextCount);
    const next = enemyOf(mover);
    if (allMoves(res.board, next, size, opt).length === 0) {
      return finish(enemyOf(next), `${next === 'attacker' ? 'Anfallaren' : 'Försvararen'} kan inte dra.`, nextCount);
    }
    setTurn(next);
    const note = res.captured.length ? ` Slog ${res.captured.length} pjäs${res.captured.length > 1 ? 'er' : ''}.` : '';
    setStatus({ dot: next, node: <>Tur: <strong>{whoLabel(next)}</strong>{note && <span className="msg-sub">{note}</span>}</> });
  }, [size, opt, moveCount, finish]);

  const onCell = useCallback((r: number, c: number) => {
    if (gameOver || busy) return;
    if (aiSide && turn === aiSide) return;
    const p = board[r][c];
    if (selected && legal.some(([lr, lc]) => lr === r && lc === c)) { commitMove(board, selected[0], selected[1], r, c); return; }
    if (p && sideOf(p) === turn) { setSelected([r, c]); setLegal(legalMoves(board, r, c, size, opt)); setFocus([r, c]); }
    else { setSelected(null); setLegal([]); }
  }, [gameOver, busy, aiSide, turn, board, selected, legal, size, opt, commitMove]);

  // AI-drag
  useEffect(() => {
    if (gameOver || !aiSide || turn !== aiSide) return;
    setBusy(true);
    const id = window.setTimeout(() => {
      const mv = aiPick(board, aiSide, size, opt);
      setBusy(false);
      if (!mv) { finish(enemyOf(aiSide), `${aiSide === 'attacker' ? 'Anfallaren' : 'Försvararen'} kan inte dra.`, moveCount); return; }
      commitMove(board, mv[0], mv[1], mv[2], mv[3]);
    }, 380);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameOver, aiSide, board]);

  // Rensa flash-markering
  useEffect(() => {
    if (!flash.length) return;
    const id = window.setTimeout(() => setFlash([]), 560);
    return () => window.clearTimeout(id);
  }, [flash]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const dirs: Record<string, Pos> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (dirs[e.key]) {
      e.preventDefault();
      const [dr, dc] = dirs[e.key];
      const nr = Math.min(size - 1, Math.max(0, focus[0] + dr));
      const nc = Math.min(size - 1, Math.max(0, focus[1] + dc));
      setFocus([nr, nc]);
      boardRef.current?.querySelector<HTMLButtonElement>(`button[data-idx="${nr * size + nc}"]`)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); onCell(focus[0], focus[1]);
    }
  }, [size, focus, onCell]);

  const captureSet = useMemo(() => {
    const s = new Set<number>();
    if (selected) for (const [tr, tc] of legal) {
      const res = simulate(board, selected[0], selected[1], tr, tc, size, opt);
      if (res.captured.length || res.kingDead) s.add(tr * size + tc);
    }
    return s;
  }, [selected, legal, board, size, opt]);

  const legalSet = useMemo(() => new Set(legal.map(([r, c]) => r * size + c)), [legal, size]);

  const colLabel = (c: number) => String.fromCharCode(65 + c);
  const cellLabel = (r: number, c: number, p: Cell) => {
    const pos = colLabel(c) + (size - r);
    const name = p === 'A' ? 'Anfallare' : p === 'K' ? 'Kungen' : p === 'D' ? 'Försvarare' : 'Tom ruta';
    const extra = isThrone(r, c, size) ? ', tronen' : isCorner(r, c, size) ? ', flyktshörn' : '';
    return `${name} på ${pos}${extra}`;
  };

  const themeBtns: { t: Theme; title: string }[] = [
    { t: 'hall', title: 'Hall — vikingasalens mörka atmosfär' },
    { t: 'klippa', title: 'Klippa — runsten och röd ockra' },
    { t: 'sol', title: 'Sol — bärnsten och ben i dagsljus' },
  ];

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kungstavla (Hnefatafl)"
        titleEn="King's Board (Hnefatafl)"
        description="Spela Hnefatafl — vikingatidens asymmetriska strategispel (kungstavla) direkt i webbläsaren, med tre teman, AI-motståndare och historisk bakgrund."
        descriptionEn="Play Hnefatafl — the Viking Age asymmetric strategy game — in the browser, with three themes, an AI opponent and historical background."
        keywords="hnefatafl, kungstavla, tafl, vikingaspel, brädspel, strategispel"
      />
      <Header />
      <Breadcrumbs />

      <main className="container mx-auto px-4 py-6">
        <div className="kungstavla" data-theme={theme}>
          <div className="wrap">
            <header className="masthead">
              <div>
                <h1 className="title">Hnefatafl <span className="em">&bull;</span> <span style={{ fontSize: '.5em', letterSpacing: '.18em', color: 'var(--text-d)' }}>KUNGSTAVLA</span></h1>
                <p className="tagline">Nordiskt strategispel från yngre järnåldern. <span className="rune">&#5921;</span> Anfallarna omringar — kungen flyr till ett hörn.</p>
              </div>
            </header>

            <div className="game">
              <section aria-label="Spelplan">
                <div className="controls">
                  <div className="field">
                    <label htmlFor="ks-size">Bräde</label>
                    <select id="ks-size" value={size} onChange={(e) => startGame(parseInt(e.target.value, 10), mode)}>
                      <option value={9}>9×9 (tablut)</option>
                      <option value={11}>11×11 (hnefatafl)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="ks-mode">Motståndare</label>
                    <select id="ks-mode" value={mode} onChange={(e) => startGame(size, e.target.value as Mode)}>
                      <option value="hotseat">Två spelare</option>
                      <option value="ai-defender">Du anfaller (AI försvarar)</option>
                      <option value="ai-attacker">Du försvarar (AI anfaller)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>&nbsp;</label>
                    <button className="primary" onClick={() => startGame(size, mode)}>Nytt spel</button>
                  </div>
                  <div className="field">
                    <label>Utseende</label>
                    <div className="theme-btns" role="group" aria-label="Välj tema">
                      {themeBtns.map(({ t, title }) => (
                        <button key={t} className={`theme-btn${theme === t ? ' active' : ''}`} data-t={t}
                          title={title} aria-pressed={theme === t} onClick={() => setTheme(t)} />
                      ))}
                    </div>
                  </div>
                  {busy && <span className="thinking on">AI tänker…</span>}
                </div>

                <div className="status" role="status" aria-live="polite">
                  <span className={`turn-dot ${status.dot}`} aria-hidden="true" />
                  <span className="msg">{status.node}</span>
                </div>

                <div className="board-frame">
                  <div className="board" ref={boardRef} role="grid" aria-label="Hnefatafl-bräde"
                    style={{ gridTemplateColumns: `repeat(${size},1fr)` }}>
                    {board.map((row, r) => row.map((p, c) => {
                      const key = r * size + c;
                      const cls = ['cell'];
                      if (isCorner(r, c, size)) cls.push('corner');
                      if (isThrone(r, c, size)) cls.push('throne');
                      if (selected && selected[0] === r && selected[1] === c) cls.push('selected');
                      if (legalSet.has(key)) cls.push('legal');
                      if (captureSet.has(key)) cls.push('capture');
                      if (lastMove && lastMove.some(([lr, lc]) => lr === r && lc === c)) cls.push('lastmove');
                      if (flash.some(([fr, fc]) => fr === r && fc === c)) cls.push('flash');
                      const pieceCls = p === 'A' ? 'attacker' : p === 'K' ? 'king' : p === 'D' ? 'defender' : null;
                      return (
                        <button key={key} data-idx={key} className={cls.join(' ')} role="gridcell"
                          tabIndex={focus[0] === r && focus[1] === c ? 0 : -1}
                          aria-label={cellLabel(r, c, p)}
                          onClick={() => onCell(r, c)} onKeyDown={onKey}>
                          {pieceCls && <span className={`piece ${pieceCls}`} />}
                        </button>
                      );
                    }))}
                  </div>
                </div>
              </section>

              <section className="panel">
                <h2>Ställning</h2>
                <div className="scoreboard">
                  <div className={`side-card${!gameOver && turn === 'attacker' ? ' active' : ''}`}>
                    <div className="who"><span className="swatch attacker" /> Anfallare</div>
                    <div className="role">Mörk — slå kungen</div>
                    <div className="count">{count(board, 'attacker', size)} <small>PJÄSER</small></div>
                  </div>
                  <div className={`side-card${!gameOver && turn === 'defender' ? ' active' : ''}`}>
                    <div className="who"><span className="swatch defender" /> Försvarare</div>
                    <div className="role">Ljus — för kungen till ett hörn</div>
                    <div className="count">{count(board, 'defender', size)} <small>PJÄSER</small></div>
                  </div>
                </div>

                <div className="move-row">
                  <span className="move-label">Drag</span>
                  <span className="move-count">{moveCount}</span>
                </div>

                {history.length > 0 && (
                  <div className="history-box">
                    <div className="history-head">Senaste spel</div>
                    <ol className="history-list">
                      {history.map((g, i) => (
                        <li key={i}>
                          <span>
                            <span className={`h-winner ${g.winner === 'attacker' ? 'att' : 'def'}`}>
                              {g.winner === 'attacker' ? 'Anfallaren' : 'Försvararen'} vinner
                            </span>{' '}
                            {g.rules.length > 0 && <span className="h-rules">{g.rules.join(', ')}</span>}
                          </span>
                          <span className="h-moves">{g.moves} drag &bull; {g.size}×{g.size}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <details>
                  <summary>Alternativregler</summary>
                  <div className="alt-grid">
                    <label className="tog-row">
                      <input type="checkbox" checked={opt.vapenfor} onChange={(e) => setOpt((o) => ({ ...o, vapenfor: e.target.checked }))} />
                      <span className="tog-sw" aria-hidden="true" />
                      <span className="tog-lbl"><strong>Kung vapenför <span className="badge">historisk variant</span></strong>
                        <small>Kungen får delta i slag mot motståndarpjäser. Fördel för försvararen.</small></span>
                    </label>
                    <label className="tog-row">
                      <input type="checkbox" checked={opt.maxKingMove} onChange={(e) => setOpt((o) => ({ ...o, maxKingMove: e.target.checked }))} />
                      <span className="tog-sw" aria-hidden="true" />
                      <span className="tog-lbl"><strong>Kung max 3 steg <span className="badge">balansjustering</span></strong>
                        <small>Kungen får flytta högst tre rutor per drag. Utjämnar styrkorna.</small></span>
                    </label>
                    <label className="tog-row">
                      <input type="checkbox" checked={opt.easyKingCapture} onChange={(e) => setOpt((o) => ({ ...o, easyKingCapture: e.target.checked }))} />
                      <span className="tog-sw" aria-hidden="true" />
                      <span className="tog-lbl"><strong>Kung slås som vanlig pjäs <span className="badge">alternativ</span></strong>
                        <small>Räcker med två fiendepjäser på motstående sidor. Svårare för försvararen.</small></span>
                    </label>
                  </div>
                </details>

                <details>
                  <summary>Regler</summary>
                  <ul>
                    <li>Två sidor: <strong>anfallare</strong> (mörk) omringar, <strong>försvarare</strong> (ljus) skyddar kungen. Anfallaren drar först.</li>
                    <li>Alla pjäser går valfritt antal rutor rakt (vågrätt/lodrätt). Ingen hoppar; max en pjäs per ruta.</li>
                    <li>En pjäs slås om motståndaren flankerar den på båda sidor. Du kan tryggt flytta in <em>mellan</em> två fiender.</li>
                    <li>Tronen och hörnen är <strong>fientliga rutor</strong> som hjälper till att slå. Inga pjäser får landa på dem — kungen kan passera tronen men aldrig återvända dit.</li>
                    <li>Kungen slås när han omges på alla fyra sidor av anfallare / fientliga rutor (minst 2 riktiga anfallare). Kungen är <strong>vapenlös</strong>.</li>
                    <li><strong>Försvararen vinner</strong> när kungen når ett hörn. <strong>Anfallaren vinner</strong> när kungen slås. Den som inte kan dra förlorar.</li>
                  </ul>
                  <p className="rules-note">
                    Tangentbord: piltangenter navigerar, Enter / mellanslag väljer och flyttar.
                    Reglerna följer tablut-traditionen (Carl von Linné, 1732).
                  </p>
                </details>
              </section>
            </div>

            <footer className="cred">
              Glaspjäserna i Birkas kammargrav Bj&nbsp;750 tros ha tillhört detta spel — kungen &bdquo;hnefi&ldquo; främst i raden. &bull; Tablut dokumenterat av Carl von Linné i Lappland, 1732.
            </footer>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Kungstavla;
