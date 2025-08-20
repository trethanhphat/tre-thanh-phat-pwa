// ✅ File: app/products/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ProductsTable from './ProductsTable';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';

type SortField = 'name' | 'price' | 'stock_quantity';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [imageCache, setImageCache] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true); // lần đầu: DB trống -> spinner
  const [offline, setOffline] = useState(false); // đang hiển thị offline
  const [justUpdated, setJustUpdated] = useState(false); // banner "Đã cập nhật"
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // giữ tham chiếu để so sánh & biết trạng thái trước đó
  const productsRef = useRef<Product[]>([]);
  const offlineRef = useRef<boolean>(false);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  // tải ảnh song song và trả map id -> url (online hoặc blob offline)
  const loadImages = async (list: Product[]) => {
    const entries = await Promise.all(
      list.map(async p => {
        if (p.image_url) return [p.id, await getImageURL(p.image_url)] as const;
        return [p.id, ''] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  // thay image cache và revoke blob cũ để tránh leak
  const replaceImageCache = (next: Record<number, string>) => {
    Object.values(imageCache).forEach(url => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setImageCache(next);
  };

  // 1) load offline trước
  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();
    if (cached.length > 0) {
      setProducts(cached);
      replaceImageCache(await loadImages(cached));
      setOffline(true);
      setLoading(false); // đã có offline để hiển thị
    } else {
      setLoading(true); // chưa có gì -> spinner
    }
  };

  // 2) fetch online và cập nhật
  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      // ✅ PARSE ĐÚNG: API của bạn là { products: [...] }
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng sản phẩm hợp lệ');

      // 🎯 Tránh xoá DB khi API tạm thời trả rỗng
      if (fresh.length === 0) {
        setLoading(false);
        return;
      }

      await syncProducts(fresh);

      // chỉ setState khi khác
      const prev = productsRef.current;
      const isDifferent =
        prev.length !== fresh.length || JSON.stringify(prev) !== JSON.stringify(fresh);

      if (isDifferent) {
        setProducts(fresh);
        replaceImageCache(await loadImages(fresh));
      }

      const wasOffline = offlineRef.current;
      setOffline(false);
      setLoading(false);
      if (wasOffline) {
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2500);
      }
    } catch (err) {
      console.warn('⚠️ Không thể tải online:', err);
      if (productsRef.current.length === 0) setLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineFirst();
    fetchOnlineAndUpdate();

    const handleOnline = () => fetchOnlineAndUpdate();
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      // revoke blob khi unmount
      Object.values(imageCache).forEach(url => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sort client-side
  const sortedProducts = [...products].sort((a, b) => {
    const getVal = (p: Product) => {
      if (sortField === 'name') return (p.name || '').toLowerCase();
      if (sortField === 'price') return Number(p.price || '0') || 0;
      if (sortField === 'stock_quantity') return Number(p.stock_quantity ?? 0);
      return 0;
    };
    const va = getVal(a);
    const vb = getVal(b);
    if (va < vb) return sortOrder === 'asc' ? -1 : 1;
    if (va > vb) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (field: SortField) => {
    if (field === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {/* trạng thái hiển thị */}
      {offline && (
        <p style={{ color: 'orange', marginBottom: 8 }}>
          ⚠️ Đang hiển thị dữ liệu offline và đang chờ cập nhật...
        </p>
      )}
      {justUpdated && !offline && (
        <p style={{ color: 'green', marginBottom: 8 }}>✅ Đã cập nhật dữ liệu mới</p>
      )}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>Không có sản phẩm</p>
      ) : (
        <ProductsTable
          products={sortedProducts}
          imageCache={imageCache}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}
