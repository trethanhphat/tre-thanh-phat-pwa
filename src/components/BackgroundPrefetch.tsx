// ✅ File: src/components/BackgroundPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
import { prefetchProductsOnce } from '@/services/productsPrefetch'; // nếu bạn có tương tự cho products
import { syncBatchesByPrefix } from '@/repositories/batchRepository';

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = async () => {
      console.log('[BackgroundPrefetch] 🚀 run() start');

      if (!navigator.onLine) {
        console.log('[BackgroundPrefetch] ❌ Offline — skip prefetch');
        return;
      }

      try {
        console.log('[BackgroundPrefetch] 🌐 Online detected, start prefetch');

        const tasks = [
          (async () => {
            console.log('[BackgroundPrefetch] 📰 prefetchNewsOnce() start');
            await prefetchNewsOnce();
            console.log('[BackgroundPrefetch] ✅ prefetchNewsOnce() done');
          })(),
        ];

        if (typeof prefetchProductsOnce === 'function') {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛍️ prefetchProductsOnce() start');
              await prefetchProductsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchProductsOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ⚠️ prefetchProductsOnce not defined, skipped');
        }

        await Promise.all(tasks);
        console.log('[BackgroundPrefetch] ✅ All prefetch tasks completed');

        // Detect QR prefix (ví dụ: 2+3+2 = 7 ký tự, như "AB123CD")
        const href = window.location.href;
        const match = href.match(/[A-Z0-9]{2}[A-Z0-9]{3}(?:[A-Z0-9]{2})?/);
        if (match) {
          const prefix = match[0];
          console.log('[BackgroundPrefetch] 🔍 Detected QR prefix:', prefix);

          if (typeof syncBatchesByPrefix === 'function') {
            console.log('[BackgroundPrefetch] 🔄 syncBatchesByPrefix() start');
            await syncBatchesByPrefix(prefix);
            console.log('[BackgroundPrefetch] ✅ syncBatchesByPrefix() done');
          } else {
            console.log('[BackgroundPrefetch] ⚠️ syncBatchesByPrefix not available');
          }
        } else {
          console.log('[BackgroundPrefetch] ℹ️ No QR prefix found in URL:', href);
        }
      } catch (err) {
        console.warn('[BackgroundPrefetch] ❌ Error during prefetch', err);
      }
    };

    // Chạy khi component mount (nếu online)
    console.log('[BackgroundPrefetch] ⏱ useEffect() triggered');
    run();

    // Khi app được cài PWA lên home screen → event 'appinstalled'
    const onInstalled = () => {
      console.log('[BackgroundPrefetch] 🧩 App installed → force prefetch news');
      prefetchNewsOnce(true).catch(err =>
        console.warn('[BackgroundPrefetch] prefetchNewsOnce(true) error', err)
      );
    };

    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  return null;
}
