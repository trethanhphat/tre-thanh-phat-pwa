// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';
import Link from 'next/link';

type SortKey = 'name' | 'price' | 'stock';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');

  useEffect(() => {
    loadOfflineFirst().then(() => syncOnline());
  }, []);

  async function loadOfflineFirst() {
    const offlineProducts = await loadProductsFromDB();
    if (offlineProducts.length > 0) {
      setProducts(offlineProducts);
      setOffline(true);
    }
    setLoading(false); // ✅ tắt loading sau khi check DB
  }

  async function syncOnline() {
    try {
      const freshProducts = await syncProducts();
      if (freshProducts.length > 0) {
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

  // ✅ Sắp xếp sản phẩm
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return Number(a.price) - Number(b.price);
      case 'stock':
        return (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0);
      default:
        return 0;
    }
  });

  return (
    <div>
      <h1>Sản phẩm</h1>

      {/* ✅ Thanh chọn sắp xếp */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Sắp xếp theo:{' '}
          <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="name">Tên</option>
            <option value="price">Giá</option>
            <option value="stock">Số lượng</option>
          </select>
        </label>
      </div>

      {/* ✅ Banner offline */}
      {offline && <p style={{ color: 'orange' }}>⚠️ Đang hiển thị dữ liệu offline</p>}

      {/* ✅ Hiển thị trạng thái */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : sortedProducts.length === 0 ? (
        <p>Không có sản phẩm</p>
      ) : (
        <div className="product-grid">
          {sortedProducts.map(p => (
            <Link key={p.id} href={`/product/${p.id}`} className="product-card">
              <img src={getImageURL(p.image_url)} alt={p.name} />
              <h2>{p.name}</h2>
              <p>Giá: {p.price}đ</p>
              <p>Còn lại: {p.stock_quantity ?? 'N/A'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
