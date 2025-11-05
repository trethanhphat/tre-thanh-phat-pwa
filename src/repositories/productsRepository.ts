// ✅ File: src/repositories/productsRepository.ts
// Import hàm khởi tạo DB và tên store
import { initDB, STORE_PRODUCTS } from '../lib/db';
// Import hàm cache ảnh sản phẩm từ module dịch vụ ảnh
import {
  prefetchProductImages,
  ensureProductImageCachedByUrl,
} from '../services/productsImageService'; // ✅ Chuyển hoàn toàn sang module riêng
// Import kiểu dữ liệu Product
import { Product } from '@/models/Product';

// ✅ Kiểm tra nếu store 'products' có ít nhất 1 bản ghi thì trả kết quả true
export async function hasProductsInDB(): Promise<boolean> {
  const db = await initDB();
  const tx = db.transaction(STORE_PRODUCTS);
  // Lấy 1 khóa (nếu có)
  const cursor = await tx.store.openCursor(); // lấy con trỏ đầu
  return !!cursor; // true nếu có ít nhất 1 record
}

// Đếm số bản ghi trong store 'products'
export async function countProductsInDB(): Promise<boolean> {
  const db = await initDB();
  return (await db.count(STORE_PRODUCTS)) > 0;
}

// 🔎 Lấy danh sách sản phẩm từ IndexedDB */
export const loadProductsFromDB = async (): Promise<Product[]> => {
  const db = await initDB();
  return await db.getAll(STORE_PRODUCTS);
};

/** 🔹 Đồng bộ dữ liệu sản phẩm + cache ảnh (AN TOÀN) */
export const syncProducts = async (products: Product[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(products.map(p => p.id));

  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.store;
  let hasChange = false;

  // Xóa sản phẩm cũ không còn
  for (let cursor = await store.openCursor(); cursor; cursor = await cursor.continue()) {
    if (!newIds.has(cursor.key as number)) {
      await cursor.delete();
      hasChange = true;
    }
  }

  // Thêm / cập nhật sản phẩm mới
  for (const p of products) {
    const existing = await store.get(p.id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
      await store.put(p);
      hasChange = true;
    }
    // 🚫 KHÔNG cache ảnh ở đây (transaction đang mở)
  }

  // ✅ Đóng transaction products trước khi thao tác ảnh
  await tx.done;

  // ✅ Cache ảnh SAU transaction (dedupe + await tuần tự để tránh đua)
  const urls = Array.from(new Set(products.map(p => p.image_url).filter(Boolean))) as string[];
  for (const url of urls) {
    try {
      await ensureProductImageCachedByUrl(url);
    } catch (e) {
      console.warn('[syncProducts] cache image failed:', url, e);
    }
  }

  // 🔹 Prefetch ảnh top 5 (nếu không bật tiết kiệm dữ liệu)
  const conn: any = (navigator as any).connection;
  if (!conn?.saveData) {
    const top5 = urls.slice(0, 5);
    if (top5.length) prefetchProductImages(top5);
  } else {
    console.log('⚡ Bỏ qua prefetch ảnh sản phẩm vì bật tiết kiệm dữ liệu');
  }

  return hasChange;
};

/** 🔹 Lưu 1 sản phẩm offline */
export const saveProductOffline = async (product: Product) => {
  const db = await initDB();
  await db.put(STORE_PRODUCTS, product);

  // ✅ Cache ảnh sau khi put (ngoài transaction dài), có thể await cho chắc
  if (product.image_url) {
    try {
      await ensureProductImageCachedByUrl(product.image_url);
    } catch (e) {
      console.warn('[saveProductOffline] cache image failed:', product.image_url, e);
    }
  }
};

/** 🔹 Lấy 1 sản phẩm offline theo id */
export const getProductOffline = async (id: number): Promise<Product | undefined> => {
  const db = await initDB();
  return db.get(STORE_PRODUCTS, id);
};
