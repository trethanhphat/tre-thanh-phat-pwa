// ✅ File: src/lib/ensureImageCachedByUrl.ts
// 🧩 Tách từ hook useImageCacheTracker.ts
// 🧩 Dùng chung cho cả News, Products, hoặc module khác.
// 🧩 Có fallback về STORE_IMAGES nếu type không hợp lệ.
//
// 🧩 Các thay đổi so với bản trong hook:
//    - Đổi sang hàm thuần, không phụ thuộc React hook.
//    - Cho phép truyền type ('news' | 'product' | 'generic').
//    - Có tham số autoUpdate (để sau này dùng trong sync thủ công).
//    - Hash blob và so sánh hash/etag, fallback sau 7 ngày nếu thiếu meta.
//

import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

/** 🔹 Cấu hình bảng lưu ảnh */
const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

/** 🔹 Thông tin ảnh cache */
export interface CachedImage {
  url: string;
  blob?: Blob;
  hash?: string;
  etag?: string;
  lastFetched?: string;
}

/** 🔹 Tính SHA-256 hash từ Blob */
export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** 🔹 Lấy hash meta từ Edge API (nếu có) */
export async function fetchImageMeta(
  url: string
): Promise<{ hash?: string; etag?: string } | null> {
  try {
    const res = await fetch(`/api/image-meta?url=${encodeURIComponent(url)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[ensureImageCachedByUrl] ⚠️ fetchImageMeta failed:', err);
    return null;
  }
}

/** ✅ Đảm bảo ảnh được cache (nếu chưa có hoặc đã thay đổi) */
export async function ensureImageCachedByUrl(
  url: string,
  type: keyof typeof STORE_MAP = 'generic',
  options?: { forceUpdate?: boolean }
): Promise<string | null> {
  if (!url) return null;

  try {
    const storeName = STORE_MAP[type] || STORE_IMAGES;
    const db = await initDB();
    const store = db.transaction(storeName, 'readwrite').store;

    // 🔹 Key là URL trực tiếp (đã có hash URL làm key trong DB)
    const existing = (await store.get(url)) as CachedImage | undefined;

    // 🔹 Lấy meta hash/etag từ Edge
    const meta = await fetchImageMeta(url);
    const remoteHash = meta?.hash;
    const remoteEtag = meta?.etag;

    // 🔹 Nếu có meta & cache trùng → dùng cache cũ
    if (
      existing &&
      !options?.forceUpdate &&
      ((remoteHash && existing.hash === remoteHash) || (remoteEtag && existing.etag === remoteEtag))
    ) {
      return URL.createObjectURL(existing.blob!);
    }

    // 🔹 Nếu không có meta → fallback: kiểm tra tuổi cache (>7 ngày)
    if (!meta && existing?.lastFetched) {
      const ageDays =
        (Date.now() - new Date(existing.lastFetched).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays <= 7 && !options?.forceUpdate) {
        return URL.createObjectURL(existing.blob!);
      }
    }

    // 🔹 Tải blob mới
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const hash = await hashBlob(blob);

    // 🔹 Nếu hash trùng cache cũ → giữ nguyên
    if (!options?.forceUpdate && existing?.hash === hash) {
      return URL.createObjectURL(existing.blob!);
    }

    // 🔹 Lưu mới vào IndexedDB
    const updated: CachedImage = {
      url,
      blob,
      hash,
      etag: remoteEtag || res.headers.get('ETag') || undefined,
      lastFetched: new Date().toISOString(),
    };
    await store.put(updated, url);

    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('[ensureImageCachedByUrl] ⚠️ ensureImageCachedByUrl failed:', err);
    return null;
  }
}
