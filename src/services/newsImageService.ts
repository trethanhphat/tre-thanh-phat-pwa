// ✅ File: src/services/newsImageService.ts
import { initDB, STORE_NEWS_IMAGES } from '@/lib/db';

/** ⏱ TTL cache tối đa (4 giờ) cho ảnh tin tức */
const CACHE_TTL = 4 * 60 * 60 * 1000;

/** ✅ Hàm hash url */
async function hashUrl(text: string): Promise<string> {
  const url = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', url);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** ✅ Hash nội dung blob */
async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** ✅ API proxy fallback */
function withProxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/** ✅ Fetch ảnh kèm ETag */
async function fetchBlobWithEtag(url: string): Promise<{ blob: Blob; etag?: string } | null> {
  try {
    console.log('[newsImageService] 🔎 try fetch:', url);
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const etagFromHeader = res.headers.get('ETag') ?? undefined;
    console.log('[newsImageService] 🛰️ server response headers:', { etagFromHeader });
    const blob = await res.blob();

    if (!blob.size) throw new Error('Blob empty');
    const etag = etagFromHeader;
    return { blob, etag };
  } catch (err) {
    console.warn('[newsImageService] ❌ fetch error', url, err);
    return null;
  }
}

const inFlight = new Map<string, Promise<any>>(); // chống tải/ghi trùng

/** ✅ Lưu/cập nhật ảnh tin tức (với kiểm tra etag + blob_hash) */
export async function saveNewsImageIfNotExists(url: string) {
  if (!url) return;
  const db = await initDB();
  const key = await hashUrl(url);
  const existing = await db.get(STORE_NEWS_IMAGES, key);

  // TTL check: nếu còn hạn → bỏ qua
  if (existing && Date.now() - existing.updated_at < CACHE_TTL) {
    return;
  }

  let result = await fetchBlobWithEtag(url);
  if (!result) result = await fetchBlobWithEtag(withProxy(url));
  if (!result) return;

  const { blob, etag } = result;
  const blob_hash = await hashBlob(blob);
  const updated_at = Date.now();

  // 🟢 Đã đổi sang phương án mới:
  // Chỉ cập nhật nếu ETag hoặc blob_hash thay đổi
  if (existing) {
    const sameEtag = etag && etag === existing.etag;
    const sameBlob = blob_hash === existing.blob_hash;

    if (sameEtag || sameBlob) {
      console.log(`[newsImageService] ⚡ Skip unchanged image: ${url}`);
      return;
    }
  } else {
    // 🧩 Nếu chưa có record cùng key → kiểm tra xem blob này đã tồn tại ở key khác chưa
    const allRecords = await db.getAll(STORE_NEWS_IMAGES);
    const duplicate = allRecords.find(r => r.blob_hash === blob_hash);
    if (duplicate) {
      // ✅ Tạo alias cho key mới nhưng dùng lại blob cũ
      await db.put(STORE_NEWS_IMAGES, {
        key,
        source_url: url,
        blob: duplicate.blob,
        etag: duplicate.etag,
        blob_hash,
        updated_at: Date.now(),
      });
      console.log(`[newsImageService] 🔁 Linked duplicate key to existing blob`, {
        url,
        existingKey: duplicate.key,
      });
      return;
    }
  }

  // 💾 Lưu mới hoặc cập nhật
  await db.put(STORE_NEWS_IMAGES, {
    key,
    source_url: url,
    blob,
    etag,
    blob_hash,
    updated_at,
  });

  console.log(`[newsImageService] 💾 Cached news image ${url}`, {
    key: key,
    source_url: url,
    blob_hash,
    etag,
    updated_at,
    size: blob.size,
  });
}
/** ✅ Offline-first lấy ảnh → nếu có blob thì hiển thị ngay */
export const getNewsImageURL = async (url: string) => {
  if (!url) return '';
  const db = await initDB();
  const key = await hashUrl(url);
  const record = await db.get(STORE_NEWS_IMAGES, key);

  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }

  // 🔹 Nếu chưa có blob → thử online trước
  return withProxy(url);
};

/** ✅ Prefetch một số ảnh nổi bật */
export async function prefetchNewsImages(urls: string[]) {
  if (!urls?.length) return;

  const conn = (navigator as any).connection;
  if (conn?.saveData) return;

  for (const url of urls.slice(0, 5)) {
    console.log('[newsImageServices] 🚀 Prefetch news image:', url);
    await saveNewsImageIfNotExists(url);
  }
}

/** ✅ Đảm bảo cache trước khi hiển thị */
export async function ensureNewsImageCachedByUrl(url: string) {
  try {
    await saveNewsImageIfNotExists(url);
  } catch (err) {
    console.warn('[newsImageService] ⚠️ Cache error:', url, err);
  }
}
