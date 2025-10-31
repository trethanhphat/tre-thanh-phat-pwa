// ✅ File: src/components/BackgroundPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
import { prefetchProductsOnce } from '@/services/productsPrefetch';
import { syncBatchesByPrefix } from '@/repositories/batchesRepository';

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = async () => {
      console.log('[BackgroundPrefetch] 🚀 run() start');

      if (!navigator.onLine) {
        console.log('[BackgroundPrefetch] ❌ Offline — skip prefetch');
        return;
      }

      const lastPrefetch = localStorage.getItem('lastPrefetch');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // ✅ chỉ prefetch nếu chưa từng chạy hoặc đã hơn 24h
      if (lastPrefetch && now - parseInt(lastPrefetch) < oneDay) {
        console.log('[BackgroundPrefetch] ⏸️ Skip — last prefetch within 24h');
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
        localStorage.setItem('lastPrefetch', now.toString());
        console.log('[BackgroundPrefetch] ✅ All prefetch tasks completed');

        // Detect QR prefix
        const href = window.location.href;
        const match = href.match(/[A-Z0-9]{2}[A-Z0-9]{3}(?:[A-Z0-9]{2})?/);
        if (match) {
          const prefix = match[0];
          console.log('[BackgroundPrefetch] 🔍 Detected QR prefix:', prefix);

          if (typeof syncBatchesByPrefix === 'function') {
            console.log('[BackgroundPrefetch] 🔄 syncBatchesByPrefix() start');
            await syncBatchesByPrefix(prefix);
            console.log('[BackgroundPrefetch] ✅ syncBatchesByPrefix() done');
          }
        } else {
          console.log('[BackgroundPrefetch] ℹ️ No QR prefix found in URL:', href);
        }
      } catch (err) {
        console.warn('[BackgroundPrefetch] ❌ Error during prefetch', err);
      }
    };

    console.log('[BackgroundPrefetch] ⏱ useEffect() triggered');
    run();

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
