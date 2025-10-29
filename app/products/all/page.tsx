// ✅ File: app/products/all/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ProductsTable from './ProductsTable';
import { Product, loadProductsFromDB, syncProducts } from '@/repositories/productRepository';
import { getProductImageURL, ensureProductImageCachedByUrl } from '@/services/productImageService';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker';

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
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const productsRef = useRef<Product[]>([]);
  const offlineRef = useRef<boolean>(false);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  useEffect(() => {
    offlineRef.current = offline;
  }, [offline]);

  // ✅ Prefetch & cache toàn bộ ảnh hiển thị
  useImageCacheTracker(products.map(p => p.image_url).filter(Boolean) as string[], {
    type: 'product',
    skipPrefetch: false,
  });

  // ✅ tải ảnh (local blob nếu có cache)
  const loadImages = async (list: Product[]) => {
    const entries = await Promise.all(
      list.map(async p => {
        if (p.image_url) {
          await ensureProductImageCachedByUrl(p.image_url);
          const url = await getProductImageURL(p.image_url);
          return [p.id, url] as const;
        }
        return [p.id, ''] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  const replaceImageCache = (next: Record<number, string>) => {
    Object.entries(imageCache).forEach(([id, url]) => {
      if (typeof url === 'string' && url.startsWith('blob:') && url !== next[Number(id)]) {
        URL.revokeObjectURL(url);
      }
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
    } else {
      setLoading(true);
    }
  };

  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      const fresh: Product[] = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? [];

      if (!Array.isArray(fresh)) throw new Error('⚠️ API không trả về mảng sản phẩm hợp lệ');
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
      if (wasOffline) setJustUpdated(true);
    } catch (err: any) {
      console.warn('⚠️ Không thể tải online:', err);
      setErrorMessage(err.message || '⚠️ Có lỗi khi tải dữ liệu');
      if (productsRef.current.length === 0) setLoading(false);
      setOffline(true);
    }
  };

  // ✅ Thêm lại đoạn này trước useEffect
  const revokeBlobUrls = (cache: Record<number, string>) => {
    Object.values(cache).forEach(url => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // ✅ useEffect chạy khi load trang
  useEffect(() => {
    loadOfflineFirst();
    fetchOnlineAndUpdate();

    const handleOnline = () => fetchOnlineAndUpdate();
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      revokeBlobUrls(imageCache);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
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

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {offline && <p style={{ color: 'orange' }}>⚠️ Đang chờ cập nhật...</p>}
      {justUpdated && !offline && <p style={{ color: 'green' }}>✅ Đã cập nhật dữ liệu mới</p>}

      {loading ? (
        <p>⚠️ Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>⚠️ Không có sản phẩm</p>
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
