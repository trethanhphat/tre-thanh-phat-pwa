// File: src/hooks/useImageLoadTracker.ts
// Hook để theo dõi trạng thái tải ảnh
import { useEffect } from 'react';
import { ensureNewsImageCachedByUrl } from '@/lib/news_images';

export function useImageLoadTracker(imageUrls: string[]) {
  useEffect(() => {
    imageUrls.forEach(url => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ensureNewsImageCachedByUrl(url); // chỉ lưu khi ảnh đã tải
      };
      img.src = url;
    });
  }, [imageUrls]);
}
