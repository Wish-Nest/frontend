import axios from 'axios';
import { VAPID_PUBLIC_KEY } from '../env';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const rawData = window.atob(base64);
  // @ts-ignore
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    await axios.post('/push/subscribe', subscription);
  } catch (e) {
    console.warn('Echec d\'envoi de la souscription push au serveur', e);
  }
}

async function ensurePushSubscription(reg: ServiceWorkerRegistration) {
  console.log('Ensuring push subscription...');
  if (!('PushManager' in window) || !('Notification' in window)) return;
  const permission = Notification.permission;
  if (permission !== 'granted') return;

  const existing = await reg.pushManager.getSubscription();
  const vapidPublicKey = VAPID_PUBLIC_KEY;
  if (!existing && vapidPublicKey) {
    try {
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      await sendSubscriptionToServer(sub);
    } catch (e) {
      console.warn('Souscription push échouée', e);
    }
  } else if (existing) {
    await sendSubscriptionToServer(existing);
  }
}

export async function requestNotificationPermissionAndSubscribe() {
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) await ensurePushSubscription(reg);
}

export async function initPWA(swUrl: string) {
  const reg = await navigator.serviceWorker.register(swUrl);
  // Active immédiatement si possible
  if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  // Si les notifications sont déjà autorisées, assurer la souscription
  try {
    await ensurePushSubscription(reg);
  } catch {}
  return reg;
}
