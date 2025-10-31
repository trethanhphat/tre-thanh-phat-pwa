//File: src/hooks/useNewsImageCache.ts
import { useEffect, useState } from 'react';
import { getNewsImageURLByUrl } from '@/services/newsImageService';
import { News } from '@/repositories/newsRepository';

export function useNewsImageCache(items: News[]) {
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const prevURLs: string[] = Object.values(imageCache);

    const loadImages = async () => {
      const entries = await Promise.all(
        items.map(async n => {
          if (!n.image_url) return [n.news_id, ''] as const;
          const url = await getNewsImageURLByUrl(n.image_url);
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
      Object.values(imageCache).forEach(u => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return imageCache;
}
