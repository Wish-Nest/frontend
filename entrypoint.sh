#!/bin/sh
# Génère /usr/share/nginx/html/config.js au démarrage du conteneur.
#
# Le bundle Vite fige les variables d'environnement au build : on ne peut donc
# pas changer BASE_URL après coup. Ce script écrit la config dans un fichier
# séparé, chargé par index.html avant le bundle, et lue par src/env.ts via
# window.__ENV__.
#
# Variables lues (à fournir avec `docker run -e ...` ou dans le compose) :
#   API_BASE_URL      URL de base de l'API  (défaut : /api, même origine)
#   VAPID_PUBLIC_KEY  clé publique VAPID    (défaut : vide)
set -eu

API_BASE_URL="${API_BASE_URL:-/api}"
VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY:-}"

# Échappement minimal pour inscrire la valeur dans une chaîne JS entre doubles quotes.
escape_js() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF
// Généré automatiquement par entrypoint.sh — ne pas éditer à la main.
window.__ENV__ = {
  API_BASE_URL: "$(escape_js "$API_BASE_URL")",
  VAPID_PUBLIC_KEY: "$(escape_js "$VAPID_PUBLIC_KEY")"
};
EOF

echo "WishNest frontend : API_BASE_URL=${API_BASE_URL}"

# Entrypoint officiel nginx : exécute /docker-entrypoint.d/*.sh puis nginx.
exec /docker-entrypoint.sh nginx -g 'daemon off;'
