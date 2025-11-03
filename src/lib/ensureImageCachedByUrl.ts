// ✅ File: src/lib/ensureImageCachedByUrl.ts (phiên bản an toàn)
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

const CACHE_TTL = 24 * 60 * 60 * 1000; // tuỳ chọn

export interface CachedImage {
  url: string; // giữ lại nếu nơi khác còn dùng
  blob?: Blob;
  hash?: string;
  etag?: string;
  lastFetched?: string;
  // khoá thực tế trong DB: key = sha256(url)
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
): Promise<{ hash?: string; etag?: string } | null> {
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
  url: string,
  type: keyof typeof STORE_MAP = 'generic',
  options?: { forceUpdate?: boolean }
): Promise<void> {
  if (!url) return;

  const db = await initDB();
  const storeName = STORE_MAP[type] ?? STORE_IMAGES;

  // 1) KIỂM TRA TỒN TẠI THEO index 'source_url' (đúng schema)
  const txRead = db.transaction(storeName);
  const store: any = txRead.store;
  const byUrl = store.index?.('source_url') ? await store.index('source_url').get(url) : null;

  // fallback tìm theo key hash nếu bản ghi cũ không có index
  const key = byUrl?.key ?? (await sha256Hex(url));
  const existing = byUrl ?? (await db.get(storeName, key)); // đọc đơn lẻ, không mở tx dài

  // 2) TTL/meta: quyết định có cần tải lại không
  if (!options?.forceUpdate) {
    const meta = await fetchImageMeta(url); // có thể luôn null nếu không triển khai
    const remoteHash = meta?.hash;
    const remoteEtag = meta?.etag;

    if (existing) {
      // TTL 7 ngày (giữ nguyên hành vi cũ khi meta không có)
      if (!meta && existing.lastFetched) {
        const ageDays = (Date.now() - new Date(existing.lastFetched).getTime()) / 86400000;
        if (ageDays <= 7) return; // còn hạn → bỏ
      }
      // nếu có meta → so sánh hash/etag
      if (
        (remoteHash && existing.hash === remoteHash) ||
        (remoteEtag && existing.etag === remoteEtag)
      ) {
        return; // không đổi
      }
    }
  }

  // 3) FETCH NGOÀI IDB (không giữ transaction)
  let res = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow',
    mode: 'cors' as RequestMode,
  });
  if (!res.ok) {
    // tuỳ chọn: fallback proxy nếu bạn dùng route proxy
    const proxy = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    res = await fetch(proxy, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) return; // đành bỏ qua
  }
  const blob = await res.blob();
  if (!blob || blob.size === 0) return;

  const hash = await hashBlob(blob);
  const etag = res.headers.get('ETag') ?? undefined;

  // nếu trùng hash → khỏi ghi
  if (!options?.forceUpdate && existing?.hash === hash) return;

  // 4) GHI NGẮN: để idb tự mở/đóng transaction
  const record = {
    key, // <<<<<< chìa khoá thực tế trong store
    source_url: url, // để tra cứu qua index lần sau
    blob,
    blob_hash: hash, // nếu bạn đọc ở nơi khác
    etag,
    updated_at: Date.now(),
    // giữ thêm các field cũ nếu bạn muốn tương thích:
    url,
    hash,
    lastFetched: new Date().toISOString(),
  };
  await db.put(storeName, record);
}
