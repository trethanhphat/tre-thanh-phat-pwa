// ✅ File: src/lib/ensureImageCachedByUrl.ts
import { initDB, STORE_NEWS_IMAGES, STORE_PRODUCTS_IMAGES, STORE_IMAGES } from '@/lib/db';

const STORE_MAP = {
  news: STORE_NEWS_IMAGES,
  product: STORE_PRODUCTS_IMAGES,
  generic: STORE_IMAGES,
} as const;

export interface CachedImage {
  url: string;
  blob?: Blob;
  hash?: string;
  etag?: string;
  lastFetched?: string;
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

/** ✅ Chỉ đảm bảo ảnh được cache vào IndexedDB */
export async function ensureImageCachedByUrl(
  url: string,
  type: keyof typeof STORE_MAP = 'generic',
  options?: { forceUpdate?: boolean }
): Promise<void> {
  if (!url) return;
  const storeName = STORE_MAP[type] || STORE_IMAGES;
  const db = await initDB();
  const store = db.transaction(storeName, 'readwrite').store;

  const existing = (await store.get(url)) as CachedImage | undefined;
  const meta = await fetchImageMeta(url);
  const remoteHash = meta?.hash;
  const remoteEtag = meta?.etag;

  // Nếu cache còn hợp lệ thì bỏ qua
  if (
    existing &&
    !options?.forceUpdate &&
    ((remoteHash && existing.hash === remoteHash) || (remoteEtag && existing.etag === remoteEtag))
  ) {
    return;
  }

  // Nếu không có meta → fallback theo tuổi cache
  if (!meta && existing?.lastFetched) {
    const ageDays = (Date.now() - new Date(existing.lastFetched).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7 && !options?.forceUpdate) return;
  }

  // Fetch blob mới
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const hash = await hashBlob(blob);

  // Nếu trùng hash → không cần cập nhật
  if (!options?.forceUpdate && existing?.hash === hash) return;

  const updated: CachedImage = {
    url,
    blob,
    hash,
    etag: remoteEtag || res.headers.get('ETag') || undefined,
    lastFetched: new Date().toISOString(),
  };
  await store.put(updated, url);
}
