// ✅ File: src/components/ResponsiveTableLabels.tsx
'use client';

import { useEffect } from 'react';

export default function ResponsiveTableLabels() {
  useEffect(() => {
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
  }, []);

  return null; // Không render gì ra UI
}
