// ✅ File: src/hooks/useImageCacheTracker.ts
// =============================================================
// 📜 Ghi chú tính năng cũ:
//   - Theo dõi cache ảnh riêng cho từng nhóm (news / products / generic).
//   - Lưu blob + etag vào IndexedDB, tránh tải lại khi ảnh không đổi.
//   - Nếu không có etag từ server thì không phát hiện được thay đổi.
//   - Không có fallback nếu type sai → lỗi transaction.
//   - Cơ chế autoSync chưa thực sự dùng.
//
// 🧩 Đã đổi sang phương án mới như sau:
//   ✅ Giữ nguyên cơ chế IndexedDB, nhóm store theo từng loại.
//   ✅ Thêm hash(blob) SHA-256 để kiểm tra thay đổi nội dung khi không có ETag.
//   ✅ Giữ `generic` store (STORE_IMAGES) cho ảnh chung.
//   ✅ Thêm fallback khi type không hợp lệ → tự động dùng STORE_IMAGES.
//   ✅ Hỗ trợ lấy hash/etag từ API Edge (`/api/image-meta`) nếu có.
//   ✅ Hoàn toàn tương thích với version cũ.
//   ✅ Có thể mở rộng cho ảnh banner, avatar, gallery, v.v.
// =============================================================
// 📦 Cấu trúc lưu trong IndexedDB (tham chiếu từ src/lib/db.ts):
//
//   DB: TPBC_DB
//   ├── products              (keyPath: id)
//   ├── products_images       (keyPath: key)
//   │     • source_url: string     ← link ảnh gốc
//   │     • updated_at: string     ← ISO date cập nhật
//   │     • etag: string | null    ← từ server nếu có
//   │     • hash: string | null    ← SHA-256 blob
//   │     • blob: Blob             ← nội dung file
//   │     • key: string            ← hash(url) dùng làm key ngắn
//   ├── news_images           (cấu trúc tương tự products_images)
//   └── images                (store generic cho ảnh khác)
//
// =============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

/** 🔹 Cấu hình bảng lưu ảnh — đồng bộ với src/lib/db.ts */
const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

/** 🔹 Thông tin ảnh cache */
export interface CachedImage {
  url: string; // URL gốc
  blob?: Blob; // dữ liệu blob
  hash?: string; // SHA-256 của blob
  etag?: string; // nếu server trả
  lastFetched?: string; // thời điểm tải
}

/** 🔹 Tính SHA-256 hash từ Blob */
async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** 🔹 Gọi API Edge để lấy hash meta (nếu có) */
async function fetchImageMeta(url: string): Promise<{ hash?: string; etag?: string } | null> {
  try {
    const res = await fetch(`/api/image-meta?url=${encodeURIComponent(url)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[useImageCacheTracker] ⚠️ fetchImageMeta failed:', err);
    return null;
  }
}

/** 🔹 Hook chính */
export function useImageCacheTracker(
  type: keyof typeof STORE_MAP = 'generic',
  options?: { autoSync?: boolean }
) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done'>('idle');

  // ✅ Fallback an toàn khi type sai
  const storeName = STORE_MAP[type] ?? STORE_IMAGES;

  /** ✅ Đảm bảo ảnh được cache (nếu chưa có hoặc đã thay đổi) */
  const ensureImageCachedByUrl = useCallback(
    async (url: string): Promise<string | null> => {
      if (!url) return null;

      try {
        const db = await initDB();
        const store = db.transaction(storeName, 'readwrite').store;
        const existing = (await store.get(url)) as CachedImage | undefined;

        // 🔹 Lấy meta từ Edge API (hash/etag) trước
        const meta = await fetchImageMeta(url);
        const remoteHash = meta?.hash;
        const remoteEtag = meta?.etag;

        // 🔹 Nếu hash hoặc etag trùng → dùng cache cũ
        if (
          existing &&
          ((remoteHash && existing.hash === remoteHash) ||
            (remoteEtag && existing.etag === remoteEtag))
        ) {
          return URL.createObjectURL(existing.blob!);
        }

        // 🔹 Tải blob mới
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const hash = await hashBlob(blob);

        // 🔹 Nếu hash trùng cache cũ → không cần ghi đè
        if (existing?.hash === hash) {
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
        console.warn('[useImageCacheTracker] ⚠️ ensureImageCachedByUrl failed:', err);
        return null;
      }
    },
    [storeName]
  );

  /** ✅ Lấy blob URL đã cache (nếu có sẵn) */
  const getImageBlobUrl = useCallback(
    async (url: string): Promise<string | null> => {
      try {
        const db = await initDB();
        const store = db.transaction(storeName, 'readonly').store;
        const cached = (await store.get(url)) as CachedImage | undefined;
        if (!cached?.blob) return null;
        return URL.createObjectURL(cached.blob);
      } catch (err) {
        console.warn('[useImageCacheTracker] ⚠️ getImageBlobUrl failed:', err);
        return null;
      }
    },
    [storeName]
  );

  /** ✅ Đồng bộ nhiều ảnh (ví dụ: danh sách news/products) */
  const syncImages = useCallback(
    async (urls: string[]) => {
      if (!urls?.length) return;
      setStatus('syncing');
      setProgress(0);
      setLoading(true);

      let done = 0;
      for (const url of urls) {
        await ensureImageCachedByUrl(url);
        done++;
        setProgress(Math.round((done / urls.length) * 100));
      }

      setLoading(false);
      setStatus('done');
    },
    [ensureImageCachedByUrl]
  );

  /** 🔹 Auto sync (nếu bật) */
  useEffect(() => {
    if (options?.autoSync) {
      // Có thể gọi syncImages ở component ngoài
    }
  }, [options]);

  return {
    loading,
    progress,
    status,
    ensureImageCachedByUrl,
    getImageBlobUrl,
    syncImages,
  };
}
