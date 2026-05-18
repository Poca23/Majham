const BS_COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#e67e22",
  "#1abc9c",
];
const BS_R = 18; // rayon bulle

let bsCanvas, bsCtx, bsGrid, bsBubble, bsNext, bsAngle;
let bsScore = 0,
  bsAnimId = null,
  bsShot = null;
let bsCols, bsRows, bsColors, bsCellW, bsCellH, bsOffsetX;

/* ── INIT ── */
function initBubble() {
  bsCanvas = $("bs-canvas");
  bsCtx = bsCanvas.getContext("2d");

  const area = bsCanvas.parentElement;
  const W = area.clientWidth - 8;
  const H = area.clientHeight - 8;
  bsCanvas.width = W;
  bsCanvas.height = H;

  const cfg = LEVELS[currentLevel].bs;
  bsRows = cfg.rows;
  bsColors = cfg.colors;
  bsCols = Math.floor(W / (BS_R * 2 + 2));
  bsCellW = W / bsCols;
  bsCellH = BS_R * 1.9;
  bsOffsetX = bsCellW / 2;

  bsScore = 0;
  $("bs-score").textContent = "0 pts";
  bsShot = null;

  bsGrid = [];
  for (let r = 0; r < bsRows; r++) {
    bsGrid[r] = [];
    const cols = r % 2 === 0 ? bsCols : bsCols - 1;
    for (let c = 0; c < cols; c++) {
      bsGrid[r][c] = BS_COLORS[Math.floor(Math.random() * bsColors)];
    }
  }

  bsBubble = bsRandColor();
  bsNext = bsRandColor();
  bsAngle = -Math.PI / 2;

  bsCanvas.onmousemove = bsCanvas.ontouchmove = bsAim;
  bsCanvas.onclick = bsCanvas.ontouchend = bsShoot;

  cancelAnimationFrame(bsAnimId);
  bsDraw();
}

function bsRandColor() {
  return BS_COLORS[Math.floor(Math.random() * bsColors)];
}

/* ── COORDONNÉES ── */
function bsBubblePos(r, c) {
  const offset = r % 2 === 0 ? 0 : bsCellW / 2;
  return {
    x: bsOffsetX + c * bsCellW + offset,
    y: BS_R + r * bsCellH,
  };
}

function bsShooterPos() {
  return { x: bsCanvas.width / 2, y: bsCanvas.height - BS_R - 10 };
}

/* ── VISER ── */
function bsAim(e) {
  e.preventDefault();
  if (bsShot) return;
  const rect = bsCanvas.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  const sp = bsShooterPos();
  bsAngle = Math.atan2(cy - sp.y, cx - sp.x);
  // limiter pour ne pas tirer vers le bas
  if (bsAngle > -0.2) bsAngle = -0.2;
  if (bsAngle < -Math.PI + 0.2) bsAngle = -Math.PI + 0.2;
  bsDraw();
}

/* ── TIRER ── */
function bsShoot(e) {
  e.preventDefault();
  if (bsShot) return;
  const sp = bsShooterPos();
  bsShot = {
    x: sp.x,
    y: sp.y,
    vx: Math.cos(bsAngle) * 10,
    vy: Math.sin(bsAngle) * 10,
    color: bsBubble,
  };
  bsBubble = bsNext;
  bsNext = bsRandColor();
  bsAnimate();
}

/* ── ANIMATION ── */
function bsAnimate() {
  if (!bsShot) return;
  bsShot.x += bsShot.vx;
  bsShot.y += bsShot.vy;

  // rebond gauche/droite
  if (bsShot.x - BS_R < 0) {
    bsShot.x = BS_R;
    bsShot.vx *= -1;
  }
  if (bsShot.x + BS_R > bsCanvas.width) {
    bsShot.x = bsCanvas.width - BS_R;
    bsShot.vx *= -1;
  }

  // rebond plafond
  if (bsShot.y - BS_R < 0) {
    bsSnap(0, 0);
    return;
  }

  // collision avec une bulle
  for (let r = 0; r < bsGrid.length; r++) {
    for (let c = 0; c < bsGrid[r].length; c++) {
      if (!bsGrid[r][c]) continue;
      const p = bsBubblePos(r, c);
      const dx = bsShot.x - p.x,
        dy = bsShot.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < BS_R * 1.9) {
        bsSnap(r, c);
        return;
      }
    }
  }

  bsDraw();
  bsAnimId = requestAnimationFrame(bsAnimate);
}

