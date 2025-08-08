// ✅ File: lib/images.ts
import { initDB, STORE_IMAGES } from './db';

export const saveImageIfNotExists = async (url: string) => {
  if (!url) return;
  const db = await initDB();
  const existing = await db.get(STORE_IMAGES, url);
  if (existing) return; // ảnh đã có, không cần tải lại

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    await db.put(STORE_IMAGES, { url, blob });
  } catch (err) {
    console.error('Lỗi tải ảnh:', url, err);
  }
};

export const getImageURL = async (url: string) => {
  const db = await initDB();
  const record = await db.get(STORE_IMAGES, url);
  if (record?.blob) {
    return URL.createObjectURL(record.blob); // ảnh offline
  }
  return url; // fallback ảnh online
};
