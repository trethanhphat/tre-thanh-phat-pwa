// ✅ File: src/lib/news_images.ts
import { initDB, STORE_NEWS_IMAGES } from './db';

/** Tính SHA-256 cho chuỗi, trả về hex (64 ký tự). */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Tải ảnh từ URL và lưu blob vào IDB với key = sha256(url). */
export async function saveNewsImageByUrl(url: string): Promise<string | null> {
  if (!url) return null;
  const key = await sha256Hex(url);
  const db = await initDB();

  // Nếu đã có rồi thì bỏ qua (tránh tải lại)
  const exists = await db.get(STORE_NEWS_IMAGES, key);
  if (exists?.blob instanceof Blob) return key;

  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    await db.put(STORE_NEWS_IMAGES, {
      key,
      source_url: url,
      blob,
      updated_at: Date.now(),
    });
    return key;
  } catch {
    // offline hoặc lỗi → bỏ qua, lần sau thử lại
    return null;
  }
}

/** Trả về URL hiển thị cho ảnh: blob: nếu đã cache; nếu chưa có → trả về URL gốc. */
export async function getNewsImageURLByUrl(url?: string): Promise<string> {
  if (!url) return '';
  const key = await sha256Hex(url);
  const db = await initDB();
  const rec = await db.get(STORE_NEWS_IMAGES, key);
  if (rec?.blob instanceof Blob) {
    return URL.createObjectURL(rec.blob);
  }
  return url; // fallback online
}

/** Đảm bảo có cache ảnh theo URL (không chặn UI). */
export async function ensureNewsImageCachedByUrl(url?: string): Promise<void> {
  if (!url) return;
  try {
    await saveNewsImageByUrl(url);
  } catch {
    // silent
  }
}