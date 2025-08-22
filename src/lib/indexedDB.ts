// ✅ File: src/lib/indexedDB.ts
import { openDB, IDBPDatabase } from 'idb';

export const DB_NAME = 'TPBC_DB';
export const STORE_PRODUCTS = 'products';
export const STORE_IMAGES = 'images';
export const STORE_BATCHES = 'batches';
export const STORE_LOGS = 'logs';

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
          db.createObjectStore(STORE_IMAGES, { keyPath: 'url' });
        }
        if (oldVersion < 2) {
          db.createObjectStore(STORE_BATCHES, { keyPath: 'batch_id' });
          db.createObjectStore(STORE_LOGS, { keyPath: 'log_id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

// 🔹 Helper chung cho CRUD
export const dbHelpers = {
  async get(storeName: string, key: IDBValidKey) {
    const db = await initDB();
    return db.transaction(storeName).objectStore(storeName).get(key);
  },

  async getAll(storeName: string) {
    const db = await initDB();
    return db.transaction(storeName).objectStore(storeName).getAll();
  },

  async set(storeName: string, value: any) {
    const db = await initDB();
    return db.transaction(storeName, 'readwrite').objectStore(storeName).put(value);
  },

  async delete(storeName: string, key: IDBValidKey) {
    const db = await initDB();
    return db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
  },

  async clear(storeName: string) {
    const db = await initDB();
    return db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
  },
};
