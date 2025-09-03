// ✅ Service: src/services/db/batchDB.ts
import { initDB, STORE_BATCHES } from '@/lib/db';
import { Batch } from '@/models/Batch';

// 🔹 Lưu 1 batch
export async function saveBatchToDB(batch: Batch) {
  const db = await initDB();
  await db.put(STORE_BATCHES, batch, batch.batch_id);
}

// 🔹 Lấy 1 batch theo id
export async function getBatchFromDB(id: string): Promise<Batch | null> {
  const db = await initDB();
  return (await db.get(STORE_BATCHES, id)) || null;
}

// 🔹 Lưu danh sách batch
export async function saveBatchListToDB(batches: Batch[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_BATCHES, 'readwrite');
  for (const batch of batches) {
    await tx.store.put(batch, batch.batch_id);
  }
  await tx.done;
}

// 🔹 Lấy toàn bộ batch
export async function getBatchListFromDB(): Promise<Batch[]> {
  const db = await initDB();
  return (await db.getAll(STORE_BATCHES)) || [];
}
