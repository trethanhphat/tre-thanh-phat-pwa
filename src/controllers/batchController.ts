// ✅ Controller: src/controllers/batchController.ts
import { Batch } from '@/models/Batch';
import { fetchBatchFromApi, fetchBatchListFromApi } from '@/services/api/batchApi';
import {
  getBatchFromDB,
  saveBatchToDB,
  getBatchListFromDB,
  saveBatchListToDB,
} from '@/services/db/batchDB';

// 🔹 Lấy 1 batch
export async function getBatchDetail(id: string): Promise<{
  batch: Batch | null;
  status: string;
}> {
  try {
    const batch = await fetchBatchFromApi(id);
    if (batch) {
      await saveBatchToDB(batch);
      return { batch, status: '📡 Dữ liệu mới nhất từ server' };
    }
    return { batch: null, status: '⚠️ Không tìm thấy dữ liệu' };
  } catch {
    const cached = await getBatchFromDB(id);
    if (cached) {
      return { batch: cached, status: '⚡ Offline: dữ liệu từ cache' };
    }
    return { batch: null, status: '❌ Không có dữ liệu offline' };
  }
}

// 🔹 Lấy danh sách batch
export async function getBatchList(): Promise<{
  batches: Batch[];
  status: string;
}> {
  try {
    const list = await fetchBatchListFromApi();
    await saveBatchListToDB(list);
    return { batches: list, status: '📡 Danh sách mới nhất từ server' };
  } catch {
    const cached = await getBatchListFromDB();
    if (cached.length > 0) {
      return { batches: cached, status: '⚡ Offline: danh sách từ cache' };
    }
    return { batches: [], status: '❌ Không có dữ liệu offline' };
  }
}
