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
/*
 ****************************************************************************************************
 * File: /src/hooks/useServiceWorkerUpdate.ts
 * Description:
 *   Hook React để quản lý cập nhật Service Worker cho ứng dụng PWA.
 *   Cung cấp thông tin về bản cập nhật mới, trạng thái cập nhật và loại kết nối mạng hiện tại.
 ****************************************************************************************************
 */

'use client';
import { useEffect, useState } from 'react';
import useNetworkStatus from '@/hooks/useNetworkStatus';

type UpdateStatus = 'idle' | 'checking' | 'hasUpdate' | 'updating' | 'done' | 'error';

export function useServiceWorkerUpdate() {
  const { network } = useNetworkStatus(); // <-- dùng dữ liệu mạng từ hook đã có
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;

      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setHasUpdate(true);
            setStatus('hasUpdate');
            console.log('[/src/hooks/useServiceWorkerUpdate.ts] ⚡ Có bản cập nhật mới sẵn sàng.');
          }
        };
      };
    });

    const onControllerChange = () => {
      console.log('[/src/hooks/useServiceWorkerUpdate.ts] ✅ Bản cập nhật đã được kích hoạt.');
      setStatus('done');
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

  const update = () => {
    if (!navigator.onLine) {
      alert('❌ Không có kết nối mạng. Vui lòng thử lại khi có Internet.');
      return;
    }

    // Cellular-like: 'cellular' hoặc effectiveType là 2g/3g/4g/slow-2g
    const kind = network.type?.toLowerCase();
    const eff = network.effectiveType?.toLowerCase();
    const isCellularLike = (kind && kind !== 'wifi') || (eff && /^(slow-2g|2g|3g|4g)$/.test(eff));

    if (isCellularLike) {
      const ok = confirm(
        '⚠️ Bạn đang dùng mạng di động. Tải bản cập nhật có thể tốn dữ liệu.\nBạn có muốn tiếp tục không?'
      );
      if (!ok) {
        alert('⏳ Bản cập nhật sẽ tự động cài khi bạn có Wi‑Fi.');
        return;
      }
    }

    if (waitingWorker) {
      console.log(
        '[/src/hooks/useServiceWorkerUpdate.ts] 🚀 Gửi SKIP_WAITING để kích hoạt SW mới.'
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
    status,
    connectionType: network.type ?? network.effectiveType ?? null,
  };
}
