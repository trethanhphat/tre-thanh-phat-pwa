import { useEffect, useRef, useState } from 'react';
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

  // ✅ Lưu cache URL (dạng blob hoặc URL gốc)
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  /**
   * 🔁 Hàm thay toàn bộ cache ảnh (có thể truyền Record hoặc mảng {id,url})
   */
  const replaceImageCache = (next: Record<string, string> | { id: string; url: string }[]) => {
    // ⚙️ Dọn blob cũ để tránh memory leak
    Object.values(imageCache).forEach(url => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // 🔹 Cho phép cả 2 kiểu input
    if (Array.isArray(next)) {
      const map = Object.fromEntries(next.map(n => [n.id, n.url]));
      setImageCache(map);
    } else {
      setImageCache(next);
    }
  };

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

  return { imageCache, replaceImageCache };
}
