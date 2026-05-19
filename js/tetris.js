/* ══════════════════════════════════════════
   TETRIS  —  tetris.js
   Dépendances : core.js (currentLevel, LEVELS, $, showWin, showToast)
══════════════════════════════════════════ */

// ── Pièces (matrices 4×4, couleur) ──────
const TX_PIECES = [
  { m: [[1, 1, 1, 1]], c: "#00bcd4" }, // I
  {
    m: [
      [1, 1],
      [1, 1],
    ],
    c: "#f1c40f",
  }, // O
  {
    m: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    c: "#9b59b6",
  }, // T
  {
    m: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    c: "#e67e22",
  }, // L
  {
    m: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    c: "#3498db",
  }, // J
  {
    m: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    c: "#2ecc71",
  }, // S
  {
    m: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    c: "#e74c3c",
  }, // Z
];

// ── État global ──────────────────────────
let txGrid, txPiece, txNext, txScore, txLines, txLevel;
let txCols, txRows, txCellSize, txSpeed;
let txCanvas, txCtx, txNextCanvas, txNextCtx;
let txTimer = null,
  txRunning = false;

// ── Init ─────────────────────────────────
function initTetris() {
  const cfg = LEVELS[currentLevel].tx;
  txCols = cfg.cols;
  txRows = Math.round(txCols * 2); // ratio 1:2
  txSpeed = cfg.speed;
  txScore = 0;
  txLines = 0;
  txLevel = 1;

  _txUpdateUI();
  _txSetupCanvas();

  txGrid = Array.from({ length: txRows }, () => Array(txCols).fill(0));
  txNext = _txRandPiece();
  _txSpawn();

  clearInterval(txTimer);
  txRunning = true;
  txTimer = setInterval(_txTick, txSpeed);
  txDraw();
}

// ── Canvas sizing (responsive) ───────────
function _txSetupCanvas() {
  txCanvas = $("tx-canvas");
  txCtx = txCanvas.getContext("2d");
  txNextCanvas = $("tx-next");
  txNextCtx = txNextCanvas.getContext("2d");

  const layout = $("tx-layout");
  const sideW = 100;
  const gap = 10;
  const maxW = layout.clientWidth - sideW - gap - 8;
  const maxH = layout.clientHeight - 8;

  txCellSize = Math.floor(Math.min(maxW / txCols, maxH / txRows));

  txCanvas.width = txCellSize * txCols;
  txCanvas.height = txCellSize * txRows;
}

// ── Pièce aléatoire ──────────────────────
function _txRandPiece() {
  const def = TX_PIECES[Math.floor(Math.random() * TX_PIECES.length)];
  return {
    m: def.m,
    c: def.c,
    x: Math.floor(txCols / 2) - Math.floor(def.m[0].length / 2),
    y: 0,
  };
}

function _txSpawn() {
  txPiece = {
    ...txNext,
    x: Math.floor(txCols / 2) - Math.floor(txNext.m[0].length / 2),
    y: 0,
  };
  txNext = _txRandPiece();
  if (_txCollides(txPiece, 0, 0)) _txGameOver();
}

// ── Collision ────────────────────────────
function _txCollides(p, dx, dy, mat) {
  mat = mat || p.m;
  for (let r = 0; r < mat.length; r++)
    for (let c = 0; c < mat[r].length; c++)
      if (mat[r][c]) {
        const nx = p.x + c + dx,
          ny = p.y + r + dy;
        if (nx < 0 || nx >= txCols || ny >= txRows) return true;
        if (ny >= 0 && txGrid[ny][nx]) return true;
      }
  return false;
}

// ── Rotation ─────────────────────────────
function _txRotate(m) {
  return m[0].map((_, c) => m.map((row) => row[c]).reverse());
}

// ── Verrou & lignes ──────────────────────
function _txLock() {
  txPiece.m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) txGrid[txPiece.y + r][txPiece.x + c] = txPiece.c;
    }),
  );
  const cleared = txGrid.filter((row) => row.every(Boolean));
  txGrid = [
    ...Array.from({ length: cleared.length }, () => Array(txCols).fill(0)),
    ...txGrid.filter((row) => !row.every(Boolean)),
  ];
  if (cleared.length) {
    const pts =
      [0, 100, 300, 500, 800][cleared.length] * txLevel * (currentLevel + 1);
    txScore += pts;
    txLines += cleared.length;
    txLevel = Math.floor(txLines / 10) + 1;
    // accélération
    clearInterval(txTimer);
    txSpeed = Math.max(80, LEVELS[currentLevel].tx.speed - (txLevel - 1) * 40);
    txTimer = setInterval(_txTick, txSpeed);
    showToast(`+${pts} pts !`);
    _txUpdateUI();
  }
  _txSpawn();
}

// ── Tick gravité ─────────────────────────
function _txTick() {
  if (!txRunning) return;
  if (_txCollides(txPiece, 0, 1)) {
    _txLock();
  } else {
    txPiece.y++;
  }
  txDraw();
}

