// ✅ File: src/lib/news_images.ts
import { initDB, STORE_NEWS_IMAGES } from './db';
import { waitForImageLoadThenFetchBlob } from './image_helpers';

/** TTL cache (ms) – ví dụ 30 ngày */
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

/** ✅ Helper thêm proxy */
function withProxy(url: string): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.includes('/api/news/image-proxy')) return url;
  return `/api/news/image-proxy?url=${encodeURIComponent(url)}`;
}

/** Tính SHA-256 cho chuỗi, trả về hex (64 ký tự). */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Xóa các ảnh quá hạn trong cache */
async function cleanupOldImages(db: IDBDatabase) {
  const tx = (db as any).transaction(STORE_NEWS_IMAGES, 'readwrite');
  const store = tx.objectStore(STORE_NEWS_IMAGES);
  const now = Date.now();
  const index = store.index('updated_at');
  const req = index.openCursor();
  req.onsuccess = () => {
    const cursor = req.result;
    if (!cursor) return;
    const rec = cursor.value;
    if (now - rec.updated_at > CACHE_TTL) {
      store.delete(rec.key);
    }
    cursor.continue();
  };
}

/** Tải ảnh (qua proxy) và lưu blob vào IDB với key = sha256(url). */
export async function saveNewsImageByUrl(url: string): Promise<string | null> {
  if (!url) return null;
  const key = await sha256Hex(url);
  const db = await initDB();

  const exists = await db.get(STORE_NEWS_IMAGES, key);
  if (exists?.blob instanceof Blob && Date.now() - exists.updated_at < CACHE_TTL) {
    console.log(`🗂 [NEWS_IMG] Cache hit: ${url}`);
    return key;
  }

  try {
    // ✅ Ưu tiên tải trực tiếp
    console.log(`🧩 [NEWS_IMG] Try direct fetch:`, url);
    let blob = await waitForImageLoadThenFetchBlob(url);

    // 🔁 Nếu lỗi do CORS hoặc fetch fail → fallback sang proxy
    if (!blob) {
      const proxyUrl = withProxy(url);
      console.warn(`↻ [NEWS_IMG] Direct fetch failed, retry via proxy:`, proxyUrl);
      blob = await waitForImageLoadThenFetchBlob(proxyUrl);
    }

    if (!blob) {
      console.error(`❌ [NEWS_IMG] Both direct & proxy fetch failed for:`, url);
      return null;
    }

    console.log(`✅ [NEWS_IMG] Blob OK (${blob.size} bytes):`, url);

    await db.put(STORE_NEWS_IMAGES, {
      key,
      source_url: url,
      blob,
      updated_at: Date.now(),
    });
    cleanupOldImages(db as any);
    console.log(`💾 [NEWS_IMG] Saved blob in IndexedDB:`, key);
    return key;
  } catch {
    console.error(`🔥 [NEWS_IMG] Unexpected error for ${url}:`, err);
    return null;
  }
}

/** Trả URL hiển thị: blob: nếu cache, nếu chưa thì qua proxy. */
export async function getNewsImageURLByUrl(url?: string): Promise<string> {
  if (!url) return '';
  const key = await sha256Hex(url);
  const db = await initDB();
  const rec = await db.get(STORE_NEWS_IMAGES, key);
  if (rec?.blob instanceof Blob) {
    return URL.createObjectURL(rec.blob);
  }
  return withProxy(url);
}

/** Đảm bảo có cache ảnh (không chặn UI). */
export async function ensureNewsImageCachedByUrl(url?: string): Promise<void> {
  if (!url) return;
  try {
    await saveNewsImageByUrl(url);
  } catch {
    // silent
  }
}
