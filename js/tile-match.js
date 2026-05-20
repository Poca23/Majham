/* ══════════════════════════════════════════
   TILE MATCH — Mahjong pyramide solvable
   
   Principe de solvabilité :
   - On construit la liste des positions (pyramide)
   - On remplit en garantissant que chaque paire
     est placée sur des positions qui seront libres
     au moment où on les jouera (simulation inverse)
══════════════════════════════════════════ */

const TILE_DEFS = [
  ["🀇", "#e74c3c"],
  ["🀈", "#e67e22"],
  ["🀉", "#f1c40f"],
  ["🀊", "#2ecc71"],
  ["🀋", "#1abc9c"],
  ["🀌", "#3498db"],
  ["🀍", "#9b59b6"],
  ["🀎", "#e91e63"],
  ["🀏", "#ff5722"],
  ["🀙", "#c0392b"],
  ["🀚", "#d35400"],
  ["🀛", "#f39c12"],
  ["🀜", "#27ae60"],
  ["🀝", "#16a085"],
  ["🀞", "#2980b9"],
  ["🀟", "#8e44ad"],
  ["🀠", "#c0392b"],
  ["🀀", "#607d8b"],
  ["🀁", "#78909c"],
  ["🀂", "#90a4ae"],
  ["🀃", "#b0bec5"],
];

let tmTiles = [],
  tmSel = null,
  tmScore = 0;

/* ── Positions de la pyramide ──
   Couche 0 = base large, couche N = sommet petit
   Tuiles se chevauchent à moitié : step = 1 col/row
   mais une tuile de couche L couvre les positions
   (row±1, col±1) de la couche L-1
── */
function tmPositions(layers) {
  const BASE_COLS = 8,
    BASE_ROWS = 6;
  const all = [];
  for (let l = 0; l < layers; l++) {
    const cols = BASE_COLS - l * 2;
    const rows = BASE_ROWS - l * 2;
    if (cols <= 0 || rows <= 0) break;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        all.push({ layer: l, row: l + r, col: l + c });
  }
  return all;
}

/* ── Vérifie si une position est libre dans un ensemble de tuiles ── */
function tmCheckFree(tile, tiles) {
  // Rien au-dessus
  const above = tiles.some(
    (t) =>
      t !== tile &&
      !t.matched &&
      t.layer === tile.layer + 1 &&
      Math.abs(t.row - tile.row) <= 1 &&
      Math.abs(t.col - tile.col) <= 1,
  );
  if (above) return false;
  // Libre à gauche ou droite
  const leftBlocked = tiles.some(
    (t) =>
      t !== tile &&
      !t.matched &&
      t.layer === tile.layer &&
      t.row === tile.row &&
      t.col === tile.col - 1,
  );
  const rightBlocked = tiles.some(
    (t) =>
      t !== tile &&
      !t.matched &&
      t.layer === tile.layer &&
      t.row === tile.row &&
      t.col === tile.col + 1,
  );
  return !leftBlocked || !rightBlocked;
}

/* ── Construction garantie solvable ──
   Algorithme :
   1. Créer toutes les positions
   2. Trouver toutes les positions libres
   3. Choisir 2 positions libres au hasard → assigner une paire
   4. Marquer ces 2 comme "matchées" (retirées)
   5. Répéter jusqu'à épuisement
   Résultat : en jouant dans l'ordre inverse, le plateau est toujours solvable
── */
function tmBuildSolvable(layers) {
  const positions = tmPositions(layers);

  // Si nombre impair, retirer la dernière position
  const count =
    positions.length % 2 === 0 ? positions.length : positions.length - 1;
  const pos = positions.slice(0, count);

  // Créer tuiles temporaires toutes non-matchées
  let tiles = pos.map((p, i) => ({
    ...p,
    id: i,
    matched: false,
    emoji: "",
    color: "",
  }));

  // Ordre de jeu simulé (pour garantir la solvabilité)
  const order = []; // liste de paires d'indices
  const remaining = [...tiles];

  let attempts = 0;
  while (remaining.filter((t) => !t.matched).length >= 2) {
    const free = remaining.filter(
      (t) => !t.matched && tmCheckFree(t, remaining),
    );
    if (free.length < 2) {
      // Impasse : recommencer
      if (++attempts > 50) break;
      remaining.forEach((t) => (t.matched = false));
      order.length = 0;
      continue;
    }
    // Choisir 2 parmi les libres
    shuffle(free);
    const a = free[0],
      b = free[1];
    order.push([a.id, b.id]);
    a.matched = true;
    b.matched = true;
  }

  // Assigner les emojis dans l'ordre inverse (les premières paires jouées = sommet)
  const emojiDeck = [];
  const pairCount = order.length;
  for (let i = 0; i < pairCount; i++) {
    const def = TILE_DEFS[i % TILE_DEFS.length];
    emojiDeck.push([...def], [...def]);
  }
  shuffle(emojiDeck);

  // Remettre toutes les tuiles à non-matchées et assigner les emojis
  tiles.forEach((t) => (t.matched = false));
  order.forEach(([idA, idB], i) => {
    const def = TILE_DEFS[i % TILE_DEFS.length];
    tiles[idA].emoji = def[0];
    tiles[idA].color = def[1];
    tiles[idB].emoji = def[0];
    tiles[idB].color = def[1];
  });

  // Garder seulement les tuiles avec emoji assigné
  tmTiles = tiles.filter((t) => t.emoji !== "");
}

