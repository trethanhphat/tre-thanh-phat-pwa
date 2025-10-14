// ✅ File: src/lib/news.ts
import { initDB, STORE_NEWS } from './db';
import { saveImageIfNotExists, prefetchImages } from './images';

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

/** 🔹 Sync tin + cache ảnh trong nền */
export const syncNews = async (items: NewsItem[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(items.map(n => n.news_id));

  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // Xóa tin cũ không còn
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as string)) {
      await cursor.delete();
      hasChange = true;
    }
    cursor = await cursor.continue();
  }

  // Thêm / cập nhật tin mới
  for (const n of items) {
    const existing = await store.get(n.news_id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(n)) {
      await store.put(n);
      hasChange = true;
    }

    // Tải nền ảnh (ưu tiên trực tiếp, fallback qua proxy)
    if (n.image_url) {
      saveImageIfNotExists(n.image_url);
    }
  }

  await tx.done;

  // 🔹 Prefetch ảnh cho top 5 tin mới nhất (nếu không bật tiết kiệm dữ liệu)
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    console.log('⚡ Bỏ qua prefetch ảnh vì đang bật tiết kiệm dữ liệu');
  } else {
    const top5 = items
      .slice(0, 5)
      .map(n => n.image_url)
      .filter(Boolean) as string[];
    if (top5.length) prefetchImages(top5);
  }

  return hasChange;
};
