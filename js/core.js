const $ = (id) => document.getElementById(id);
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LEVELS = [
  {
    name: "Débutant",
    color: "#4caf50",
    tm: { cols: 4, rows: 3 },
    sc: { cols: 4, colors: 3, stackH: 4 },
    ct: { rows: 4, cols: 4, pairs: 6 },
    bv: { colors: 3, extra: 1 },
    bs: { rows: 5, colors: 3 },
  },
  {
    name: "Facile",
    color: "#8bc34a",
    tm: { cols: 4, rows: 4 },
    sc: { cols: 5, colors: 4, stackH: 5 },
    ct: { rows: 4, cols: 6, pairs: 8 },
    bv: { colors: 4, extra: 1 },
    bs: { rows: 6, colors: 4 },
  },
  {
    name: "Moyen",
    color: "#ff9800",
    tm: { cols: 6, rows: 4 },
    sc: { cols: 5, colors: 5, stackH: 6 },
    ct: { rows: 6, cols: 6, pairs: 10 },
    bv: { colors: 5, extra: 1 },
    bs: { rows: 7, colors: 5 },
  },
  {
    name: "Difficile",
    color: "#f44336",
    tm: { cols: 6, rows: 5 },
    sc: { cols: 6, colors: 6, stackH: 7 },
    ct: { rows: 6, cols: 8, pairs: 14 },
    bv: { colors: 6, extra: 2 },
    bs: { rows: 8, colors: 6 },
  },
  {
    name: "Expert",
    color: "#9c27b0",
    tm: { cols: 8, rows: 5 },
    sc: { cols: 7, colors: 7, stackH: 8 },
    ct: { rows: 8, cols: 8, pairs: 18 },
    bv: { colors: 7, extra: 2 },
    bs: { rows: 9, colors: 7 },
  },
];

let currentLevel = 1;

function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2000);
}

function showWin(emoji, title, score, onReplay) {
  document.querySelectorAll(".win-overlay").forEach((o) => o.remove());
  const ov = document.createElement("div");
  ov.className = "win-overlay";
  ov.innerHTML = `
    <div class="win-box">
      <div class="win-emoji">${emoji}</div>
      <div class="win-title">${title}</div>
      <div class="win-score">${score}</div>
      <div class="win-btns">
        <button class="btn-primary"  id="wr">↺ Rejouer</button>
        <button class="btn-secondary" id="wh">🏠 Menu</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector("#wr").onclick = () => {
    ov.remove();
    onReplay();
  };
  ov.querySelector("#wh").onclick = () => {
    ov.remove();
    goHome();
  };
}

function goHome() {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $("screen-home").classList.add("active");
}

function setScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function updateBadge(id, lvl) {
  const el = $(id);
  if (!el) return;
  el.textContent = lvl.name;
  el.style.background = lvl.color;
}

function pickLevel(game) {
  const names = {
    tilesmatch: "Tile Match",
    stack: "Stack & Clear",
    chain: "Chain Tiles",
    bottle: "Bottle Sort",
    bubble: "Bubble Shooter",
  };
  const box = document.createElement("div");
  box.className = "level-screen";
  box.innerHTML = `
    <div class="level-box">
      <h2>Choisir un niveau</h2>
      <p>Pour ${names[game]}</p>
      <div class="level-btns">
        ${LEVELS.map((l, i) => `<button class="level-btn" style="background:${l.color}" data-i="${i}">${l.name}</button>`).join("")}
      </div>
      <button class="level-cancel">Annuler</button>
    </div>`;
  document.body.appendChild(box);
  box.querySelectorAll(".level-btn").forEach((btn) => {
    btn.onclick = () => {
      currentLevel = +btn.dataset.i;
      box.remove();
      startGame(game);
    };
  });
  box.querySelector(".level-cancel").onclick = () => box.remove();
  box.onclick = (e) => {
    if (e.target === box) box.remove();
  };
}

function startGame(type) {
  setScreen(`screen-${type}`);
  const badgeMap = {
    tilesmatch: "tm-lvl-badge",
    stack: "sc-lvl-badge",
    chain: "ct-lvl-badge",
    bottle: "bv-lvl-badge",
    bubble: "bs-lvl-badge",
  };
  const initMap = {
    tilesmatch: initTileMatch,
    stack: initStack,
    chain: initChain,
    bottle: initBottle,
    bubble: initBubble,
  };
  updateBadge(badgeMap[type], LEVELS[currentLevel]);
  initMap[type]();
}
