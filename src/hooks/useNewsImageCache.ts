// ✅ File: src/hooks/useNewsImageCache.ts
import { useEffect, useState } from 'react';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';
import { getImageBlobUrl } from '@/lib/getImageBlobUrl';
import { News } from '@/models/News';

export function useNewsImageCache(items: News[]) {
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const prevURLs: string[] = Object.values(imageCache);
    const createdBlobUrls: string[] = [];

    const loadImages = async () => {
      const entries = await Promise.all(
        items.map(async n => {
          if (!n.image_url) return [n.news_id, ''] as const;

          // ✅ Đảm bảo có cache nếu chưa có
          try {
            await ensureNewsImageCachedByUrl(n.image_url);
          } catch (err) {
            console.warn('[NewsImageCache] ensure cache failed:', err);
          }

          // ✅ Lấy URL blob (hoặc proxy fallback)
          const url = await getImageBlobUrl(n.image_url, 'news');
          if (url.startsWith('blob:')) createdBlobUrls.push(url);
          return [n.news_id, url] as const;
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
      Object.values(imageCache).forEach((u: string) => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
      for (const u of createdBlobUrls) URL.revokeObjectURL(u);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return imageCache;
}
