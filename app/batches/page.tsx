// ✅ File: app/batches/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Batch {
  batch_id: string;
  region_name: string;
  planting_date: string;
  quantity: string;
  area: string;
  note: string;
  batch_location: string;
  batch_longitude: string;
  batch_latitude: string;
}

export default function BatchListPage() {
  const [data, setData] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sheet/batches')
      .then(res => {
        if (!res.ok) throw new Error('Không thể lấy dữ liệu');
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Có lỗi xảy ra');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">📋 Danh sách lô / Batch</h1>
        <p className="p-4">⏳ Đang tải dữ liệu...</p>
      </div>
    );
  if (error) return <p className="p-4 text-red-600">❌ {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📋 Danh sách lô / Batch</h1>
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
          {data.map(batch => (
            <tr key={batch.batch_id} className="hover:bg-gray-50">
              <td
                className="border p-2 text-blue-600 underline"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Mã lô"
              >
                <Link href={`/batch/${batch.batch_id}`}>{batch.batch_id}</Link>
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Tên vùng trồng"
              >
                {batch.region_name}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Ngày trồng"
              >
                {batch.planting_date}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Số lượng"
              >
                {batch.quantity}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Diện tích (ha)"
              >
                {batch.area || '—'}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Kinh độ"
              >
                {batch.batch_longitude || 'Đang cập nhật'}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Vĩ độ"
              >
                {batch.batch_latitude || 'Đang cập nhật'}
              </td>
              <td
                className="border p-2 text-blue-600 underline"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Vị trí trên bản đồ"
              >
                {batch.batch_location ? (
                  <Link href={batch.batch_location}>Mở bản đồ</Link>
                ) : (
                  <span className="text-gray-500">Đang cập nhật</span>
                )}
              </td>
              <td
                className="border p-2"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Ghi chú"
              >
                {batch.note || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
