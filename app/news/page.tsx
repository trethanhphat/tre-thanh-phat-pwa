// app/news/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ControlBar from '@/components/ControlBar';
import NewsTable from '@app/news/NewsTable';
import { NewsItem, loadNewsFromDB, syncNews } from '@/lib/news';
import { useImageCache } from '@/hooks/useImageCache';
import { useImageLoadTracker } from '@/hooks/useImageLoadTracker';

type SortField = 'published' | 'title' | 'author';
type SortOrder = 'asc' | 'desc';

export default function NewsListPage() {
  // ---------------------- STATE ----------------------
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useImageLoadTracker(items.map(n => n.image_url).filter(Boolean) as string[]);
  const imageMap = useImageCache(items);

  // Sort / Filter / Pagination
  const [sortField, setSortField] = useState<SortField>('published');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const itemsRef = useRef<NewsItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    const cached = await loadNewsFromDB();
    if (cached.length > 0) {
      setItems(cached);

      setUsingCache(true);
    }
    setLoading(false);
  };

  // ---------------------- ONLINE UPDATE ----------------------
  const fetchOnlineAndUpdate = async () => {
    try {
      const res = await axios.get('/api/news', {
        headers: { 'Cache-Control': 'no-store' },
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`HTTP ${res.status}: ${res.data?.error || 'API lỗi'}`);
      }

      const payload = res.data;
      const fresh: NewsItem[] = Array.isArray(payload) ? payload : payload?.data ?? [];

      if (!Array.isArray(fresh) || fresh.length === 0) {
        setLoading(false);
        return;
      }

      const hasChange = await syncNews(fresh);
      setErrorMessage(null);

      if (hasChange) {
        setItems(fresh);
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
      if (itemsRef.current.length === 0) setLoading(false);
    }
  };

  // ---------------------- MOUNT ----------------------
  useEffect(() => {
    const init = async () => {
      await loadOfflineFirst();
      if (typeof navigator !== 'undefined' && navigator.onLine) {
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

  // ---------------------- SORT / FILTER / PAGINATION ----------------------
  const handleSortChange = (field: SortField) => {
    if (field === sortField) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSorted = sortedAndFiltered(items, sortField, sortOrder, searchText);
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ---------------------- RENDER ----------------------
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">📰 News</h1>

      {loading && <div className="p-3 bg-gray-50 border rounded">Đang tải...</div>}
      {usingCache && !loading && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
          ⚠️ Đang hiển thị dữ liệu <b>offline</b> từ cache
        </div>
      )}
      {justUpdated && !loading && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          ✅ Đã cập nhật dữ liệu mới
        </div>
      )}
      {errorMessage && !loading && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded">⚠️ {errorMessage}</div>
      )}

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
        searchPlaceholder="🔎 Tìm bài viết..."
        unitLabel="bài/trang"
      />

      <NewsTable
        items={paginatedItems}
        imageCache={imageMap} // ✅ thay hook riêng bằng map blob đã cache
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
        searchPlaceholder="🔎 Tìm bài viết..."
        unitLabel="bài/trang"
      />
    </div>
  );
}

// ---------------------- Helpers ----------------------
function sortedAndFiltered(
  items: NewsItem[],
  sortField: SortField,
  sortOrder: SortOrder,
  searchText: string
) {
  const q = (searchText || '').toLowerCase().trim();

  const filtered = q
    ? items.filter(n => {
        const hay = `${n.title} ${n.summary || ''} ${n.author || ''} ${(n.categories || []).join(
          ' '
        )}`.toLowerCase();
        return hay.includes(q);
      })
    : items;

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'author':
        return (a.author || '').localeCompare(b.author || '') * dir;
      case 'published':
      default: {
        const ad = a.published || a.updated || '';
        const bd = b.published || b.updated || '';
        return ad.localeCompare(bd) * dir;
      }
    }
  });

  return sorted;
}
