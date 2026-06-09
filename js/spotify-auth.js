/**
 * spotify-auth.js — Authentification Spotify via Authorization Code + PKCE
 * Aucun client secret requis (code public).
 *
 * Flux :
 *  1. generateChallenge() → stocke le verifier en sessionStorage
 *  2. redirectToSpotify() → redirige vers accounts.spotify.com
 *  3. handleCallback()    → échange le code contre un token
 *  4. getAccessToken()    → retourne un token valide (refresh automatique)
 */

const SpotifyAuth = (() => {

  const STORAGE_KEYS = {
    ACCESS_TOKEN:  "sp_access_token",
    REFRESH_TOKEN: "sp_refresh_token",
    EXPIRES_AT:    "sp_expires_at",
    CODE_VERIFIER: "sp_code_verifier",
  };

  // ── Utilitaires PKCE ──────────────────────────────────────────────────────

  /** Génère une chaîne aléatoire URL-safe */
  function _randomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => chars[b % chars.length]).join("");
  }

  /** SHA-256 d'une chaîne → ArrayBuffer */
  async function _sha256(plain) {
    const enc = new TextEncoder().encode(plain);
    return crypto.subtle.digest("SHA-256", enc);
  }

  /** Encode un ArrayBuffer en base64url (sans padding) */
  function _base64url(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /** Génère verifier + challenge PKCE */
  async function _generatePKCE() {
    const verifier = _randomString(64);
    const challenge = _base64url(await _sha256(verifier));
    return { verifier, challenge };
  }

  // ── Token storage ──────────────────────────────────────────────────────────

  function _saveTokens({ access_token, refresh_token, expires_in }) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  access_token);
    if (refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    }
    const expiresAt = Date.now() + (expires_in - 60) * 1000; // marge 60s
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  }

  function _clearTokens() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }

  function isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /** Retourne un token valide, rafraîchi si nécessaire. */
  async function getAccessToken() {
    const token     = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.EXPIRES_AT) || 0);

    if (!token) return null;

    if (Date.now() < expiresAt) return token;

    // Token expiré → refresh
    return _refreshAccessToken();
  }

  async function _refreshAccessToken() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken || !CONFIG.SPOTIFY_CLIENT_ID) {
      _clearTokens();
      return null;
    }

    try {
      const resp = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "refresh_token",
          refresh_token: refreshToken,
          client_id:     CONFIG.SPOTIFY_CLIENT_ID,
        }),
      });

      if (!resp.ok) throw new Error("Refresh failed: " + resp.status);

      const data = await resp.json();
      _saveTokens(data);
      return data.access_token;
    } catch (err) {
      console.error("[SpotifyAuth] Refresh token error:", err);
      _clearTokens();
      return null;
    }
  }

  // ── Flux d'authentification ───────────────────────────────────────────────

  /** Lance la redirection vers Spotify pour l'authentification. */
  async function login() {
    if (!CONFIG.SPOTIFY_CLIENT_ID) {
      console.warn("[SpotifyAuth] SPOTIFY_CLIENT_ID non configuré dans config.js");
      return;
    }

    const { verifier, challenge } = await _generatePKCE();
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, verifier);

    const params = new URLSearchParams({
      response_type:         "code",
      client_id:             CONFIG.SPOTIFY_CLIENT_ID,
      scope:                 CONFIG.SPOTIFY_SCOPES,
      redirect_uri:          CONFIG.SPOTIFY_REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge:        challenge,
    });

    window.location.href = "https://accounts.spotify.com/authorize?" + params.toString();
  }

  /** Échange le code d'autorisation contre un access token. */
  async function handleCallback(code) {
    const verifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
    if (!verifier) {
      console.error("[SpotifyAuth] Code verifier introuvable");
      return false;
    }

    try {
      const resp = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "authorization_code",
          code,
          redirect_uri:  CONFIG.SPOTIFY_REDIRECT_URI,
          client_id:     CONFIG.SPOTIFY_CLIENT_ID,
          code_verifier: verifier,
        }),
      });

      if (!resp.ok) throw new Error("Token exchange failed: " + resp.status);

      const data = await resp.json();
      _saveTokens(data);
      sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

      // Nettoyer l'URL (enlever le ?code=...)
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    } catch (err) {
      console.error("[SpotifyAuth] Échange de code échoué:", err);
      return false;
    }
  }

  function logout() {
    _clearTokens();
  }

  return { login, logout, handleCallback, getAccessToken, isLoggedIn };
})();
