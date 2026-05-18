const BALL_COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#e67e22",
  "#1abc9c",
  "#e91e63",
];
let scCols = [],
  scSel = null,
  scScore = 0,
  SC_MAX_H = 8;

function initStack() {
  const { cols, colors: nc, stackH } = LEVELS[currentLevel].sc;
  SC_MAX_H = stackH;
  scSel = null;
  scScore = 0;
  $("sc-score").textContent = "0 pts";

  const deck = [];
  BALL_COLORS.slice(0, nc).forEach((c) => deck.push(c, c, c));
  shuffle(deck);

  scCols = Array.from({ length: cols }, () => []);
  deck.forEach((c, i) => scCols[i % cols].push(c));
  renderStack();
}

function renderStack() {
  const container = $("sc-columns");
  container.innerHTML = "";
  const cols = scCols.length;
  const maxW = Math.min(window.innerWidth - 32, 480);
  const maxH = window.innerHeight - 140;
  const perRow = cols <= 5 ? cols : Math.ceil(cols / 2);
  const szByW = Math.floor((maxW - (perRow - 1) * 8) / perRow);
  const szByH = Math.floor((maxH - 8) / (SC_MAX_H + 1));
  const sz = Math.min(46, szByW, szByH);

  scCols.forEach((col, ci) => {
    const el = document.createElement("div");
    el.className = "sc-column" + (ci === scSel ? " selected-col" : "");
    el.onclick = () => scClick(ci);

    col.forEach((color, ti) => {
      const isSel = ci === scSel && ti === col.length - 1;
      const b = document.createElement("div");
      b.className = "sc-ball" + (isSel ? " sel" : "");
      b.style.cssText = `width:${sz}px;height:${sz}px;background:${color}`;
      el.appendChild(b);
    });

    if (!col.length) {
      const ph = document.createElement("div");
      ph.className = "sc-empty-ph";
      ph.style.cssText = `width:${sz}px;height:${sz}px`;
      el.appendChild(ph);
    }
    container.appendChild(el);
  });
}

function scClick(ci) {
  if (scSel === null) {
    if (!scCols[ci].length) return;
    scSel = ci;
    renderStack();
    return;
  }
  if (scSel === ci) {
    scSel = null;
    renderStack();
    return;
  }

  const from = scCols[scSel],
    to = scCols[ci];
  if (to.length >= SC_MAX_H) {
    showToast("Colonne pleine !");
    scSel = null;
    renderStack();
    return;
  }

  const ball = from.pop();
  to.push(ball);
  scScore += 50 * (currentLevel + 1);
  $("sc-score").textContent = scScore + " pts";

  // check triplet on top
  if (to.length >= 3 && to.slice(-3).every((c) => c === to[to.length - 1])) {
    to.splice(-3, 3);
    scScore += 200 * (currentLevel + 1);
    $("sc-score").textContent = scScore + " pts";
    showToast("🎉 Triplet !");
  }

  scSel = null;
  renderStack();

  if (scCols.every((col) => !col.length)) {
    setTimeout(() => showWin("🎱", "Vidé !", scScore + " pts", initStack), 400);
  }
}
