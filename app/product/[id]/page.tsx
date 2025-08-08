// ✅ File: app/product/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { openDB } from 'idb';

const DB_NAME = 'TPBC_DB';
const STORE_PRODUCTS = 'products';
const STORE_IMAGES = 'images';

// Khởi tạo DB
async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'url' });
      }
    },
  });
}

// Lưu ảnh nếu chưa có
async function saveImageIfNotExists(url: string) {
  if (!url) return;
  const db = await initDB();
  const existing = await db.get(STORE_IMAGES, url);
  if (existing) return;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    await db.put(STORE_IMAGES, { url, blob });
  } catch (err) {
    console.error('Lỗi tải ảnh:', err);
  }
}

// Lấy ảnh offline nếu có
async function getImageURL(url: string) {
  if (!url) return '';
  const db = await initDB();
  const record = await db.get(STORE_IMAGES, url);
  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }
  return url; // fallback online
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        // 1️⃣ Lấy từ API
        const res = await fetch(`/api/product?id=${id}`);
        if (!res.ok) throw new Error('Không thể tải sản phẩm từ API');
        const data = await res.json();

        // 2️⃣ Lưu DB offline
        const db = await initDB();
        await db.put(STORE_PRODUCTS, data);

        // 3️⃣ Cache ảnh chung
        if (data.image_url) {
          await saveImageIfNotExists(data.image_url);
          data.image_url = await getImageURL(data.image_url);
        }

        setProduct(data);
      } catch (err) {
        console.warn('⚠️ Không có mạng, tải sản phẩm từ offline DB');
        const db = await initDB();
        const offlineData = await db.get(STORE_PRODUCTS, Number(id));
        if (offlineData) {
          offlineData.image_url = await getImageURL(offlineData.image_url);
          setProduct(offlineData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{product.name}</h1>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          style={{ maxWidth: '300px', borderRadius: '8px' }}
        />
      )}
      <p>💰 Giá: {product.price}₫</p>
      <p>
        📦 Tồn kho: {product.stock_quantity} ({product.stock_status})
      </p>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </div>
  );
}
