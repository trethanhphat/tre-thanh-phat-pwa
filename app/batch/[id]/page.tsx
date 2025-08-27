// ✅ File: app/batch/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Batch {
  batch_id: string;
  batch_location: string;
  batch_longitude: string;
  batch_latitude: string;
  region_id: string;
  region_name: string;
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
    fetch(`/api/sheet/batches?id=${id}`)
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
      <p>
        <a className="button" href="/batches">
          <strong>Quay trở về danh sách lô</strong>
        </a>
      </p>
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📦 Lô/Batch: {id}</h1>

      {loading && <p>⏳ Đang tải dữ liệu...</p>}
      {error && <p className="text-red-600">❌ {error}</p>}

      {!loading && !error && batch && (
        <div className="border rounded-lg p-4 shadow bg-white">
          <p>
            <strong>Mã lô:</strong> {batch.batch_id}
          </p>
          <p>
            <strong>Mã vùng trồng:</strong> {batch.region_id}
          </p>
          <p>
            <strong>Tên vùng trồng:</strong> {batch.region_name}
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
          <p>
            <strong>Kinh độ:</strong> {batch.batch_longitude || 'Chưa cập nhật'}
          </p>
          <p>
            <strong>Vĩ độ:</strong> {batch.batch_latitude || 'Chưa cập nhật'}
          </p>
          <p>
            <strong>Vị trí trên bản đồ:</strong>{' '}
            {batch.batch_location ? (
              <Link href={batch.batch_location}>Mở bản đồ</Link>
            ) : (
              <span className="text-gray-500">Đang cập nhật</span>
            )}
          </p>
          <p>
            <a className="button" href="/batches">
              <strong>Quay trở về danh sách lô</strong>
            </a>
          </p>
        </div>
      )}

      {!loading && !error && !batch && <p className="text-gray-500">⚠️ Không tìm thấy lô này.</p>}
    </main>
  );
}
