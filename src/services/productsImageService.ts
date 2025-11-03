// File: src/services/productsImageService.ts
import { initDB, STORE_PRODUCTS, STORE_PRODUCTS_IMAGES } from '@/lib/db';

/** ⏱ TTL cache tối đa (7 ngày) cho ảnh sản phẩm */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/** ✅ Tạo key hash từ URL (SHA-256 hex) */
async function sha256Hex(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** ✅ API proxy fallback */
function withProxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/** ✅ Fetch ảnh → kèm lấy ETag nếu có */
async function fetchBlobWithEtag(url: string): Promise<{ blob: Blob; etag?: string } | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    if (blob.size === 0) throw new Error('Blob empty');

    const etag = res.headers.get('ETag') ?? undefined;
    return { blob, etag };
  } catch (err) {
    console.warn('❌ Fetch image error:', url, err);
    return null;
  }
}

/** ✅ Hash nội dung blob (SHA-256) */
async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** ✅ Lưu/cập nhật ảnh sản phẩm (có kiểm tra thay đổi nội dung) */

const inFlight = new Map<string, Promise<any>>(); // chống tải/ghi trùng

/** ✅ Lưu/cập nhật ảnh sản phẩm (TTL + kiểm tra thay đổi bằng etag/blob_hash) */
export const saveProductImageIfNotExists = async (url: string) => {
  if (!url) return;

  // Chống trùng lặp khi nhiều nơi gọi đồng thời
  if (inFlight.has(url)) return inFlight.get(url);
  const task = (async () => {
    const db = await initDB();

    // 1) Kiểm tra theo index 'source_url' trước (đúng với schema hiện tại),
    //    fallback theo key SHA-256(url) nếu cần.
    const txRead = db.transaction(STORE_PRODUCTS_IMAGES);
    const store: any = txRead.store;
    const byUrl = store.index?.('source_url') ? await store.index('source_url').get(url) : null;

    const key = byUrl?.key ?? (await sha256Hex(url));
    const existing = byUrl ?? (await db.get(STORE_PRODUCTS_IMAGES, key));

    const now = Date.now();
    const last = Number(existing?.updated_at ?? 0);

    // 2) TTL: còn hạn thì bỏ qua (không fetch). Nếu muốn luôn kiểm tra thay đổi,
    //    bạn có thể bỏ khối này hoặc chuyển sang conditional request với ETag.
    if (existing && now - last < CACHE_TTL) {
      return existing;
    }

    // 3) Fetch blob + ETag ngoài IDB (không giữ transaction mở khi await)
    let result = await fetchBlobWithEtag(url);
    if (!result) result = await fetchBlobWithEtag(withProxy(url));
    if (!result) return existing ?? undefined;

    const { blob, etag } = result;
    const blob_hash = await hashBlob(blob);

    // 4) Nếu đã có dữ liệu và nội dung không đổi → bỏ ghi
    if (existing) {
      const sameEtag = !!etag && etag === existing.etag;
      const sameBlob = blob_hash === existing.blob_hash;
      if (sameEtag || sameBlob) {
        console.log(`⚡ Skip unchanged image: ${url}`);
        return existing;
      }
    }

    // 5) Ghi vào IDB (idb tự mở/đóng transaction → không TransactionInactiveError)
    const record = {
      key,
      source_url: url,
      blob,
      etag,
      blob_hash,
      updated_at: now,
    };

    await db.put(STORE_PRODUCTS_IMAGES, record);
    console.log(`💾 Cached product image: ${url} (${blob.size} bytes, etag=${etag || 'none'})`);
    return record;
  })();

  inFlight.set(url, task);
  try {
    return await task;
  } finally {
    inFlight.delete(url);
  }
};

//** ✅ Lấy Blob URL ảnh sản phẩm theo productId */
export async function getProductBlobUrlById(productId: number): Promise<string | null> {
  const db = await initDB();
  const prod = await db.get(STORE_PRODUCTS, productId);
  const url: string | undefined = prod?.image_url;
  if (!url) return null;

  const tx = db.transaction(STORE_PRODUCTS_IMAGES);
  const store: any = tx.store;

  // Tìm theo index 'source_url'
  let rec = store.index?.('source_url') ? await store.index('source_url').get(url) : null;

  // Fallback: key = SHA-256(url)
  if (!rec) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url));
    const hash = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    rec = await store.get(hash);
  }

  return rec?.blob ? URL.createObjectURL(rec.blob) : null;
}

/** ✅ Offline-first lấy ảnh → nếu có blob thì hiển thị ngay */
export const getProductImageURL = async (url: string) => {
  if (!url) return '';
  const db = await initDB();
  const key = await sha256Hex(url);
  const record = await db.get(STORE_PRODUCTS_IMAGES, key);

  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }

  // 🔹 Nếu chưa có blob → thử online trước
  return withProxy(url);
};

/** ✅ Prefetch một số ảnh nổi bật */
export async function prefetchProductImages(urls: string[]) {
  if (!urls?.length) return;

  const conn = (navigator as any).connection;
  if (conn?.saveData) return;

  for (const url of urls.slice(0, 5)) {
    await saveProductImageIfNotExists(url);
  }
}

/** ✅ Đảm bảo cache trước khi hiển thị */
export async function ensureProductImageCachedByUrl(originalUrl: string, fetchUrl?: string) {
  if (!originalUrl) return null;
  try {
    await saveProductImageIfNotExists(fetchUrl || originalUrl);
  } catch (err) {
    console.warn('⚠️ Cache error:', originalUrl, err);
  }
}
