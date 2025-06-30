// app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetchProducts } from '@/lib/api/products';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(err => console.error('Lỗi khi lấy sản phẩm:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
