// ✅ File: src/lib/news.ts
import { initDB, STORE_NEWS } from './db';

export interface NewsItem {
  news_id: string; // keyPath
  title: string;
  link: string;
  author?: string;
  categories: string[];
  published?: string; // ISO
  updated?: string; // ISO
  summary?: string;
  image_url?: string;
  image_proxy_url?: string; // ✅ fallback proxy khi ảnh gốc bị CORS hoặc lỗi
}

/** 🔹 Load tin từ IndexedDB, mới nhất lên đầu */
export const loadNewsFromDB = async (): Promise<NewsItem[]> => {
  const db = await initDB();
  const all = await db.getAll(STORE_NEWS);
  return all.sort((a: NewsItem, b: NewsItem) => {
    const ad = a.published || a.updated || '';
    const bd = b.published || b.updated || '';
    return bd.localeCompare(ad);
  });
};

/** 🔹 Sync tin tức (KHÔNG cache ảnh trực tiếp nữa, giao cho useImageCacheTracker xử lý) */
export const syncNews = async (items: NewsItem[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(items.map(n => n.news_id));

  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // 🔸 Xóa tin cũ không còn trong danh sách mới
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as string)) {
      await cursor.delete();
      hasChange = true;
    }
    cursor = await cursor.continue();
  }

  // 🔸 Thêm / cập nhật tin mới
  for (const n of items) {
    const existing = await store.get(n.news_id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(n)) {
      await store.put(n);
      hasChange = true;
    }
  }

  await tx.done;
  return hasChange;
};
