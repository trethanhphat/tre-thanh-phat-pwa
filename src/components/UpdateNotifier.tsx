// File: /src/components/UpdateNotifier.tsx

'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useEffect, useMemo, useState } from 'react';

export default function UpdateNotifier() {
  const { hasUpdate, update, status, connectionType } = useServiceWorkerUpdate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate) setVisible(true);
  }, [hasUpdate]);

  if (!visible) return null;

  const getMessage = () => {
    switch (status) {
      case 'hasUpdate':
        return '🔄 Có bản cập nhật mới – Nhấn để cập nhật';
      case 'updating':
        return '⏳ Đang cập nhật... Vui lòng chờ';
      case 'done':
        return '✅ Cập nhật thành công! Ứng dụng đang làm mới...';
      default:
        return '';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'updating':
        return '#ffb703'; // vàng khi đang cập nhật
      case 'done':
        return '#2a9d8f'; // xanh khi hoàn thành
      default:
        return '#116530'; // xanh lá mặc định
    }
  };

  const handleClick = () => {
    if (status === 'hasUpdate') update();
    else if (status === 'done') setVisible(false); // ẩn khi xong
  };

  // ✅ Chuẩn hoá hiển thị kết nối: Wi‑Fi | Dữ liệu di động
  const connectionLabel = useMemo(() => {
    if (!connectionType) return null;

    const t = connectionType.toLowerCase();
    const isWifi = t === 'wifi';
    const isCellularLike = t === 'cellular' || /^(slow-2g|2g|3g|4g)$/.test(t);

    if (isWifi) return 'Wi‑Fi';
    if (isCellularLike) return 'Dữ liệu di động';
    // Trường hợp khác (hiếm): giữ nguyên hoặc có thể trả về null để ẩn
    return 'Kết nối mạng';
  }, [connectionType]);

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 10,
        backgroundColor: getBackgroundColor(),
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '10px',
        zIndex: 9999,
        cursor: status === 'hasUpdate' ? 'pointer' : 'default',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        fontSize: 15,
        minWidth: 260,
        textAlign: 'center',
      }}
    >
      {getMessage()}
      {connectionLabel && (
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          Loại kết nối internet: {connectionLabel}
        </div>
      )}
    </div>
  );
}
