// ✅ File: src/components/BackgroundSync.tsx
// ✅ Bản có log và fix fallback cho connection.type undefined
'use client';

import { useEffect } from 'react';
import { backgroundSync } from '@/utils/backgroundSync';
import { getSyncOverMobile } from '@/utils/settings';

export default function BackgroundSync() {
  useEffect(() => {
    const checkAndSync = async () => {
      const lastSync = localStorage.getItem('lastSync');
      const now = Date.now();

      console.log('[BackgroundSync] 🔁 Checking lastSync:', lastSync);

      if (!lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
        console.log('[BackgroundSync] ⏳ Running backgroundSync...');
        await backgroundSync();
        localStorage.setItem('lastSync', now.toString());
        console.log('[BackgroundSync] ✅ Sync complete');
      } else {
        console.log('[BackgroundSync] ⏸ Skipped (already synced recently)');
      }
    };

    const allowMobile = getSyncOverMobile();
    const connection = (navigator as any).connection;

    console.log('[BackgroundSync] 📱 allowMobile:', allowMobile);
    console.log('[BackgroundSync] 🌐 Online detected');
    console.log('[BackgroundSync] 📡 Connection type:', connection?.type);

    if (navigator.onLine) {
      // ⚙️ Nếu không xác định được loại kết nối, mặc định cho phép chạy (thường là WiFi)
      if (allowMobile || !connection || connection.type === 'wifi') {
        console.log('[BackgroundSync] 🚀 Running sync now...');
        checkAndSync();
      } else {
        console.log('[BackgroundSync] ⚠️ Skipped – mobile data and not allowed');
      }
    } else {
      console.log('[BackgroundSync] ❌ Offline – will retry later');
    }
  }, []);

  return null;
}
