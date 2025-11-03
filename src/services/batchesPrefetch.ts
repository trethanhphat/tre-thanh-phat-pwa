// ✅ File: src/services/batchesPrefetch.ts
import axios from 'axios';
import { initDB, STORE_BATCHES } from '@/lib/db';
import { upsertBatches } from '@/repositories/batchesRepository';

export async function prefetchBatchesOnce(force = false): Promise<void> {
  if (!navigator.onLine && !force) return;
  const res = await axios.get('/api/sheet/batches', { headers: { 'Cache-Control': 'no-store' } });
  const list = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.data)
    ? res.data.data
    : [];
  if (list.length) {
    await upsertBatches(list);
  }
}
