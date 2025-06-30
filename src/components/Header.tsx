'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Header cố định */}
      <div
        style={{
          padding: '1.5rem',
          background: 'var(--menu-bg)',
          borderBottom: '1px solid #ccc',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <h1 className="font-ttp" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {appName}
        </h1>
        <p style={{ marginBottom: '0' }}>{appDescription}</p>
      </div>
    </>
  );
}
