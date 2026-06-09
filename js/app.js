/**
 * app.js — Point d'entrée principal d'AutoDeck
 * Initialise : status bar, routeur, Wake Lock, Fullscreen, gestion Spotify callback.
 */

document.addEventListener("DOMContentLoaded", async () => {

  // ── 1. Appliquer la configuration ─────────────────────────────────────────

  // Nom du produit
  document.querySelectorAll("[data-product-name]").forEach(el => {
    el.textContent = CONFIG.PRODUCT_NAME;
  });

  // Couleur d'accent CSS
  document.documentElement.style.setProperty("--accent", CONFIG.ACCENT_COLOR);
  // Couleur de fond du bouton play
  const style = document.createElement("style");
  style.textContent = `
    #btn-play-pause { background: ${CONFIG.ACCENT_COLOR}; box-shadow: 0 6px 24px ${CONFIG.ACCENT_COLOR}66; }
    #btn-play-pause:hover { filter: brightness(1.1); }
    #progress-bar-fill { background: ${CONFIG.ACCENT_COLOR}; }
  `;
  document.head.appendChild(style);

  // ── 2. Status bar : heure + date + icônes ─────────────────────────────────

  const $time = document.getElementById("status-time");
  const $date = document.getElementById("status-date");

  function _updateClock() {
    const now = new Date();
    // Heure
    $time.textContent = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit",
    });
    // Date abrégée
    $date.textContent = now.toLocaleDateString("fr-FR", {
      weekday: "short", day: "numeric", month: "short",
    });
  }

  _updateClock();
  setInterval(_updateClock, 1000);

  // ── 3. Fullscreen ─────────────────────────────────────────────────────────

  const $btnFullscreen = document.getElementById("btn-fullscreen");
  if ($btnFullscreen) {
    $btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.warn);
      } else {
        document.exitFullscreen().catch(console.warn);
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const icon = $btnFullscreen.querySelector("svg");
      if (!icon) return;
      // Basculer entre maximize et minimize
      if (document.fullscreenElement) {
        icon.innerHTML = `
          <polyline points="4 14 10 14 10 20"></polyline>
          <polyline points="20 10 14 10 14 4"></polyline>
          <line x1="10" y1="14" x2="3" y2="21"></line>
          <line x1="21" y1="3" x2="14" y2="10"></line>`;
      } else {
        icon.innerHTML = `
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>`;
      }
    });
  }

  // ── 4. Wake Lock API ──────────────────────────────────────────────────────

  let _wakeLock = null;

  async function _acquireWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try {
      _wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
      console.warn("[WakeLock]", err);
    }
  }

  // Réacquérir si l'onglet redevient visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") _acquireWakeLock();
  });

  _acquireWakeLock();

  // ── 5. Routeur + icônes de la sidebar ─────────────────────────────────────

  document.querySelectorAll(".app-icon").forEach(el => {
    el.addEventListener("click", () => {
      const view = el.dataset.view;
      if (view) Router.navigate(view);
    });
  });

  // Accueil → vue Maps (comme CarPlay par défaut)
  const $btnHome = document.getElementById("btn-home");
  if ($btnHome) {
    $btnHome.addEventListener("click", () => Router.navigate("maps"));
  }

  // Callbacks à l'entrée de chaque vue
  Router.onEnter("maps",  () => MapsApp.init());
  Router.onEnter("music", () => SpotifyApp.init());

  // ── 6. Gestion du callback Spotify (après redirection OAuth) ──────────────

  const urlParams = new URLSearchParams(window.location.search);
  const spotifyCode  = urlParams.get("code");
  const spotifyError = urlParams.get("error");

  if (spotifyError) {
    console.warn("[Spotify] Erreur OAuth:", spotifyError);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (spotifyCode) {
    // On est revenus du callback Spotify → échanger le code
    const ok = await SpotifyAuth.handleCallback(spotifyCode);
    if (ok) {
      Router.navigate("music");
      // Laisser le temps au DOM de s'afficher avant d'init Spotify
      setTimeout(() => SpotifyApp.init(), 100);
    } else {
      Router.navigate("maps");
    }
  } else {
    // Navigation par défaut : Maps
    Router.navigate("maps");
  }

  // ── 7. Bouton "Se connecter à Spotify" ────────────────────────────────────

  const $btnSpotifyLogin = document.getElementById("btn-spotify-login");
  if ($btnSpotifyLogin) {
    $btnSpotifyLogin.addEventListener("click", () => SpotifyAuth.login());
  }

  // ── 8. Masquer l'overlay de chargement ────────────────────────────────────

  const $overlay = document.getElementById("loading-overlay");
  if ($overlay) {
    setTimeout(() => {
      $overlay.classList.add("fade-out");
      setTimeout(() => $overlay.remove(), 500);
    }, 400);
  }

});
