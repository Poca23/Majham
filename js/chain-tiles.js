/* ══════════════════════════════════════════
   CHAIN TILES — js/chain-tiles.js
   Relier des paires identiques avec max 2 angles
══════════════════════════════════════════ */

const CT_DEFS = [
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
  "⑦",
  "⑧",
  "⑨",
  "🔴",
  "🔵",
  "🟢",
  "🟡",
  "🟣",
  "🟠",
  "⭐",
  "🔶",
  "💎",
  "🌸",
  "🎯",
];

let ctGrid = [],
  ctSel = null,
  ctScore = 0,
  CT_R = 4,
  CT_C = 4;
let ctCellSize = 60;

/* ── Init ── */
function initChain() {
  const { rows, cols, pairs } = LEVELS[currentLevel].ct;
  CT_R = rows;
  CT_C = cols;
  ctSel = null;
  ctScore = 0;
  $("ct-score").textContent = "0 pts";

  // Construire le deck : paires d'emojis
  const deck = [];
  for (let i = 0; i < pairs; i++) {
    const e = CT_DEFS[i % CT_DEFS.length];
    deck.push(e, e);
  }
  // Compléter avec des cellules vides si nécessaire
  while (deck.length < rows * cols) deck.push(null);
  shuffle(deck);

  ctGrid = [];
  let di = 0;
  for (let r = 0; r < rows; r++) {
    ctGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      const e = deck[di++];
      ctGrid[r][c] = { emoji: e, matched: e === null, r, c };
    }
  }
  renderChain();
}

/* ── Rendu ── */
function renderChain() {
  const area = $("ct-board").parentElement; // .game-area
  const maxW = area.clientWidth - 24;
  const maxH = area.clientHeight - 24;

  const sz = Math.max(
    40,
    Math.min(
      Math.floor((maxW - (CT_C - 1) * 6) / CT_C),
      Math.floor((maxH - (CT_R - 1) * 6) / CT_R),
      72,
    ),
  );
  ctCellSize = sz;
  const fs = Math.floor(sz * 0.48);

  const board = $("ct-board");
  board.style.gridTemplateColumns = `repeat(${CT_C}, ${sz}px)`;
  board.style.gap = "6px";
  board.innerHTML = "";

  for (let r = 0; r < CT_R; r++) {
    for (let c = 0; c < CT_C; c++) {
      const t = ctGrid[r][c];
      const el = document.createElement("div");

      if (t.matched) {
        // Cellule vide : placeholder invisible mais garde l'espace
        el.className = "ct-tile empty";
        el.style.cssText = `width:${sz}px;height:${sz}px`;
      } else {
        const isSel = ctSel && ctSel.r === r && ctSel.c === c;
        el.className = "ct-tile" + (isSel ? " selected" : "");
        el.style.cssText = `width:${sz}px;height:${sz}px;font-size:${fs}px`;
        el.textContent = t.emoji;
        el.addEventListener("click", () => ctClick(r, c));
      }
      board.appendChild(el);
    }
  }
}

/* ── Vérifie si (r,c) est libre (matched ou les deux extrémités) ── */
function ctIsFree(r, c, r1, c1, r2, c2) {
  if (r < 0 || r >= CT_R || c < 0 || c >= CT_C) return false;
  const t = ctGrid[r][c];
  return t.matched || (r === r1 && c === c1) || (r === r2 && c === c2);
}

