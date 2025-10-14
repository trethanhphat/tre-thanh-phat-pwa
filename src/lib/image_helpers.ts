// 📄 src/lib/image_helpers.ts
export async function waitForImageLoadThenFetchBlob(url: string): Promise<Blob | null> {
  try {
    const resp = await fetch(url, {
      mode: 'cors',
      cache: 'no-store',
    });
    if (!resp.ok) return null;
    return await resp.blob();
  } catch {
    return null;
  }
}
