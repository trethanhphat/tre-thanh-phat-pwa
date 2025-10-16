// File: src/lib/product_images.ts
import { saveImageIfNotExists } from './images';

/**
 * Đảm bảo ảnh sản phẩm được cache (nếu chưa có).
 */
export async function ensureProductImageCachedByUrl(url: string) {
  if (!url) return;
  try {
    await saveImageIfNotExists(url);
  } catch (err) {
    console.warn('⚠️ Lỗi cache ảnh sản phẩm:', url, err);
  }
}
