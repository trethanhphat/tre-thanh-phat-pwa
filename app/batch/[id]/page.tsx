// ✅ File: app/batch/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Batch {
  batch_id: string;
  region_id: string;
  planting_date: string;
  quantity: string;
  area: string;
  note: string;
}

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/sheet/batch?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể lấy dữ liệu');
        return res.json();
      })
      .then(data => {
        setBatch(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Có lỗi xảy ra');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📦 Lô/Batch: {id}</h1>
      <p>
        <a className="button" href="/batchs">
          <strong>Quay trở về danh sách lô</strong>
        </a>
      </p>

      {loading && <p>⏳ Đang tải dữ liệu...</p>}
      {error && <p className="text-red-600">❌ {error}</p>}

      {!loading && !error && batch && (
        <div className="border rounded-lg p-4 shadow bg-white">
          <p>
            <strong>Mã lô:</strong> {batch.batch_id}
          </p>
          <p>
            <strong>Khu vực:</strong> {batch.region_id}
          </p>
          <p>
            <strong>Ngày trồng:</strong> {batch.planting_date}
          </p>
          <p>
            <strong>Số lượng:</strong> {batch.quantity}
          </p>
          <p>
            <strong>Diện tích:</strong> {batch.area || '—'}
          </p>
          <p>
            <strong>Ghi chú:</strong> {batch.note || 'Không có'}
          </p>
        </div>
      )}

      {!loading && !error && !batch && <p className="text-gray-500">⚠️ Không tìm thấy lô này.</p>}
    </main>
  );
}
