// ✅ File: src/repositories/newsRepository.ts
// ─────────────────────────────────────────────
// 📘 Chức năng: Quản lý dữ liệu tin tức (news) trong IndexedDB
// 🔹 Load, đồng bộ và lưu cache ảnh offline-first
//
// 🛠️ Đã đổi sang phương án mới như sau:
//   • Sau khi fetch API, tự động gọi ensureNewsImageCachedByUrl()
//     để lưu blob ảnh vào IndexedDB (newsImageService)
//   • Hàm fetchAndSyncNewsFromAPI() nay trả về mảng tin hợp lệ,
//     đồng thời prefetch ảnh top N cho offline hiển thị nhanh
//   • Giữ nguyên tương thích loadNewsFromDB, upsertNews, pruneNews
// ─────────────────────────────────────────────

import axios from 'axios';
import { initDB, STORE_NEWS } from '@/lib/db';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';

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
  image_url?: string; // 🟢 chỉ lưu URL gốc
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
 * 💾 Upsert tin tức (thêm/cập nhật nếu khác)
 *  - Trả về true nếu có thay đổi (để UI reload)
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
 * 🔹 Fetch tin tức từ API → Đồng bộ vào IndexedDB + cache ảnh offline
 * @param limit Số lượng tin (mặc định 10)
 */
export async function fetchAndSyncNewsFromAPI(limit = 10): Promise<News[]> {
  try {
    const res = await axios.get('/api/news', {
      params: { limit },
      headers: { 'Cache-Control': 'no-store' },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      console.warn('[newsRepository] ❌ API HTTP', res.status, res.data);
      return [];
    }

    const payload = res.data;
    const fresh: News[] = Array.isArray(payload) ? payload : payload?.data ?? [];

    if (!Array.isArray(fresh)) {
      console.warn('[newsRepository] ⚠️ API trả về không đúng định dạng');
      return [];
    }

    // ✅ Lưu DB trước
    const hasChange = await upsertNews(fresh);

    // ✅ Nếu có ảnh, pre-cache qua ensureNewsImageCachedByUrl
    const topImages = fresh
      .map(n => n.image_url)
      .filter(Boolean)
      .slice(0, 10) as string[];

    for (const imgUrl of topImages) {
      try {
        await ensureNewsImageCachedByUrl(imgUrl);
      } catch (err) {
        console.debug('[newsRepository] ⚠️ cache image fail:', imgUrl, err);
      }
    }

    return fresh;
  } catch (err) {
    console.warn('[newsRepository] ⚠️ fetchAndSyncNewsFromAPI error:', err);
    return [];
  }
}

/** ✅ Đồng bộ tin tức đầy đủ (fallback cho service worker hoặc job nền) */
export async function syncNews(): Promise<void> {
  try {
    const db = await initDB();
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const newsList = await res.json();

    const tx = db.transaction(STORE_NEWS, 'readwrite');
    await Promise.all(newsList.map((n: any) => tx.store.put(n)));
    await tx.done;

    // Cache ảnh luôn cho offline (song song)
    const urls = newsList.map((n: any) => n.image_url).filter(Boolean);
    for (const u of urls.slice(0, 10)) ensureNewsImageCachedByUrl(u);

    console.log(`[newsRepository] ✅ Đã đồng bộ ${newsList.length} tin tức.`);
  } catch (err) {
    console.warn('[newsRepository] ⚠️ Lỗi syncNews:', err);
  }
}