/* ── Cherche un chemin (max 2 angles) et le retourne si trouvé ── */
function ctFindPath(r1, c1, r2, c2) {
  const free = (r, c) => ctIsFree(r, c, r1, c1, r2, c2);

  const hOk = (r, ca, cb) => {
    const [lo, hi] = ca < cb ? [ca, cb] : [cb, ca];
    for (let c = lo; c <= hi; c++) if (!free(r, c)) return false;
    return true;
  };
  const vOk = (c, ra, rb) => {
    const [lo, hi] = ra < rb ? [ra, rb] : [rb, ra];
    for (let r = lo; r <= hi; r++) if (!free(r, c)) return false;
    return true;
  };

  // 0 virage
  if (r1 === r2 && hOk(r1, c1, c2))
    return [
      [r1, c1],
      [r1, c2],
    ];
  if (c1 === c2 && vOk(c1, r1, r2))
    return [
      [r1, c1],
      [r2, c1],
    ];

  // 1 virage
  if (free(r1, c2) && hOk(r1, c1, c2) && vOk(c2, r1, r2))
    return [
      [r1, c1],
      [r1, c2],
      [r2, c2],
    ];
  if (free(r2, c1) && vOk(c1, r1, r2) && hOk(r2, c1, c2))
    return [
      [r1, c1],
      [r2, c1],
      [r2, c2],
    ];

  // 2 virages via ligne intermédiaire
  for (let r = 0; r < CT_R; r++) {
    if (
      free(r, c1) &&
      free(r, c2) &&
      vOk(c1, r1, r) &&
      hOk(r, c1, c2) &&
      vOk(c2, r, r2)
    )
      return [
        [r1, c1],
        [r, c1],
        [r, c2],
        [r2, c2],
      ];
  }
  for (let c = 0; c < CT_C; c++) {
    if (
      free(r1, c) &&
      free(r2, c) &&
      hOk(r1, c1, c) &&
      vOk(c, r1, r2) &&
      hOk(r2, c, c2)
    )
      return [
        [r1, c1],
        [r1, c],
        [r2, c],
        [r2, c2],
      ];
  }
  return null;
}

/* ── Dessine le chemin SVG puis le fait disparaître ── */
function ctShowPath(points) {
  // Supprimer ancien SVG
  const old = $("ct-path-svg");
  if (old) old.remove();

  const board = $("ct-board");
  const gap = 6;
  const half = ctCellSize / 2;

  // Convertir grille → pixels (centre de chaque cellule)
  const pts = points.map(([r, c]) => ({
    x: c * (ctCellSize + gap) + half,
    y: r * (ctCellSize + gap) + half,
  }));

  const d = pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "ct-path-svg";
  svg.setAttribute("width", board.offsetWidth);
  svg.setAttribute("height", board.offsetHeight);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.style.cssText = `
    fill:none;
    stroke:var(--gold);
    stroke-width:3.5;
    stroke-linecap:round;
    stroke-linejoin:round;
    stroke-dasharray:600;
    stroke-dashoffset:600;
    animation:ctDash 0.3s ease forwards;
    opacity:0.9;
  `;
  svg.appendChild(path);

  // Le board doit être en position relative
  board.style.position = "relative";
  board.appendChild(svg);

  // Retirer après animation
  setTimeout(() => svg.remove(), 600);
}

/* ── Clic sur une tuile ── */
function ctClick(r, c) {
  const t = ctGrid[r][c];
  if (t.matched) return;

  // Désélectionner
  if (ctSel && ctSel.r === r && ctSel.c === c) {
    ctSel = null;
    renderChain();
    return;
  }

  // Première sélection
  if (!ctSel) {
    ctSel = { r, c };
    renderChain();
    return;
  }

  // Deuxième sélection : même emoji ?
  const a = ctGrid[ctSel.r][ctSel.c];
  const b = t;

  if (a.emoji !== b.emoji) {
    // Changer la sélection
    ctSel = { r, c };
    renderChain();
    return;
  }

  // Chercher chemin
  const path = ctFindPath(ctSel.r, ctSel.c, r, c);
  if (!path) {
    showToast("🚫 Pas de chemin libre !");
    ctSel = { r, c };
    renderChain();
    return;
  }

  // Match !
  ctShowPath(path);

  // Marquer comme matched avec délai (laisser l'animation de chemin jouer)
  setTimeout(() => {
    a.matched = true;
    b.matched = true;
    ctScore += 150 * (currentLevel + 1);
    $("ct-score").textContent = ctScore + " pts";
    ctSel = null;
    renderChain();

    if (ctGrid.flat().every((t) => t.matched)) {
      setTimeout(
        () => showWin("🃏", "Chaîne complète !", ctScore + " pts", initChain),
        400,
      );
    } else {
      ctCheckDeadlock();
    }
  }, 320);
}

/* ── Détection deadlock ── */
function ctCheckDeadlock() {
  const active = ctGrid.flat().filter((t) => !t.matched);
  for (let i = 0; i < active.length; i++)
    for (let j = i + 1; j < active.length; j++)
      if (
        active[i].emoji === active[j].emoji &&
        ctFindPath(active[i].r, active[i].c, active[j].r, active[j].c)
      )
        return;
  if (active.length) showToast("🔒 Aucun chemin disponible !");
}
