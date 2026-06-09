/**
 * router.js — Routeur SPA minimal (switch de vues sans rechargement)
 */

const Router = (() => {
  /** @type {string} Vue actuellement affichée */
  let _current = null;

  /** @type {Object.<string, Function>} Callbacks appelés à l'activation d'une vue */
  const _onEnter = {};

  /**
   * Enregistre un callback appelé chaque fois qu'une vue devient active.
   * @param {string} viewId - ID de la vue (sans le préfixe "view-")
   * @param {Function} fn
   */
  function onEnter(viewId, fn) {
    _onEnter[viewId] = fn;
  }

  /**
   * Navigue vers une vue.
   * @param {string} viewId - ex: "maps", "music", "about"
   */
  function navigate(viewId) {
    if (viewId === _current) return;

    // Masquer toutes les vues
    document.querySelectorAll(".app-view").forEach(el => el.classList.remove("active"));

    // Afficher la cible
    const target = document.getElementById("view-" + viewId);
    if (target) {
      target.classList.add("active");
      _current = viewId;
    }

    // Mettre à jour l'icône active dans la sidebar
    document.querySelectorAll(".app-icon").forEach(el => {
      el.classList.toggle("active", el.dataset.view === viewId);
    });

    // Déclencher le callback éventuel
    if (_onEnter[viewId]) _onEnter[viewId]();
  }

  function getCurrent() { return _current; }

  return { navigate, onEnter, getCurrent };
})();
