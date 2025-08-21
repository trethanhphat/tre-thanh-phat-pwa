'use client';

import Link from 'next/link';
import { Product } from '@/lib/products';
import { formatPrice, formatStockStatus } from '@/utils/format';

interface ProductsTableProps {
  products: Product[];
  imageCache: { [id: number]: string };
  sortField: 'name' | 'price' | 'stock_quantity' | 'stock_status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => void;
  searchQuery?: string;
}

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchQuery = '',
}: ProductsTableProps) {
  const renderSortIcon = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: 'yellow' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
      <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-primary)' }}>
        <tr>
          <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>Ảnh sản phẩm</th>
          <th
            style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
            onClick={() => onSortChange('name')}
          >
            Tên sản phẩm{renderSortIcon('name')}
          </th>
          <th
            style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
            onClick={() => onSortChange('price')}
          >
            Giá{renderSortIcon('price')}
          </th>
          <th
            style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
            onClick={() => onSortChange('stock_quantity')}
          >
            Tồn kho{renderSortIcon('stock_quantity')}
          </th>
          <th
            style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
            onClick={() => onSortChange('stock_status')}
          >
            Trạng thái{renderSortIcon('stock_status')}
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr
            key={p.id}
            style={{
              transition: 'background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f8ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                {highlightText(p.name)}
              </Link>
              <span onClick={() => onSortChange('name')} style={{ cursor: 'pointer' }}>
                {sortField === 'name' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Giá"
            >
              {formatPrice(p.price)}
              <span onClick={() => onSortChange('price')} style={{ cursor: 'pointer' }}>
                {sortField === 'price' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Tồn kho"
            >
              {p.stock_quantity ?? '-'}
              <span onClick={() => onSortChange('stock_quantity')} style={{ cursor: 'pointer' }}>
                {sortField === 'stock_quantity' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Trạng thái"
            >
              {(() => {
                const { text, color } = formatStockStatus(p.stock_status);
                return <span style={{ color }}>{text}</span>;
              })()}
              <span onClick={() => onSortChange('stock_status')} style={{ cursor: 'pointer' }}>
                {sortField === 'stock_status' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
