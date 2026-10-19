// Ordre de résolution : config runtime (window.__ENV__, injectée par
// /config.js) > variables figées au build (import.meta.env) > défauts.
// Seul window.__ENV__ peut varier après construction de l'image Docker.

type RuntimeEnv = {
    readonly API_BASE_URL?: string;
    readonly VAPID_PUBLIC_KEY?: string;
};

const runtime: RuntimeEnv =
    (typeof window !== 'undefined' ? (window as Window).__ENV__ : undefined) ?? {};

// Retourne la première valeur définie ET non vide (un "" doit retomber sur le fallback).
const firstSet = (...values: Array<string | undefined>): string | undefined =>
    values.find((value) => typeof value === 'string' && value.length > 0);

export const API_BASE_URL: string =
    firstSet(
        runtime.API_BASE_URL,
        (import.meta as any).env?.VITE_API_BASE_URL,
        (import.meta as any).env?.REACT_APP_API_BASE_URL,
    ) ?? '/api';

export const VAPID_PUBLIC_KEY: string =
    firstSet(
        runtime.VAPID_PUBLIC_KEY,
        (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY,
        (import.meta as any).env?.REACT_APP_VAPID_PUBLIC_KEY,
    ) ?? '';

export const APP_VERSION: string =
    (import.meta as any).env?.VITE_APP_VERSION ?? (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0');
