export const API_BASE_URL: string = ((import.meta as any).env?.VITE_API_BASE_URL ?? (import.meta as any).env?.REACT_APP_API_BASE_URL ?? '/api');
export const VAPID_PUBLIC_KEY: string = ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ?? (import.meta as any).env?.REACT_APP_VAPID_PUBLIC_KEY ?? '');
export const APP_VERSION: string = ((import.meta as any).env?.VITE_APP_VERSION ?? (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'));

