// File: src/components/SortIcon.tsx
'use client';

import React from 'react';

type SortOrder = 'asc' | 'desc' | null;

interface SortIconProps {
  field: string; // tên cột (vd: 'price', 'name')
  sortField: string | null; // cột hiện đang sort
  sortOrder: SortOrder; // asc | desc | null
  onSortChange: (field: string) => void; // callback khi nhấn icon
}

export default function SortIcon({ field, sortField, sortOrder, onSortChange }: SortIconProps) {
  // Kiểm tra trạng thái của cột hiện tại
  const isActive = field === sortField;

  let icon = '↕️'; // default: chưa sort
  if (isActive) {
    if (sortOrder === 'asc') icon = '⬆️';
    else if (sortOrder === 'desc') icon = '⬇️';
  }

  return (
    <span
      onClick={() => onSortChange(field)}
      style={{
        cursor: 'pointer',
        marginLeft: '6px',
        userSelect: 'none',
      }}
      role="button"
      aria-label={`Sort by ${field}`}
    >
      {icon}
    </span>
  );
}
