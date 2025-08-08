// src/utils/indexedDB.ts
import { initDB, STORE_IMAGES } from '@/lib/db';

// Lưu ảnh dưới dạng Blob
export async function saveImageToDB(imageUrl: string) {
  const db = await initDB();
  const tx = db.transaction(STORE_IMAGES, 'readwrite');
  const store = tx.objectStore(STORE_IMAGES);

  const exist = await store.get(imageUrl);
  if (!exist) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Lỗi tải ảnh');
      const blob = await response.blob();
      await store.put({ url: imageUrl, blob });
      await tx.done;
    } catch (err) {
      console.error('Lỗi lưu ảnh vào IndexedDB:', err);
    }
  }
}

// Lấy ảnh đã lưu dưới dạng Object URL để hiển thị
export async function getImageFromDB(imageUrl: string): Promise<string | null> {
  const db = await initDB();
  const tx = db.transaction(STORE_IMAGES, 'readonly');
  const store = tx.objectStore(STORE_IMAGES);

  const record = await store.get(imageUrl);
  if (record?.blob) {
    // Tạo URL để src img có thể dùng
    return URL.createObjectURL(record.blob);
  }
  return null;
}
