// ✅ File: src/components/ServiceWorkerCheck.tsx

'use client';

import { useEffect } from 'react';

export default function ServiceWorkerCheck() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          console.log('[PWA] ✅ Service Worker is active:', reg.active?.scriptURL);
        })
        .catch(err => {
          console.error('[PWA] ❌ Service Worker not ready:', err);
        });
    } else {
      console.warn('[PWA] ⚠️ Service Worker not supported in this browser.');
    }
  }, []);

  return null;
}
