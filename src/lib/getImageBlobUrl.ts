// ✅ File: src/lib/getImageBlobUrl.ts
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

/** 🔹 Lấy objectURL từ cache, fallback ra URL gốc */
export async function getImageBlobUrl(
  url: string,
  type: 'news' | 'product' | 'generic'
): Promise<string> {
  if (!url) return '';

  const db = await initDB();

  let storeName = STORE_IMAGES;
  if (type === 'news') storeName = STORE_NEWS_IMAGES;
  else if (type === 'product') storeName = STORE_PRODUCTS_IMAGES;

  const record = await db.get(storeName, url);
  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }

  return url; // fallback khi chưa có
}
