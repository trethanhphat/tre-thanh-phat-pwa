// ✅ File: src/repositories/productsRepository.ts
import { initDB, STORE_PRODUCTS } from '../lib/db';
import {
  prefetchProductImages,
  ensureProductImageCachedByUrl,
} from '../services/productsImageService'; // ✅ Chuyển hoàn toàn sang module riêng
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
  const all = await db.getAll(STORE_PRODUCTS);
  return all;
};

/** 🔹 Đồng bộ dữ liệu sản phẩm + cache ảnh */
export const syncProducts = async (products: Product[]): Promise<boolean> => {
  const db = await initDB();
  const newIds = new Set(products.map(p => p.id));

  const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
  const store = tx.store;

  let hasChange = false;

  // Xóa sản phẩm cũ không còn
  let cursor = await store.openCursor();
  while (cursor) {
    if (!newIds.has(cursor.key as number)) {
      await cursor.delete();
      hasChange = true;
    }
    cursor = await cursor.continue();
  }

  // Thêm / cập nhật sản phẩm mới
  for (const p of products) {
    const existing = await store.get(p.id);
    if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
      await store.put(p);
      hasChange = true;
    }

    // ✅ Lưu ảnh offline trong nền (phân luồng theo loại product)
    if (p.image_url) {
      ensureProductImageCachedByUrl(p.image_url);
    }
  }

  await tx.done;

  // 🔹 Prefetch ảnh cho top 5 sản phẩm (nếu không bật tiết kiệm dữ liệu)
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    console.log('⚡ Bỏ qua prefetch ảnh sản phẩm vì bật tiết kiệm dữ liệu');
  } else {
    const top5 = products
      .slice(0, 5)
      .map(p => p.image_url)
      .filter(Boolean) as string[];
    if (top5.length) prefetchProductImages(top5); // ✅ Dùng hàm mới riêng cho product
  }

  return hasChange;
};

/** 🔹 Lưu 1 sản phẩm offline */
export const saveProductOffline = async (product: Product) => {
  const db = await initDB();
  await db.put(STORE_PRODUCTS, product);

  if (product.image_url) {
    ensureProductImageCachedByUrl(product.image_url); // ✅ đồng bộ với hàm mới
  }
};

/** 🔹 Lấy 1 sản phẩm offline theo id */
export const getProductOffline = async (id: number): Promise<Product | undefined> => {
  const db = await initDB();
  return db.get(STORE_PRODUCTS, id);
};
