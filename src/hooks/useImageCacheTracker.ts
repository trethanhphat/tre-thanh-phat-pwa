// File: src/hooks/useImageCacheTracker.ts
import { useEffect, useRef, useState } from 'react';
import { ensureNewsImageCachedByUrl } from '@/lib/news_images';
import { ensureProductImageCachedByUrl } from '@/services/productImageService';

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

          // ✅ Load lại blob từ IndexedDB và cập nhật imageCache để hiển thị
          const dbUrl =
            type === 'news'
              ? await ensureNewsImageCachedByUrl(url)
              : type === 'product'
              ? await ensureProductImageCachedByUrl(url)
              : url;

          if (dbUrl) {
            setImageCache(prev => ({
              ...prev,
              [url]: dbUrl, // ✅ Hiển thị blob ngay
            }));
          }

          console.log(`💾 Cached ${type} image:`, url, dbUrl);
        } catch (err) {
          console.warn('⚠️ Cache error:', url, err);
        }
        loadedRef.current.add(url);
      };

      img.onerror = async () => {
        console.warn(`⚠️ Lỗi tải ảnh ${type}:`, url);

        // ✅ Nếu ảnh bị chặn hoặc lỗi → thử lại qua proxy
        if (!url.startsWith('/api/image-proxy?')) {
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
          console.log(`↻ Thử tải lại qua proxy: ${proxyUrl}`);

          try {
            const proxyImg = new Image();
            proxyImg.crossOrigin = 'anonymous';
            proxyImg.loading = 'lazy';
            proxyImg.decoding = 'async';
            proxyImg.referrerPolicy = 'no-referrer';

            proxyImg.onload = async () => {
              try {
                if (type === 'news') {
                  await ensureNewsImageCachedByUrl(proxyUrl);
                } else if (type === 'product') {
                  await ensureProductImageCachedByUrl(url, proxyUrl);
                }

                const dbUrl =
                  type === 'news'
                    ? await ensureNewsImageCachedByUrl(proxyUrl)
                    : type === 'product'
                    ? await ensureProductImageCachedByUrl(proxyUrl)
                    : proxyUrl;

                if (dbUrl) {
                  setImageCache(prev => ({
                    ...prev,
                    [url]: dbUrl, // ✅ URL gốc ánh xạ sang blob từ proxy
                  }));
                }

                console.log(`💾 Cached ${type} image qua proxy:`, dbUrl);
              } catch (err) {
                console.warn('⚠️ Cache error (proxy):', proxyUrl, err);
              }
              loadedRef.current.add(url);
            };

            proxyImg.onerror = () => {
              console.warn(`❌ Proxy cũng lỗi cho ảnh ${type}:`, url);
            };

            proxyImg.src = proxyUrl;
          } catch (err) {
            console.warn(`❌ Không thể tải qua proxy ${type}:`, url, err);
          }
        }
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
