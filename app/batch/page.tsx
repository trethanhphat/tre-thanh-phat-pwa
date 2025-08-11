// ✅ File: app/batch/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Batch {
  batch_id: string;
  region_id: string;
  planting_date: string;
  quantity: string;
  area: string;
  note: string;
}

export default function BatchListPage() {
  const [data, setData] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sheet/batch')
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

  if (loading) return <p className="p-4">⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="p-4 text-red-600">❌ {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📋 Danh sách lô / Batch</h1>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Mã lô</th>
            <th className="border p-2">Khu vực</th>
            <th className="border p-2">Ngày trồng</th>
            <th className="border p-2">Số lượng</th>
            <th className="border p-2">Diện tích</th>
            <th className="border p-2">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {data.map(batch => (
            <tr key={batch.batch_id} className="hover:bg-gray-50">
              <td className="border p-2 text-blue-600 underline">
                <Link href={`/batch/${batch.batch_id}`}>{batch.batch_id}</Link>
              </td>
              <td className="border p-2">{batch.region_id}</td>
              <td className="border p-2">{batch.planting_date}</td>
              <td className="border p-2">{batch.quantity}</td>
              <td className="border p-2">{batch.area || '—'}</td>
              <td className="border p-2">{batch.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
