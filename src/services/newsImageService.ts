// ✅ File: src/services/newsImageService.ts
import { initDB, STORE_NEWS_IMAGES } from '@/lib/db';

const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

/** ✅ Tạo key hash từ URL (SHA-256 hex) */
async function sha256Hex(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** ✅ API proxy fallback URL */
function withProxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/** ✅ Fetch ảnh → kèm lấy ETag nếu có */
async function fetchBlobWithEtag(url: string): Promise<{ blob: Blob; etag?: string } | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    if (blob.size === 0) throw new Error('Blob empty');
    const etag = res.headers.get('ETag') ?? undefined;
    return { blob, etag };
  } catch (err) {
    console.warn('[newsImageService] ⚠️ fetch error:', url, err);
    return null;
  }
}

/**
 * 🔹 Lưu/cập nhật ảnh news (key = sha256(originalUrl))
 * @param originalUrl URL gốc dùng làm key trong DB
 * @param fetchUrl optional - URL dùng để fetch (ví dụ proxy)
 * @returns key (sha256 hex) khi thành công, hoặc null khi fail
 */
export async function saveNewsImageIfNotExists(
  originalUrl: string,
  fetchUrl?: string
): Promise<string | null> {
  if (!originalUrl) return null;
  const db = await initDB();
  const key = await sha256Hex(originalUrl);

  const existing = await db.get(STORE_NEWS_IMAGES, key);
  if (existing && Date.now() - existing.updated_at < CACHE_TTL) {
    return key; // ✅ cache còn hạn
  }

  // 🆕 ✅ Danh sách URL thử lần lượt: fetchUrl (nếu có) → originalUrl → proxy fallback
  const fallbackProxy = withProxy(originalUrl);
  const targets = fetchUrl ? [fetchUrl, originalUrl, fallbackProxy] : [originalUrl, fallbackProxy];

  let result: Awaited<ReturnType<typeof fetchBlobWithEtag>> = null;

  /** 🔹 Tính SHA-256 hex từ Blob (để phát hiện ảnh đổi nội dung) */
  async function sha256Blob(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  for (const t of targets) {
    console.log('[newsImageService] 🔎 try fetch:', t);
    result = await fetchBlobWithEtag(t);
    if (result) {
      if (t === fallbackProxy)
        console.log('[newsImageService] ✅ fetched via proxy fallback:', originalUrl);
      break;
    }
  }

  if (!result) {
    console.warn('[newsImageService] ❌ All fetch attempts failed for', originalUrl);
    return null;
  }

  const { blob, etag } = result;
  const updated_at = Date.now();

  // 🔹 Tính hash nội dung blob
  const blobHash = await sha256Blob(blob);

  await db.put(STORE_NEWS_IMAGES, {
    key, // hash của URL (định danh)
    source_url: originalUrl,
    blob,
    etag,
    updated_at,
    blob_hash: blobHash, // ✅ thêm hash nội dung ảnh
    size: blob.size, // (tùy chọn, giúp debug)
  });

  console.log('[newsImageService] 💾 Cached news image', originalUrl, {
    key,
    blob_hash: blobHash,
    size: blob.size,
  });

  const viaProxy =
    result && targets.includes(withProxy(originalUrl)) && result !== null && result !== undefined;
  console.log(`[newsImageService] 💾 Cached ${viaProxy ? 'via proxy' : 'direct'}:`, originalUrl);
  return key;
}

/** ✅ Offline-first lấy ảnh → ưu tiên blob, fallback qua proxy */
export async function getNewsImageURLByUrl(url?: string): Promise<string> {
  if (!url) return '';
  const db = await initDB();
  const key = await sha256Hex(url);
  const rec = await db.get(STORE_NEWS_IMAGES, key);
  if (rec?.blob) {
    console.debug('[newsImageService] 🎯 blob hit:', url);
    return URL.createObjectURL(rec.blob);
  }
  console.debug('[newsImageService] 📡 blob miss → use proxy:', url);
  return withProxy(url);
}

/** Prefetch nhiều ảnh news (top N) */
export async function prefetchNewsImages(urls: string[]) {
  if (!urls?.length) return;
  const conn = (navigator as any).connection;
  if (conn?.saveData) return;
  for (const url of urls.slice(0, 10)) {
    try {
      await saveNewsImageIfNotExists(url);
    } catch (err) {
      console.warn('[newsImageService] prefetch image error', url, err);
    }
  }
}

/** Ensure cache (non-blocking) */
export async function ensureNewsImageCachedByUrl(
  originalUrl?: string,
  fetchUrl?: string
): Promise<string | null> {
  if (!originalUrl) return null;
  try {
    const key = await saveNewsImageIfNotExists(originalUrl, fetchUrl);
    return key;
  } catch (err) {
    console.warn('[newsImageService] ensure cache error', originalUrl, err);
    return null;
  }
}
