// ✅ Prefetch & warm CDN + IndexedDB image cache (dùng chung cho news + product)

import { ensureNewsImageCachedByUrl } from './news_images';
import { ensureProductImageCachedByUrl } from './product_images';

interface PrefetchOptions {
  /** Danh sách URL ảnh */
  urls: string[];
  /** Loại ảnh: 'news' hoặc 'product' */
  type?: 'news' | 'product';
  /** Số lượng ảnh ưu tiên (mặc định 5) */
  topCount?: number;
  /** Có prefetch ảnh còn lại không */
  includeRest?: boolean;
}

/**
 * Prefetch ảnh nền để warm CDN + local cache (IndexedDB)
 * - Ưu tiên top N ảnh đầu
 * - Bỏ qua nếu người dùng bật tiết kiệm dữ liệu
 * - Tự động gọi đúng module cache (news/product)
 */
export async function prefetchImagesInBackground({
  urls,
  type = 'news',
  topCount = 5,
  includeRest = false,
}: PrefetchOptions): Promise<void> {
  if (!Array.isArray(urls) || urls.length === 0) return;

  // 🔹 Bỏ qua khi bật tiết kiệm dữ liệu
  if (navigator.connection?.saveData) {
    console.info('[prefetch] Bỏ qua do bật tiết kiệm dữ liệu.');
    return;
  }

  const topUrls = urls.slice(0, topCount);
  const restUrls = includeRest ? urls.slice(topCount) : [];

  // Prefetch top ảnh
  for (const url of topUrls) {
    prefetchSingleImage(url, type, true);
  }

  // Prefetch phần còn lại (độ ưu tiên thấp)
  if (restUrls.length > 0) {
    setTimeout(() => {
      for (const url of restUrls) {
        prefetchSingleImage(url, type, false);
      }
    }, 3000);
  }
}

/**
 * Prefetch 1 ảnh: warm CDN + lưu vào IndexedDB
 * Dùng priority thấp để tránh chiếm băng thông UI.
 */
async function prefetchSingleImage(
  url: string,
  type: 'news' | 'product',
  isPriority: boolean
): Promise<void> {
  if (!url) return;
  try {
    // 🔹 Warm CDN bằng request ẩn
    fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      mode: 'no-cors',
      priority: isPriority ? 'high' : 'low',
      cache: 'force-cache',
    }).catch(() => {});

    // 🔹 Cache local IndexedDB
    if (type === 'news') {
      await ensureNewsImageCachedByUrl(url);
    } else {
      await ensureProductImageCachedByUrl(url);
    }
  } catch (err) {
    console.warn('[prefetchSingleImage] lỗi:', err);
  }
}
