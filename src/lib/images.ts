// ✅ File: src/lib/images.ts
import { initDB, STORE_IMAGES } from '@/lib/db';

export const saveImageIfNotExists = async (url: string) => {
  if (!url) return;
  const db = await initDB();
  const existing = await db.get(STORE_IMAGES, url);
  if (existing) {
    console.log('Ảnh đã tồn tại trong IndexedDB:', url);
    return; // ảnh đã có, không cần tải lại
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    await db.put(STORE_IMAGES, { url, blob });
    console.log('Đã lưu ảnh vào IndexedDB:', url);
  } catch (err) {
    console.error('Lỗi tải ảnh:', url, err);
  }
};

export const getImageURL = async (url: string) => {
  if (!url) return ''; //
  const db = await initDB();
  const record = await db.get(STORE_IMAGES, url);
  if (record?.blob) {
    console.log('Lấy ảnh từ IndexedDB:', url);
    return URL.createObjectURL(record.blob); // ảnh offline
  }
  console.log('Ảnh chưa có cache, dùng URL gốc:', url);
  return url; // fallback ảnh online
};
