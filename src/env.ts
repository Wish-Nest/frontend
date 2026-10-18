export const API_BASE_URL: string = ((import.meta as any).env?.VITE_API_BASE_URL ?? (import.meta as any).env?.REACT_APP_API_BASE_URL ?? '/api');
export const VAPID_PUBLIC_KEY: string = ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ?? (import.meta as any).env?.REACT_APP_VAPID_PUBLIC_KEY ?? '');

