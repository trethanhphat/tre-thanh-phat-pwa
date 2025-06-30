// lib/api/products.ts
import {
  NEXT_PUBLIC_API_PRODUCTS_URL,
  NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY,
  NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET,
} from '@/lib/env';
import { Product } from '@/types/product';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_PRODUCTS_URL}?consumer_key=${process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET}`
  );

  if (!res.ok) {
    throw new Error('Lỗi khi gọi API sản phẩm');
  }

  return res.json();
}
