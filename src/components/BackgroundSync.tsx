// File: src/components/BackgroundSync.tsx

'use client';

import { useEffect } from 'react';
import { backgroundSync } from '@/utils/backgroundSync';
import { getSyncOverMobile } from '@/utils/settings';

export default function BackgroundSync() {
  useEffect(() => {
    const checkAndSync = async () => {
      const lastSync = localStorage.getItem('lastSync');
      const now = Date.now();

      if (!lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
        await backgroundSync();
        localStorage.setItem('lastSync', now.toString());
      }
    };

    const allowMobile = getSyncOverMobile();
    if (navigator.onLine) {
      const connection = (navigator as any).connection;
      if (allowMobile || connection?.type === 'wifi') {
        checkAndSync();
      }
    }
  }, []);

  return null;
}
