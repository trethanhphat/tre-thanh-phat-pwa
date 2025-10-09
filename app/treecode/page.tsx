// File: app/treecode/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { codeToNumber, numberToCode } from '@/lib/treeCode';

// ⬇️ ADD: Giới hạn tối đa hệ one-based (kết thúc ở ZZZZ)
const MAX_ONE_BASED = 718057;

export default function TreeCodePage() {
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [highlightCode, setHighlightCode] = useState(false);
  const [highlightNumber, setHighlightNumber] = useState(false);

  // ⬇️ ADD: state thông báo lỗi cho UI
  const [error, setError] = useState('');

  // Khi code thay đổi → tính number (chỉ set khi khác) + báo lỗi nếu mã không hợp lệ
  useEffect(() => {
    if (!code) {
      if (number) setNumber('');
      setError('');
      return;
    }
    const n = codeToNumber(code.toUpperCase());
    const s = n === '' ? '' : String(n);

    if (n === '' && code) {
      // mã không hợp lệ so với quy ước one-based (A001, AA01, AAA1, AAAA)
      setError('Mã không hợp lệ. Ví dụ hợp lệ: 0001, A001, AA01, AAA1, AAAA');
    } else {
      setError('');
    }

    if (s !== number) setNumber(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Khi number thay đổi → tính code (kiểm tra hợp lệ & dải tối đa)
  useEffect(() => {
    if (!number) {
      if (code) setCode('');
      setError('');
      return;
    }

    const n = Number(number);

    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      setError('Vui lòng nhập số nguyên hợp lệ');
      if (code) setCode('');
      return;
    }

    if (n < 1) {
      setError('Vui lòng nhập số nguyên ≥ 1');
      if (code) setCode('');
      return;
    }

    // ⬇️ ADD: chặn vượt dải để không rơi vào "undefinedAAA"
    if (n > MAX_ONE_BASED) {
      setError(`Số ngoài phạm vi (1..${MAX_ONE_BASED})`);
      if (code) setCode('');
      return;
    }

    const c = numberToCode(n);
    // Nếu bạn đã vá numberToCode() trả '' khi vượt dải, vẫn nên giữ guard trên cho chắc

    setError('');
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

      {/* Mã → Số */}
      <div style={{ marginBottom: 20 }}>
        <label>Mã cây → Số thứ tự</label>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã cây (vd: 0001, A001, AA01, AAA1, AAAA)"
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

      {/* Số → Mã */}
      <div>
        <label>Số thứ tự → Mã cây</label>
        <input
          // ⬇️ ADD: dùng input number + min/max để hỗ trợ người dùng
          type="number"
          min={1}
          max={MAX_ONE_BASED}
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder={`Nhập số thứ tự (Từ 1 đến ${MAX_ONE_BASED})`}
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

      {/* ⬇️ ADD: hiển thị thông báo lỗi đẹp */}
      {error && (
        <div style={{ color: 'crimson', marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}