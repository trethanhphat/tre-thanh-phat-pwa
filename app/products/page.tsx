// 📄 File: app/products/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ProductsTable from './ProductsTable'; // ✅ chỉ lo HIỂN THỊ bảng + sort icon
import ControlBar from './ControlBar';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products'; // ✅ IndexedDB helpers + type
import { getImageURL } from '@/lib/images'; // ✅ Lấy URL ảnh (online hoặc blob offline)

type SortField = 'stock_status' | 'price' | 'stock_quantity' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  // ---------------------- STATE ----------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [imageCache, setImageCache] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false); // true = đang hiển thị cache
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sort / Filter / Pagination
  const [sortField, setSortField] = useState<SortField>('stock_status');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // refs để so sánh
  const productsRef = useRef<Product[]>([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // ---------------------- ẢNH CACHE ----------------------
  const loadImages = async (list: Product[]) => {
    const entries = await Promise.all(
      list.map(async p => {
        if ((p as any).image_url) return [p.id, await getImageURL((p as any).image_url)] as const;
        return [p.id, ''] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  const replaceImageCache = (next: Record<number, string>) => {
    Object.values(imageCache).forEach(url => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setImageCache(next);
  };

  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    try {
      const cached = await loadProductsFromDB();
      if (cached.length > 0) {
        setProducts(cached);
        replaceImageCache(await loadImages(cached));
        setOffline(true);
      }
      setLoading(false);
    } catch (err) {
      console.warn('⚠️ Lỗi khi đọc IndexedDB:', err);
      setLoading(false);
    }
  };

  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { 'Cache-Control': 'no-store' },
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`HTTP ${res.status}`);
      }

      const payload = res.data;
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng hợp lệ');

      if (fresh.length === 0) {
        // API rỗng thật
        setProducts([]);
        setOffline(false);
        setLoading(false);
        return;
      }

      await syncProducts(fresh);
      setErrorMessage(null);

      const prev = productsRef.current;
      const isDifferent =
        prev.length !== fresh.length || JSON.stringify(prev) !== JSON.stringify(fresh);

      if (isDifferent) {
        setProducts(fresh);
        replaceImageCache(await loadImages(fresh));
        setJustUpdated(true);
      }

      setOffline(false);
      setLoading(false);
    } catch (err: any) {
      console.warn('⚠️ Không thể tải online:', err);
      setErrorMessage(err.message || '⚠️ Có lỗi khi tải dữ liệu');
      setOffline(true);
      setJustUpdated(false);
      if (productsRef.current.length === 0) setLoading(false);
    }
  };

  // Mount: load offline trước, rồi online
  useEffect(() => {
    loadOfflineFirst();
    fetchOnlineAndUpdate();

    const handleOnline = () => fetchOnlineAndUpdate();
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      Object.values(imageCache).forEach(url => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------- SORT / FILTER / PAGINATION ----------------------
  const handleSortChange = (field: SortField) => {
    if (field === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSorted = sortedAndFiltered(products, sortField, sortOrder, searchText);
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalPages) val = totalPages;
    setCurrentPage(val);
  };

  // ---------------------- RENDER ----------------------
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {offline && products.length > 0 && (
        <p style={{ color: 'orange' }}>⚠️ Đang hiển thị dữ liệu offline</p>
      )}
      {justUpdated && !offline && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu mới</p>}

      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        offline ? (
          <p style={{ color: 'orange' }}>
            ⚠️ Chưa có dữ liệu offline. Hãy mở ứng dụng khi có mạng ít nhất 1 lần để lưu dữ liệu.
          </p>
        ) : (
          <p>⚠️ Không có sản phẩm</p>
        )
      ) : (
        <>
          {/* Control bar TRÊN */}
          <ControlBar
            searchText={searchText}
            setSearchText={setSearchText}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

          <ProductsTable
            products={paginatedProducts}
            imageCache={imageCache}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            searchText={searchText}
          />

          {/* Control bar DƯỚI */}
          <ControlBar
            searchText={searchText}
            setSearchText={setSearchText}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}

// ---------------------- HELPERS ----------------------
function sortedAndFiltered(
  products: Product[],
  sortField: SortField,
  sortOrder: SortOrder,
  searchText: string
) {
  const filtered = products.filter(p => p.name?.toLowerCase().includes(searchText.toLowerCase()));
  return filtered.sort((a, b) => {
    const getVal = (p: Product) => {
      if (sortField === 'stock_status') return (p.stock_status || '').toLowerCase();
      if (sortField === 'name') return (p.name || '').toLowerCase();
      if (sortField === 'price') return Number((p as any).price ?? '0') || 0;
      if (sortField === 'stock_quantity') return Number((p as any).stock_quantity ?? 0);
      return 0;
    };
    const va = getVal(a);
    const vb = getVal(b);
    if (va < vb) return sortOrder === 'asc' ? -1 : 1;
    if (va > vb) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}
