// ✅ File: app/products/ProductsTable.tsx

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { formatPrice, formatStockStatus } from '@/utils/format';

interface ProductsTableProps {
  products: Product[];
  imageCache: { [id: number]: string };
  sortField: 'name' | 'price' | 'stock_quantity' | 'stock_status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => void;
  searchText?: string; // highlight search
}

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchText = '',
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(products.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortOrder, products, pageSize]);

  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const highlightText = (text: string) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ background: 'yellow' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const PaginationControls = () => (
    <div
      style={{
        margin: '8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
        Prev
      </button>
      <span>Trang</span>
      <input
        type="number"
        value={currentPage}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v);
        }}
        style={{ width: '50px' }}
      />
      <span>/ {totalPages}</span>
      <button
        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <span>Sản phẩm/trang:</span>
      <select value={pageSize} onChange={e => setPageSize(parseInt(e.target.value))}>
        {[5, 10, 20, 50].map(n => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );

  const renderSortIcon = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div>
      <PaginationControls />
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
        <thead>
          <tr style={{ background: 'var(--color-primary)', position: 'sticky', top: 0, zIndex: 1 }}>
            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
              Ảnh sản phẩm
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('name')}
            >
              Tên sản phẩm {renderSortIcon('name')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('price')}
            >
              Giá {renderSortIcon('price')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_quantity')}
            >
              Tồn kho {renderSortIcon('stock_quantity')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_status')}
            >
              Trạng thái {renderSortIcon('stock_status')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map(p => (
            <tr
              key={p.id}
              style={{ cursor: 'default', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {imageCache[p.id] ? (
                  <Link href={`/product/${p.id}`}>
                    <img src={imageCache[p.id]} alt={p.name} style={{ maxWidth: '150px' }} />
                  </Link>
                ) : (
                  <span>...</span>
                )}
              </td>
              <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                <Link
                  href={`/product/${p.id}`}
                  style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
                >
                  {highlightText(p.name)}
                </Link>
              </td>
              <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                {formatPrice(p.price)}
              </td>
              <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                {p.stock_quantity ?? '-'}
              </td>
              <td style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
                {(() => {
                  const { text, color } = formatStockStatus(p.stock_status);
                  return <span style={{ color }}>{text}</span>;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls />
    </div>
  );
}
