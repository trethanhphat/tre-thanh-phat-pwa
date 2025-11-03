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

  const tx = (await db).transaction(storeName);
  const store = tx.store;

  // 1) tìm theo index 'source_url'
  let record: any = store.index?.('source_url') ? await store.index('source_url').get(url) : null;

  // 2) fallback: thử theo key = SHA-256(url) (cách các hook mô tả)
  if (!record && storeName !== STORE_IMAGES) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url));
    const hash = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    record = await store.get(hash);
  }

  return record?.blob ? URL.createObjectURL(record.blob) : url;
}
