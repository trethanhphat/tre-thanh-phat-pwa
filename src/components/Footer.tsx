'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default (
  <>
    {/* Footer cố định */}
    <footer className={styles.footer}>
      <a href={`//${appUrl}`}>
        <h3 className="font-ttp app-title">{appName}</h3>
      </a>
      <p>
        Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <p className="mt-1">{copyright}</p>
    </footer>
  </>
);
