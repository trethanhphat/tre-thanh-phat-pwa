// ✅ Controller: src/controllers/batchController.ts
import { Batch } from '@/models/Batch';
import { fetchBatchListFromApi, fetchBatchDetailFromApi } from '@/services/api/batchApi';
import { loadBatchesFromDB, upsertBatches, pruneBatches } from '@/repositories/batchesRepository';

const STATUS = {
  OFFLINE: '❌ Không có dữ liệu offline (cần online lần đầu)',
  SYNCED: '✅ Dữ liệu đã là mới nhất',
  UPDATED: '✅ Đã cập nhật dữ liệu mới',
  FALLBACK: '⚠️ Dùng dữ liệu cũ (offline)',
  NOT_FOUND: '⚠️ Không tìm thấy lô này trên server',
};

/**
 * Lấy danh sách batch (offline-first).
 */
export async function getBatchList(
  forceUpdate = false
): Promise<{ batches: Batch[]; status: string }> {
  const offline = await loadBatchesFromDB();

  // 🔹 Nếu có dữ liệu offline và không ép update → trả luôn offline trước
  if (!forceUpdate && offline.length > 0) {
    // Sync nền nhưng không block UI
    syncBatchListInBackground();
    return { batches: offline, status: STATUS.SYNCED };
  }

  // 🔹 Nếu không có dữ liệu offline → cần online lần đầu
  if (offline.length === 0 && !forceUpdate) {
    try {
      const serverData = await fetchBatchListFromApi();
      await upsertBatches(serverData);
      await pruneBatches(serverData.map(b => b.batch_id));
      return { batches: serverData, status: STATUS.UPDATED };
    } catch {
      return { batches: [], status: STATUS.OFFLINE };
    }
  }

  // 🔹 Nếu ép force update hoặc không có offline → gọi API
  try {
    const serverData = await fetchBatchListFromApi();
    await upsertBatches(serverData);
    await pruneBatches(serverData.map(b => b.batch_id));
    return { batches: serverData, status: STATUS.UPDATED };
  } catch {
    if (offline.length > 0) {
      return { batches: offline, status: STATUS.FALLBACK };
    }
    return { batches: [], status: STATUS.OFFLINE };
  }
}

/**
 * Lấy chi tiết 1 batch theo id (offline-first).
 */
export async function getBatchDetail(
  id: string,
  forceUpdate = false
): Promise<{ batch: Batch | null; status: string }> {
  const offline = await loadBatchesFromDB();
  const local = offline.find(b => b.batch_id === id) || null;

  // 🔹 Nếu có dữ liệu offline và không ép update → trả offline trước
  if (!forceUpdate && local) {
    syncBatchDetailInBackground(id);
    return { batch: local, status: STATUS.SYNCED };
  }

  // 🔹 Nếu không có offline → lần đầu cần online
  if (!local && !forceUpdate) {
    try {
      const serverBatch = await fetchBatchDetailFromApi(id);
      if (serverBatch) {
        await upsertBatches([serverBatch]);
        return { batch: serverBatch, status: STATUS.UPDATED };
      }
      return { batch: null, status: STATUS.NOT_FOUND };
    } catch {
      return { batch: null, status: STATUS.OFFLINE };
    }
  }

  // 🔹 Nếu ép force update hoặc không có offline → gọi API
  try {
    const serverBatch = await fetchBatchDetailFromApi(id);
    if (serverBatch) {
      await upsertBatches([serverBatch]);
      return { batch: serverBatch, status: STATUS.UPDATED };
    }
    return { batch: null, status: STATUS.NOT_FOUND };
  } catch {
    if (local) {
      return { batch: local, status: STATUS.FALLBACK };
    }
    return { batch: null, status: STATUS.OFFLINE };
  }
}

/**
 * Hàm sync nền danh sách batch.
 */
async function syncBatchListInBackground() {
  try {
    const serverData = await fetchBatchListFromApi();
    await upsertBatches(serverData);
    await pruneBatches(serverData.map(b => b.batch_id));
  } catch {
    // bỏ qua lỗi sync nền
  }
}

/**
 * Hàm sync nền chi tiết batch.
 */
async function syncBatchDetailInBackground(id: string) {
  try {
    const serverBatch = await fetchBatchDetailFromApi(id);
    if (serverBatch) {
      await upsertBatches([serverBatch]);
    }
  } catch {
    // bỏ qua lỗi sync nền
  }
}
