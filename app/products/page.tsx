// app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '@/lib/api/products';
import type { Product } from '@/types/product';

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
            <div key={product.id} className="border rounded-lg p-2 shadow">
              <img
                src={product.images?.[0]?.src}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
              <p className="text-green-700 font-medium">{product.price}₫</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
