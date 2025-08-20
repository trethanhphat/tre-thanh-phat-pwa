// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import Link from 'next/link';

// Hàm render trạng thái dạng badge
function formatStockStatus(status?: string) {
  switch (status) {
    case 'instock':
      return { text: 'Còn hàng', color: 'green' };
    case 'outofstock':
      return { text: 'Hết hàng', color: 'red' };
    case 'onbackorder':
      return { text: 'Đặt trước', color: 'orange' };
    default:
      return { text: 'Không rõ', color: 'gray' };
  }
}

// Icon sort
function renderSortIcon(key: string, sortKey: string, sortAsc: boolean) {
  if (key !== sortKey) return '↕';
  return sortAsc ? '▲' : '▼';
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  // sort state
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);

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
        setUpdated(true);
      } catch (err) {
        console.error('Không thể sync sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm sort
  const handleSort = (key: keyof Product) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const av = (a[sortKey] ?? '').toString();
    const bv = (b[sortKey] ?? '').toString();
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  return (
    <div>
      <h1>Sản phẩm</h1>

      {loading && <p>Đang tải dữ liệu...</p>}
      {updated && !loading && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                ID {renderSortIcon('id', sortKey, sortAsc)}
              </th>
              <th>Ảnh</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Tên {renderSortIcon('name', sortKey, sortAsc)}
              </th>
              <th>Giá</th>
              <th>Kho</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(p => {
              const { text, color } = formatStockStatus(p.stock_status);
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{p.id}</td>
                  <td>
                    <img
                      src={p.image_url || '/assets/icon/no-image.png'}
                      alt={p.name}
                      width={50}
                      height={50}
                      onError={e => {
                        e.currentTarget.src = '/assets/icon/no-image.png';
                      }}
                    />
                  </td>
                  <td>
                    <Link href={`/products/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.price || '-'}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: color + '20',
                        color,
                        fontSize: '0.85em',
                      }}
                    >
                      {text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
