// File: src/hooks/useImageCacheTracker.ts
// 📄 File: src/hooks/useImageCacheTracker.ts
import { useEffect, useRef } from 'react';
import { saveImageIfNotExists } from '@/lib/images';

/**
 * Hook tải và cache ảnh cho bất kỳ loại dữ liệu nào (news, product, ...).
 */
export function useImageCacheTracker(
  imageUrls: string[],
  options?: { type?: string; skipPrefetch?: boolean }
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
          await saveImageIfNotExists(url);
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

    return () => {
      imgs.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls, type, skipPrefetch]);
}
