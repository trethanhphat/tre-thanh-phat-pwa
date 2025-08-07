// ✅ File: app/tree/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';

export default function TreeDetailPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <main className="main">
      <h1 className="text-2xl font-bold text-green-700">🌿 Cây: {id}</h1>
      <p>
        Đang tải dữ liệu chi tiết về cây có mã <strong>{id}</strong>...
      </p>
      {/* TODO: Gọi API lấy thông tin cây tại đây */}
    </main>
  );
}
