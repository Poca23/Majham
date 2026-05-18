const BV_COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#e67e22",
  "#1abc9c",
  "#e91e63",
];
const BV_CAP = 4;
let bvBottles = [],
  bvSel = null,
  bvScore = 0,
  bvMoves = 0;

function initBottle() {
  const { colors: nc, extra } = LEVELS[currentLevel].bv;
  bvSel = null;
  bvScore = 0;
  bvMoves = 0;
  $("bv-score").textContent = "0 pts";

  const deck = [];
  BV_COLORS.slice(0, nc).forEach((c) => {
    for (let i = 0; i < BV_CAP; i++) deck.push(c);
  });
  shuffle(deck);

  bvBottles = Array.from({ length: nc }, (_, i) =>
    deck.slice(i * BV_CAP, (i + 1) * BV_CAP),
  );
  for (let i = 0; i < extra; i++) bvBottles.push([]);
  renderBottle();
}

function renderBottle() {
  const area = $("bv-area");
  area.innerHTML = "";
  const n = bvBottles.length;
  const maxW = window.innerWidth - 24;
  const maxH = window.innerHeight - 130;
  const perRow = n <= 4 ? n : Math.ceil(n / 2);
  const bw = Math.min(56, Math.floor((maxW - (perRow - 1) * 8) / perRow));
  const bh = Math.min(
    bw * 2.8,
    Math.floor((maxH - Math.ceil(n / perRow) * 8) / Math.ceil(n / perRow)),
  );

  bvBottles.forEach((bottle, bi) => {
    const wrap = document.createElement("div");
    wrap.className = "bottle-wrap" + (bvSel === bi ? " sel" : "");
    wrap.onclick = () => bvClick(bi);
    wrap.appendChild(buildBottleSVG(bottle, bw, bh));
    area.appendChild(wrap);
  });
}

function buildBottleSVG(bottle, w, h) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

  const neckW = w * 0.35,
    neckH = h * 0.2;
  const nx = (w - neckW) / 2;
  const bodyY = neckH,
    bodyH = h - neckH;

  const clipId = `bc${Math.random().toString(36).slice(2)}`;
  const defs = document.createElementNS(ns, "defs");
  const clip = document.createElementNS(ns, "clipPath");
  clip.setAttribute("id", clipId);
  const cr = document.createElementNS(ns, "rect");
  cr.setAttribute("x", 0);
  cr.setAttribute("y", bodyY);
  cr.setAttribute("width", w);
  cr.setAttribute("height", bodyH);
  cr.setAttribute("rx", w * 0.15);
  clip.appendChild(cr);
  defs.appendChild(clip);
  svg.appendChild(defs);

  // body bg
  const bg = document.createElementNS(ns, "rect");
  bg.setAttribute("x", 0);
  bg.setAttribute("y", bodyY);
  bg.setAttribute("width", w);
  bg.setAttribute("height", bodyH);
  bg.setAttribute("rx", w * 0.15);
  bg.setAttribute("fill", "rgba(255,255,255,.08)");
  bg.setAttribute("stroke", "rgba(255,255,255,.2)");
  bg.setAttribute("stroke-width", "1.5");
  svg.appendChild(bg);

  // liquid layers
  const slotH = bodyH / BV_CAP;
  bottle.forEach((color, i) => {
    const ly = bodyY + bodyH - (i + 1) * slotH;
    const liq = document.createElementNS(ns, "rect");
    liq.setAttribute("x", 1);
    liq.setAttribute("y", ly);
    liq.setAttribute("width", w - 2);
    liq.setAttribute("height", slotH + 1);
    liq.setAttribute("fill", color);
    liq.setAttribute("clip-path", `url(#${clipId})`);
    svg.appendChild(liq);
  });

  // neck
  const neck = document.createElementNS(ns, "rect");
  neck.setAttribute("x", nx);
  neck.setAttribute("y", 0);
  neck.setAttribute("width", neckW);
  neck.setAttribute("height", neckH + 2);
  neck.setAttribute("rx", neckW * 0.3);
  neck.setAttribute("fill", "rgba(255,255,255,.06)");
  neck.setAttribute("stroke", "rgba(255,255,255,.18)");
  neck.setAttribute("stroke-width", "1.5");
  svg.appendChild(neck);

  // cap
  const cap = document.createElementNS(ns, "rect");
  cap.setAttribute("x", nx - 2);
  cap.setAttribute("y", "-6");
  cap.setAttribute("width", neckW + 4);
  cap.setAttribute("height", "10");
  cap.setAttribute("rx", "3");
  cap.setAttribute("fill", "#546e7a");
  svg.appendChild(cap);

  // shine
  const shine = document.createElementNS(ns, "rect");
  shine.setAttribute("x", w * 0.14);
  shine.setAttribute("y", bodyY + 5);
  shine.setAttribute("width", w * 0.1);
  shine.setAttribute("height", bodyH * 0.5);
  shine.setAttribute("rx", w * 0.05);
  shine.setAttribute("fill", "rgba(255,255,255,.14)");
  shine.setAttribute("clip-path", `url(#${clipId})`);
  svg.appendChild(shine);

  return svg;
}

function bvClick(bi) {
  if (bvSel === null) {
    const b = bvBottles[bi];
    if (!b.length) return;
    if (b.length === BV_CAP && b.every((c) => c === b[0])) return;
    bvSel = bi;
    renderBottle();
    return;
  }
  if (bvSel === bi) {
    bvSel = null;
    renderBottle();
    return;
  }

  const from = bvBottles[bvSel],
    to = bvBottles[bi];
  const top = from[from.length - 1];

  if (to.length >= BV_CAP) {
    showToast("Bouteille pleine !");
    bvSel = null;
    renderBottle();
    return;
  }
  if (to.length && to[to.length - 1] !== top) {
    showToast("Couleurs différentes !");
    bvSel = null;
    renderBottle();
    return;
  }

  let poured = 0;
  while (from.length && from[from.length - 1] === top && to.length < BV_CAP) {
    to.push(from.pop());
    poured++;
  }
  bvMoves++;
  bvSel = null;
  bvScore += poured * 20 * (currentLevel + 1);
  $("bv-score").textContent = bvScore + " pts";
  renderBottle();

  if (
    bvBottles.every(
      (b) => !b.length || (b.length === BV_CAP && b.every((c) => c === b[0])),
    )
  ) {
    bvScore += Math.max(0, 500 * (currentLevel + 1) - bvMoves * 10);
    $("bv-score").textContent = bvScore + " pts";
    setTimeout(
      () => showWin("🧪", "Trié !", bvScore + " pts", initBottle),
      500,
    );
  }
}
