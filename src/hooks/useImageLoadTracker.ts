// ✅ File: src/hooks/useImageLoadTracker.ts
import { useEffect, useRef } from 'react';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';

/**
 * Hook để tải và cache ảnh khi hiển thị lần đầu.
 * - Tải trực tiếp, nếu thành công thì lưu IndexedDB.
 * - Có cleanup để tránh leak event listeners.
 */
export function useImageLoadTracker(imageUrls: string[]) {
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!imageUrls?.length) return;

    const imgs: HTMLImageElement[] = [];

    imageUrls.forEach(url => {
      if (!url || loadedRef.current.has(url)) return; // skip trống hoặc đã tải rồi

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ensureNewsImageCachedByUrl(url);
        loadedRef.current.add(url); // đánh dấu đã tải
      };
      img.onerror = () => {
        console.warn('⚠️ Lỗi tải ảnh:', url);
      };
      img.src = url;
      imgs.push(img);
    });

    return () => {
      // cleanup listeners
      imgs.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);
}
