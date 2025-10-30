// ✅ Repository: src/repositories/batchRepository.ts
import { initDB, STORE_BATCHES } from '@/lib/db';
import { Batch } from '@/models/Batch';

// 🔎 Lấy danh sách batch từ IndexedDB
export async function loadBatchesFromDB(): Promise<Batch[]> {
  const db = await initDB();
  return (await db.getAll(STORE_BATCHES)) as Batch[];
}

// 💾 Đồng bộ batch list (chỉ thêm/sửa cái mới hoặc khác)
export async function upsertBatches(batches: Batch[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_BATCHES, 'readwrite');
  const store = tx.objectStore(STORE_BATCHES);

  for (const batch of batches) {
    const existing = await store.get(batch.batch_id);
    if (!existing) {
      // ✅ Thêm mới
      await store.add(batch);
    } else {
      // ✅ So sánh dữ liệu → chỉ update khi khác
      if (JSON.stringify(existing) !== JSON.stringify(batch)) {
        await store.put(batch);
      }
    }
  }

  await tx.done;
}

// ❌ Xoá những batch không còn trong server list
export async function pruneBatches(validIds: string[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_BATCHES, 'readwrite');
  const store = tx.objectStore(STORE_BATCHES);

  let cursor = await store.openCursor();
  while (cursor) {
    if (!validIds.includes(cursor.key as string)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
}

// 🔄 Đồng bộ batch theo prefix (VD: 'MD', 'BK', 'PT' ...)
// Lấy danh sách từ API /api/sheet/batches?prefix=MD và cập nhật IndexedDB
export async function syncBatchesByPrefix(prefix: string): Promise<void> {
  if (!prefix) return;
  try {
    const res = await fetch(`/api/sheet/batches?prefix=${prefix}`, {
      headers: { 'Cache-Control': 'no-store' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.data ?? [];
    if (!items.length) {
      console.warn(`[batchRepository] ⚠️ Không có dữ liệu cho prefix ${prefix}`);
      return;
    }

    console.log(`[batchRepository] 🔄 Đồng bộ ${items.length} batch(s) cho prefix ${prefix}`);
    await upsertBatches(items);

    // Tuỳ chọn: prune các batch không còn thuộc prefix đó
    const validIds = items.map((b: any) => b.batch_id);
    await pruneBatches(validIds);
  } catch (err) {
    console.warn('[batchRepository] ⚠️ Lỗi syncBatchesByPrefix:', err);
  }
}
