// File: src/lib/image_helpers.ts
export async function waitForImageLoadThenFetchBlob(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // giúp trình duyệt xử lý ảnh từ domain khác
    img.onload = async () => {
      try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) return resolve(null);
        const blob = await resp.blob();
        resolve(blob);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}