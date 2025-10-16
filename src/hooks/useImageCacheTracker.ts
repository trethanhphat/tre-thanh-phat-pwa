// File: src/hooks/useImageCacheTracker.ts
import { useEffect, useRef } from 'react';
import { ensureNewsImageCachedByUrl } from '@/lib/news_images';
import { ensureProductImageCachedByUrl } from '@/lib/products_images';

/**
 * ✅ Hook tải và cache ảnh (tự động phân luồng theo loại).
 *
 * @param imageUrls Danh sách URL ảnh
 * @param options.type 'news' | 'product' | 'generic'
 * @param options.skipPrefetch Bỏ qua prefetch
 */
export function useImageCacheTracker(
  imageUrls: string[],
  options?: { type?: 'news' | 'product' | 'generic'; skipPrefetch?: boolean }
) {
  const loadedRef = useRef<Set<string>>(new Set());
  const { type = 'generic', skipPrefetch = false } = options || {};

  useEffect(() => {
    if (!imageUrls?.length || skipPrefetch) return;

    const imgs: HTMLImageElement[] = [];

    imageUrls.forEach(url => {
      if (!url || loadedRef.current.has(url)) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';

      img.onload = async () => {
        try {
          if (type === 'news') {
            await ensureNewsImageCachedByUrl(url);
          } else if (type === 'product') {
            await ensureProductImageCachedByUrl(url);
          }
          console.log(`💾 Cached ${type} image:`, url);
        } catch (err) {
          console.warn('⚠️ Cache error:', url, err);
        }
        loadedRef.current.add(url);
      };

      img.onerror = () => {
        console.warn(`⚠️ Lỗi tải ảnh ${type}:`, url);
      };

      img.src = url;
      imgs.push(img);
    });

    // ✅ Dọn listener khi unmount
    return () => {
      imgs.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls, type, skipPrefetch]);
}
