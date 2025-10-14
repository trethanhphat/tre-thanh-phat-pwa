//File: src/hooks/useNewsImageCache.ts
import { useEffect, useState } from 'react';
import { getNewsImageURLByUrl } from '@/lib/news_images';
import { NewsItem } from '@/lib/news';

export function useNewsImageCache(items: NewsItem[]) {
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const entries = await Promise.all(
        items.map(async (n) => {
          const url = await getNewsImageURLByUrl(n.image_url);
          return [n.news_id, url] as const;
        })
      );
      if (isMounted) {
        setImageCache(Object.fromEntries(entries));
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      Object.values(imageCache).forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [items]);

  return imageCache;
}