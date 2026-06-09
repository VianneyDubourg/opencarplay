/**
 * spotify.js — Module Musique Spotify
 *
 * Mode 1 (Premium) : Web Playback SDK → lecteur complet maison
 * Mode 2 (fallback) : iframe embed Spotify (aperçu 30s) + bouton connexion
 */

const SpotifyApp = (() => {

  let _player      = null;   // Instance Spotify.Player du SDK
  let _deviceId    = null;   // ID du device Web Playback
  let _isPremium   = false;
  let _sdkReady    = false;
  let _uiMounted   = false;

  // ── Éléments DOM (récupérés une fois au montage) ──────────────────────────

  let $playerCard, $connectArea, $noConfig;
  let $albumArt, $albumArtPlaceholder, $trackName, $artistName, $albumName;
  let $progressFill, $timeElapsed, $timeDuration;
  let $btnPrev, $btnPlay, $btnNext;
  let $btnLogout;
  let $volumeSlider, $progressWrapper;
  let $embedWrapper;

  // ── Initialisation principale ─────────────────────────────────────────────

  async function init() {
    if (_uiMounted) return;
    _uiMounted = true;

    _cacheDOM();

    // Pas de Client ID configuré → afficher le message de configuration
    if (!CONFIG.SPOTIFY_CLIENT_ID) {
      _showNoConfig();
      return;
    }

    // Vérifier si l'utilisateur est déjà connecté
    if (SpotifyAuth.isLoggedIn()) {
      const token = await SpotifyAuth.getAccessToken();
      if (token) {
        await _checkPremiumAndInit(token);
        return;
      }
    }

    // Non connecté → afficher le bouton de connexion
    _showConnectUI();
  }

  function _cacheDOM() {
    $playerCard           = document.getElementById("player-card");
    $connectArea          = document.getElementById("spotify-connect-area");
    $noConfig             = document.getElementById("spotify-no-config");
    $albumArt             = document.getElementById("album-art");
    $albumArtPlaceholder  = document.getElementById("album-art-placeholder");
    $trackName            = document.getElementById("track-name");
    $artistName           = document.getElementById("artist-name");
    $albumName            = document.getElementById("album-name");
    $progressFill         = document.getElementById("progress-bar-fill");
    $timeElapsed          = document.getElementById("time-elapsed");
    $timeDuration         = document.getElementById("time-duration");
    $btnPrev              = document.getElementById("btn-prev");
    $btnPlay              = document.getElementById("btn-play-pause");
    $btnNext              = document.getElementById("btn-next");
    $btnLogout            = document.getElementById("btn-spotify-logout");
    $volumeSlider         = document.getElementById("volume-slider");
    $progressWrapper      = document.getElementById("progress-bar-wrapper");
    $embedWrapper         = document.getElementById("spotify-embed-wrapper");
  }

  // ── Gestion de l'affichage des sections ───────────────────────────────────

  function _hideAll() {
    [$playerCard, $connectArea, $noConfig, $embedWrapper].forEach(el => {
      if (el) el.style.display = "none";
    });
  }

  function _showNoConfig() {
    _hideAll();
    if ($noConfig) $noConfig.style.display = "flex";
  }

  function _showConnectUI() {
    _hideAll();
    if ($connectArea) $connectArea.style.display = "flex";
    // Afficher aussi l'embed de démo si disponible
    if ($embedWrapper) $embedWrapper.style.display = "block";
  }

  function _showPlayer() {
    _hideAll();
    if ($playerCard) $playerCard.style.display = "flex";
  }

  // ── Vérification Premium + init SDK ───────────────────────────────────────

  async function _checkPremiumAndInit(token) {
    try {
      const resp = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!resp.ok) {
        // Token invalide → déconnexion
        SpotifyAuth.logout();
        _showConnectUI();
        return;
      }

      const user = await resp.json();
      _isPremium = (user.product === "premium");

      if (_isPremium) {
        _initWebPlaybackSDK(token);
      } else {
        // Compte gratuit → fallback embed
        _showConnectUI();
        _showEmbedFallback();
      }
    } catch (err) {
      console.error("[Spotify] Erreur vérification compte:", err);
      _showConnectUI();
    }
  }

  // ── Web Playback SDK ──────────────────────────────────────────────────────

  function _initWebPlaybackSDK(token) {
    // Charger le SDK Spotify si pas encore chargé
    if (!document.getElementById("spotify-sdk-script")) {
      const script = document.createElement("script");
      script.id  = "spotify-sdk-script";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      document.body.appendChild(script);
    }

    // Callback appelé par le SDK quand il est prêt
    window.onSpotifyWebPlaybackSDKReady = () => {
      _sdkReady = true;
      _createPlayer(token);
    };

    // Si le SDK était déjà chargé
    if (window.Spotify) {
      _sdkReady = true;
      _createPlayer(token);
    }
  }

  async function _createPlayer(token) {
    _player = new Spotify.Player({
      name: CONFIG.PRODUCT_NAME + " Player",
      volume: 0.8,
      getOAuthToken: async (cb) => {
        // Toujours fournir un token frais
        const freshToken = await SpotifyAuth.getAccessToken();
        cb(freshToken || token);
      },
    });

    // Événements du SDK
    _player.addListener("ready", ({ device_id }) => {
      _deviceId = device_id;
      _showPlayer();
      _bindPlayerEvents();
      _transferPlayback(device_id);
      _startStatePolling();
    });

    _player.addListener("not_ready", ({ device_id }) => {
      console.warn("[Spotify] Player not ready:", device_id);
    });

    _player.addListener("player_state_changed", (state) => {
      if (state) _updateUI(state);
    });

    _player.addListener("authentication_error", async ({ message }) => {
      console.error("[Spotify] Auth error:", message);
      const newToken = await SpotifyAuth.getAccessToken();
      if (!newToken) {
        SpotifyAuth.logout();
        _showConnectUI();
      }
    });

    _player.addListener("account_error", ({ message }) => {
      console.error("[Spotify] Account error (Premium requis):", message);
      _isPremium = false;
      _showConnectUI();
      _showEmbedFallback();
    });

    await _player.connect();
  }

  /** Transfère la lecture sur ce device */
  async function _transferPlayback(deviceId) {
    const token = await SpotifyAuth.getAccessToken();
    if (!token) return;

    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    }).catch(err => console.warn("[Spotify] Transfer playback:", err));
  }

  // ── Polling de l'état (fallback si player_state_changed ne fire pas) ──────

  let _pollTimer = null;

  function _startStatePolling() {
    if (_pollTimer) return;
    _pollTimer = setInterval(async () => {
      if (!_player) return;
      const state = await _player.getCurrentState();
      if (state) _updateUI(state);
    }, 2000);
  }

  // ── Mise à jour de l'UI depuis l'état du player ────────────────────────────

  function _updateUI(state) {
    if (!state) return;

    const track    = state.track_window?.current_track;
    const paused   = state.paused;
    const position = state.position;
    const duration = state.duration || 1;

    // Progression
    const pct = Math.min(100, (position / duration) * 100);
    if ($progressFill) $progressFill.style.width = pct + "%";
    if ($timeElapsed)  $timeElapsed.textContent  = _formatTime(position);
    if ($timeDuration) $timeDuration.textContent = _formatTime(duration);

    // Bouton play/pause (icônes Feather via innerHTML)
    if ($btnPlay) {
      $btnPlay.innerHTML = paused
        ? `<svg viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" fill="white"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>`;
    }

    if (!track) return;

    // Infos piste
    if ($trackName)  $trackName.textContent  = track.name || "—";
    if ($artistName) $artistName.textContent = (track.artists || []).map(a => a.name).join(", ") || "—";
    if ($albumName)  $albumName.textContent  = track.album?.name || "";

    // Pochette
    const imageUrl = track.album?.images?.[0]?.url;
    if (imageUrl) {
      if ($albumArt) {
        $albumArt.src = imageUrl;
        $albumArt.style.display = "block";
      }
      if ($albumArtPlaceholder) $albumArtPlaceholder.style.display = "none";
    } else {
      if ($albumArt) $albumArt.style.display = "none";
      if ($albumArtPlaceholder) $albumArtPlaceholder.style.display = "flex";
    }
  }

  // ── Liaison des boutons de contrôle ───────────────────────────────────────

  function _bindPlayerEvents() {
    if ($btnPrev) {
      $btnPrev.addEventListener("click", () => _player?.previousTrack());
    }

    if ($btnPlay) {
      $btnPlay.addEventListener("click", () => _player?.togglePlay());
    }

    if ($btnNext) {
      $btnNext.addEventListener("click", () => _player?.nextTrack());
    }

    if ($btnLogout) {
      $btnLogout.addEventListener("click", () => {
        SpotifyAuth.logout();
        _player?.disconnect();
        _player = null;
        if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
        _uiMounted = false;
        init();
      });
    }

    if ($volumeSlider) {
      $volumeSlider.addEventListener("input", (e) => {
        _player?.setVolume(Number(e.target.value) / 100);
      });
    }

    // Clic sur la barre de progression → seek
    if ($progressWrapper) {
      $progressWrapper.addEventListener("click", async (e) => {
        const rect  = $progressWrapper.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const state = await _player?.getCurrentState();
        if (state?.duration) {
          _player.seek(Math.floor(ratio * state.duration));
        }
      });
    }
  }

  // ── Fallback embed iframe ─────────────────────────────────────────────────

  function _showEmbedFallback() {
    // Embed de la playlist "Top Mix" publique Spotify comme démo
    const embedEl = document.getElementById("spotify-embed");
    if (embedEl && !embedEl.src) {
      embedEl.src = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0";
    }
    if ($embedWrapper) $embedWrapper.style.display = "block";
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────

  function _formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m     = Math.floor(total / 60);
    const s     = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return { init };
})();