/* ── SNAP : coller la bulle à la grille ── */
function bsSnap(hitR, hitC) {
  // trouver la cellule vide la plus proche du point d'impact
  let best = null,
    bestD = Infinity;
  for (let r = 0; r <= Math.min(hitR + 1, bsGrid.length); r++) {
    const cols = r % 2 === 0 ? bsCols : bsCols - 1;
    for (let c = 0; c < cols; c++) {
      if (bsGrid[r] && bsGrid[r][c]) continue;
      const p = bsBubblePos(r, c);
      const dx = bsShot.x - p.x,
        dy = bsShot.y - p.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = { r, c };
      }
    }
  }

  if (!best) {
    // nouvelle ligne en haut
    best = { r: 0, c: 0 };
  }

  if (!bsGrid[best.r]) bsGrid[best.r] = [];
  bsGrid[best.r][best.c] = bsShot.color;
  bsShot = null;

  // pop les groupes
  const popped = bsFindGroup(best.r, best.c);
  if (popped.length >= 3) {
    popped.forEach(({ r, c }) => (bsGrid[r][c] = null));
    bsScore += popped.length * 100 * (currentLevel + 1);
    $("bs-score").textContent = bsScore + " pts";
    showToast(`+${popped.length * 100 * (currentLevel + 1)} pts !`);
    bsDropFloating();
  }

  bsDraw();

  // défaite : bulles trop basses
  const maxRow = bsGrid.length - 1;
  const shooterY = bsCanvas.height - BS_R * 3;
  for (let c = 0; c < (bsGrid[maxRow] || []).length; c++) {
    if (bsGrid[maxRow][c]) {
      const p = bsBubblePos(maxRow, c);
      if (p.y + BS_R >= shooterY) {
        setTimeout(
          () => showWin("💀", "Perdu !", bsScore + " pts", initBubble),
          400,
        );
        return;
      }
    }
  }

  // victoire : grille vide
  if (bsGrid.every((row) => row.every((c) => !c))) {
    setTimeout(
      () => showWin("🫧", "Vidé !", bsScore + " pts", initBubble),
      400,
    );
  }
}

/* ── BFS : trouver groupe de même couleur ── */
function bsFindGroup(r0, c0) {
  const color = bsGrid[r0][c0];
  const visited = new Set();
  const queue = [{ r: r0, c: c0 }];
  visited.add(`${r0},${c0}`);
  while (queue.length) {
    const { r, c } = queue.shift();
    bsNeighbors(r, c).forEach(({ r: nr, c: nc }) => {
      const key = `${nr},${nc}`;
      if (!visited.has(key) && bsGrid[nr] && bsGrid[nr][nc] === color) {
        visited.add(key);
        queue.push({ r: nr, c: nc });
      }
    });
  }
  return [...visited].map((k) => {
    const [r, c] = k.split(",").map(Number);
    return { r, c };
  });
}

/* ── Supprimer bulles flottantes (non connectées au plafond) ── */
function bsDropFloating() {
  const connected = new Set();
  const queue = [];
  // Toute bulle de la ligne 0 est ancrée
  (bsGrid[0] || []).forEach((c, ci) => {
    if (c) {
      queue.push({ r: 0, c: ci });
      connected.add(`0,${ci}`);
    }
  });
  while (queue.length) {
    const { r, c } = queue.shift();
    bsNeighbors(r, c).forEach(({ r: nr, c: nc }) => {
      const key = `${nr},${nc}`;
      if (!connected.has(key) && bsGrid[nr] && bsGrid[nr][nc]) {
        connected.add(key);
        queue.push({ r: nr, c: nc });
      }
    });
  }
  bsGrid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell && !connected.has(`${r},${c}`)) {
        bsGrid[r][c] = null;
        bsScore += 50 * (currentLevel + 1);
      }
    }),
  );
  $("bs-score").textContent = bsScore + " pts";
}

/* ── VOISINS hexagonaux ── */
function bsNeighbors(r, c) {
  const even = r % 2 === 0;
  const dirs = even
    ? [
        [-1, -1],
        [-1, 0],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
      ]
    : [
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, 0],
        [1, 1],
      ];
  return dirs
    .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
    .filter(
      ({ r, c }) =>
        r >= 0 &&
        r < bsGrid.length &&
        c >= 0 &&
        bsGrid[r] &&
        c < bsGrid[r].length,
    );
}

/* ── DRAW ── */
function bsDraw() {
  const ctx = bsCtx;
  const W = bsCanvas.width,
    H = bsCanvas.height;
  ctx.clearRect(0, 0, W, H);

  // grille
  bsGrid.forEach((row, r) => {
    row.forEach((color, c) => {
      if (color)
        bsDrawBubble(bsBubblePos(r, c).x, bsBubblePos(r, c).y, BS_R, color);
    });
  });

  // ligne de visée
  if (!bsShot) {
    const sp = bsShooterPos();
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(sp.x + Math.cos(bsAngle) * 120, sp.y + Math.sin(bsAngle) * 120);
    ctx.stroke();
    ctx.restore();
  }

  // bulle en cours de vol
  if (bsShot) bsDrawBubble(bsShot.x, bsShot.y, BS_R, bsShot.color);

  // lanceur
  const sp = bsShooterPos();
  bsDrawBubble(sp.x, sp.y, BS_R, bsBubble);

  // prochaine bulle
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "bold 11px Segoe UI";
  ctx.textAlign = "left";
  ctx.fillText("Next:", sp.x + BS_R + 10, sp.y + 4);
  bsDrawBubble(sp.x + BS_R + 46, sp.y, BS_R * 0.7, bsNext);
}

function bsDrawBubble(x, y, r, color) {
  const ctx = bsCtx;
  const grad = ctx.createRadialGradient(
    x - r * 0.3,
    y - r * 0.3,
    r * 0.1,
    x,
    y,
    r,
  );
  grad.addColorStop(0, lighten(color));
  grad.addColorStop(1, color);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function lighten(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + 80);
  const g = Math.min(255, ((n >> 8) & 0xff) + 80);
  const b = Math.min(255, (n & 0xff) + 80);
  return `rgb(${r},${g},${b})`;
}
