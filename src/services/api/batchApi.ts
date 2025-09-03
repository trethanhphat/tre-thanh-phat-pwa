// ✅ Service: src/services/api/batchApi.ts
import { Batch } from '@/models/Batch';

export async function fetchBatchListFromApi(): Promise<Batch[]> {
  const res = await fetch('/api/sheet/batches');
  if (!res.ok) throw new Error('❌ Không thể lấy danh sách lô từ server');
  return res.json();
}

export async function fetchBatchDetailFromApi(id: string): Promise<Batch | null> {
  const res = await fetch(`/api/sheet/batches?id=${id}`);
  if (!res.ok) throw new Error(`❌ Không thể lấy dữ liệu lô #${id} từ server`);
  return res.json();
}
