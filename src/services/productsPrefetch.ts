// ✅ File: src/services/productsPrefetch.ts
import { loadProductsFromDB, syncProducts } from '@/repositories/productRepository';
import { prefetchProductImages } from '@/services/productImageService';
import { fetchProductsFromAPI } from '@/services/api'; // <-- nếu bạn có API riêng

let hasPrefetched = false;

/** 🔹 Chạy 1 lần duy nhất để prefetch sản phẩm + ảnh */
export async function prefetchProductsOnce() {
  if (hasPrefetched) return;
  hasPrefetched = true;

  try {
    const products = await fetchProductsFromAPI(); // giả định có hàm này
    await syncProducts(products);
    prefetchProductImages(products.map(p => p.image_url).filter(Boolean) as string[]);
    console.log('✅ Prefetched products & images');
  } catch (err) {
    console.error('❌ Prefetch products failed:', err);
  }
}
