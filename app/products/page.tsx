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

  // Load ảnh song song, trả về object map id -> localUrl
  const loadImages = async (list: Product[]) => {
    const promises = list.map(async p => {
      if (p.image_url) {
        return [p.id, await getImageURL(p.image_url)] as const;
      }
      return [p.id, ''] as const;
    });
    const entries = await Promise.all(promises);
    return Object.fromEntries(entries);
  };

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

        const imgMap = await loadImages(data.products);
        setImageCache(imgMap);
      }
    } catch (error) {
      console.warn('⚠️ Không thể tải online, dùng dữ liệu offline:', error);
      const cachedData = await loadProductsFromDB();
      if (cachedData.length > 0) {
        setProducts(cachedData);

        const imgMap = await loadImages(cachedData);
        setImageCache(imgMap);

        setOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleOnline = () => {
      fetchProducts();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);

      // Giải phóng các Object URLs để tránh rò rỉ bộ nhớ
      Object.values(imageCache).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
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
            <tr style={{ background: 'var(--color-primary)' }}>
              <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Ảnh</th>
              <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                Tên sản phẩm
              </th>
              <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Giá</th>
              <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Tồn kho</th>
              <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td
                  style={{
                    border: '1px solid var(--color-border)',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {imageCache[p.id] ? (
                    <Link href={`/product/${p.id}`}>
                      <img src={imageCache[p.id]} alt={p.name} style={{ maxWidth: '60px' }} />
                    </Link>
                  ) : (
                    <span>...</span>
                  )}
                </td>
                <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                  <Link
                    href={`/product/${p.id}`}
                    style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
                  >
                    {p.name}
                  </Link>
                </td>
                <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                  {p.price}
                </td>
                <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                  {p.stock_quantity ?? '-'}
                </td>
                <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                  {p.stock_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
