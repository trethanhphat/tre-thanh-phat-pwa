// ✅ File: app/products-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [imageCache, setImageCache] = useState<{ [id: number]: string }>({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products-list');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data?.products) {
        setProducts(data.products);
        await syncProducts(data.products);
        setOffline(false);
        loadImages(data.products);
      }
    } catch (error) {
      console.warn('⚠️ Không thể tải online, dùng dữ liệu offline:', error);
      const cachedData = await loadProductsFromDB();
      if (cachedData.length > 0) {
        setProducts(cachedData);
        loadImages(cachedData);
        setOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (list: Product[]) => {
    const imgMap: { [id: number]: string } = {};
    for (const p of list) {
      if (p.image_url) {
        imgMap[p.id] = await getImageURL(p.image_url);
      }
    }
    setImageCache(imgMap);
  };

  useEffect(() => {
    fetchProducts();
    const handleOnline = () => fetchProducts();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>
      {offline && <p style={{ color: 'orange' }}>⚠️ Đang hiển thị dữ liệu offline</p>}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>Không có sản phẩm</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ảnh</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tên sản phẩm</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Giá</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tồn kho</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                  {imageCache[p.id] && (
                    <img src={imageCache[p.id]} alt={p.name} style={{ maxWidth: '60px' }} />
                  )}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.price}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {p.stock_quantity ?? '-'}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.stock_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
