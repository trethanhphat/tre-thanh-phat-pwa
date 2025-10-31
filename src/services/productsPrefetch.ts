// ✅ File: src/services/productsPrefetch.ts
import { initDB, STORE_PRODUCTS } from '@/lib/db';
import { ensureImageCachedByUrl } from '@/lib/ensureImageCachedByUrl';
import { Product, syncProducts } from '@/repositories/productsRepository';

let hasPrefetched = false;

/**
 * 🔹 Prefetch sản phẩm từ API (nếu online), lưu IndexedDB và cache ảnh.
 * Chạy 1 lần trong nền (BackgroundPrefetch).
 */
export async function prefetchProductsOnce(force = false) {
  if (hasPrefetched && !force) return;
  hasPrefetched = true;

  if (!navigator.onLine) {
    console.log('[prefetchProductsOnce] offline → bỏ qua');
    return;
  }

  try {
    console.log('[prefetchProductsOnce] Bắt đầu tải sản phẩm từ API...');
    const res = await fetch('/api/products');
    const json = await res.json();

    if (!json?.products || !Array.isArray(json.products)) {
      console.warn('[prefetchProductsOnce] Không có dữ liệu hợp lệ từ API');
      return;
    }

    const products: Product[] = json.products;
    console.log(`[prefetchProductsOnce] Nhận ${products.length} sản phẩm từ API`);

    // 🔹 Lưu sản phẩm vào IndexedDB (đồng bộ tự động)
    await syncProducts(products);

    // 🔹 Cache ảnh từng sản phẩm (không giữ trong RAM)
    for (const p of products) {
      if (p.image_url) {
        await ensureImageCachedByUrl(p.image_url, 'product');
      }
    }

    console.log('[prefetchProductsOnce] ✅ Hoàn tất prefetch sản phẩm & ảnh');
  } catch (err) {
    console.error('[prefetchProductsOnce] ❌ Lỗi:', err);
  }
}
