// components/TreeCodeChecker.tsx
'use client';

import { useState } from 'react';
import { codeToNumber } from '@/utils/treeCode';

export default function TreeCodeChecker() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleCheck = () => {
    try {
      setError('');
      const num = codeToNumber(code);
      setResult(num);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 400 }}>
      <h2>Tra cứu số thứ tự cây</h2>
      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Nhập mã cây (VD: 0001, A001, ZZZZ)"
        style={{ padding: '0.5rem', width: '100%' }}
      />
      <button onClick={handleCheck} style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
        Kiểm tra
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result !== null && <p>Số thứ tự: {result}</p>}
    </div>
  );
}
