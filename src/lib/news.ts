// ✅ File: src/lib/news.ts
import { initDB, STORE_NEWS } from './db';
import { ensureNewsImageCachedByUrl } from './news_images';

export interface NewsItem {
  news_id: string;         // keyPath
  title: string;
  link: string;
  author?: string;
  categories: string[];
  published?: string;      // ISO
  updated?: string;        // ISO
  summary?: string;
  image_url?: string;
}

export const loadNewsFromDB = async (): Promise<NewsItem[]> => {
  const db = await initDB();
  const all = await db.getAll(STORE_NEWS);
  return all.sort((a: NewsItem, b: NewsItem) => {
    const ad = a.published || a.updated || '';
    const bd = b.published || b.updated || '';
    return bd.localeCompare(ad);
  });
};

export const syncNews = async (items: NewsItem[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(items.map(n => n.news_id));

  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // Xóa record cũ
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as string)) {
      await cursor.delete();
      hasChange = true;
    }
    cursor = await cursor.continue();
  }

  // Thêm / cập nhật + cache ảnh nền theo URL (hash)
  for (const n of items) {
    const existing = await store.get(n.news_id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(n)) {
      await store.put(n);
      hasChange = true;
    }
    if (n.image_url) {
      // Tải nền, lưu blob vào news_images bằng key sha256(url)
      ensureNewsImageCachedByUrl(n.image_url);
    }
  }

  await tx.done;
  return hasChange;
};
