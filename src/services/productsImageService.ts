// File: src/services/productsImageService.ts
import { initDB, STORE_PRODUCTS_IMAGES } from '@/lib/db';

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
export const saveProductImageIfNotExists = async (url: string) => {
  if (!url) return;
  const db = await initDB();
  const key = await sha256Hex(url);
  const existing = await db.get(STORE_PRODUCTS_IMAGES, key);

  // 🔹 TTL check: còn hạn → bỏ qua
  if (existing && Date.now() - existing.updated_at < CACHE_TTL) {
    return;
  }

  // 🔹 Thử fetch trực tiếp, nếu lỗi mới fallback qua proxy
  let result = await fetchBlobWithEtag(url);
  if (!result) result = await fetchBlobWithEtag(withProxy(url));
  if (!result) return;

  const { blob, etag } = result;
  const blob_hash = await hashBlob(blob);
  const updated_at = Date.now();

  // 🟢 Đã đổi sang phương án mới như sau:
  // Chỉ cập nhật khi etag hoặc blob_hash thay đổi
  if (existing) {
    const sameEtag = etag && etag === existing.etag;
    const sameBlob = blob_hash === existing.blob_hash;

    if (sameEtag || sameBlob) {
      // Không cần ghi lại nếu nội dung không đổi
      console.log(`⚡ Skip unchanged image: ${url}`);
      return;
    }
  }

  await db.put(STORE_PRODUCTS_IMAGES, {
    key,
    source_url: url,
    blob,
    etag,
    blob_hash,
    updated_at,
  });

  console.log(`💾 Cached product image: ${url} (${blob.size} bytes, etag=${etag || 'none'})`);
};

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
