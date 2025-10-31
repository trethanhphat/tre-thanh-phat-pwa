// ✅ File: src/lib/db.ts
import { openDB } from 'idb';

export const DB_NAME = 'TPBC_DB';
export const STORE_PRODUCTS = 'products'; // Store thông tin sản phẩm
export const STORE_PRODUCTS_IMAGES = 'products_images'; // Store ảnh sản phẩm
export const STORE_IMAGES = 'images'; // Store ảnh thông thường
export const STORE_BATCHES = 'batches'; // Store lô trồng
export const STORE_NEWS = 'news'; // Store tin tức
export const STORE_NEWS_IMAGES = 'news_images'; // Store ảnh tin tức

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db, oldVersion) {
      // 🔹 Store sản phẩm
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      // 🔹 Store ảnh sản phẩm
      if (!db.objectStoreNames.contains(STORE_PRODUCTS_IMAGES)) {
        const s = db.createObjectStore(STORE_PRODUCTS_IMAGES, { keyPath: 'key' });
        s.createIndex('source_url', 'source_url', { unique: false });
        s.createIndex('updated_at', 'updated_at', { unique: false });
        s.createIndex('etag', 'etag', { unique: false });
        s.createIndex('blob_hash', 'blob_hash', { unique: false });
      }

      // 🔹 Store batches
      if (!db.objectStoreNames.contains(STORE_BATCHES)) {
        db.createObjectStore(STORE_BATCHES, { keyPath: 'batch_id' });
      }
      // 🔹 Store tin tức
      if (!db.objectStoreNames.contains(STORE_NEWS)) {
        db.createObjectStore(STORE_NEWS, { keyPath: 'news_id' });
      }
      // 🔹 Store ảnh tin tức
      if (!db.objectStoreNames.contains(STORE_NEWS_IMAGES)) {
        const s = db.createObjectStore(STORE_NEWS_IMAGES, { keyPath: 'key' });
        s.createIndex('source_url', 'source_url', { unique: false });
        s.createIndex('updated_at', 'updated_at', { unique: false });
        s.createIndex('etag', 'etag', { unique: false });
        s.createIndex('blob_hash', 'blob_hash', { unique: false });
      }
    },
  });
};
