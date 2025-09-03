// ✅ Service: src/services/api/batchApi.ts
import { Batch } from '@/src/models/Batch';

export async function fetchBatchListFromApi(): Promise<Batch[]> {
  const res = await fetch('/api/sheet/batches');
  if (!res.ok) throw new Error('Không thể lấy danh sách từ server');
  return res.json();
}

export async function fetchBatchFromApi(id: string): Promise<Batch | null> {
  const res = await fetch(`/api/sheet/batches?id=${id}`);
  if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');
  return res.json();
}
