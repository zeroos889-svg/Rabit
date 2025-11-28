/**
 * PWA (Progressive Web App) Utilities
 * Provides offline support, caching, and install functionality
 */

// Cache names
const CACHE_NAME = 'rabit-hr-v1';
const STATIC_CACHE = 'rabit-static-v1';
const DYNAMIC_CACHE = 'rabit-dynamic-v1';
const API_CACHE = 'rabit-api-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes to cache
const CACHEABLE_API_ROUTES = [
  '/api/user/profile',
  '/api/company/info',
  '/api/employees/list',
  '/api/departments',
  '/api/settings',
];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Store the install prompt event
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service worker registered:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Check if the app can be installed
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Listen for install prompt
 */
export function listenForInstallPrompt(
  callback: (canInstall: boolean) => void
): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    callback(true);
  };

  window.addEventListener('beforeinstallprompt', handler);

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    callback(false);
  }

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}

/**
 * Prompt user to install the app
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return choice.outcome === 'accepted';
  } catch (error) {
    console.error('Error prompting install:', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline changes
 */
export function listenForNetworkChanges(
  callback: (online: boolean) => void
): () => void {
  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
}

/**
 * Cache API response
 */
export async function cacheApiResponse(
  url: string,
  response: Response
): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open(API_CACHE);
    await cache.put(url, response.clone());
  } catch (error) {
    console.error('Error caching API response:', error);
  }
}

/**
 * Get cached API response
 */
export async function getCachedApiResponse(url: string): Promise<Response | null> {
  if (!('caches' in window)) return null;

  try {
    const cache = await caches.open(API_CACHE);
    const response = await cache.match(url);
    return response || null;
  } catch (error) {
    console.error('Error getting cached response:', error);
    return null;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  if (!('caches' in window) || !('storage' in navigator)) return 0;

  try {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Prefetch critical resources
 */
export async function prefetchResources(urls: string[]): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
  } catch (error) {
    console.error('Error prefetching resources:', error);
  }
}

/**
 * Background sync for offline actions
 */
interface SyncAction {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

const SYNC_STORE_KEY = 'rabit-sync-queue';

export function queueSyncAction(action: Omit<SyncAction, 'id' | 'timestamp'>): void {
  const queue = getSyncQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(queue));

  // Register background sync if supported
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
        .sync.register('sync-actions');
    });
  }
}

export function getSyncQueue(): SyncAction[] {
  try {
    const data = localStorage.getItem(SYNC_STORE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_STORE_KEY);
}

export async function processSyncQueue(): Promise<void> {
  if (!isOnline()) return;

  const queue = getSyncQueue();
  const failedActions: SyncAction[] = [];

  for (const action of queue) {
    try {
      // Process each action based on type
      await processSyncAction(action);
    } catch (error) {
      console.error('Error processing sync action:', error);
      failedActions.push(action);
    }
  }

  // Save failed actions back to queue
  localStorage.setItem(SYNC_STORE_KEY, JSON.stringify(failedActions));
}

async function processSyncAction(action: SyncAction): Promise<void> {
  // Implement based on action type
  switch (action.type) {
    case 'create':
    case 'update':
    case 'delete':
      // Send to API
      console.log('Processing sync action:', action);
      break;
    default:
      console.warn('Unknown sync action type:', action.type);
  }
}

/**
 * Listen for service worker updates
 */
export function listenForUpdates(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('sw-update-available', handler);
  return () => window.removeEventListener('sw-update-available', handler);
}

/**
 * Skip waiting and reload
 */
export async function updateAndReload(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

export {
  CACHE_NAME,
  STATIC_CACHE,
  DYNAMIC_CACHE,
  API_CACHE,
  STATIC_ASSETS,
  CACHEABLE_API_ROUTES,
};
