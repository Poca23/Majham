const CACHE = "mahjam-v6";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/base.css",
  "/css/layout.css",
  "/css/components.css",
  "/css/games.css",
  "/css/tile-match.css",
  "/css/chain-tiles.css",
  "/css/bubble-shooter.css",
  "/css/tetris.css",
  "/css/pwa.css",
  "/js/core.js",
  "/js/tile-match.js",
  "/js/stack-clear.js",
  "/js/chain-tiles.js",
  "/js/bottle-sort.js",
  "/js/bubble-shooter.js",
  "/js/tetris.js",
  "/js/pwa.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
