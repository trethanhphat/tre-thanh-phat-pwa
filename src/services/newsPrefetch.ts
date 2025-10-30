// ✅ File: src/services/newsPrefetch.ts
import { fetchAndSyncNewsFromAPI } from '@/repositories/newsRepository';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';

const PREFETCH_KEY = 'ttp_prefetch_news_v1';
const PREFETCH_INTERVAL = 4 * 60 * 60 * 1000; // 4 giờ

function goodConnection(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return navigator.onLine;
  // Ưu tiên wifi hoặc downlink đủ tốt
  return navigator.onLine && (conn.effectiveType === 'wifi' || conn.downlink > 2);
}

function shouldPrefetch(force = false): boolean {
  if (!force && !goodConnection()) return false;
  const last = Number(localStorage.getItem(PREFETCH_KEY) || 0);
  return force || Date.now() - last > PREFETCH_INTERVAL;
}

/**
 * Prefetch news once:
 * - Lấy 10 tin mới nhất từ API + sync vào IndexedDB
 * - Prefetch ảnh top 10
 * - Ghi last-run timestamp (localStorage)
 */
export async function prefetchNewsOnce(force = false) {
  if (!shouldPrefetch(force)) return;

  // Random small delay để tránh dồn request
  const jitter = Math.random() * 3000;
  await new Promise(res => setTimeout(res, jitter));

  try {
    const { items } = await fetchAndSyncNewsFromAPI(10);
    if (items?.length) {
      // Prefetch ảnh top10
      const imgs = items.map(i => i.image_url).filter(Boolean) as string[];
      await Promise.all(imgs.slice(0, 10).map(url => ensureNewsImageCachedByUrl(url)));
    }
    localStorage.setItem(PREFETCH_KEY, Date.now().toString());
    console.log('[newsPrefetch] Prefetch news done');
  } catch (err) {
    console.warn('[newsPrefetch] error', err);
  }
}
