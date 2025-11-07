// ✅ File: src/services/newsPrefetch.ts
import { initDB, STORE_IMAGES } from '@/lib/db';
import { fetchAndSyncNewsFromAPI } from '@/repositories/newsRepository';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';

const PREFETCH_KEY = 'lastPrefetchNews';
const PREFETCH_INTERVAL = 4 * 60 * 60 * 1000; // 4 giờ

function goodConnection(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return navigator.onLine;
  return navigator.onLine && (conn.effectiveType === 'wifi' || conn.downlink > 2);
}

function shouldPrefetch(force = false): boolean {
  if (!force && !goodConnection()) {
    console.log('[newsPrefetch] ⚠️ Skip — poor connection');
    return false;
  }
  const last = Number(localStorage.getItem(PREFETCH_KEY) || 0);
  const should = force || Date.now() - last > PREFETCH_INTERVAL;
  console.log('[newsPrefetch] ⏱ shouldPrefetch =', should, { force, last });
  return should;
}

/**
 * Prefetch news once:
 * - Lấy 10 tin mới nhất từ API + sync vào IndexedDB
 * - Prefetch ảnh top 10
 * - Ghi last-run timestamp (localStorage)
 */
export async function prefetchNewsOnce(force = false) {
  if (!shouldPrefetch(force)) return;

  const jitter = Math.random() * 3000;
  await new Promise(res => setTimeout(res, jitter));

  try {
    console.log('[newsPrefetch] 🚀 Fetching news...');
    const items = await fetchAndSyncNewsFromAPI(10);
    console.log('[newsPrefetch] 📦 Received items:', items?.length ?? 0);

    if (items?.length > 0) {
      const imgs = items.map(i => i.image_url).filter(Boolean) as string[];
      console.log('[newsPrefetch] 🖼️ Start Prefetching images:', imgs.length);
      await Promise.all(imgs.slice(0, 10).map(url => ensureNewsImageCachedByUrl(url)));
    } else {
      console.warn('[newsPrefetch] ⚠️ No news fetched or synced');
    }

    localStorage.setItem(PREFETCH_KEY, Date.now().toString());
    console.log('[newsPrefetch] ✅ Prefetch completed');
  } catch (err) {
    console.warn('[newsPrefetch] ❌ Error during prefetch', err);
  }
}
