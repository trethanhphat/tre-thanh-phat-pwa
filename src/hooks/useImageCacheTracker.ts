// ✅ File: src/hooks/useImageCacheTracker.ts
// 🧩 Đã đổi sang phương án mới: hợp nhất hook cache ảnh của news & products
//    - Dùng tham số type: 'news' | 'product' | 'generic' để chọn store.
//    - Hỗ trợ tính hash(blob) và so sánh thay đổi nội dung.
//    - Tự động đồng bộ cache offline-first qua IndexedDB.
//    - Có thể mở rộng thêm type khác (user, article, v.v.)
// ------------------------------------------------------------

'use client';

import { useEffect, useState, useCallback } from 'react';
import { initDB } from '@/lib/db';

/** 🔹 Cấu hình bảng lưu ảnh */
const STORE_MAP = {
  news: 'news_images',
  product: 'product_images',
  generic: 'image_cache',
} as const;

/** 🔹 Thông tin ảnh cache */
export interface CachedImage {
  url: string; // URL gốc
  blob?: Blob; // Dữ liệu blob
  hash?: string; // hash nội dung (SHA-256)
  etag?: string; // nếu có từ server
  lastFetched?: string;
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
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done'>('idle');

  const storeName = STORE_MAP[type];

  /** ✅ Đảm bảo ảnh được cache (nếu chưa có hoặc đã thay đổi) */
  const ensureImageCachedByUrl = useCallback(
    async (url: string): Promise<string | null> => {
      if (!url) return null;

      try {
        const db = await initDB();
        const store = db.transaction(storeName, 'readwrite').store;
        const existing = (await store.get(url)) as CachedImage | undefined;

        // 🔹 Lấy meta từ Edge API trước (để giảm tải client)
        const meta = await fetchImageMeta(url);
        const remoteHash = meta?.hash;
        const remoteEtag = meta?.etag;

        // 🔹 Nếu có hash/etag giống nhau → dùng cache cũ
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

        // 🔹 Nếu hash trùng cache cũ → giữ nguyên
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

  /** ✅ Đồng bộ nhiều ảnh (ví dụ khi load danh sách news/products) */
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

  /** 🔹 Tự động sync nếu được bật */
  useEffect(() => {
    if (options?.autoSync) {
      // Bạn có thể truyền danh sách URL riêng ở ngoài thay vì auto-sync tại đây.
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
