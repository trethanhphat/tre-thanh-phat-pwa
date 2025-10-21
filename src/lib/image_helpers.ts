// 📄 src/lib/image_helpers.ts
export async function waitForImageLoadThenFetchBlob(url: string): Promise<Blob | null> {
  try {
    console.log(`🧠 [FETCH_BLOB] Fetching: ${url}`);
    const resp = await fetch(url, {
      mode: 'cors',
      cache: 'no-store',
    });
    if (!resp.ok) {
      console.warn(`⚠️ [FETCH_BLOB] HTTP ${resp.status} for ${url}`);
      return null;
    }
    return await resp.blob();
    console.log(`📦 [FETCH_BLOB] Got blob (${blob.size} bytes) from ${url}`);
  } catch {
    console.error(`💥 [FETCH_BLOB] Fetch error for ${url}:`, err);
    return null;
  }
}
