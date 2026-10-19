/// <reference types="vite/client" />

// Injecté au build par vite.config.ts (define) depuis package.json
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_APP_VERSION?: string;
  // compat prefix for CRA-style envs if any are provided at build time
  readonly REACT_APP_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Injectée côté client par /config.js (régénéré par entrypoint.sh au
// démarrage du conteneur Docker) : seules valeurs non figées au build.
interface Window {
  readonly __ENV__?: {
    readonly API_BASE_URL?: string;
    readonly VAPID_PUBLIC_KEY?: string;
  };
}

