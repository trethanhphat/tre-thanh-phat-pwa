// ✅ File: src/lib/products.ts
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

export const syncProducts = async (products: Product[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(products.map(p => p.id));

  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // Xóa record cũ
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as number)) {
      await cursor.delete();
      hasChange = true;
    }
    cursor = await cursor.continue();
  }

  // Thêm / cập nhật
  for (const p of products) {
    const existing = await store.get(p.id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
      await store.put(p);
      hasChange = true;
    }
    if (p.image_url) {
      saveImageIfNotExists(p.image_url);
    }
  }

  await tx.done;
  return hasChange; // ✅ trả về true/false để component biết có cần setState không
};
