// File: /src/hooks/useServiceWorkerUpdate.ts

import { useEffect, useState } from 'react';

export function useServiceWorkerUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (connection?.effectiveType) {
      setConnectionType(connection.effectiveType);
    }

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;

      // Khi có update
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setHasUpdate(true);
          }
        };
      };
    });

    // Lắng nghe controller change (khi worker mới được activate)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const update = () => {
    if (connectionType && connectionType !== 'wifi') {
      alert('Chỉ cập nhật khi có kết nối Wi-Fi để tiết kiệm dữ liệu.');
      return;
    }
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    // Lúc này reload sẽ được gọi qua controllerchange listener ở trên
  };

  return {
    hasUpdate,
    update,
    connectionType,
  };
}
