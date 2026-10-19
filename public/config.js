// Configuration runtime lue par src/env.ts via window.__ENV__.
//
// - En dev (npm start) : ce fichier par défaut est servi depuis /public.
// - En Docker : entrypoint.sh régénère ce fichier à chaque démarrage du
//   conteneur à partir des variables d'environnement (API_BASE_URL,
//   VAPID_PUBLIC_KEY), car le bundle Vite fige les variables au build.
//
// Ne pas mettre de valeur sensible ici : ce fichier est public.
window.__ENV__ = window.__ENV__ || {};
