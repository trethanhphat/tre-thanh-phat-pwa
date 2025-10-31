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
 * - ✅ IMAGE CACHE (phiên bản mới):
 *    + Dùng hook useImageCacheTracker('products') thay vì truyền danh sách keys
 *    + Khi có dữ liệu mới → gọi syncImages(urls) để prefetch blob và lưu IndexedDB
 *    + Khi render → getImageBlobUrl(url) để lấy blobUrl hiển thị
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
 *
 * 🟢 ĐÃ ĐỔI SANG PHƯƠNG ÁN MỚI NHƯ SAU:
 *    - Thay toàn bộ cơ chế imageCache cũ (imageKeys, replaceImageCache) bằng hook hợp nhất.
 *    - Dùng { syncImages, getImageBlobUrl, progress } từ useImageCacheTracker.
 *    - Có bước map blobUrl → imageMap giống như bên News.
 *    - Giảm code trùng, đồng nhất với app/news/page.tsx.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ProductsTable from './ProductsTable';
import ControlBar from '@/components/ControlBar';
import { Product, loadProductsFromDB, syncProducts } from '@/repositories/productRepository';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker'; // ✅ hook hợp nhất mới

type SortField = 'stock_status' | 'price' | 'stock_quantity' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  // ---------------------- STATE ----------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
  const {
    syncImages,
    getImageBlobUrl,
    loading: imageSyncing,
    progress,
  } = useImageCacheTracker('products');
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();
    if (cached.length > 0) {
      setProducts(cached);
      setUsingCache(true);
      console.log(`🗄 Có ${cached.length} sản phẩm trong Local DB`);
    }
    setLoading(false);
  };

  // ---------------------- ONLINE UPDATE ----------------------
  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { 'Cache-Control': 'no-store' },
        validateStatus: () => true,
      });
      if (res.status < 200 || res.status >= 300)
        throw new Error(`HTTP ${res.status}: ${res.data?.error || 'API lỗi'}`);

      const payload = res.data;
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh) || fresh.length === 0) {
        setLoading(false);
        return;
      }

      const hasChange = await syncProducts(fresh);
      setErrorMessage(null);

      if (hasChange) {
        setProducts(fresh);
        setJustUpdated(true);
      } else {
        setJustUpdated(false);
      }

      setUsingCache(false);
      setLoading(false);

      // ✅ Sau khi sync sản phẩm, đồng bộ luôn ảnh
      const urls = fresh.map(p => p.image_url).filter(Boolean) as string[];
      if (urls.length) {
        syncImages(urls);
      }
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
      } else {
        setUsingCache(true);
        setLoading(false);
      }
    };
    init();

    const handleOnline = () => fetchOnlineAndUpdate();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ---------------------- IMAGE BLOB MAP ----------------------
  useEffect(() => {
    if (!products.length) return;
    (async () => {
      const map: Record<string, string> = {};
      for (const p of products) {
        if (!p.image_url) continue;
        const blobUrl = await getImageBlobUrl(p.image_url);
        if (blobUrl) map[p.id ?? p.sku ?? p.name] = blobUrl;
      }
      setImageMap(map);
    })();
  }, [products, getImageBlobUrl]);

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

      {loading && <p>⏳ Đang tải dữ liệu...</p>}
      {imageSyncing && <p style={{ color: 'dodgerblue' }}>💾 Đang đồng bộ ảnh... {progress}%</p>}
      {usingCache && !loading && (
        <p style={{ color: 'orange' }}>⚠️ Đang hiển thị dữ liệu offline và chờ cập nhật...</p>
      )}
      {justUpdated && !usingCache && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu mới</p>}
      {errorMessage && !loading && <p style={{ color: 'red' }}>⚠️ {errorMessage}</p>}

      <ControlBar
        searchText={searchText}
        setSearchText={v => {
          setSearchText(v);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        setPageSize={n => {
          setPageSize(n);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        searchPlaceholder="🔎 Tìm sản phẩm..."
        unitLabel="sp/trang"
      />

      <ProductsTable
        products={paginatedProducts}
        imageCache={imageMap}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        searchText={searchText}
      />

      <ControlBar
        searchText={searchText}
        setSearchText={v => {
          setSearchText(v);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        setPageSize={n => {
          setPageSize(n);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        searchPlaceholder="🔎 Tìm sản phẩm..."
        unitLabel="sp/trang"
      />
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
