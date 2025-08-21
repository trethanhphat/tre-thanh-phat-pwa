// ✅ File: app/products/ProductsTable.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/products';
import { formatPrice, formatStockStatus } from '@/utils/format';

interface ProductsTableProps {
  products: Product[];
  imageCache: { [id: number]: string };
  sortField: 'name' | 'price' | 'stock_quantity' | 'stock_status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => void;
  searchText?: string;
  pageSizeOptions?: number[];
}

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchText = '',
  pageSizeOptions = [5, 10, 20, 50],
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleJumpToPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let page = parseInt(e.target.value);
    if (isNaN(page)) page = 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const renderSortSpan = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => (
    <span onClick={() => onSortChange(field)} style={{ cursor: 'pointer', marginLeft: 4 }}>
      {sortField === field ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
    </span>
  );

  const renderPagination = () => (
    <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
        « Đầu
      </button>
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        ‹ Trước
      </button>
      <span>
        Trang{' '}
        <input
          type="number"
          value={currentPage}
          onChange={handleJumpToPage}
          style={{ width: '50px' }}
        />{' '}
        / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Tiếp ›
      </button>
      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
        Cuối »
      </button>
      <span>
        Sản phẩm/trang:{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(1);
          }}
        >
          {pageSizeOptions.map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </span>
    </div>
  );

  return (
    <>
      {renderPagination()}
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
        <thead
          style={{ position: 'sticky', top: 0, background: 'var(--color-primary)', zIndex: 1 }}
        >
          <tr>
            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
              Ảnh sản phẩm
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('name')}
            >
              Tên sản phẩm {renderSortArrow('name')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('price')}
            >
              Giá {renderSortArrow('price')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_quantity')}
            >
              Tồn kho {renderSortArrow('stock_quantity')}
            </th>
            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_status')}
            >
              Trạng thái {renderSortArrow('stock_status')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map(p => (
            <tr
              key={p.id}
              style={{
                border: '1px solid var(--color-border)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Ảnh sản phẩm"
              >
                {imageCache[p.id] ? (
                  <Link href={`/product/${p.id}`}>
                    <img src={imageCache[p.id]} alt={p.name} style={{ maxWidth: '150px' }} />
                  </Link>
                ) : (
                  <span>...</span>
                )}
              </td>
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tên sản phẩm"
              >
                <Link
                  href={`/product/${p.id}`}
                  style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
                >
                  {p.name
                    .split(new RegExp(`(${searchText})`, 'gi'))
                    .map((part, i) =>
                      part.toLowerCase() === searchText.toLowerCase() ? (
                        <mark key={i}>{part}</mark>
                      ) : (
                        part
                      )
                    )}
                </Link>
                {renderSortSpan('name')}
              </td>
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Giá"
              >
                {formatPrice(p.price)}
                {renderSortSpan('price')}
              </td>
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tồn kho"
              >
                {p.stock_quantity ?? '-'}
                {renderSortSpan('stock_quantity')}
              </td>
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Trạng thái"
              >
                {(() => {
                  const { text, color } = formatStockStatus(p.stock_status);
                  return <span style={{ color }}>{text}</span>;
                })()}
                {renderSortSpan('stock_status')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {renderPagination()}

      <style jsx>{`
        td::before {
        }
      `}</style>
    </>
  );
}
