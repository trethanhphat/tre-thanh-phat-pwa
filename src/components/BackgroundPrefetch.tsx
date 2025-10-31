// ✅ File: src/components/BackgroundPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
import { prefetchProductsOnce } from '@/services/productsPrefetch';
import { syncBatchesByPrefix } from '@/repositories/batchRepository';

export default function BackgroundPrefetch() {
  useEffect(() => {
    console.log('[BackgroundPrefetch] ⏱ useEffect() triggered');

    const run = async (reason = 'initial') => {
      console.log(`[BackgroundPrefetch] 🚀 run() start — reason: ${reason}`);

      console.log('[BackgroundPrefetch] 🌍 navigator.onLine =', navigator.onLine);
      if (!navigator.onLine) {
        console.log('[BackgroundPrefetch] ❌ Offline — skip prefetch');
        return;
      }

      try {
        console.log('[BackgroundPrefetch] 🌐 Online detected, start prefetch');

        const tasks: Promise<void>[] = [];

        // --- News ---
        if (typeof prefetchNewsOnce === 'function') {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 📰 prefetchNewsOnce() start');
              await prefetchNewsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchNewsOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ⚠️ prefetchNewsOnce not defined');
        }

        // --- Products ---
        if (typeof prefetchProductsOnce === 'function') {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛍️ prefetchProductsOnce() start');
              await prefetchProductsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchProductsOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ⚠️ prefetchProductsOnce not defined');
        }

        await Promise.all(tasks);
        console.log('[BackgroundPrefetch] ✅ All prefetch tasks completed');

        // --- QR Prefix ---
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

    // Run immediately
    run('initial');

    // Retry when online again
    window.addEventListener('online', () => run('online event'));

    // Khi app được cài PWA lên home screen → event 'appinstalled'
    const onInstalled = () => {
      console.log('[BackgroundPrefetch] 🧩 App installed → force prefetch news');
      prefetchNewsOnce(true).catch(err =>
        console.warn('[BackgroundPrefetch] prefetchNewsOnce(true) error', err)
      );
    };

    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', () => run('online event'));
    };
  }, []);

  return null;
}
