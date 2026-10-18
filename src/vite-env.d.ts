/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  // compat prefix for CRA-style envs if any are provided at build time
  readonly REACT_APP_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

