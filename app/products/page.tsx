// ✅ File: app/products/page.tsx
/**
 * Trang /products
 * - ✅ OFFLINE FIRST:
 *    + Luôn thử load dữ liệu đã cache trong IndexedDB (loadProductsFromDB) trước
 *    + Nếu có → hiển thị ngay (offline mode), kèm banner "⚠️ Đang hiển thị dữ liệu offline"
 *    + Nếu chưa có → báo "⚠️ Chưa có sản phẩm, cần mở online để đồng bộ lần đầu"
 *
 * - ✅ ONLINE UPDATE:
 *    + Gọi API /api/products bằng axios → đồng bộ IndexedDB (syncProducts)
 *    + Nếu có dữ liệu mới khác với cache → cập nhật UI và hiện banner xanh "✅ Đã cập nhật dữ liệu mới"
 *    + Nếu offline/lỗi API → fallback về cache, hiển thị banner cam
 *
 * - ✅ Image cache:
 *    + Dùng hook useImageCacheTracker để prefetch và auto cleanup blob
 *
 * - ✅ Control bar:
 *    + Search theo tên
 *    + Page size (10/20/50…)
 *    + Pagination (Đầu / Trước / nhập số / Sau / Cuối)
 *
 * - ✅ Responsive:
 *    + PC: control bar hiển thị 1 hàng
 *    + Mobile: control bar hiển thị 3 hàng
 *    + Control bar đặt ở cả TRÊN & DƯỚI bảng sản phẩm
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ProductsTable from './ProductsTable';
import ControlBar from '@/components/ControlBar';
import { Product, loadProductsFromDB, syncProducts } from '@/repositories/productRepository';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker';

type SortField = 'stock_status' | 'price' | 'stock_quantity' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  // ---------------------- STATE ----------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [syncedOnce, setSyncedOnce] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sort / Filter / Pagination
  const [sortField, setSortField] = useState<SortField>('stock_status');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const productsRef = useRef<Product[]>([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // ---------------------- IMAGE CACHE ----------------------
  // ✅ Dùng custom hook thay vì tự load blob và revoke
  const imageKeys = products
    .map(p => p.image_url) // ✅ key đúng được lưu trong DB khi sync
    .filter(Boolean) as string[];
  const { imageCache, replaceImageCache } = useImageCacheTracker(imageKeys, { type: 'product' });

  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();

    const hasLocal = cached.length > 0;
    setHasLocalData(hasLocal);

    if (hasLocal) {
      setProducts(cached);
      setUsingCache(true);
    } else {
      setUsingCache(false);
    }

    // ❌ Không setLoading(false) ở đây nữa!
  };

  // ---------------------- ONLINE UPDATE ----------------------
  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { 'Cache-Control': 'no-store' },
        validateStatus: () => true,
      });
      if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);

      const payload = res.data;
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng hợp lệ');
      if (fresh.length === 0) {
        setLoading(false);
        return;
      }

      const hasChange = await syncProducts(fresh);
      setErrorMessage(null);

      if (hasChange) {
        setProducts(fresh);
        // ✅ Reset lại imageCache (hook sẽ tự tải lại blob)
        const keys = fresh.map(p => p.image_url).filter(Boolean) as string[];
        replaceImageCache(Object.fromEntries(keys.map(k => [k, k])));

        setJustUpdated(true);
      } else {
        setJustUpdated(false);
      }
      setUsingCache(false);
      setLoading(false);
    } catch (err: any) {
      console.warn('⚠️ Không thể tải online:', err);
      setErrorMessage(err.message || '⚠️ Có lỗi khi tải dữ liệu');
      setUsingCache(true);
      setJustUpdated(false);
      if (productsRef.current.length === 0) setLoading(false);
    }
  };

  // ---------------------- MOUNT ----------------------
  useEffect(() => {
    const init = async () => {
      await loadOfflineFirst();
      if (navigator.onLine) {
        await fetchOnlineAndUpdate();
        if (!navigator.onLine) {
          if (!hasLocalData) {
            setErrorMessage('⚠️ Chưa có dữ liệu cục bộ — vui lòng online để tải dữ liệu lần đầu.');
          }
          setLoading(false);
        }
      } else {
        setUsingCache(true);
        setLoading(false);
      }
    };
    init();

    const handleOnline = () => fetchOnlineAndUpdate();
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
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

  // ---------------------- RENDER ----------------------
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {usingCache && !justUpdated && (
        <p style={{ color: 'orange' }}>
          ⚠️ Đang hiển thị dữ liệu trên máy (chưa có cập nhật mới).
          {products.length === 0 && ' Chưa có sản phẩm, cần mở online để đồng bộ lần đầu.'}
        </p>
      )}
      {!navigator.onLine && hasLocalData && (
        <p style={{ color: 'orange' }}>📦 Đang hiển thị dữ liệu cục bộ (offline)</p>
      )}

      {!navigator.onLine && !hasLocalData && (
        <p style={{ color: 'red' }}>
          ⚠️ Chưa có dữ liệu cục bộ — vui lòng online để tải dữ liệu lần đầu.
        </p>
      )}

      {navigator.onLine && justUpdated && (
        <p style={{ color: 'green' }}>✅ Vừa cập nhật dữ liệu mới từ server</p>
      )}

      {navigator.onLine && !justUpdated && hasLocalData && (
        <p style={{ color: 'green' }}>✅ Dữ liệu đã là mới nhất</p>
      )}

      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>⚠️ Không có sản phẩm</p>
      ) : (
        <>
          {/* Control bar TRÊN bảng */}
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

          {/* Control bar DƯỚI bảng */}
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

// ---------------------- Helper: Lọc & Sắp xếp ----------------------
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
