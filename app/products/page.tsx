// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock_quantity'>('name');

  // Tải dữ liệu offline trước
  useEffect(() => {
    const loadData = async () => {
      const cached = await loadProductsFromDB();
      setProducts(cached);
      setLoading(false);

      // Thử sync từ API
      try {
        const res = await fetch('/api/product');
        if (res.ok) {
          const fresh = await res.json();
          await syncProducts(fresh);
          setProducts(fresh);
          setUpdated(true);
          setTimeout(() => setUpdated(false), 2000);
        }
      } catch (err) {
        console.warn('Không thể sync sản phẩm:', err);
      }
    };
    loadData();
  }, []);

  // Hàm lấy ảnh offline
  const resolveImage = async (p: Product) => {
    if (!p.image_url) return '';
    return await getImageURL(p.image_url);
  };

  // Sắp xếp danh sách
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return Number(a.price) - Number(b.price);
    if (sortBy === 'stock_quantity') return (a.stock_quantity || 0) - (b.stock_quantity || 0);
    return 0;
  });

  if (loading) return <div>⏳ Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Sản phẩm</h1>

      {updated && <div style={{ color: 'green', marginBottom: 8 }}>✅ Đã cập nhật dữ liệu mới</div>}

      <div style={{ marginBottom: 12 }}>
        <label>Sắp xếp theo: </label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="name">Tên</option>
          <option value="price">Giá</option>
          <option value="stock_quantity">Số lượng</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {sortedProducts.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
            <strong>{p.name}</strong>
            <div>Giá: {p.price} đ</div>
            <div>Số lượng: {p.stock_quantity}</div>
            <div>Trạng thái: {p.stock_status}</div>
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                style={{ maxWidth: '100%', marginTop: 8, borderRadius: 4 }}
                onError={async e => {
                  const offlineURL = await resolveImage(p);
                  if (offlineURL) (e.currentTarget as HTMLImageElement).src = offlineURL;
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
