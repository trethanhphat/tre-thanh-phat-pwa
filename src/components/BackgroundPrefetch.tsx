// ✅ File: src/components/BackgroundPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { hasNewsInDB } from '@/repositories/newsRepository';
import { hasProductsInDB } from '@/repositories/productsRepository';
import { hasBatchesInDB } from '@/repositories/batchesRepository';
import { prefetchNewsOnce } from '@/services/newsPrefetch';
import { prefetchProductsOnce } from '@/services/productsPrefetch';
import { prefetchBatchesOnce } from '@/services/batchesPrefetch'; // ⬅️ thêm
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

      // ⬇️ kiểm tra DB cục bộ
      const newsReady = await hasNewsInDB();
      const productsReady = await hasProductsInDB();
      const batchesReady = await hasBatchesInDB();

      // ✅ chỉ prefetch nếu chưa từng chạy hoặc đã hơn 24h
      const canSkipByTTL = lastPrefetch && now - parseInt(lastPrefetch) < oneDay;
      if (canSkipByTTL && productsReady && batchesReady) {
        console.log('[BackgroundPrefetch] ⏸️ Skip — last prefetch within 24h (DB ready)');
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

        // ⬇️ Prefetch News nếu DB còn trống (bỏ qua TTL)
        if (!newsReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛒 prefetchNewsOnce() start');
              await prefetchNewsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchNewsOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Products DB ready — skip prefetch');
        }

        // ⬇️ Prefetch Products nếu DB còn trống (bỏ qua TTL)
        if (!productsReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 🛒 prefetchProductsOnce() start');
              await prefetchProductsOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchProductsOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Products DB ready — skip prefetch');
        }

        // ⬇️ Prefetch Batches (Google Sheet → IndexedDB) nếu DB còn trống (bỏ qua TTL)
        if (!batchesReady || !canSkipByTTL) {
          tasks.push(
            (async () => {
              console.log('[BackgroundPrefetch] 📦 prefetchBatchesOnce() start');
              await prefetchBatchesOnce();
              console.log('[BackgroundPrefetch] ✅ prefetchBatchesOnce() done');
            })()
          );
        } else {
          console.log('[BackgroundPrefetch] ℹ️ Batches DB ready — skip prefetch');
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

    // ⬇️ khi app được cài (PWA), force prefetch cả news + products + batches
    const onInstalled = () => {
      console.log('[BackgroundPrefetch] 🧪 App installed → force prefetch all');
      Promise.all([
        prefetchNewsOnce(true),
        prefetchProductsOnce(true),
        prefetchBatchesOnce(true),
      ]).catch(err => console.warn('[BackgroundPrefetch] force prefetch error', err));
    };

    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  return null;
}
