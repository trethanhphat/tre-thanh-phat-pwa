/**********************************************************************
 * 📄 File: File: app/news/page.tsx
 * 📘 Module: Hiển thị danh sách News
 * 🧠 Description:
 * - Trang /news hiển thị danh sách tin tức với cơ chế Offline-First và Online Update.
 * - Sử dụng IndexedDB để lưu trữ dữ liệu tin tức và ảnh tin tức.
 * - Giao diện Responsive với thanh điều khiển (Control Bar) tìm kiếm, phân trang và chọn số lượng bài/trang.
 * - Khi load trang, ưu tiên lấy dữ liệu từ IndexedDB để hiển thị nhanh rồi báo là dữ liệu trên máy.
 * - Nếu mở lần đầu không có tin thì báo là cần kết nối mạng để đồng bộ.
 * - Nếu có kết nối mạng, tự động gọi API để lấy danh sách tin tức mới.
 * - Nếu có thay đổi so với dữ liệu cũ trong IndexedDB thì cập nhật và hiển thị tin mới.
 * - Nếu không có thay đổi thì giữ nguyên dữ liệu cũ.
 * - Nếu có kết nối mạng, tự động gọi API để kiểm tra và cập nhật tin tức mới trong nền và báo lại lên giao diện.
 * - Ảnh tin tức được cache trong IndexedDB với cơ chế nhận diện trùng lặp bằng hash(blob).
 * - Sử dụng hook useImageCacheTracker để đồng bộ ảnh tin tức vào IndexedDB.
 * - Giao diện có thanh điều khiển (Control Bar) để tìm kiếm
 * - Dữ liệu tin tức được lưu trong IndexedDB để truy cập nhanh và offline.
 * - Ảnh tin tức được cache trong IndexedDB với cơ chế nhận diện trùng lặp bằng hash(blob).
 * - Có bảng tin với phân trang, tìm kiếm và sắp xếp.
 *
 * 👤 Author: Nguyễn Như Đường (TPB Corp)
 * 🏢 Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * 📅 Created: 2025-10-25
 * 🔄 Last Updated: 2025-11-07
 * 🧩 Maintainer: DevOps Team @ TPB Corp
 *
 * 🧾 Version: 1.0.2
 * 🪶 Change Log:
 *   - 1.0.2 (2025-11-07): Tối ưu TTL cache ảnh & xử lý offline.
 *   - 1.0.1 (2025-10-30): Bổ sung đồng bộ khi khởi động app.
 *   - 1.0.0 (2025-10-25): Tạo file ban đầu.
 *
 * ⚖️ License: © 2025 TPB Corp. All rights reserved.
 * 📜 Confidentiality: Internal Use Only.
 * 🔐 Compliance: ISO/IEC 27001, ISO/IEC 12207, ISO 9001
 *
 * 🧭 Standards:
 *   - ISO/IEC 12207: Software Life Cycle Processes
 *   - ISO/IEC 25010: Software Quality Requirements
 *   - TTP Internal Coding Standard v2.1
 *
 * 🧩 Dependencies:
 *   - IndexedDB API
 *   - src/lib/db.ts
 *
 * 🧠 Notes:
 *   - TTL cache ảnh tối đa: 4 giờ.
 *   - Ảnh giới hạn kích thước 512x512px để tối ưu.
 */
