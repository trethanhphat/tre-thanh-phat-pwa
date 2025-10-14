// ✅ File: src/lib/images.ts
import { initDB, STORE_IMAGES } from '@/lib/db';

// ⏱ thời gian cache tối đa (7 ngày)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// ✅ Hàm tạo key hash từ URL (đơn giản hoá)
async function sha256Hex(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ✅ Hàm thêm proxy URL fallback
function withProxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// ✅ Thử fetch ảnh → trả Blob (ưu tiên trực tiếp, nếu lỗi thì null)
async function tryFetchImage(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { mode: 'no-cors', priority: 'low' as any });
    if (!res.ok && res.type !== 'opaque') throw new Error('Fetch error');
    return await res.blob();
  } catch (err) {
    console.warn('❌ Lỗi tải ảnh trực tiếp:', url, err);
    return null;
  }
}

// ✅ Lưu ảnh nếu chưa có hoặc đã hết hạn
export const saveImageIfNotExists = async (url: string) => {
  if (!url) return;
  const db = await initDB();
  const key = await sha256Hex(url);
  const existing = await db.get(STORE_IMAGES, key);

  if (existing && Date.now() - existing.updated_at < CACHE_TTL) {
    console.log('✅ Ảnh đã có cache:', url);
    return;
  }

  let blob = await tryFetchImage(url);
  if (!blob) {
    console.log('⚙️ Dùng proxy để tải ảnh:', url);
    blob = await tryFetchImage(withProxy(url));
  }

  if (blob) {
    await db.put(STORE_IMAGES, { key, url, blob, updated_at: Date.now() });
    console.log('💾 Đã lưu ảnh:', url);
  }
};

// ✅ Lấy URL ảnh từ cache hoặc fallback sang online/proxy
export const getImageURL = async (url: string) => {
  if (!url) return '';
  const db = await initDB();
  const key = await sha256Hex(url);
  const record = await db.get(STORE_IMAGES, key);
  if (record?.blob) {
    return URL.createObjectURL(record.blob);
  }

  // Nếu không có cache → thử trực tiếp, fallback proxy
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return url;
  } catch {}
  return withProxy(url);
};

// ✅ Prefetch ảnh nền (ví dụ top 5 tin / sản phẩm)
export async function prefetchImages(urls: string[]) {
  if (!urls?.length) return;

  // ⚠️ Bỏ qua nếu người dùng bật tiết kiệm dữ liệu
  if (navigator.connection?.saveData) {
    console.log('⚠️ Bỏ qua prefetch (saveData bật)');
    return;
  }

  const db = await initDB();

  for (const url of urls.slice(0, 5)) {
    const key = await sha256Hex(url);
    const existing = await db.get(STORE_IMAGES, key);
    if (existing) continue; // đã có → bỏ qua

    // Prefetch ẩn bằng proxy (warm cache CDN)
    fetch(withProxy(url), { mode: 'no-cors', priority: 'low' as any })
      .then(res => res.blob())
      .then(async blob => {
        if (blob) {
          await db.put(STORE_IMAGES, { key, url, blob, updated_at: Date.now() });
          console.log('🔥 Prefetched & cached:', url);
        }
      })
      .catch(() => console.warn('Prefetch fail:', url));
  }
}
