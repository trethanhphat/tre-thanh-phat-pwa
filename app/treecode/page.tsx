// File: app/treecode/page.tsx
'use client';

import { useState } from 'react';
import { codeToNumber, numberToCode } from '@/lib/treeCode';

export default function TreeCodePage() {
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [highlight, setHighlight] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1000);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tree Code Checker</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Mã cây → Số thứ tự</label>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã cây"
          style={{ marginLeft: 10 }}
        />
        <button onClick={() => setNumber(String(codeToNumber(code)))}>Chuyển</button>
        {number && (
          <span
            onClick={() => copyToClipboard(number)}
            style={{
              marginLeft: 10,
              cursor: 'pointer',
              backgroundColor: highlight ? 'yellow' : 'transparent',
            }}
          >
            {number}
          </span>
        )}
      </div>

      <div>
        <label>Số thứ tự → Mã cây</label>
        <input
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder="Nhập số thứ tự"
          style={{ marginLeft: 10 }}
        />
        <button onClick={() => setCode(numberToCode(Number(number)))}>Chuyển</button>
        {code && (
          <span
            onClick={() => copyToClipboard(code)}
            style={{
              marginLeft: 10,
              cursor: 'pointer',
              backgroundColor: highlight ? 'yellow' : 'transparent',
            }}
          >
            {code}
          </span>
        )}
      </div>
    </div>
  );
}
