/* ── Service Worker ── */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

/* ── Bannière installation Android/Chrome ── */
let deferredPrompt = null;
const banner = document.getElementById("pwa-banner");
const installBtn = document.getElementById("pwa-install");
const dismissBtn = document.getElementById("pwa-dismiss");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => banner.classList.add("show"), 3000);
});

installBtn.addEventListener("click", async () => {
  banner.classList.remove("show");
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

dismissBtn.addEventListener("click", () => {
  banner.classList.remove("show");
});

window.addEventListener("appinstalled", () => {
  banner.classList.remove("show");
  deferredPrompt = null;
});

/* ── Hint iOS (Safari) ── */
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
const iosHint = document.getElementById("ios-hint");

if (isIos && !isStandalone && !sessionStorage.getItem("ios-hint-seen")) {
  setTimeout(() => iosHint.classList.add("show"), 3500);
  iosHint.querySelector("button").addEventListener("click", () => {
    iosHint.classList.remove("show");
    sessionStorage.setItem("ios-hint-seen", "1");
  });
}

/* ── Indicateur offline ── */
const offlineBar = document.getElementById("offline-bar");

function syncOnlineStatus() {
  offlineBar.classList.toggle("show", !navigator.onLine);
}

window.addEventListener("online", syncOnlineStatus);
window.addEventListener("offline", syncOnlineStatus);
syncOnlineStatus();