// ── Game over ────────────────────────────
function _txGameOver() {
  txRunning = false;
  clearInterval(txTimer);
  setTimeout(
    () => showWin("🟦", "Game Over !", txScore + " pts", initTetris),
    300,
  );
}

// ── UI labels ────────────────────────────
function _txUpdateUI() {
  $("tx-score").textContent = txScore + " pts";
  $("tx-level").textContent = txLevel || 1;
  $("tx-lines").textContent = txLines || 0;
}

// ── Ghost (projection) ───────────────────
function _txGhostY() {
  let dy = 0;
  while (!_txCollides(txPiece, 0, dy + 1)) dy++;
  return txPiece.y + dy;
}

// ── DRAW ─────────────────────────────────
function txDraw() {
  const ctx = txCtx,
    cs = txCellSize;
  ctx.clearRect(0, 0, txCanvas.width, txCanvas.height);

  // grille de fond
  ctx.strokeStyle = "rgba(255,255,255,.04)";
  ctx.lineWidth = 1;
  for (let r = 0; r < txRows; r++)
    for (let c = 0; c < txCols; c++) {
      ctx.strokeRect(c * cs, r * cs, cs, cs);
    }

  // cellules posées
  txGrid.forEach((row, r) =>
    row.forEach((color, c) => {
      if (color) _txDrawCell(ctx, c, r, color, cs);
    }),
  );

  // ghost
  const gy = _txGhostY();
  txPiece.m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) {
        ctx.globalAlpha = 0.2;
        _txDrawCell(ctx, txPiece.x + c, gy + r, txPiece.c, cs);
        ctx.globalAlpha = 1;
      }
    }),
  );

  // pièce active
  txPiece.m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) _txDrawCell(ctx, txPiece.x + c, txPiece.y + r, txPiece.c, cs);
    }),
  );

  // pièce suivante
  _txDrawNext();
}

function _txDrawCell(ctx, c, r, color, cs) {
  const x = c * cs + 1,
    y = r * cs + 1,
    s = cs - 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, 4);
  ctx.fill();
  // reflet
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, s * 0.45, s * 0.3, 2);
  ctx.fill();
}

function _txDrawNext() {
  const ctx = txNextCtx,
    cs = 18;
  ctx.clearRect(0, 0, 80, 80);
  const m = txNext.m;
  const ox = Math.floor((80 - m[0].length * cs) / 2);
  const oy = Math.floor((80 - m.length * cs) / 2);
  m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) _txDrawCell(ctx, 0, 0, txNext.c, cs); // placeholder
      if (v) {
        ctx.fillStyle = txNext.c;
        ctx.beginPath();
        ctx.roundRect(ox + c * cs + 1, oy + r * cs + 1, cs - 2, cs - 2, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.18)";
        ctx.beginPath();
        ctx.roundRect(
          ox + c * cs + 3,
          oy + r * cs + 3,
          (cs - 2) * 0.45,
          (cs - 2) * 0.3,
          2,
        );
        ctx.fill();
      }
    }),
  );
}

// ── Contrôles clavier ────────────────────
document.addEventListener("keydown", (e) => {
  if (!txRunning) return;
  if (e.key === "ArrowLeft") _txMove(-1);
  if (e.key === "ArrowRight") _txMove(1);
  if (e.key === "ArrowDown") _txSoftDrop();
  if (e.key === "ArrowUp") _txTryRotate();
  if (e.key === " ") _txHardDrop();
});

// ── Contrôles tactiles ───────────────────
function _txBindButtons() {
  const map = {
    "tx-left": () => _txMove(-1),
    "tx-right": () => _txMove(1),
    "tx-rotate": () => _txTryRotate(),
    "tx-down": () => _txSoftDrop(),
    "tx-drop": () => _txHardDrop(),
  };
  Object.entries(map).forEach(([id, fn]) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        fn();
      },
      { passive: false },
    );
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      fn();
    });
  });
}
_txBindButtons();

// ── Actions ──────────────────────────────
function _txMove(dx) {
  if (!_txCollides(txPiece, dx, 0)) {
    txPiece.x += dx;
    txDraw();
  }
}

function _txSoftDrop() {
  if (!_txCollides(txPiece, 0, 1)) {
    txPiece.y++;
    txScore += currentLevel + 1;
    _txUpdateUI();
    txDraw();
  }
}

function _txHardDrop() {
  let dy = 0;
  while (!_txCollides(txPiece, 0, dy + 1)) dy++;
  txScore += dy * 2 * (currentLevel + 1);
  txPiece.y += dy;
  _txLock();
  _txUpdateUI();
  txDraw();
}

function _txTryRotate() {
  const rot = _txRotate(txPiece.m);
  // wall kick : essayer décalages 0, -1, +1, -2, +2
  for (const dx of [0, -1, 1, -2, 2]) {
    if (!_txCollides({ ...txPiece, m: rot }, dx, 0)) {
      txPiece.m = rot;
      txPiece.x += dx;
      txDraw();
      return;
    }
  }
}
