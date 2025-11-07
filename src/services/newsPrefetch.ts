/**
 * 📄 File: src/services/newsPrefetch.ts
 * 📘 Services: Prefetch News khi mở app lần đầu
 * 🧠 Description:
 * Được gọi khi app mở lần đầu thực hiện trong BackgroundPrefetch component.
 * Mục đích: Kiểm tra lần cuối prefetch so sánh với hiện tại quá thời hạn cập nhật chưa + kiểm tra trạng thái kết nối mạng để tải trước:
 *  - Một số tin tức mới nhất từ API;
 *  - Lưu tin vào IndexedDB;
 *  - Tải và lưu cache ảnh liên quan của 10 tin.
 *
 *
 * 👤 Author: Nguyễn Như Đường (TPB Corp)
 * 🏢 Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * 📅 Created: 2025-10-25
 * 🔄 Last Updated: 2025-11-07
 * 🧩 Maintainer: DevOps Team @ TPB Corp
 *
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

import { initDB, STORE_IMAGES } from '@/lib/db';
import { fetchAndSyncNewsFromAPI } from '@/repositories/newsRepository';
import { ensureNewsImageCachedByUrl } from '@/services/newsImageService';

const PREFETCH_KEY = 'lastPrefetchNews';
const PREFETCH_INTERVAL = 4 * 60 * 60 * 1000; // 4 giờ

function goodConnection(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return navigator.onLine;
  return navigator.onLine && (conn.effectiveType === 'wifi' || conn.downlink > 2);
}

function shouldPrefetch(force = false): boolean {
  if (!force && !goodConnection()) {
    console.log('[newsPrefetch] ⚠️ Skip — poor connection');
    return false;
  }
  const last = Number(localStorage.getItem(PREFETCH_KEY) || 0);
  const should = force || Date.now() - last > PREFETCH_INTERVAL;
  console.log('[newsPrefetch] ⏱ shouldPrefetch =', should, { force, last });
  return should;
}

/**
 * Prefetch news once:
 * - Lấy 10 tin mới nhất từ API + sync vào IndexedDB
 * - Prefetch ảnh top 10
 * - Ghi last-run timestamp (localStorage)
 */

export async function prefetchNewsOnce(force = false) {
  if (!shouldPrefetch(force)) return;

  const jitter = Math.random() * 3000;
  await new Promise(res => setTimeout(res, jitter));

  try {
    console.log('[newsPrefetch] 🚀 Fetching news...');
    const items = await fetchAndSyncNewsFromAPI(10);
    console.log('[newsPrefetch] 📦 Received items:', items?.length ?? 0);

    if (items?.length > 0) {
      const imgs = items.map(i => i.image_url).filter(Boolean) as string[];
      console.log('[newsPrefetch] 🖼️ Start Prefetching images:', imgs.length);
      await Promise.all(imgs.slice(0, 10).map(url => ensureNewsImageCachedByUrl(url)));
    } else {
      console.warn('[newsPrefetch] ⚠️ No news fetched or synced');
    }

    localStorage.setItem(PREFETCH_KEY, Date.now().toString());
    console.log('[newsPrefetch] ✅ Prefetch completed');
  } catch (err) {
    console.warn('[newsPrefetch] ❌ Error during prefetch', err);
  }
}
