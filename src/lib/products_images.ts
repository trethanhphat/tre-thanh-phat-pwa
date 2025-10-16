import { initDB, STORE_IMAGES } from '@/lib/db';

/** ⏱ TTL cache tối đa (7 ngày) cho ảnh sản phẩm */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/** ✅ Tạo key hash từ URL (SHA-256 hex) */
async function sha256Hex(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** ✅ Thêm proxy fallback cho ảnh sản phẩm */
function withProxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/** ✅ Thử fetch ảnh và trả Blob nếu được */
async function tryFetchImage(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { mode: 'no-cors', priority: 'low' as any });
    if (!res.ok && res.type !== 'opaque') throw new Error('Fetch error');
    return await res.blob();
  } catch (err) {
    console.warn('❌ Lỗi tải ảnh sản phẩm:', url, err);
    return null;
  }
}

/** ✅ Lưu ảnh sản phẩm nếu chưa có hoặc hết hạn */
export const saveProductImageIfNotExists = async (url: string) => {
  if (!url) return;
  const db = await initDB();
  const key = await sha256Hex(url);
  const existing = await db.get(STORE_IMAGES, key);

  if (existing && Date.now() - existing.updated_at < CACHE_TTL) {
    console.log('✅ Ảnh sản phẩm đã có cache:', url);
    return;
  }

  let blob = await tryFetchImage(url);
  if (!blob) {
    console.log('⚙️ Dùng proxy để tải ảnh sản phẩm:', url);
    blob = await tryFetchImage(withProxy(url));
  }

  if (blob) {
    await db.put(STORE_IMAGES, { key, url, blob, updated_at: Date.now() });
    console.log('💾 Đã lưu ảnh sản phẩm:', url);
  }
};

/** ✅ Lấy URL ảnh sản phẩm từ cache hoặc fallback proxy */
export const getProductImageURL = async (url: string) => {
  if (!url) return '';
  const db = await initDB();
  const key = await sha256Hex(url);
  const record = await db.get(STORE_IMAGES, key);
  if (record?.blob) return URL.createObjectURL(record.blob);

  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return url;
  } catch {}
  return withProxy(url);
};

/** ✅ Prefetch ảnh sản phẩm nền (ví dụ top 5 sản phẩm nổi bật) */
export async function prefetchProductImages(urls: string[]) {
  if (!urls?.length) return;

  const conn = (navigator as any).connection as
    | { saveData?: boolean; effectiveType?: string }
    | undefined;

  if (conn?.saveData) {
    console.log('⚠️ Bỏ qua prefetch ảnh sản phẩm (saveData bật)');
    return;
  }

  const db = await initDB();

  for (const url of urls.slice(0, 5)) {
    const key = await sha256Hex(url);
    const existing = await db.get(STORE_IMAGES, key);
    if (existing) continue;

    fetch(withProxy(url), { mode: 'no-cors', priority: 'low' as any })
      .then(res => res.blob())
      .then(async blob => {
        if (blob) {
          await db.put(STORE_IMAGES, {
            key,
            url,
            blob,
            updated_at: Date.now(),
          });
          console.log('🔥 Prefetched & cached product image:', url);
        }
      })
      .catch(() => console.warn('Prefetch fail:', url));
  }
}

/** ✅ Đảm bảo ảnh sản phẩm được cache sẵn */
export async function ensureProductImageCachedByUrl(url: string) {
  if (!url) return;
  try {
    await saveProductImageIfNotExists(url);
  } catch (err) {
    console.warn('⚠️ Lỗi cache ảnh sản phẩm:', url, err);
  }
}
