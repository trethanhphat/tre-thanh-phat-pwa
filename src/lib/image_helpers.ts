// 📄 src/lib/image_helpers.ts
export async function waitForImageLoadThenFetchBlob(url: string): Promise<Blob | null> {
  try {
    console.log(`🔍 [FETCH_BLOB] Bắt đầu tải ảnh: ${url}`);

    const resp = await fetch(url, {
      mode: 'cors',
      cache: 'no-store',
    });

    if (!resp.ok) {
      console.warn(`⚠️ [FETCH_BLOB] HTTP ${resp.status} (${resp.statusText}) for ${url}`);
      return null;
    }

    // ✅ Lấy blob sau khi fetch thành công
    const blob = await resp.blob();

    if (!(blob instanceof Blob)) {
      console.error(`💥 [FETCH_BLOB] Invalid blob object for ${url}:`, blob);
      return null;
    }

    console.log(`📦 [FETCH_BLOB] Got blob (${blob.size} bytes) from ${url}`);
    return blob;
  } catch (err) {
    console.error(`💥 [FETCH_BLOB] Fetch error for ${url}:`, err);
    return null;
  }
}
