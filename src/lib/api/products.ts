// lib/api/products.ts

import { Product } from '@/types/product';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(
    `https://rungkhoai.com/wp-json/wc/v3/products?consumer_key=${process.env.NEXT_PUBLIC_RUNGKHOAI_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_RUNGKHOAI_CONSUMER_SECRET}`
  );

  if (!res.ok) {
    throw new Error('Lỗi khi gọi API sản phẩm');
  }

  return res.json();
}
