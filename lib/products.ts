// ✅ File: lib/products.ts
import { initDB, STORE_PRODUCTS } from './db';
import { saveImageIfNotExists } from './images';

export interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  stock_status: string;
  image_url?: string;
}

export const loadProductsFromDB = async (): Promise<Product[]> => {
  const db = await initDB();
  return await db.getAll(STORE_PRODUCTS);
};

export const syncProducts = async (products: Product[]) => {
  const db = await initDB();

  // Danh sách ID mới
  const newIds = new Set(products.map(p => p.id));

  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.store;

  // Xóa bản ghi cũ
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as number)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  // Thêm / cập nhật bản ghi mới + lưu ảnh
  for (const p of products) {
    await store.put(p);
    if (p.image_url) {
      saveImageIfNotExists(p.image_url);
    }
  }

  await tx.done;
};
