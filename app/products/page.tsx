// File: app/products/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import ProductsTable from './ProductsTable';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';

type SortField = 'stock_status' | 'price' | 'stock_quantity' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [imageCache, setImageCache] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('stock_status');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // số sản phẩm / trang
  const [searchText, setSearchText] = useState('');

  const productsRef = useRef<Product[]>([]);
  const offlineRef = useRef<boolean>(false);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  const loadImages = async (list: Product[]) => {
    const entries = await Promise.all(
      list.map(async p => {
        if (p.image_url) return [p.id, await getImageURL(p.image_url)] as const;
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

  const loadOfflineFirst = async () => {
    const cached = await loadProductsFromDB();
    if (cached.length > 0) {
      setProducts(cached);
      replaceImageCache(await loadImages(cached));
      setOffline(true);
      setLoading(false);
    } else setLoading(true);
  };

  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng hợp lệ');
      if (fresh.length === 0) {
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
      }

      const wasOffline = offlineRef.current;
      setOffline(false);
      setLoading(false);
      if (wasOffline) {
        setJustUpdated(true);
        // setTimeout(() => setJustUpdated(false), 2500);
      }
    } catch (err: any) {
      console.warn('⚠️ Không thể tải online:', err);
      setErrorMessage(err.message || '⚠️ Có lỗi khi tải dữ liệu');
      if (productsRef.current.length === 0) setLoading(false);
      setOffline(true);
    }
  };

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
  }, []);

  const handleSortChange = (field: SortField) => {
    if (field === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // reset page khi đổi sort
  };

  const filteredProducts = sortedAndFiltered(products, sortField, sortOrder, searchText);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) setCurrentPage(val);
  };

  const renderControls = () => (
    <>
      <div style={{ margin: '0.5rem 0' }}>
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{ marginRight: 12 }}
        />

        <label>
          Sản phẩm / trang:&nbsp;
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Trang{' '}
          <input
            type="number"
            value={currentPage}
            onChange={handlePageInput}
            style={{ width: 50 }}
          />{' '}
          / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {offline && <p style={{ color: 'orange' }}>⚠️ Đang chờ cập nhật...</p>}
      {justUpdated && !offline && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu mới</p>}

      {loading ? (
        <p>⚠️ Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>⚠️ Không có sản phẩm</p>
      ) : (
        <>
          <ProductsTable
            products={paginatedProducts}
            imageCache={imageCache}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </>
      )}
    </div>
  );
}

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
}
