/*
 ****************************************************************************************************
 * File: /src/hooks/useServiceWorkerUpdate.ts
 * Description:
 *   Hook React để quản lý cập nhật Service Worker cho ứng dụng PWA.
 *   Cung cấp thông tin về bản cập nhật mới, trạng thái cập nhật và loại kết nối mạng hiện tại.
 *
 * Tính năng chính:
 *   - Kiểm tra và phát hiện bản cập nhật Service Worker.
 *   - Quản lý trạng thái cập nhật (kiểm tra, có bản cập nhật, đang cập nhật, hoàn thành, lỗi).
 *   - Xác định loại kết nối mạng: Dùng connection type của chrome để xác định là wifi hay cellular (nền tảng android hỗ trợ biết được loại kết nối).
 *  để cảnh báo người dùng về việc sử dụng dữ liệu di động để cập nhật sẽ tốn chi phí
 *  chỉ nên cập nhật dữ liệu dưới nền nếu đang dùng wifi hoặc gói cellular không giới hạn dữ liệu.
 *  - Hiển thị thông báo và cảnh báo người dùng khi cần thiết.
 *   - Cung cấp hàm để người dùng kích hoạt cập nhật thủ công.
 *
 * Sử dụng:
 *   const { hasUpdate, update, status, connectionType } = useServiceWorkerUpdate();
 *
 * Trạng thái trả về:
 *   - hasUpdate: boolean - Có bản cập nhật mới hay không.
 *   - update: () => void - Hàm để kích hoạt cập nhật.
 *   - status: 'idle' | 'checking' | 'hasUpdate' | 'updating' | 'done' | 'error' - Trạng thái cập nhật hiện tại.
 *   - connectionType: string | null - Loại kết nối mạng hiện tại (wifi, 4g, 3g, v.v.) hoặc null nếu không xác định được.
 ****************************************************************************************************
 */
//

import { useEffect, useState } from 'react';

type UpdateStatus = 'idle' | 'checking' | 'hasUpdate' | 'updating' | 'done' | 'error';

export function useServiceWorkerUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // 🔹 Theo dõi loại kết nối (Wi-Fi / 4G / 3G)
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (connection?.type) {
      setConnectionType(connection.type) || setConnectionType(undefined);
      console.log('[src/hooks/useServiceWorkerUpdate.ts] Loại kết nối hiện tại:', connection.type);
    }

    // 🔹 Lấy registration hiện có
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;

      // Khi có update mới
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setHasUpdate(true);
            setStatus('hasUpdate');
            console.log('[src/hooks/useServiceWorkerUpdate.ts] ⚡ Có bản cập nhật mới sẵn sàng.');
          }
        };
      };
    });

    // Khi SW mới được kích hoạt
    const onControllerChange = () => {
      console.log('[src/hooks/useServiceWorkerUpdate.ts] ✅ Bản cập nhật đã được kích hoạt.');
      setStatus('done');
      // Tránh reload loop — chỉ reload 1 lần
      if (!sessionStorage.getItem('pwa_reloaded')) {
        sessionStorage.setItem('pwa_reloaded', 'true');
        setTimeout(() => window.location.reload(), 1500);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  // ✅ Khi người dùng nhấn "Cập nhật"
  const update = () => {
    if (!navigator.onLine) {
      alert('❌ Không có kết nối mạng. Vui lòng thử lại khi có Internet.');
      return;
    }

    if (connectionType && connectionType !== 'wifi') {
      const confirmUpdate = confirm(
        '⚠️ Bạn đang dùng mạng di động. Tải bản cập nhật có thể tốn dữ liệu.\nBạn có muốn tiếp tục không?'
      );
      if (!confirmUpdate) {
        alert('⏳ Bản cập nhật sẽ tự động cài khi bạn có Wi-Fi.');
        return;
      }
    }

    if (waitingWorker) {
      console.log(
        '[src/hooks/useServiceWorkerUpdate.ts] 🚀 Gửi tín hiệu SKIP_WAITING để kích hoạt SW mới.'
      );
      setStatus('updating');
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      alert('Không có bản cập nhật khả dụng.');
    }
  };

  return {
    hasUpdate,
    update,
    status, // 'hasUpdate' | 'updating' | 'done'
    connectionType,
  };
}
