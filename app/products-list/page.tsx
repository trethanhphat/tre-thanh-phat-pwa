// ✅ File: app/products-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { openDB } from 'idb';

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  stock_status: string;
}

const DB_NAME = 'TPBC_DB';
const STORE_NAME = 'products';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  // Mở hoặc tạo DB IndexedDB
  const initDB = async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  };

  // Lấy dữ liệu từ IndexedDB
  const loadFromDB = async () => {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
  };

  // Lưu dữ liệu mới và xóa dữ liệu cũ
  const syncDB = async (data: Product[]) => {
    const db = await initDB();

    // Danh sách ID mới
    const newIds = new Set(data.map(p => p.id));

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;

    // Xóa bản ghi cũ không còn trong API
    let cursor = await store.openCursor();
    while (cursor) {
      if (!newIds.has(cursor.key as number)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }

    // Thêm hoặc cập nhật sản phẩm mới
    for (const item of data) {
      await store.put(item);
    }

    await tx.done;
  };

  // Lấy sản phẩm từ API hoặc DB offline
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products-list');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data?.products) {
        setProducts(data.products);
        await syncDB(data.products); // Đồng bộ DB
        setOffline(false);
      }
    } catch (error) {
      console.warn('⚠️ Không thể tải online, dùng dữ liệu offline:', error);
      const cachedData = await loadFromDB();
      if (cachedData.length > 0) {
        setProducts(cachedData as Product[]);
        setOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Khi online thì đồng bộ lại
    const handleOnline = () => fetchProducts();
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
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
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            border: '1px solid #ccc',
          }}
        >
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tên sản phẩm</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Giá</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tồn kho</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.id}</td>
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
