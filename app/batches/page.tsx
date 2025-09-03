// ✅ View: app/batches/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Batch } from '@/models/Batch';
import { getBatchList } from '@/controllers/batchController';

export default function BatchListPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [status, setStatus] = useState<string>('⏳ Đang tải dữ liệu...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBatchList()
      .then(({ batches, status }) => {
        setBatches(batches);
        setStatus(status);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-green-700 mb-4">📦 Danh sách Lô/Batch</h1>

      {loading && <p>⏳ Đang tải dữ liệu...</p>}
      {!loading && <p className="text-sm text-gray-500 italic">{status}</p>}

      {!loading && batches.length > 0 && (
        <ul className="space-y-2">
          {batches.map(b => (
            <li key={b.batch_id} className="border p-3 rounded shadow bg-white">
              <Link href={`/batch/${b.batch_id}`} className="text-blue-600 hover:underline">
                <strong>{b.batch_id}</strong> — {b.region_name}
              </Link>
              <p className="text-sm text-gray-600">🌱 Ngày trồng: {b.planting_date}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && batches.length === 0 && (
        <p className="text-gray-500">⚠️ Không có dữ liệu lô nào.</p>
      )}
    </main>
  );
}
