// ✅ File: app/batch/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';

export default function BatchDetailPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <main className="main">
      <h1 className="text-2xl font-bold text-blue-700">📦 Lô/Batch: {id}</h1>
      <p>
        Đang tải dữ liệu chi tiết về lô có mã <strong>{id}</strong>...
      </p>
      {/* TODO: Gọi API lấy thông tin lô/batch tại đây */}
    </main>
  );
}
