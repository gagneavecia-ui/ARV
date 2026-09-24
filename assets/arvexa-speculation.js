// ================================================================
// ARVEXA SPECULATION RULES — Fallback programmatique
// Pour navigateurs supportant l'API Speculation Rules
// (injecte les règles dynamiquement si pas déjà dans le <head>)
// ================================================================

(function () {
  'use strict';

  if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) {
    console.log('[ARVEXA] Speculation Rules non supportées');
    return;
  }

  // Vérifier qu'on n'a pas déjà des règles dans le HTML
  const existing = document.querySelector('script[type="speculationrules"]');
  if (existing) {
    console.log('[ARVEXA] Speculation Rules présentes dans le HTML');
    return;
  }

  const rules = {
    prerender: [
      {
        where: {
          and: [
            { href_matches: "/chapitre.html*" },
            { not: { href_matches: "*?part=*" } }
          ]
        },
        eagerness: "moderate"
      }
    ],
    prefetch: [
      {
        where: {
          href_matches: [
            "/matiere.html*",
            "/lecture.html*",
            "/profil.html*",
            "/abonnement.html*"
          ]
        },
        eagerness: "conservative"
      }
    ]
  };

  const script = document.createElement('script');
  script.type = 'speculationrules';
  script.textContent = JSON.stringify(rules);
  document.head.appendChild(script);

  console.log('[ARVEXA] Speculation Rules injectées');
})();