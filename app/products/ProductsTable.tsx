// File: app/products/ProductsTable.tsx
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
}

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
}: ProductsTableProps) {
  const renderSortIcon = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
      <thead>
        <tr style={{ background: 'var(--color-primary)' }}>
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
            style={{ border: '1px solid var(--color-border)', padding: '8px' }}
            onClick={() => onSortChange('stock_status')}
          >
            Trạng thái{renderSortIcon('stock_status')}
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id}>
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
              // onClick={() => onSortChange('name')}
            >
              <Link
                href={`/product/${p.id}`}
                style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
              >
                {p.name}
              </Link>
              <span onClick={() => onSortChange('name')} style={{ cursor: 'pointer' }}>
                {sortField === 'name' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Giá"
              // onClick={() => onSortChange('price')}
            >
              {formatPrice(p.price)}
              <span onClick={() => onSortChange('price')} style={{ cursor: 'pointer' }}>
                {sortField === 'price' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Tồn kho"
              //onClick={() => onSortChange('stock_quantity')}
            >
              {p.stock_quantity ?? '-'}
              <span onClick={() => onSortChange('stock_quantity')} style={{ cursor: 'pointer' }}>
                {sortField === 'stock_quantity' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
              </span>
            </td>
            <td
              style={{ border: '1px solid var(--color-border)', padding: '8px' }}
              data-label="Trạng thái"
              // onClick={() => onSortChange('stock_status')}
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
