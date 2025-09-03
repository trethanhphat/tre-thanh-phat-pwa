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