/* ── Init ── */
function initTileMatch() {
  const { layers } = LEVELS[currentLevel].tm;
  tmSel = null;
  tmScore = 0;
  $("tm-score").textContent = "0 pts";
  tmBuildSolvable(layers);
  renderTileMatch();
}

/* ── isFree (pour le jeu réel) ── */
function tmIsFree(tile) {
  return tmCheckFree(tile, tmTiles);
}

/* ── Rendu ── */
function renderTileMatch() {
  const board = $("tm-board");
  board.innerHTML = "";

  const area = board.parentElement;
  const maxW = area.clientWidth - 8;
  const maxH = area.clientHeight - 8;

  const BASE_COLS = 8,
    BASE_ROWS = 6;
  const layers = LEVELS[currentLevel].tm.layers;
  const OFFSET = 5; // décalage visuel par couche (px)

  const sz = Math.min(
    Math.floor((maxW - layers * OFFSET) / BASE_COLS),
    Math.floor((maxH - layers * OFFSET) / BASE_ROWS),
    60,
  );
  const gap = 2;
  const fs = Math.floor(sz * 0.48);

  const boardW = BASE_COLS * (sz + gap) + (layers - 1) * OFFSET;
  const boardH = BASE_ROWS * (sz + gap) + (layers - 1) * OFFSET;
  board.style.width = boardW + "px";
  board.style.height = boardH + "px";

  // Trier par layer pour z-index correct (couches hautes par-dessus)
  [...tmTiles]
    .filter((t) => !t.matched)
    .sort((a, b) => a.layer - b.layer)
    .forEach((tile) => {
      const free = tmIsFree(tile);
      const isSel = tmSel && tmSel.id === tile.id;

      // Décalage visuel : couche haute = décalé vers haut-droite
      const x = tile.col * (sz + gap) + tile.layer * OFFSET;
      const y = tile.row * (sz + gap) - tile.layer * OFFSET;

      const el = document.createElement("div");
      el.className =
        "tm-tile" +
        (free ? " tm-free" : " tm-blocked") +
        (isSel ? " tm-selected" : "");
      el.style.cssText = `
        left:${x}px;top:${y}px;
        width:${sz}px;height:${sz}px;
        font-size:${fs}px;
        z-index:${tile.layer * 10 + (isSel ? 100 : 1)};
        --tile-color:${tile.color};
      `;
      el.textContent = tile.emoji;
      if (free) el.onclick = () => tmClick(tile.id);
      board.appendChild(el);
    });
}

/* ── Clic ── */
function tmClick(id) {
  const tile = tmTiles.find((t) => t.id === id);
  if (!tile || !tmIsFree(tile)) return;

  if (!tmSel) {
    tmSel = tile;
    renderTileMatch();
    return;
  }
  if (tmSel.id === id) {
    tmSel = null;
    renderTileMatch();
    return;
  }

  if (tmSel.emoji === tile.emoji) {
    tmSel.matched = tile.matched = true;
    tmScore += 100 * (currentLevel + 1);
    $("tm-score").textContent = tmScore + " pts";
    tmSel = null;
    renderTileMatch();
    if (tmTiles.every((t) => t.matched))
      setTimeout(
        () => showWin("🀄", "Bravo !", tmScore + " pts", initTileMatch),
        400,
      );
  } else {
    tmSel = tile;
    renderTileMatch();
  }
}
