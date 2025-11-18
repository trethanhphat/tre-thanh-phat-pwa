// ✅ File: src/hooks/useServiceWorkerUpdate.ts

'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => {
            console.log(
              '[src/hooks/useServiceWorkerUpdate.ts] ✅ Service Worker registered:',
              reg.scope
            );

            // Khi có bản cập nhật mới
            reg.onupdatefound = () => {
              const newWorker = reg.installing;
              if (!newWorker) return;

              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log(
                    '[src/hooks/useServiceWorkerUpdate.ts] 🔄 New SW waiting → sending SKIP_WAITING'
                  );
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              };
            };
          })
          .catch(err => {
            console.error(
              '[src/hooks/useServiceWorkerUpdate.ts] ❌ Service Worker registration failed:',
              err
            );
          });

        // Khi SW mới đã được activate, reload để sử dụng bản mới
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log(
            '[src/hooks/useServiceWorkerUpdate.ts] 🔁 New Service Worker activated → Reloading...'
          );
          window.location.reload();
        });
      });
    }
  }, []);

  return null;
}
