// ✅ File: src/lib/db.ts
import { openDB } from 'idb';

export const DB_NAME = 'TPBC_DB';
export const STORE_PRODUCTS = 'products';
export const STORE_IMAGES = 'images';
export const STORE_BATCHES = 'batches';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db, oldVersion) {
      // 🔹 Store sản phẩm
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }

      // 🔹 Store ảnh
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'url' });
      }

      // 🔹 Store batches
      if (!db.objectStoreNames.contains(STORE_BATCHES)) {
        db.createObjectStore(STORE_BATCHES, { keyPath: 'batch_id' });
      }
    },
  });
};