/**
 * Trang /news
 * - ✅ OFFLINE FIRST:
 *    + Luôn thử load dữ liệu từ IndexedDB trước (loadNewsFromDB)
 *    + Nếu có → hiển thị ngay, đánh dấu đang dùng cache (offline)
 *    + Nếu chưa có → thông báo cần mở online để đồng bộ lần đầu
 *
 * - ✅ ONLINE UPDATE:
 *    + Khi online, gọi /api/news bằng axios để lấy danh sách mới
 *    + Nếu có khác biệt → syncNews và cập nhật IndexedDB
 *    + Nếu không thay đổi → giữ nguyên cache cũ
 *
 * - ✅ IMAGE CACHE (phiên bản mới):
 *    + Dùng useImageCacheTracker('news') để đồng bộ ảnh vào IndexedDB
 *    + Mỗi ảnh được lưu bằng hash(blob) để nhận diện trùng lặp
 *    + Khi render → lấy blob URL từ getImageBlobUrl(url)
 *
 * - ✅ Control Bar:
 *    + Tìm kiếm, phân trang, chọn số lượng bài/trang
 *    + Pagination ở cả TRÊN & DƯỚI bảng tin
 *
 * 🟢 ĐÃ ĐỔI SANG PHƯƠNG ÁN MỚI NHƯ SAU:
 *    - Thay cơ chế cache ảnh cũ bằng hook useImageCacheTracker mới.
 *    - Đồng bộ cách load ảnh giống app/products/page.tsx.
 *    - Dọn dẹp code và đồng nhất cấu trúc, thêm log kiểm soát rõ ràng.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { News } from '@/models/News';
import ControlBar from '@/components/ControlBar';
import NewsTable from './NewsTable';
import { loadNewsFromDB, syncNews } from '@/repositories/newsRepository';
import { useImageCacheTracker } from '@/hooks/useImageCacheTracker'; // ✅ dùng hook mới hợp nhất

type SortField = 'published' | 'title' | 'author';
type SortOrder = 'asc' | 'desc';

export default function NewsListPage() {
  // ---------------------- STATE ----------------------
  const [items, setItems] = useState<News[]>([]); // Tạo mảng lưu trữ tin tức
  const [loading, setLoading] = useState(true); // Tạo trạng thái loading
  const [usingCache, setUsingCache] = useState(false); // Trạng thái đang dùng cache
  const [justUpdated, setJustUpdated] = useState(false); // Trạng thái vừa cập nhật mới
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Lưu thông báo lỗi nếu có

  // ---------------------- IMAGE CACHE ----------------------
  const {
    syncImages,
    getImageBlobUrl,
    loading: imageSyncing,
    progress,
  } = useImageCacheTracker([], { type: 'news' });
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // ---------------------- SORT / FILTER / PAGINATION ----------------------
  const [sortField, setSortField] = useState<SortField>('published');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const itemsRef = useRef<News[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ---------------------- OFFLINE FIRST ----------------------
  const loadOfflineFirst = async () => {
    const cached = await loadNewsFromDB();
    if (cached.length > 0) {
      setItems(cached);
      setUsingCache(true);
      console.log(`🗄 Có ${cached.length} bài trong Local DB`);
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
      if (res.status < 200 || res.status >= 300)
        throw new Error(`HTTP ${res.status}: ${res.data?.error || 'API lỗi'}`);

      const payload = res.data;
      const fresh: News[] = Array.isArray(payload) ? payload : payload?.data ?? [];

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

      // ✅ Sau khi đồng bộ dữ liệu, đồng bộ luôn ảnh offline
      const urls = fresh.map(n => n.image_url).filter(Boolean) as string[];
      if (urls.length) {
        syncImages(urls);
      }
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

  // ---------------------- IMAGE RENDER MAP ----------------------
  useEffect(() => {
    if (!items.length) return;
    (async () => {
      const map: Record<string, string> = {};
      for (const n of items) {
        if (!n.image_url) continue;
        const blobUrl = await getImageBlobUrl(n.image_url, 'news');
        if (blobUrl) map[n.news_id] = blobUrl;
      }
      setImageMap(map);
    })();
  }, [items]); // getImageBlobUrl đã stable

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
      <h1>📰 Danh sách tin tức</h1>
      {errorMessage && !loading && (
        <p style={{ color: 'red', marginBottom: 8 }}>⚠️ {errorMessage}</p>
      )}
      {loading && <p>⏳ Đang tải dữ liệu...</p>}
      {imageSyncing && <p style={{ color: 'dodgerblue' }}>💾 Đang đồng bộ ảnh... {progress}%</p>}
      {usingCache && !loading && (
        <p style={{ color: 'orange', marginBottom: 8 }}>
          ⚠️ Đang hiển thị dữ liệu offline và chờ cập nhật...
        </p>
      )}
      {justUpdated && !usingCache && (
        <p style={{ color: 'green', marginBottom: 8 }}>✅ Đã cập nhật dữ liệu mới</p>
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
        searchPlaceholder="🔎 Tìm bài viết..."
        unitLabel="bài/trang"
      />
    </div>
  );
}

// ---------------------- Helpers ----------------------
function sortedAndFiltered(
  items: News[],
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
