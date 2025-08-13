// ✅ File: app/tree/page.tsx

'use client';
import { useEffect, useState } from 'react';
import TreeCodeChecker from '@/components/TreeCodeChecker';

export default function SheetPage() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sheet/tree')
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div>
      <div style={{ padding: 20 }}>
        <h1>Dữ liệu từ Google Sheet</h1>
        <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TreeCodeChecker />;
    </div>
  );
}
