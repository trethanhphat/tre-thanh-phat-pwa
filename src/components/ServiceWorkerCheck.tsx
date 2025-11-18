// ✅ File: src/components/ServiceWorkerCheck.tsx

'use client';

import { useEffect } from 'react';

export default function ServiceWorkerCheck() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          console.log(
            '[src/components/ServiceWorkerCheck.tsx] ✅ Service Worker is active:',
            reg.active?.scriptURL
          );
        })
        .catch(err => {
          console.error(
            '[src/components/ServiceWorkerCheck.tsx] ❌ Service Worker not ready:',
            err
          );
        });
    } else {
      console.warn(
        '[src/components/ServiceWorkerCheck.tsx] ⚠️ Service Worker not supported in this browser.'
      );
    }
  }, []);

  return null;
}
