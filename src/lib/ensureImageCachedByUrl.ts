// ✅ File: src/lib/ensureImageCachedByUrl.ts
/**✅ Đảm bảo ảnh được cache trong IndexedDB theo URL
 * - Hỗ trợ các loại ảnh: 'news' | 'product' | 'generic' (mặc định)
 * - Kiểm tra TTL + meta (etag/blob_hash) để quyết định có tải lại hay không
 * - Lưu trữ ảnh với khoá SHA-256 của URL
 */
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

// Khai báo map từ type sang store name
const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

const CACHE_TTL = 24 * 60 * 60 * 1000; // Thời gian cache 24h (1 ngày) tuỳ chọn

export interface CachedImage {
  key: string; // khoá chính trong DB: key = sha256(url)
  soure_url: string; // giữ lại nếu nơi khác còn dùng
  blob?: Blob; // Lưu blob ảnh
  blob_hash?: string; // hash(blob) để nhận diện trùng lặp nội dung (tên khác)
  last_modified?: string;
  etag?: string;
  lastFetched?: string;
}

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// (tuỳ chọn) meta từ edge, nếu bạn có route này thì giữ; nếu không trả null
export async function fetchImageMeta(
  url: string
): Promise<{ blob_hash?: string; etag?: string; last_modified?: string } | null> {
  try {
    const res = await fetch(`/api/image-meta?url=${encodeURIComponent(url)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ensureImageCachedByUrl(
  soure_url: string,
  type: keyof typeof STORE_MAP = 'generic',
  options?: { forceUpdate?: boolean }
): Promise<void> {
  if (!soure_url) return;

  const db = await initDB();
  const storeName = STORE_MAP[type] ?? STORE_IMAGES;
  // Bắt đầu Console log để biết store đang dùng
  console.log('[src/lib/ensureImageCachedByUrl] 📦 Store đang dùng:', { type, storeName });
  // Kết thúc Console log để biết store đang dùng

  // 1) KIỂM TRA TỒN TẠI THEO index 'source_url' (đúng schema)
  const txRead = db.transaction(storeName);
  const store: any = txRead.store;
  const byUrl = store.index?.('source_url') ? await store.index('source_url').get(soure_url) : null;

  // fallback tìm theo key hash nếu bản ghi cũ không có index
  const key = byUrl?.key ?? (await sha256Hex(soure_url));
  const existing = byUrl ?? (await db.get(storeName, key)); // đọc đơn lẻ, không mở tx dài

  // 2) TTL/meta: quyết định có cần tải lại không
  if (!options?.forceUpdate) {
    const meta = await fetchImageMeta(soure_url); // có thể luôn null nếu không triển khai
    console.log('[src/lib/ensureImageCachedByUrl] 🔍 Meta từ /api/image-meta:', {
      soure_url,
      meta,
    }); // Hiển thị xem có lấy được etag từ image-meta không
    const remoteHash = meta?.blob_hash;
    const remoteEtag = meta?.etag?.replace(/^W\//, ''); // bỏ W/ nếu có
    const remoteLastModified = meta?.last_modified;

    if (existing) {
      // TTL 7 ngày (giữ nguyên hành vi cũ khi meta không có)
      if (!meta && existing.lastFetched) {
        const ageDays = (Date.now() - new Date(existing.lastFetched).getTime()) / 86400000;
        if (ageDays <= 7) return; // còn hạn → bỏ
      }
      // nếu có meta → so sánh hash/etag

      if (
        (remoteHash && existing.blob_hash === remoteHash) ||
        (remoteEtag && existing.etag === remoteEtag)
      ) {
        //  Bắt đầu console log để biết ảnh có thay đổi không
        console.log('[src/lib/ensureImageCachedByUrl] ⚠️ Skip lưu vì ảnh không thay đổi:', {
          soure_url,
          remoteHash,
          existingHash: existing?.blob_hash,
          remoteEtag,
          existingEtag: existing?.etag,
          remoteLastModified,
          existingLastModified: existing?.last_modified,
        });
        // Kết thúc console log để biết ảnh có thay đổi không
        return; // không đổi
      }
    }
  }

  // 3) FETCH NGOÀI IDB (không giữ transaction)
  let res = await fetch(soure_url, {
    cache: 'no-store',
    redirect: 'follow',
    mode: 'cors' as RequestMode,
  });
  const meta = await fetchImageMeta(soure_url);
  const remoteEtag = meta?.etag?.replace(/^W\//, ''); // bỏ W/ nếu có
  const etagHeader = res.headers.get('ETag') ?? remoteEtag ?? undefined;

  // Bắt đầu console log header để biết xem có etag không
  console.log('[src/lib/ensureImageCachedByUrl] 🛰️ Server response headers:', {
    soure_url,
    etagHeader,
    etag: res.headers.get('ETag'),
    contentType: res.headers.get('Content-Type'),
  });
  // Kết thúc console log header xem có etag không
  if (!res.ok) {
    // tuỳ chọn: fallback proxy nếu bạn dùng route proxy
    const proxy = `/api/image-proxy?url=${encodeURIComponent(soure_url)}`;
    res = await fetch(proxy, { cache: 'no-store', redirect: 'follow' });
    const etagFromHeader = res.headers.get('ETag') ?? remoteEtag ?? undefined;
    // Bắt đầu console log header từ proxy
    console.log('[src/lib/ensureImageCachedByUrl] 🛰️ Proxy response headers:', {
      link_load_image: proxy,
      etagFromHeader,
    });
    // Kết thúc console log header từ proxy
    if (!res.ok) return; // đành bỏ qua
  }
  const blob = await res.blob();

  if (!blob || blob.size === 0) return;
  const blob_hash = await hashBlob(blob);
  const etag = remoteEtag ?? etagHeader;
  console.log('[src/lib/ensureImageCachedByUrl] ETag từ server:', etag, blob_hash);

  // nếu trùng blob_hash → khỏi ghi
  if (!options?.forceUpdate && existing?.blob_hash === blob_hash) return;

  // 4) GHI NGẮN: để idb tự mở/đóng transaction
  const record = {
    key, // <<<<<< chìa khoá thực tế trong store
    source_url: soure_url, // để tra cứu qua index lần sau
    blob,
    blob_hash: blob_hash, // nếu bạn đọc ở nơi khác
    etag,
    updated_at: Date.now(),
    // giữ thêm các field cũ nếu bạn muốn tương thích:
    last_modified: meta?.last_modified ?? existing?.last_modified,
    lastFetched: new Date().toISOString(),
  };
  // Ghi đè bản ghi
  // Console log để biết ghi dữ liệu gì
  console.log('[src/lib/ensureImageCachedByUrl] 💾 Lưu ảnh vào IndexedDB:', {
    storeName,
    key,
    soure_url,
    blob_hash,
    etag,
    updated_at: new Date().toISOString(),
  });
  // Kết thúc console log để biết ghi dữ liệu gì
  await db.put(storeName, record);
}
