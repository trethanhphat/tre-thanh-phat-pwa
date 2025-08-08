// src/utils/indexedDB.ts
import { initDB, STORE_PRODUCTS, STORE_IMAGES } from '@/lib/db';

// Lưu sản phẩm vào IndexedDB
export async function saveProductsToDB(products: any[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.objectStore(STORE_PRODUCTS);

  for (const product of products) {
    // Chuẩn bị đối tượng sản phẩm rút gọn nếu cần
    const data = {
      id: product.id,
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      image_url: product.image || '', // hoặc product.image_url nếu khác
      description: product.description || '',
    };
    await store.put(data);
  }
  await tx.done;
}

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
    return URL.createObjectURL(record.blob);
  }
  return null;
}
