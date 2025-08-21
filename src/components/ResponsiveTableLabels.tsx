// ✅ File: src/components/ResponsiveTableLabels.tsx
'use client';

import { useEffect } from 'react';

export default function ResponsiveTableLabels() {
  useEffect(() => {
    const updateDataLabels = () => {
      document.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(
          th => th.textContent?.trim() || ''
        );

        table.querySelectorAll('tbody tr').forEach(row => {
          row.querySelectorAll('td').forEach((cell, i) => {
            if (headers[i]) {
              cell.setAttribute('data-label', headers[i]);
            }
          });
        });
      });
    };

    updateDataLabels(); // chạy ngay

    const observer = new MutationObserver(() => {
      updateDataLabels(); // chạy khi DOM thay đổi
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
