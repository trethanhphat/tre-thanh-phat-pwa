'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

export function ServiceWorkerUpdateNotice() {
  const { hasUpdate, update, connectionType } = useServiceWorkerUpdate();

  if (!hasUpdate) return null;

  return (
    <button
      onClick={update}
      className="fixed bottom-5 right-5 z-[9999] bg-green-800 text-white px-4 py-2 rounded shadow-md"
    >
      🔄 Có bản cập nhật mới – Nhấn để làm mới
    </button>
  );
}
