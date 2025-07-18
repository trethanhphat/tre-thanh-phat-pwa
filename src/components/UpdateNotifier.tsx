// File: /src/components/UpdateNotifier.tsx

'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

export default function UpdateNotifier() {
  const { hasUpdate, update } = useServiceWorkerUpdate();

  if (!hasUpdate) return null;

  return (
    <button
      onClick={update}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 0,
        backgroundColor: '#116530',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: 9999,
      }}
    >
      🔄 Có bản cập nhật mới – Nhấn để làm mới
    </button>
  );
}
