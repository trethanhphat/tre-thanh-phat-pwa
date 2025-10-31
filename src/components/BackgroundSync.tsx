// ✅ File: src/components/BackgroundSync.tsx

'use client';

import { useEffect } from 'react';
import { backgroundSync } from '@/utils/backgroundSync';
import { getSyncOverMobile } from '@/utils/settings';

export default function BackgroundSync() {
  useEffect(() => {
    const checkAndSync = async () => {
      console.log('[BackgroundSync] 🔹 Start checkAndSync()');

      const lastSync = localStorage.getItem('lastSync');
      const now = Date.now();

      if (!lastSync) {
        console.log('[BackgroundSync] 🆕 No previous sync found → run now');
      } else {
        console.log(
          '[BackgroundSync] ⏱ Last sync at',
          new Date(parseInt(lastSync)).toLocaleString()
        );
        console.log(
          '[BackgroundSync] ⏳ Time since last sync:',
          Math.round((now - parseInt(lastSync)) / 1000 / 60),
          'min'
        );
      }

      if (!lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
        try {
          console.log('[BackgroundSync] 🚀 Triggering backgroundSync() ...');
          await backgroundSync();
          localStorage.setItem('lastSync', now.toString());
          console.log('[BackgroundSync] ✅ Sync complete at', new Date(now).toLocaleString());
        } catch (err) {
          console.warn('[BackgroundSync] ❌ Sync error:', err);
        }
      } else {
        console.log('[BackgroundSync] ⏭ Skip sync (within 24h)');
      }
    };

    const allowMobile = getSyncOverMobile();
    console.log('[BackgroundSync] 📱 allowMobile:', allowMobile);

    if (navigator.onLine) {
      console.log('[BackgroundSync] 🌐 Online detected');
      const connection = (navigator as any).connection;
      console.log('[BackgroundSync] 📡 Connection type:', connection?.type);

      if (allowMobile || connection?.type === 'wifi') {
        console.log('[BackgroundSync] ✅ Condition met, run checkAndSync()');
        checkAndSync();
      } else {
        console.log('[BackgroundSync] ⚠️ Skipped – mobile data and not allowed');
      }
    } else {
      console.log('[BackgroundSync] ❌ Offline – skip sync');
    }
  }, []);

  return null;
}
