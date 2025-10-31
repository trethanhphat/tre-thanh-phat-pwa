// ✅ File: src/services/batchSync.ts
import { Batch } from '@/models/Batch';
import { fetchBatchListFromApi } from './api/batchApi';
import { loadBatchesFromDB, upsertBatches, pruneBatches } from '@/repositories/batchesRepository';

/**
 * 🔹 Lấy danh sách lô: ưu tiên IndexedDB trước, sau đó tải nền từ API.
 */
export async function loadBatchList(): Promise<Batch[]> {
  // 1️⃣ Hiển thị dữ liệu trong local DB ngay lập tức
  const localData = await loadBatchesFromDB();
  if (localData.length > 0) console.log('[IndexedDB] ⚡ Dùng dữ liệu lô cũ');
  else console.log('[IndexedDB] ⚠️ Chưa có dữ liệu lô, sẽ tải từ API');

  // 2️⃣ Tải mới trong nền (Edge Cache của Vercel)
  fetchBatchListFromApi()
    .then(async remote => {
      if (!remote || remote.length === 0) return;

      // ✅ Thêm/sửa batch mới
      await upsertBatches(remote);

      // ❌ Xóa batch trong DB nhưng không còn trên server
      await pruneBatches(remote.map(b => b.batch_id));

      console.log(`[Sync] ✅ Đã đồng bộ ${remote.length} lô vào IndexedDB`);
    })
    .catch(err => console.warn('[Sync] ⚠️ Không thể tải mới:', err));

  return localData;
}

/**
 * 🔹 Cập nhật thủ công: bỏ qua edge cache (tải CSV mới nhất)
 */
export async function refreshBatchList(): Promise<Batch[]> {
  console.log('[Manual Refresh] 🔄 Đang tải CSV mới nhất...');
  const res = await fetch('/api/sheet/batches?force=1', {
    headers: { 'Cache-Control': 'no-store' }, // ⚡ Bỏ qua cache
  });
  if (!res.ok) throw new Error('❌ Không thể tải CSV mới nhất');

  const data: Batch[] = await res.json();

  // ✅ Ghi đè hoặc thêm mới
  await upsertBatches(data);

  // ✅ Đồng bộ xóa dữ liệu thừa
  await pruneBatches(data.map(b => b.batch_id));

  console.log('[Manual Refresh] ✅ Đã cập nhật dữ liệu lô');
  return data;
}
