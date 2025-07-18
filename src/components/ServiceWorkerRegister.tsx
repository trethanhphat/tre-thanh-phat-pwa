// ✅ File: src/components/ServiceWorkerRegister.tsx

'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => {
            console.log('[PWA] ✅ Service Worker registered:', reg.scope);

            // Khi có bản cập nhật mới
            reg.onupdatefound = () => {
              const newWorker = reg.installing;
              if (!newWorker) return;

              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] 🔄 New SW waiting → sending SKIP_WAITING');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              };
            };
          })
          .catch(err => {
            console.error('[PWA] ❌ Service Worker registration failed:', err);
          });

        // Khi SW mới đã được activate, reload để sử dụng bản mới
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] 🔁 New Service Worker activated → Reloading...');
          window.location.reload();
        });
      });
    }
  }, []);

  return null;
}
