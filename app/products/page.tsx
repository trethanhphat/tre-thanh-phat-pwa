// 📄 File: app/products/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ProductsTable from './ProductsTable'; // ✅ chỉ lo HIỂN THỊ bảng + sort icon
import ControlBar from './ControlBar';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products'; // ✅ IndexedDB helpers + type
import { getImageURL } from '@/lib/images'; // ✅ Lấy URL ảnh (online hoặc blob offline)

/**
 * Trang /products
 * - ✅ OFFLINE FIRST: ưu tiên hiển thị dữ liệu đã cache trong IndexedDB (loadProductsFromDB)
 * - ✅ ONLINE UPDATE: gọi API /api/products bằng axios → sync IndexedDB (syncProducts) → cập nhật UI
 * - ✅ Image cache: tạo map id->url (có thể là blob:) + revoke khi thay/umount để tránh memory leak
 * - ✅ Control bar: Search + Page size + Pagination (Đầu/Trước/nhập số/Sau/Cuối)
 * - ✅ Responsive: PC = 1 hàng; Mobile = 3 hàng; HIỂN THỊ Ở CẢ TRÊN & DƯỚI BẢNG
 */
type SortField = 'stock_status' | 'price' | 'stock_quantity' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  // ---------------------- STATE CHÍNH ----------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [imageCache, setImageCache] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true); // spinner lần đầu
  const [offline, setOffline] = useState(false); // đang hiển thị dữ liệu offline
  const [justUpdated, setJustUpdated] = useState(false); // banner "Đã cập nhật"
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // báo lỗi online

  // Sort / Filter / Pagination
  const [sortField, setSortField] = useState<SortField>('stock_status'); // mặc định
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Refs để so sánh/tham chiếu trạng thái trước (tránh setState thừa)
  const productsRef = useRef<Product[]>([]);
  const offlineRef = useRef<boolean>(false);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  // ---------------------- ẢNH: TẠO CACHE SONG SONG ----------------------
  // -> Trả map id -> url (có thể là online url hoặc blob offline)
  const loadImages = async (list: Product[]) => {
    const entries = await Promise.all(
      list.map(async p => {
        // Nếu model có image_url thì convert ra URL phù hợp (online/blob)
        if ((p as any).image_url) return [p.id, await getImageURL((p as any).image_url)] as const;
        return [p.id, ''] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  // -> Thay toàn bộ imageCache + revoke blob cũ để tránh memory leak
  const replaceImageCache = (next: Record<number, string>) => {
    Object.values(imageCache).forEach(url => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setImageCache(next);
  };

  // ---------------------- OFFLINE FIRST ----------------------
  // 1) Load offline trước từ IndexedDB để UI có cái hiển thị ngay
  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();
    if (cached.length > 0) {
      setProducts(cached);
      replaceImageCache(await loadImages(cached));
      setOffline(true);
      setLoading(false); // có dữ liệu → render ngay
    } else {
      setLoading(true); // chưa có gì → spinner
    }
  };

  // 2) Gọi ONLINE bằng axios + cập nhật IndexedDB + UI
  const fetchOnlineAndUpdate = async () => {
    try {
      // ✅ axios: gọi API thật
      const res = await axios.get('/api/products', {
        // tránh cache tĩnh ở một số môi trường
        headers: { 'Cache-Control': 'no-store' },
        // với vercel edge bạn không cần but safe
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`HTTP ${res.status}`);
      }

      const payload = res.data;

      // ✅ API có thể trả về: [ ... ] hoặc { products: [...] } hoặc { data: [...] }
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng hợp lệ');

      // 🎯 Tránh xóa DB khi API tạm thời trả rỗng
      if (fresh.length === 0) {
        setLoading(false);
        return;
      }

      // Đồng bộ IndexedDB
      await syncProducts(fresh);
      setErrorMessage(null);

      // Chỉ setState khi thực sự khác để giảm re-render
      const prev = productsRef.current;
      const isDifferent =
        prev.length !== fresh.length || JSON.stringify(prev) !== JSON.stringify(fresh);

      if (isDifferent) {
        setProducts(fresh);
        replaceImageCache(await loadImages(fresh));

        // ✅ chỉ báo "Đã cập nhật" khi dữ liệu mới thật sự khác
        setJustUpdated(true);
        // setTimeout(() => setJustUpdated(false), 2500);
      }

      setOffline(false);
      setLoading(false);
    } catch (err: any) {
      console.warn('⚠️ Không thể tải online:', err);
      setErrorMessage(err.message || '⚠️ Có lỗi khi tải dữ liệu');
      if (productsRef.current.length === 0) setLoading(false);
      setOffline(true); // Nếu lỗi: vẫn bám offline
      setJustUpdated(false); // 🔑 reset lại, tránh hiển thị sai
    }
  };

  // Mount: chạy offline trước rồi online cập nhật; lắng nghe 'online'
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

  // ---------------------- SORT / FILTER / PAGINATION ----------------------
  const handleSortChange = (field: SortField) => {
    // Click cùng field → đảo chiều; field mới → asc
    if (field === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // đổi sort thì về trang 1
  };

  // Lọc + Sắp xếp (trước khi phân trang)
  const filteredAndSorted = sortedAndFiltered(products, sortField, sortOrder, searchText);

  // Tổng số trang
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

  // Cắt theo trang hiện tại
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Nhập số trang để nhảy
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
      {offline && <p style={{ color: 'orange' }}>⚠️ Đang chờ cập nhật...</p>}
      {justUpdated && !offline && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu mới</p>}

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

          {/* Bảng sản phẩm chỉ lo hiển thị + sort icon + highlight */}
          <ProductsTable
            products={paginatedProducts} // ✅ đã phân trang
            imageCache={imageCache} // ✅ id -> url ảnh
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

/**
 * Lọc + Sắp xếp theo yêu cầu
 * - Dùng Number(...) khi price/stock_quantity có thể là string để sort chính xác
 */
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
