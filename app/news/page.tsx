// app/news/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import ControlBar from '@/components/BottomMenu'; // tái dùng y nguyên
import NewsTable from '@app/news/NewsTable'; // tái dùng y nguyên

import { NewsItem, loadNewsFromDB, syncNews } from '@/lib/news';
import { getNewsImageURLByUrl } from '@/lib/news_images';

type SortField = 'published' | 'title' | 'author';
type SortOrder = 'asc' | 'desc';

export default function NewsListPage() {
  // ---------------------- STATE ----------------------
  const [items, setItems] = useState<NewsItem[]>([]);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sort / Filter / Pagination
  const [sortField, setSortField] = useState<SortField>('published');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Ref để biết đã có data khi lỗi online
  const itemsRef = useRef<NewsItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ---------------------- IMAGE CACHE ----------------------
  const loadImages = async (list: NewsItem[]) => {
    const entries = await Promise.all(
      list.map(async (n) => {
        const url = await getNewsImageURLByUrl(n.image_url);
        return [n.news_id, url] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  
  const replaceImageCache = (next: Record<string, string>) => {
    Object.values(imageCache).forEach((url) => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImageCache(next);
  };


  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    const cached = await loadNewsFromDB();
    if (cached.length > 0) {
      setItems(cached);
      replaceImageCache(await loadImages(cached));
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

      if (!Array.isArray(fresh)) throw new Error('API không trả về mảng hợp lệ');
      if (fresh.length === 0) {
        setLoading(false);
        return;
      }

      const hasChange = await syncNews(fresh);
      setErrorMessage(null);

      if (hasChange) {
        setItems(fresh);
        replaceImageCache(await loadImages(fresh));
        setJustUpdated(true); // Có cập nhật mới
      } else {
        setJustUpdated(false); // Dữ liệu giống hệt
        setUsingCache(false);  // Xác nhận bản mới nhất
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

    return () => {
      window.removeEventListener('online', handleOnline);
      // Revoke blob khi unmount
      Object.values(imageCache).forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageCache]);

  // ---------------------- SORT / FILTER / PAGINATION ----------------------
  const handleSortChange = (field: SortField) => {
    if (field === sortField) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">📰 News</h1>

      {/* Banners */}
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
        <div className="p-3 bg-rose-50 border border-rose-200 rounded">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Control Bar (Trên) — tái dùng nguyên bản */}
      <ControlBar
        searchText={searchText}
        setSearchText={(v: string) => {
          setSearchText(v);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        setPageSize={(n: number) => {
          setPageSize(n);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
       // 👇 Tuỳ biến cho News
        searchPlaceholder="🔎 Tìm bài viết..."
        unitLabel="bài/trang"
      />

      {/* Table */}
      <NewsTable
        items={paginatedItems}
        imageCache={imageCache}
        sortField={sortField === 'published' ? 'published' : (sortField as any)}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        searchText={searchText}
      />

      {/* Control Bar (Dưới) — tái dùng nguyên bản */}
      <ControlBar
        searchText={searchText}
        setSearchText={(v: string) => {
          setSearchText(v);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        setPageSize={(n: number) => {
          setPageSize(n);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
       // 👇 Tuỳ biến cho News
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
    ? items.filter((n) => {
        const hay = `${n.title} ${n.summary || ''} ${n.author || ''} ${(n.categories || []).join(' ')}`
          .toLowerCase();
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
