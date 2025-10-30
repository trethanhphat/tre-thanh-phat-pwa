// ✅ File: src/components/BackgroundPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
import { prefetchProductsOnce } from '@/services/productsPrefetch'; // nếu bạn có tương tự cho products, optional
import { syncBatchesByPrefix } from '@/repositories/batchRepository';

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = async () => {
      if (!navigator.onLine) return;

      try {
        // Prefetch chung: news + products (productsPrefetch optional)
        await Promise.all([
          prefetchNewsOnce(),
          typeof prefetchProductsOnce === 'function' ? prefetchProductsOnce() : Promise.resolve(),
        ]);

        // Detect QR prefix (format: 2 + 3 + 2 = 7 ký tự)
        const href = window.location.href;
        const match = href.match(/[A-Z0-9]{2}[A-Z0-9]{3}(?:[A-Z0-9]{2})?/);
        if (match) {
          const prefix = match[0];
          console.log('[BackgroundPrefetch] detected prefix', prefix);
          // nếu repo có hàm đồng bộ theo prefix
          if (typeof syncBatchesByPrefix === 'function') {
            await syncBatchesByPrefix(prefix);
          }
        }
      } catch (err) {
        console.warn('[BackgroundPrefetch] error', err);
      }
    };

    // chạy khi mount (nếu online)
    run();

    // khi app được cài lên homescreen -> event 'appinstalled' trigger, rerun forced
    const onInstalled = () => {
      console.log('[BackgroundPrefetch] appinstalled -> force prefetch');
      prefetchNewsOnce(true).catch(() => {});
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  return null;
}
