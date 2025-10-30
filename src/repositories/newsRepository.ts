// ✅ File: src/repositories/newsRepository.ts
import axios from 'axios';
import { initDB, STORE_NEWS } from '@/lib/db';

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
  // NOTE: không lưu proxy URL vào DB
}

/** 🔹 Load tin từ IndexedDB, mới nhất lên đầu */
export const loadNewsFromDB = async (): Promise<NewsItem[]> => {
  const db = await initDB();
  const all = await db.getAll(STORE_NEWS);
  // sắp xếp mới nhất lên trên
  return (all as NewsItem[]).sort((a, b) => {
    const ad = a.published || a.updated || '';
    const bd = b.published || b.updated || '';
    return bd.localeCompare(ad);
  });
};

/**
 * 🔹 Đồng bộ tin tức: chỉ thêm/cập nhật những item có khác
 *    Trả về true nếu có thay đổi (cần update UI)
 */
export const syncNews = async (items: NewsItem[]): Promise<boolean> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NEWS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // Xóa tin cũ không còn (tùy muốn — giữ nguyên hiện tại bạn có prune function ở nơi khác)
  // Ở đây chỉ tập trung thêm / cập nhật
  for (const n of items) {
    const existing = await store.get(n.news_id);
    // Nếu chưa có hoặc có trường updated khác → cập nhật
    if (!existing || (n.updated && n.updated !== existing.updated)) {
      await store.put(n);
      hasChange = true;
    }
  }

  await tx.done;
  return hasChange;
};

/**
 * 🔹 Gọi API /api/news và đồng bộ vào IndexedDB
 * @param limit số tin lấy (mặc định 10)
 * @returns { items, hasChange } - items = mảng news mới (từ API) hoặc []
 */
export async function fetchAndSyncNewsFromAPI(
  limit = 10
): Promise<{ items: NewsItem[]; hasChange: boolean }> {
  try {
    const res = await axios.get('/api/news', {
      params: { limit },
      headers: { 'Cache-Control': 'no-store' },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      console.warn('[newsRepository] API HTTP', res.status, res.data);
      return { items: [], hasChange: false };
    }

    const payload = res.data;
    const fresh: NewsItem[] = Array.isArray(payload) ? payload : payload?.data ?? [];

    if (!Array.isArray(fresh)) {
      console.warn('[newsRepository] API trả về không đúng định dạng');
      return { items: [], hasChange: false };
    }

    const hasChange = await syncNews(fresh);
    return { items: fresh, hasChange };
  } catch (err) {
    console.warn('[newsRepository] fetchAndSyncNewsFromAPI error:', err);
    return { items: [], hasChange: false };
  }
}
