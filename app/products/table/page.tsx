// ✅ File: app/products/table/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ProductsTable from '../all/ProductsTable';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker'; // ✅ dùng hook thay thế cho tự quản lý blob

type SortField = 'name' | 'price' | 'stock_quantity';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // chỉ true khi chưa có offline và đang đợi online
  const [offline, setOffline] = useState(false); // đang hiển thị dữ liệu offline
  const [justUpdated, setJustUpdated] = useState(false); // banner "Đã cập nhật"
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const productsRef = useRef<Product[]>([]);
  const offlineRef = useRef<boolean>(false);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  // ✅ Hook theo dõi và cache ảnh, tự revoke khi thay đổi hoặc unmount
  const { imageCache, replaceImageCache } = useImageCacheTracker(
    products.map(p => ({ id: p.id, url: p.image_url })),
    { type: 'product' }
  );

  // 1) Load offline trước: nếu có thì hiển thị ngay & bật cờ offline
  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();
    if (cached.length > 0) {
      setProducts(cached);
      setOffline(true);
      setLoading(false); // đã có offline để hiển thị, không cần spinner
    } else {
      setLoading(true); // lần đầu, DB trống -> chờ online
    }
  };

  // 2) Fetch online và cập nhật nếu có dữ liệu
  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      // Hỗ trợ cả 3 dạng: [], { products: [] }, { data: [] }
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) {
        throw new Error('API không trả về mảng sản phẩm hợp lệ');
      }

      // Đồng bộ IndexedDB
      await syncProducts(fresh);

      // So sánh với danh sách đang hiển thị (tránh setState thừa)
      const prev = productsRef.current;
      const isDifferent =
        prev.length !== fresh.length || JSON.stringify(prev) !== JSON.stringify(fresh);

      if (isDifferent) {
        setProducts(fresh);
        replaceImageCache(Object.fromEntries(fresh.map(p => [p.image_url, p.image_url])));
        // ✅ cập nhật cache ảnh
      }

      // Nếu trước đó đang hiển thị offline -> show banner "Đã cập nhật"
      const wasOffline = offlineRef.current;
      setOffline(false);
      setLoading(false);
      if (wasOffline) {
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2500);
      }
    } catch (err) {
      console.warn('⚠️ Không thể tải online:', err);
      // Nếu chưa có offline thì thôi không còn gì để hiển thị -> tắt loading để show "Không có sản phẩm"
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sắp xếp dữ liệu để truyền vào bảng
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
    if (field === sortField) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {/* Banner trạng thái */}
      {offline && (
        <p style={{ color: 'orange', marginBottom: 8 }}>
          ⚠️ Đang hiển thị dữ liệu offline và đang chờ cập nhật...
        </p>
      )}
      {justUpdated && !offline && (
        <p style={{ color: 'green', marginBottom: 8 }}>✅ Đã cập nhật dữ liệu mới</p>
      )}

      {/* Màn hình lần đầu (DB trống) → chỉ hiển thị spinner */}
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
