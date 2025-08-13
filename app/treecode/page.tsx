// File: app/treecode/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { codeToNumber, numberToCode } from '@/lib/treeCode';

export default function TreeCodePage() {
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [highlightCode, setHighlightCode] = useState(false);
  const [highlightNumber, setHighlightNumber] = useState(false);

  // Khi code thay đổi → tự động tính number
  useEffect(() => {
    if (!code) {
      setNumber('');
      return;
    }
    const n = codeToNumber(code.toUpperCase());
    if (n !== '') setNumber(String(n));
    else setNumber('');
  }, [code]);

  // Khi number thay đổi → tự động tính code
  useEffect(() => {
    if (!number) {
      setCode('');
      return;
    }
    const c = numberToCode(Number(number));
    if (c !== '') setCode(c);
    else setCode('');
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
