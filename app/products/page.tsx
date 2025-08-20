// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';
import Link from 'next/link';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setUpdated(false);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const products: Product[] = Array.isArray(data) ? data : data.data || [];

        if (!Array.isArray(products)) {
          throw new Error('API không trả về mảng sản phẩm');
        }

        await syncProducts(products);
        const cached = await loadProductsFromDB();
        setProducts(cached);
        setUpdated(true); // ✅ hiển thị thông báo đã cập nhật
      } catch (err) {
        console.error('Không thể sync sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Sản phẩm</h1>

      {loading && <p>Đang tải dữ liệu...</p>}
      {updated && !loading && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu</p>}

      <ul>
        {products.map(p => (
          <li key={p.id}>
            <Link href={`/products/${p.id}`}>
              <span>{p.name}</span>
            </Link>
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                width={50}
                height={50}
                onError={e => {
                  e.currentTarget.src = '/assets/icon/no-image.png';
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
