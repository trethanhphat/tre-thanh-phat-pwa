// File: /src/components/ManualSyncButton.tsx

'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useState } from 'react';

export default function ManualSyncButton() {
  const { hasUpdate, update, connectionType } = useServiceWorkerUpdate();
  const [syncing, setSyncing] = useState(false);

  const handleClick = async () => {
    console.log('[SYNC] Kết nối mạng:', connectionType);

    // 1. Ưu tiên cập nhật phiên bản mới
    if (hasUpdate) {
      console.log('[SYNC] Có bản cập nhật mới');
      update();
      return;
    }

    // 2. Không có bản cập nhật → thử đồng bộ dữ liệu
    if (connectionType === 'wifi') {
      setSyncing(true);
      console.log('[SYNC] Đang đồng bộ dữ liệu...');

      try {
        // 🔄 Giả lập gửi dữ liệu ảnh, text... lên server
        await new Promise(res => setTimeout(res, 1000));
        console.log('[SYNC] ✅ Đồng bộ thành công');
        alert('Đồng bộ thành công');
      } catch (e) {
        console.error('[SYNC] ❌ Lỗi khi đồng bộ:', e);
        alert('Lỗi khi đồng bộ');
      } finally {
        setSyncing(false);
      }
    } else {
      alert('Chỉ đồng bộ khi có Wi-Fi để tiết kiệm dữ liệu');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={syncing}
      style={{
        marginTop: 16,
        padding: '10px 18px',
        backgroundColor: syncing ? '#aaa' : '#004AAD',
        color: '#fff',
        borderRadius: '8px',
        border: 'none',
      }}
    >
      {syncing ? 'Đang đồng bộ...' : '🔍 Kiểm tra cập nhật & đồng bộ'}
    </button>
  );
}
