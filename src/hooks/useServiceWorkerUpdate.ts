// File: /src/hooks/useServiceWorkerUpdate.ts

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
    if (connection?.effectiveType) {
      setConnectionType(connection.effectiveType);
      console.log('[PWA] Loại kết nối hiện tại:', connection.effectiveType);
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
            console.log('[PWA] ⚡ Có bản cập nhật mới sẵn sàng.');
          }
        };
      };
    });

    // Khi SW mới được kích hoạt
    const onControllerChange = () => {
      console.log('[PWA] ✅ Bản cập nhật đã được kích hoạt.');
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
      console.log('[PWA] 🚀 Gửi tín hiệu SKIP_WAITING để kích hoạt SW mới.');
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
