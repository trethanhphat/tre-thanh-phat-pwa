// 📄 src/lib/image_helpers.ts
// ✅ Ưu tiên tải trực tiếp, fallback proxy nếu lỗi hoặc blob rỗng
export async function fetchImageBlobSmart(
  url: string,
  proxyBase = '/api/image-proxy?url='
): Promise<Blob | null> {
  try {
    // 1️⃣ Thử tải trực tiếp
    let blob = await tryFetchBlob(url, { mode: 'cors', cache: 'no-store' });
    if (blob && blob.size > 0) {
      console.log(`📦 [IMG] Loaded direct blob (${blob.size} bytes): ${url}`);
      return blob;
    }

    console.warn(`⚠️ [IMG] Direct load failed or empty, fallback to proxy`);
    // 2️⃣ Fallback qua proxy
    const proxyUrl = proxyBase + encodeURIComponent(url);
    blob = await tryFetchBlob(proxyUrl, { cache: 'no-store' });
    if (blob && blob.size > 0) {
      console.log(`📦 [IMG] Loaded via proxy (${blob.size} bytes): ${proxyUrl}`);
      return blob;
    }

    console.error(`❌ [IMG] Both direct & proxy fetch failed: ${url}`);
    return null;
  } catch (err) {
    console.error('❌ [IMG] Error fetching image:', err);
    return null;
  }
}

// 🧩 Helper: tải blob 1 lần (có timeout)
async function tryFetchBlob(url: string, opts: RequestInit): Promise<Blob | null> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 8000); // ⏱ timeout 8s
    const resp = await fetch(url, { ...opts, signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(id);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return blob;
  } catch {
    return null;
  }
}
