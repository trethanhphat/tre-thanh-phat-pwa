// ✅ File: src/repositories/newsRepository.ts
import axios from 'axios';
import { initDB, STORE_NEWS } from '@/lib/db';

/** 🔹 Kiểu dữ liệu tin tức (đồng bộ với /api/news) */
export interface News {
  news_id: string; // keyPath
  title: string;
  link: string;
  author?: string;
  categories: string[];
  published?: string; // ISO
  updated?: string; // ISO
  summary?: string;
  image_url?: string; // 🟢 chỉ lưu URL gốc, không có proxy
}

/** 🔹 Load tin từ IndexedDB (offline-first, mới nhất lên đầu) */
export async function loadNewsFromDB(): Promise<News[]> {
  const db = await initDB();
  const all = (await db.getAll(STORE_NEWS)) as News[];
  return all.sort((a, b) => {
    const ad = a.published || a.updated || '';
    const bd = b.published || b.updated || '';
    return bd.localeCompare(ad);
  });
}

/**
 * 💾 Đồng bộ tin tức vào IndexedDB
 *  - chỉ thêm/cập nhật nếu khác
 *  - trả về true nếu có thay đổi (để UI reload)
 */
export async function upsertNews(items: News[]): Promise<boolean> {
  const db = await initDB();
  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  for (const n of items) {
    const existing = await store.get(n.news_id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(n)) {
      await store.put(n);
      hasChange = true;
    }
  }

  await tx.done;
  return hasChange;
}

/** ❌ Xóa các bản ghi không còn tồn tại trên server (nếu cần) */
export async function pruneNews(validIds: string[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.objectStore(STORE_NEWS);
  let cursor = await store.openCursor();
  while (cursor) {
    if (!validIds.includes(cursor.key as string)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

/**
 * 🔹 Fetch từ API → Đồng bộ vào IndexedDB
 * @param limit Số lượng tin (mặc định 10)
 */
export async function fetchAndSyncNewsFromAPI(
  limit = 10
): Promise<{ items: News[]; hasChange: boolean }> {
  try {
    const res = await axios.get('/api/news', {
      params: { limit },
      headers: { 'Cache-Control': 'no-store' },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      console.warn('[newsRepository] ❌ API HTTP', res.status, res.data);
      return { items: [], hasChange: false };
    }

    const payload = res.data;
    const fresh: News[] = Array.isArray(payload) ? payload : payload?.data ?? [];

    if (!Array.isArray(fresh)) {
      console.warn('[newsRepository] ⚠️ API trả về không đúng định dạng');
      return { items: [], hasChange: false };
    }

    const hasChange = await upsertNews(fresh);
    return { items: fresh, hasChange };
  } catch (err) {
    console.warn('[newsRepository] ⚠️ fetchAndSyncNewsFromAPI error:', err);
    return { items: [], hasChange: false };
  }
}

// ✅ Đồng bộ dữ liệu tin tức từ API online về IndexedDB (giống products)
export async function syncNews(): Promise<void> {
  try {
    const db = await initDB();

    // 🔹 Gọi API online
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const newsList = await res.json();

    // 🔹 Ghi đè toàn bộ vào IndexedDB
    const tx = db.transaction(STORE_NEWS, 'readwrite');
    await Promise.all(newsList.map((n: any) => tx.store.put(n)));
    await tx.done;

    console.log(`[newsRepository] ✅ Đã đồng bộ ${newsList.length} tin tức.`);
  } catch (err) {
    console.warn('[newsRepository] ⚠️ Lỗi syncNews:', err);
  }
}
