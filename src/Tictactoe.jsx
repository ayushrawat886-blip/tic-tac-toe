import { useState, useEffect } from "react";
import "./TicTacToe.css";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { player: b[a], line: [a, c, d] };
    }
  }
  return null;
}

function cpuPick(b) {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  const tryWin = (p) =>
    free.find((i) => {
      const t = [...b];
      t[i] = p;
      return getWinner(t);
    });

  const win = tryWin("O");
  if (win !== undefined) return win;
  const block = tryWin("X");
  if (block !== undefined) return block;
  if (!b[4]) return 4;
  return free[Math.floor(Math.random() * free.length)];
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [xTurn, setXTurn] = useState(true);
  const [mode, setMode] = useState("2p");
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });

  const result = getWinner(board);
  const draw = !result && board.every(Boolean);
  const over = !!result || draw;
  const turn = xTurn ? "X" : "O";
  const cpuThinking = mode === "cpu" && !xTurn && !over;

  function move(i) {
    if (board[i] || over) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);

    const r = getWinner(next);
    if (r) setScores((s) => ({ ...s, [r.player]: s[r.player] + 1 }));
    else if (next.every(Boolean)) setScores((s) => ({ ...s, D: s.D + 1 }));

    setXTurn(!xTurn);
  }

  useEffect(() => {
    if (!cpuThinking) return;
    const t = setTimeout(() => move(cpuPick(board)), 400);
    return () => clearTimeout(t);
  }, [cpuThinking, board]);

  function newRound() {
    setBoard(Array(9).fill(""));
    setXTurn(true);
  }

  function changeMode(e) {
    setMode(e.target.value);
    setScores({ X: 0, O: 0, D: 0 });
    newRound();
  }

  let status = `${turn}'s turn`;
  if (result) status = `${result.player} wins!`;
  else if (draw) status = "It's a draw";
  else if (cpuThinking) status = "Computer is thinking…";

  return (
    <main className="ttt">
      <h1 className="ttt-title">Tic Tac Toe</h1>

      <div className="ttt-scores">
        <div className="ttt-score ttt-x">Player X<b>{scores.X}</b></div>
        <div className="ttt-score">Draws<b>{scores.D}</b></div>
        <div className="ttt-score ttt-o">{mode === "cpu" ? "Computer" : "Player O"}<b>{scores.O}</b></div>
      </div>

      <p className="ttt-status" aria-live="polite">{status}</p>

      <div className="ttt-board">
        {board.map((v, i) => {
          const isWin = result?.line.includes(i);
          const dim = result && !isWin;
          return (
            <button
              key={i}
              className={`ttt-cell ${v ? "ttt-" + v.toLowerCase() : ""} ${isWin ? "ttt-win" : ""} ${dim ? "ttt-dim" : ""}`}
              onClick={() => move(i)}
              disabled={!!v || over || cpuThinking}
              aria-label={`Cell ${i + 1}${v ? ", " + v : ""}`}
            >
              {v && <span className="ttt-mark">{v}</span>}
            </button>
          );
        })}
      </div>

      <div className="ttt-controls">
        <button className="ttt-btn ttt-primary" onClick={newRound}>New round</button>
        <select className="ttt-btn" value={mode} onChange={changeMode} aria-label="Game mode">
          <option value="2p">2 players</option>
          <option value="cpu">Vs computer</option>
        </select>
      </div>
    </main>
  );
}