// ✅ File: src/hooks/useNewsImageCache.ts
import { useEffect, useState } from 'react';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';
import { initDB, STORE_NEWS_IMAGES } from '@/lib/db';
import { News } from '@/repositories/newsRepository';

/**
 * Hook cache ảnh tin tức offline (blob)
 * - Kiểm tra cache từ IndexedDB
 * - Nếu chưa có thì gọi ensureNewsImageCachedByUrl() để tải & lưu
 * - Tự revoke blob cũ khi unmount
 */
export function useNewsImageCache(items: News[]) {
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const prevURLs: string[] = Object.values(imageCache);

    const loadImages = async () => {
      const db = await initDB();

      const entries = await Promise.all(
        items.map(async n => {
          if (!n.image_url) return [n.news_id, ''] as const;

          const key = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(n.image_url));
          const hash = Array.from(new Uint8Array(key))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

          let record = await db.get(STORE_NEWS_IMAGES, hash);
          if (!record) {
            // ⚡ Nếu chưa có → tải & lưu (có ETag + blob_hash)
            await ensureNewsImageCachedByUrl(n.image_url);
            record = await db.get(STORE_NEWS_IMAGES, hash);
          }

          if (record?.blob) {
            const blobUrl = URL.createObjectURL(record.blob);
            return [n.news_id, blobUrl] as const;
          }

          return [n.news_id, ''] as const;
        })
      );

      if (isMounted) {
        // Revoke ảnh cũ trước khi set cái mới
        prevURLs.forEach(u => u.startsWith('blob:') && URL.revokeObjectURL(u));
        setImageCache(Object.fromEntries(entries));
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      // Dọn toàn bộ blob khi unmount
      Object.values(imageCache).forEach(u => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return imageCache;
}
