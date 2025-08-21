// File: app/products/ProductsTable.tsx
'use client';
import React from 'react';
import { Product } from '@/lib/products';

type Props = {
  products: Product[];
  imageCache: Record<number, string>;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  searchText?: string;
};

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchText = '',
}: Props) {
  const renderSortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const highlightText = (text: string) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <mark key={idx} style={{ backgroundColor: 'yellow', color: 'black' }}>
              {part}
            </mark>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ccc' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 10 }}>
          <tr>
            <th
              style={{ cursor: 'pointer', padding: '4px 8px', borderBottom: '1px solid #ccc' }}
              onClick={() => onSortChange('name')}
            >
              Tên{renderSortArrow('name')}
            </th>
            <th
              style={{ cursor: 'pointer', padding: '4px 8px', borderBottom: '1px solid #ccc' }}
              onClick={() => onSortChange('price')}
            >
              Giá{renderSortArrow('price')}
            </th>
            <th
              style={{ cursor: 'pointer', padding: '4px 8px', borderBottom: '1px solid #ccc' }}
              onClick={() => onSortChange('stock_quantity')}
            >
              SL{renderSortArrow('stock_quantity')}
            </th>
            <th
              style={{ cursor: 'pointer', padding: '4px 8px', borderBottom: '1px solid #ccc' }}
              onClick={() => onSortChange('stock_status')}
            >
              Trạng thái{renderSortArrow('stock_status')}
            </th>
            <th style={{ padding: '4px 8px', borderBottom: '1px solid #ccc' }}>Ảnh</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr
              key={p.id}
              style={{
                transition: 'background-color 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f8ff')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '4px 8px' }}>{highlightText(p.name || '')}</td>
              <td style={{ padding: '4px 8px' }}>{p.price}</td>
              <td style={{ padding: '4px 8px' }}>{p.stock_quantity ?? 0}</td>
              <td style={{ padding: '4px 8px' }}>{p.stock_status}</td>
              <td style={{ padding: '4px 8px' }}>
                {imageCache[p.id] && (
                  <img
                    src={imageCache[p.id]}
                    alt={p.name}
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
