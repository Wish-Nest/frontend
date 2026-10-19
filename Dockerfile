FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG APP_VERSION
ENV VITE_APP_VERSION=$APP_VERSION
ENV NODE_OPTIONS --max-old-space-size=11000
ENV CI false
ENV GENERATE_SOURCEMAP false
ENV TSC_COMPILE_ON_ERROR true
ENV DISABLE_ESLINT_PLUGIN true
ENV SKIP_PREFLIGHT_CHECK true
RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Config runtime : régénérée à chaque démarrage du conteneur (pas au build).
#   API_BASE_URL      défaut /api (relatif à l'origine du frontend)
#   VAPID_PUBLIC_KEY  clé publique VAPID
ENV API_BASE_URL=/api

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
