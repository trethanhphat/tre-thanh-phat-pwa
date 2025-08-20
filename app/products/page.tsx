// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import Link from 'next/link';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    async function loadOfflineFirst() {
      const offlineData = await loadProductsFromDB();
      if (offlineData.length > 0) {
        setProducts(offlineData);
        setOffline(true);
        setLoading(false);
      }
      // luôn thử fetch online để cập nhật mới
      await syncOnline();
    }

    async function syncOnline() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data?.products) {
          // ✅ truyền data.products vào syncProducts
          const freshProducts = await syncProducts(data.products);
          setProducts(freshProducts);
          setOffline(false);
        }
      } catch (err) {
        console.error('Sync error', err);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    }

    loadOfflineFirst();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (products.length === 0) return <p>Không có sản phẩm</p>;

  return (
    <div>
      {offline && <p>⚠️ Đang hiển thị dữ liệu offline</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.id}`} className="border p-2 rounded block">
            <h2 className="font-bold">{p.name}</h2>
            <p>Giá: {p.price}₫</p>
            <p>Tồn kho: {p.stock_quantity ?? 'Không rõ'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
