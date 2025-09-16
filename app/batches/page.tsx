// ✅ File: app/batches/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Batch } from '@/models/Batch';
import { getBatchList } from '@/controllers/batchController';

export default function BatchListPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [status, setStatus] = useState<string>('⏳ Đang tải dữ liệu...');
  const [loading, setLoading] = useState(true);

  async function loadData(forceUpdate = false) {
    setLoading(true);
    try {
      const { batches: batchData, status } = await getBatchList(forceUpdate);
      setBatches(batchData);
      setStatus(status);
    } catch (err: any) {
      // Nếu offline hoặc lỗi khác
      if (batches.length > 0) {
        setStatus('📂 Hiển thị dữ liệu trên máy, chờ cập nhật');
      } else {
        setStatus(err.message || '⚠️ Không thể tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-green-700">📦 Danh sách Lô/Batch</h1>

      <div className="flex items-center gap-3">
        {!loading && (
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            🔄 Cập nhật thủ công
          </button>
        )}
        <span className="text-sm text-gray-500 italic">{status}</span>
      </div>

      {loading && <p>⏳ Đang tải dữ liệu...</p>}

      {!loading && batches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr style={{ background: 'var(--color-primary)' }}>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Mã lô
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Tên vùng trồng
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Ngày trồng
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Số lượng
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Diện tích (ha)
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Kinh độ
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Vĩ độ
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Vị trí trên bản đồ
                </th>
                <th
                  className="border p-2"
                  style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                >
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b, index) => (
                <tr
                  key={b.batch_id}
                  className="hover:bg-gray-50"
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
                  }}
                >
                  <td
                    className="border p-2 text-blue-600 underline"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Mã lô"
                  >
                    <Link href={`/batch/${b.batch_id}`}>{b.batch_id}</Link>
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Tên vùng trồng"
                  >
                    {b.region_name}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Ngày trồng"
                  >
                    {b.planting_date}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Số lượng"
                  >
                    {b.quantity}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Diện tích (ha)"
                  >
                    {b.area || '—'}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Kinh độ"
                  >
                    {b.batch_longitude || 'Đang cập nhật'}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Vĩ độ"
                  >
                    {b.batch_latitude || 'Đang cập nhật'}
                  </td>
                  <td
                    className="border p-2 text-blue-600 underline"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Vị trí trên bản đồ"
                  >
                    {b.batch_location ? (
                      <Link href={b.batch_location}>Mở bản đồ</Link>
                    ) : (
                      <span className="text-gray-500">Đang cập nhật</span>
                    )}
                  </td>
                  <td
                    className="border p-2"
                    style={{ border: '1px solid var(--color-border)', padding: '0.5rem' }}
                    data-label="Ghi chú"
                  >
                    {b.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && batches.length === 0 && (
        <p className="text-gray-500">⚠️ Không có dữ liệu lô nào.</p>
      )}
    </main>
  );
}
