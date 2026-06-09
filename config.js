/**
 * config.js — Configuration centrale d'AutoDeck
 * Modifiez ce fichier pour personnaliser l'application.
 * NE JAMAIS mettre de secrets (mots de passe, tokens) ici.
 */
const CONFIG = {

  // ── Identité produit ─────────────────────────────────────────────────────
  PRODUCT_NAME: "AutoDeck",
  ACCENT_COLOR: "#007AFF",  // Bleu principal (format hex)

  // ── Google Maps Embed API ─────────────────────────────────────────────────
  // Clé gratuite : https://console.cloud.google.com/ → API "Maps Embed API"
  // Restreignez la clé par "Référents HTTP" dans Google Cloud pour la sécurité.
  GOOGLE_MAPS_API_KEY: "",

  // Lieu affiché par défaut sur la carte
  DEFAULT_LOCATION: "Paris, France",
  DEFAULT_LAT: 48.8566,
  DEFAULT_LNG: 2.3522,
  DEFAULT_ZOOM: 14,

  // ── Spotify ───────────────────────────────────────────────────────────────
  // Client ID de votre app Spotify : https://developer.spotify.com/dashboard
  // Déclarez l'URI de redirection dans le dashboard Spotify.
  SPOTIFY_CLIENT_ID: "",

  // URI de redirection (doit correspondre exactement au dashboard Spotify)
  // En local : "http://localhost:PORT/" — En prod : "https://votre-domaine.com/"
  SPOTIFY_REDIRECT_URI: (() => {
    // Détection automatique de l'origine, surchargeagle manuellement :
    // return "https://mon-domaine.com/";
    return window.location.origin + window.location.pathname;
  })(),

  // Scopes Spotify requis pour le Web Playback SDK
  SPOTIFY_SCOPES: [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ].join(" "),

};
