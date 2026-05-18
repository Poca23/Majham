const CT_DEFS = [
  "🀇",
  "🀈",
  "🀉",
  "🀊",
  "🀋",
  "🀌",
  "🀍",
  "🀎",
  "🀏",
  "🀙",
  "🀚",
  "🀛",
  "🀜",
  "🀝",
  "🀞",
  "🀟",
  "🀠",
  "🀀",
  "🀁",
  "🀂",
];
let ctGrid = [],
  ctSel = null,
  ctScore = 0,
  CT_R = 4,
  CT_C = 4;

function initChain() {
  const { rows, cols, pairs } = LEVELS[currentLevel].ct;
  CT_R = rows;
  CT_C = cols;
  ctSel = null;
  ctScore = 0;
  $("ct-score").textContent = "0 pts";

  const deck = [];
  for (let i = 0; i < pairs; i++) {
    const e = CT_DEFS[i % CT_DEFS.length];
    deck.push({ emoji: e }, { emoji: e });
  }
  // pad empty cells
  while (deck.length < rows * cols) deck.push({ emoji: "", matched: true });
  shuffle(deck);

  ctGrid = [];
  let di = 0;
  for (let r = 0; r < rows; r++) {
    ctGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      const d = deck[di++];
      ctGrid[r][c] = { emoji: d.emoji, matched: !d.emoji, r, c };
    }
  }
  renderChain();
}

function renderChain() {
  const board = $("ct-board");
  const maxW = Math.min(window.innerWidth - 32, 520);
  const maxH = window.innerHeight - 120;
  const sz = Math.min(
    Math.floor((maxW - (CT_C - 1) * 4) / CT_C),
    Math.floor((maxH - (CT_R - 1) * 4) / CT_R),
    68,
  );
  const fs = Math.floor(sz * 0.5);

  board.style.gridTemplateColumns = `repeat(${CT_C}, ${sz}px)`;
  board.innerHTML = "";

  for (let r = 0; r < CT_R; r++) {
    for (let c = 0; c < CT_C; c++) {
      const t = ctGrid[r][c];
      const el = document.createElement("div");
      el.className =
        "ct-tile" +
        (t.matched ? " matched" : "") +
        (ctSel && ctSel.r === r && ctSel.c === c ? " selected" : "");
      el.style.cssText = `width:${sz}px;height:${sz}px;font-size:${fs}px;${t.matched ? "opacity:0;pointer-events:none" : ""}`;
      el.textContent = t.emoji;
      if (!t.matched) el.onclick = () => ctClick(r, c);
      board.appendChild(el);
    }
  }
}

function ctCanConnect(r1, c1, r2, c2) {
  // Try direct + 1-bend + 2-bend paths on empty cells
  const free = (r, c) =>
    r >= 0 &&
    r < CT_R &&
    c >= 0 &&
    c < CT_C &&
    (ctGrid[r][c].matched || (r === r1 && c === c1) || (r === r2 && c === c2));

  const hLine = (r, c_a, c_b) => {
    const [lo, hi] = c_a < c_b ? [c_a, c_b] : [c_b, c_a];
    for (let c = lo; c <= hi; c++) if (!free(r, c)) return false;
    return true;
  };
  const vLine = (c, r_a, r_b) => {
    const [lo, hi] = r_a < r_b ? [r_a, r_b] : [r_b, r_a];
    for (let r = lo; r <= hi; r++) if (!free(r, c)) return false;
    return true;
  };

  // 0 bends
  if (r1 === r2 && hLine(r1, c1, c2)) return true;
  if (c1 === c2 && vLine(c1, r1, r2)) return true;

  // 1 bend: corner (r1,c2) or (r2,c1)
  if (free(r1, c2) && vLine(c2, r1, r2) && hLine(r1, c1, c2)) return true;
  if (free(r2, c1) && hLine(r2, c1, c2) && vLine(c1, r1, r2)) return true;

  // 2 bends: scan all rows/cols as intermediate
  for (let r = 0; r < CT_R; r++) {
    if (
      free(r, c1) &&
      free(r, c2) &&
      vLine(c1, r1, r) &&
      hLine(r, c1, c2) &&
      vLine(c2, r, r2)
    )
      return true;
  }
  for (let c = 0; c < CT_C; c++) {
    if (
      free(r1, c) &&
      free(r2, c) &&
      hLine(r1, c1, c) &&
      vLine(c, r1, r2) &&
      hLine(r2, c, c2)
    )
      return true;
  }
  return false;
}

function ctClick(r, c) {
  if (!ctSel) {
    ctSel = { r, c };
    renderChain();
    return;
  }
  if (ctSel.r === r && ctSel.c === c) {
    ctSel = null;
    renderChain();
    return;
  }

  const a = ctGrid[ctSel.r][ctSel.c],
    b = ctGrid[r][c];
  if (a.emoji === b.emoji && ctCanConnect(ctSel.r, ctSel.c, r, c)) {
    a.matched = b.matched = true;
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
  } else {
    ctSel = { r, c };
    renderChain();
  }
}

function ctCheckDeadlock() {
  const u = ctGrid.flat().filter((t) => !t.matched);
  for (let i = 0; i < u.length; i++)
    for (let j = i + 1; j < u.length; j++)
      if (
        u[i].emoji === u[j].emoji &&
        ctCanConnect(u[i].r, u[i].c, u[j].r, u[j].c)
      )
        return;
  if (u.length) showToast("🔒 Aucun chemin disponible !");
}
