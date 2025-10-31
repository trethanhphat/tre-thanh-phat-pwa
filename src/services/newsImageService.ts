// ✅ File: src/services/newsImageService.ts
import { initDB, STORE_NEWS_IMAGES } from '@/lib/db';

/** TTL cache (ms) – 30 ngày */
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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    if (blob.size === 0) throw new Error('Blob empty');
    const etag = res.headers.get('ETag') ?? undefined;
    return { blob, etag };
  } catch (err) {
    // không throw để còn thử fallback
    console.warn('[newsImageService] fetch error', url, err);
    return null;
  }
}

/**
 * 🔹 Lưu/cập nhật ảnh news (key = sha256(originalUrl))
 * @param originalUrl URL gốc dùng làm key trong DB (bắt buộc)
 * @param fetchUrl optional - URL dùng để fetch (ví dụ proxy). Nếu cung cấp, sẽ thử fetch fetchUrl trước rồi mới fetch originalUrl
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
    // vẫn còn hạn
    return key;
  }

  // Thử fetch theo thứ tự: fetchUrl (proxy) nếu có -> originalUrl
  const targets = fetchUrl ? [fetchUrl, originalUrl] : [originalUrl];

  let result: { blob: Blob; etag?: string } | null = null;

  for (const t of targets) {
    result = await fetchBlobWithEtag(t);
    if (result) break;
  }

  if (!result) return null;

  const { blob, etag } = result;
  const updated_at = Date.now();

  await db.put(STORE_NEWS_IMAGES, {
    key,
    source_url: originalUrl, // lưu URL gốc để debug/lookup
    blob,
    etag,
    updated_at,
  });

  // Không cần trả về blob URL — caller có thể gọi getNewsImageURLByUrl
  console.log('[newsImageService] Cached news image', originalUrl);
  return key;
}

/** ✅ Offline-first lấy ảnh → nếu có blob thì trả blob URL (objectURL), nếu chưa có trả proxy URL */
/** ✅ Offline-first lấy ảnh → ưu tiên blob, fallback qua proxy */
export async function getNewsImageURLByUrl(url?: string): Promise<string> {
  if (!url) return '';
  const db = await initDB();
  const key = await sha256Hex(url);
  const rec = await db.get(STORE_NEWS_IMAGES, key);
  if (rec?.blob) {
    // ✅ Có blob → tạo object URL
    const objUrl = URL.createObjectURL(rec.blob);
    // Giữ 1 log nhẹ để debug (có thể bỏ)
    console.debug('[newsImageService] blob hit:', url);
    return objUrl;
  }
  console.debug('[newsImageService] blob miss, fallback proxy:', url);
  return withProxy(url);
}

/** Prefetch nhiều ảnh news (top N) */
export async function prefetchNewsImages(urls: string[]) {
  if (!urls?.length) return;
  const conn = (navigator as any).connection;
  if (conn?.saveData) return; // bỏ qua nếu user tiết kiệm dữ liệu

  for (const url of urls.slice(0, 10)) {
    try {
      await saveNewsImageIfNotExists(url);
    } catch (err) {
      console.warn('[newsImageService] prefetch image error', url, err);
    }
  }
}

/** Ensure cache (không block UI). Trả về key khi thành công hoặc null khi fail */
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
