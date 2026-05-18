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
  ["🀙", "#e74c3c"],
  ["🀚", "#e67e22"],
  ["🀛", "#f1c40f"],
  ["🀜", "#2ecc71"],
  ["🀝", "#1abc9c"],
  ["🀞", "#3498db"],
  ["🀟", "#9b59b6"],
  ["🀠", "#e91e63"],
  ["🀀", "#607d8b"],
  ["🀁", "#78909c"],
  ["🀂", "#90a4ae"],
  ["🀃", "#b0bec5"],
];

let tmGrid = [],
  tmSel = null,
  tmScore = 0,
  TM_R = 4,
  TM_C = 6;

function initTileMatch() {
  const { cols, rows } = LEVELS[currentLevel].tm;
  TM_R = rows;
  TM_C = cols;
  tmSel = null;
  tmScore = 0;
  $("tm-score").textContent = "0 pts";

  const pairCount = Math.floor((rows * cols) / 2);
  const deck = [];
  for (let i = 0; i < pairCount; i++) {
    const def = TILE_DEFS[i % TILE_DEFS.length];
    deck.push([...def], [...def]);
  }
  shuffle(deck);

  tmGrid = [];
  let di = 0;
  for (let r = 0; r < rows; r++) {
    tmGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      if (di < deck.length) {
        const [emoji, color] = deck[di++];
        tmGrid[r][c] = { emoji, color, matched: false, r, c };
      } else {
        tmGrid[r][c] = { emoji: "", color: "", matched: true, r, c };
      }
    }
  }
  renderTileMatch();
}

function tmIsFree(r, c) {
  if (tmGrid[r][c].matched) return false;
  const bl = c > 0 && !tmGrid[r][c - 1].matched;
  const br = c < TM_C - 1 && !tmGrid[r][c + 1].matched;
  return !(bl && br);
}

function renderTileMatch() {
  const board = $("tm-board");
  const maxW = Math.min(window.innerWidth - 32, 520);
  const maxH = window.innerHeight - 120;
  const sz = Math.min(
    Math.floor((maxW - (TM_C - 1) * 4) / TM_C),
    Math.floor((maxH - (TM_R - 1) * 4) / TM_R),
    72,
  );
  const fs = Math.floor(sz * 0.52);

  board.style.gridTemplateColumns = `repeat(${TM_C}, ${sz}px)`;
  board.innerHTML = "";

  for (let r = 0; r < TM_R; r++) {
    for (let c = 0; c < TM_C; c++) {
      const t = tmGrid[r][c];
      const el = document.createElement("div");
      el.className =
        "tm-tile" +
        (t.matched ? " matched" : "") +
        (!t.matched && !tmIsFree(r, c) ? " blocked" : "") +
        (tmSel && tmSel.r === r && tmSel.c === c ? " selected" : "");
      el.style.cssText = `width:${sz}px;height:${sz}px;font-size:${fs}px;${t.matched ? "opacity:0;pointer-events:none" : ""}`;
      el.textContent = t.emoji;
      if (!t.matched) el.onclick = () => tmClick(r, c);
      board.appendChild(el);
    }
  }
}

function tmClick(r, c) {
  if (!tmIsFree(r, c)) return;
  if (!tmSel) {
    tmSel = { r, c };
    renderTileMatch();
    return;
  }
  if (tmSel.r === r && tmSel.c === c) {
    tmSel = null;
    renderTileMatch();
    return;
  }

  const a = tmGrid[tmSel.r][tmSel.c],
    b = tmGrid[r][c];
  if (a.emoji === b.emoji) {
    a.matched = b.matched = true;
    tmScore += 100 * (currentLevel + 1);
    $("tm-score").textContent = tmScore + " pts";
    tmSel = null;
    renderTileMatch();
    if (tmGrid.flat().every((t) => t.matched)) {
      setTimeout(
        () => showWin("🀄", "Bravo !", tmScore + " pts", initTileMatch),
        400,
      );
    }
  } else {
    tmSel = { r, c };
    renderTileMatch();
  }
}
