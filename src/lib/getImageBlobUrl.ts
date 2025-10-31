// ✅ File: src/lib/getImageBlobUrl.ts
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

/** 🔹 Lấy objectURL từ cache, fallback ra URL gốc */
export async function getImageBlobUrl(
  url: string,
  type: keyof typeof STORE_MAP = 'generic'
): Promise<string> {
  if (!url) return '';
  const storeName = STORE_MAP[type] || STORE_IMAGES;
  const db = await initDB();
  const record = await db.get(storeName, url);
  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }
  return url; // fallback khi chưa có
}
