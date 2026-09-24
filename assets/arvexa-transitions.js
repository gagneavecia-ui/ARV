// ================================================================
// ARVEXA TRANSITIONS — View Transitions API + prefetch intelligent
// ================================================================

(function () {
  'use strict';

  const supportsVT = 'startViewTransition' in document;
  const supportsPrefetch = 'onscrollend' in window; // heuristic

  // ================================================================
  // INTERCEPTION DES CLICS INTERNES
  // ================================================================
  if (supportsVT) {
    document.addEventListener('click', (e) => {
      // Ne pas intercepter si modificateur, target, ou clic non-gauche
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a[href]');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      if (link.dataset.noTransition !== undefined) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:') || href.startsWith('javascript:')) return;

      // Même origine ?
      let url;
      try { url = new URL(href, location.href); }
      catch (err) { return; }
      if (url.origin !== location.origin) return;

      // Éviter boucle si c'est la page courante
      if (url.href === location.href) return;

      e.preventDefault();
      navigateWithTransition(url.href);
    }, { capture: true });
  }

  function navigateWithTransition(href) {
    try {
      document.startViewTransition(() => {
        window.location.href = href;
      });
    } catch (err) {
      window.location.href = href;
    }
  }

  // ================================================================
  // PREFETCH AU SURVOL (desktop) + TOUCHSTART (mobile)
  // ================================================================
  const prefetched = new Set();
  const PREFETCHABLE = [
    'chapitre.html', 'matiere.html', 'lecture.html',
    'profil.html', 'abonnement.html', 'notifications.html',
    'calculatrice.html', 'formulaires.html', 'tableau-periodique.html',
    'outils.html', 'exam.html', 'groupe.html'
  ];

  function shouldPrefetch(url) {
    try {
      const u = new URL(url, location.href);
      if (u.origin !== location.origin) return false;
      const path = u.pathname.split('/').pop();
      return PREFETCHABLE.some((p) => path === p || path === p.replace('.html', ''));
    } catch (err) { return false; }
  }

  function prefetch(url) {
    if (prefetched.has(url)) return;
    if (!shouldPrefetch(url)) return;
    prefetched.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);

    // Prefetch aussi les chunks JS/CSS probables
    // (le navigateur s'en charge si les <link rel="prefetch"> sont dans la page cible)
  }

  // Survol (desktop)
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    prefetch(link.href);
  }, { passive: true, capture: true });

  // Touch (mobile) — prefetch immédiat
  document.addEventListener('touchstart', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    prefetch(link.href);
  }, { passive: true, capture: true });

  // Focus clavier
  document.addEventListener('focusin', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    prefetch(link.href);
  }, { capture: true });

  console.log('[ARVEXA] Transitions ready — VT:', supportsVT);
})();