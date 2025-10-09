// File: app/treecode/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { codeToNumber, numberToCode } from '@/lib/treeCode';

export default function TreeCodePage() {
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [highlightCode, setHighlightCode] = useState(false);
  const [highlightNumber, setHighlightNumber] = useState(false);

  // Khi code thay đổi → tính number (chỉ set khi khác)
  useEffect(() => {
    const n = codeToNumber(code);
    const s = n === '' ? '' : String(n);
    if (s !== number) setNumber(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Khi number thay đổi → tính code (chỉ set khi khác)
  useEffect(() => {
    if (!number) {
      if (code) setCode('');
      return;
    }
    const c = numberToCode(Number(number));
    if (c !== code) setCode(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  const copyToClipboard = (text: string, type: 'code' | 'number') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        setHighlightCode(true);
        setTimeout(() => setHighlightCode(false), 1000);
      } else {
        setHighlightNumber(true);
        setTimeout(() => setHighlightNumber(false), 1000);
      }
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
        {number && (
          <span
            onClick={() => copyToClipboard(number, 'number')}
            style={{
              marginLeft: 10,
              cursor: 'pointer',
              backgroundColor: highlightNumber ? 'yellow' : 'transparent',
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
        {code && (
          <span
            onClick={() => copyToClipboard(code, 'code')}
            style={{
              marginLeft: 10,
              cursor: 'pointer',
              backgroundColor: highlightCode ? 'yellow' : 'transparent',
            }}
          >
            {code}
          </span>
        )}
      </div>
    </div>
  );
}
