// ✅ File: app/news/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ControlBar from '@/components/ControlBar';
import NewsTable from '@app/news/NewsTable';
import { NewsItem, loadNewsFromDB, syncNews } from '@/lib/news';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker'; // ✅ dùng hook mới theo dõi cache ảnh

type SortField = 'published' | 'title' | 'author';
type SortOrder = 'asc' | 'desc';

export default function NewsListPage() {
  // ---------------------- STATE ----------------------
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageURLs = items.map(n => n.image_url).filter(Boolean) as string[];
  const { imageCache, replaceImageCache } = useImageCacheTracker(imageURLs, { type: 'news' });

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
      console.log(`🗄 Có ${cached.length} mục trong Local DB`); // Hiện số mục tin được lưu trong Local DB
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
        // setTimeout(() => setJustUpdated(false), 2500); // ✅ tự ẩn banner sau 2.5s
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
    <div style={{ padding: '1rem' }}>
      <h1>📰 News</h1>

      {loading && <p>Đang tải dữ liệu...</p>}
      {usingCache && !loading && (
        <p style={{ color: 'orange', marginBottom: 8 }}>
          ⚠️ Đang hiển thị dữ liệu offline và đang chờ cập nhật...
        </p>
      )}
      {justUpdated && !usingCache && (
        <p style={{ color: 'green', marginBottom: 8 }}>✅ Đã cập nhật dữ liệu mới</p>
      )}
      {errorMessage && !loading && (
        <p style={{ color: 'red', marginBottom: 8 }}>⚠️ {errorMessage}</p>
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
        imageCache={imageCache} // ✅ truyền cache blob thực tế
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
        const ad = new Date(a.published || a.updated || '').getTime();
        const bd = new Date(b.published || b.updated || '').getTime();
        return (ad - bd) * dir;
      }
    }
  });

  return sorted;
}
