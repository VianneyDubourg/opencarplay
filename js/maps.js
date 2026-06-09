/**
 * maps.js — Module Google Maps (Embed API, version gratuite)
 * Utilise uniquement l'Embed API (iframe), sans Maps JavaScript API facturée.
 */

const MapsApp = (() => {
  let _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    const wrapper = document.getElementById("maps-iframe-wrapper");
    const placeholder = document.getElementById("maps-placeholder");

    if (!CONFIG.GOOGLE_MAPS_API_KEY) {
      // Aucune clé : afficher le message d'instruction
      if (placeholder) placeholder.style.display = "flex";
      if (wrapper) {
        const iframe = wrapper.querySelector("#maps-iframe");
        if (iframe) iframe.style.display = "none";
      }
      return;
    }

    // Clé présente : construire l'URL de l'Embed API
    if (placeholder) placeholder.style.display = "none";

    const iframe = document.getElementById("maps-iframe");
    if (!iframe) return;

    const params = new URLSearchParams({
      key: CONFIG.GOOGLE_MAPS_API_KEY,
      q: CONFIG.DEFAULT_LOCATION,
      zoom: String(CONFIG.DEFAULT_ZOOM || 14),
      maptype: "roadmap",
    });

    iframe.src = `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
    iframe.style.display = "block";
  }

  return { init };
})();
