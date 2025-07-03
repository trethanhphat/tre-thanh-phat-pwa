// ✅ File: app/pwa-test/page.tsx

'use client';

import { useEffect, useState } from 'react';

export default function PwaTestPage() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      setOnline(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    updateStatus();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          console.log('[TEST] ✅ Service Worker ready at:', reg.active?.scriptURL);
        })
        .catch(() => {
          console.log('[TEST] ❌ Service Worker not ready.');
        });
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">🧪 PWA Offline Test</h1>
      <p className="mt-2">Network Status: {online ? '🟢 Online' : '🔴 Offline'}</p>
      <p className="mt-2 text-sm text-gray-500">
        Tắt mạng, sau đó reload để kiểm tra khả năng hoạt động offline.
      </p>
    </main>
  );
}
