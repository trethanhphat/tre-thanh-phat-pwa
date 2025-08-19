// File: app / settings / page.tsx;

'use client';

import { useState, useEffect } from 'react';
import { setSyncOverMobile, getSyncOverMobile } from '@/utils/settings';

export default function SettingsPage() {
  const [syncOverMobile, setSyncOverMobileState] = useState(false);

  useEffect(() => {
    setSyncOverMobileState(getSyncOverMobile());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSyncOverMobileState(checked);
    setSyncOverMobile(checked);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 400 }}>
      <h1>Cài đặt đồng bộ</h1>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <input type="checkbox" checked={syncOverMobile} onChange={handleChange} />
        Cho phép đồng bộ khi dùng mạng di động
      </label>
      <p style={{ marginTop: '0.5rem', color: '#555', fontSize: '0.9rem' }}>
        Khi bật, ứng dụng sẽ đồng bộ dữ liệu sản phẩm và ảnh cả khi dùng mạng di động, giúp cập nhật
        mới nhất nhưng có thể tốn dữ liệu di động.
      </p>
    </div>
  );
}
