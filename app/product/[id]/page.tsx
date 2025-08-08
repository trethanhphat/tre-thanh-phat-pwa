'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { openDB } from 'idb';

const DB_NAME = 'TPBC_DB';
const STORE_PRODUCTS = 'products';
const STORE_IMAGES = 'images';

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

async function saveImageIfNotExists(url: string) {
  if (!url) return;
  const db = await initDB();
  const existing = await db.get(STORE_IMAGES, url);
  if (existing) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Lỗi tải ảnh');
    const blob = await res.blob();
    await db.put(STORE_IMAGES, { url, blob });
  } catch (err) {
    console.error('Lỗi tải ảnh:', err);
  }
}

async function getImageURL(url: string): Promise<string> {
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
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let objectUrlToRevoke: string | null = null;

    const fetchProduct = async () => {
      try {
        // 1️⃣ Lấy sản phẩm từ API backend
        const res = await fetch(`/api/product?id=${id}`);
        if (!res.ok) throw new Error('Không thể tải sản phẩm từ API');
        const data = await res.json();

        // 2️⃣ Lưu sản phẩm vào IndexedDB offline
        const db = await initDB();
        await db.put(STORE_PRODUCTS, data);

        // 3️⃣ Xử lý lưu ảnh nếu có
        if (data.image) {
          await saveImageIfNotExists(data.image);
          const localUrl = await getImageURL(data.image);
          objectUrlToRevoke = localUrl;
          if (isMounted) {
            setLocalImageUrl(localUrl);
            data.image_url = localUrl; // để hiển thị ảnh offline
          }
        }

        if (isMounted) setProduct(data);
      } catch (err) {
        console.warn('⚠️ Không có mạng, tải sản phẩm từ offline DB');
        const db = await initDB();
        // id từ params dạng string, convert sang số để get cache
        const offlineData = await db.get(STORE_PRODUCTS, Number(id));
        if (offlineData) {
          const localUrl = await getImageURL(offlineData.image);
          objectUrlToRevoke = localUrl;
          if (isMounted) {
            setLocalImageUrl(localUrl);
            offlineData.image_url = localUrl;
            setProduct(offlineData);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [id]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{product.name}</h1>
      {(localImageUrl || product.image_url || product.image) && (
        <img
          src={localImageUrl || product.image_url || product.image}
          alt={product.name}
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      )}
      <p>💰 Giá: {product.price}₫</p>
      <p>
        📦 Tồn kho: {product.stock_quantity} ({product.stock_status})
      </p>
      <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
    </div>
  );
}
