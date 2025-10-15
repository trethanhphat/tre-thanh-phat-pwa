// File: app/product/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { saveProductOffline, getProductOffline } from '@/lib/products';
import { saveImageIfNotExists, getImageURL } from '@/lib/images';
import { formatPrice, formatStockStatus } from '@/utils/format';

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let objectUrlToRevoke: string | null = null;

    const loadProduct = async () => {
      try {
        // --- ƯU TIÊN ONLINE ---
        const res = await fetch(`/api/product?id=${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Không thể tải sản phẩm từ API');
        const data = await res.json();

        await saveProductOffline(data); // ✅ đồng bộ offline

        if (data.image_url) {
          await saveImageIfNotExists(data.image_url);
          const localUrl = await getImageURL(data.image_url);
          objectUrlToRevoke = localUrl;
          if (isMounted) {
            data.image_url = localUrl;
            setLocalImageUrl(localUrl);
          }
        }

        if (isMounted) setProduct(data);
      } catch (err) {
        console.warn('⚠️ Offline hoặc lỗi API, fallback IndexedDB');
        const offlineData = await getProductOffline(Number(id));
        if (offlineData) {
          if (offlineData.image_url) {
            const localUrl = await getImageURL(offlineData.image_url);
            objectUrlToRevoke = localUrl;
            if (isMounted) {
              offlineData.image_url = localUrl;
            }
          }
          if (isMounted) {
            setProduct(offlineData);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [id]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div style={{ padding: 20 }}>
      <p>
        <a className="button" href="/products">
          <strong>Quay trở về danh sách sản phẩm</strong>
        </a>
      </p>
      <h1>{product.name}</h1>

      {(localImageUrl || product.image_url) && (
        <img
          src={localImageUrl || product.image_url}
          alt={product.name}
          style={{ maxWidth: 300, borderRadius: 8 }}
        />
      )}
      <p>💰 Giá: {formatPrice(product.price)}</p>
      <p>
        📦 Tồn kho: {product.stock_quantity ?? '-'} (
        {(() => {
          const { text, color } = formatStockStatus(product.stock_status);
          return <span style={{ color }}>{text}</span>;
        })()}
        )
      </p>
      <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
      <p>
        <a className="button" href="/products">
          <strong>Quay trở về danh sách sản phẩm</strong>
        </a>
      </p>
    </div>
  );
}
