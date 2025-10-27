// File: app/products/ProductsTable.tsx
'use client';

import Link from 'next/link';
import { Product } from '@/lib/products'; // ✅ dùng type gốc của bạn
import { formatPrice, formatStockStatus } from '@/utils/format'; // ✅ giữ logic format sẵn có

/**
 * Component này CHỈ lo HIỂN THỊ bảng.
 * - Nhận danh sách đã phân trang từ page.tsx
 * - Nhận imageCache để hiện ảnh sản phẩm (URL online hoặc blob)
 * - Giữ nguyên HAI hàm sort icon: renderSortArrow + renderSortSpan (KHÔNG bỏ)
 * - Highlight từ khoá search trong tên sản phẩm
 */
interface ProductsTableProps {
  products: Product[]; // ✅ đã phân trang
  imageCache: { [id: number]: string };
  sortField: 'name' | 'price' | 'stock_quantity' | 'stock_status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => void;
  searchText?: string;
  pageSizeOptions?: number[]; // (giữ lại nếu bạn có nhu cầu tái dùng)
}

export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
  searchText = '',
  pageSizeOptions = [5, 10, 20, 50], // (không dùng ở đây nhưng GIỮ lại theo yêu cầu "không bỏ gì")
}: ProductsTableProps) {
  // ================== ICON SORT Ở HEADER ==================
  // ✅ KHÔNG BỎ: Giữ nguyên theo bạn
  const renderSortArrow = (field: string) => {
    if (sortField !== (field as any)) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  // ================== ICON SORT TRONG CELL ==================
  // ✅ KHÔNG BỎ: Giữ nguyên theo bạn
  const renderSortSpan = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => (
    <span onClick={() => onSortChange(field)} style={{ cursor: 'pointer', marginLeft: 4 }}>
      {sortField === field ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
    </span>
  );

  // Helper: highlight searchText trong tên (escape regex để an toàn)
  const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return (
    <>
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
        <thead
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--color-primary)',
            color: 'var(--color-secondary)',
            zIndex: 1,
          }}
        >
          <tr>
            <th style={{ border: '1px solid var(--color-border)', padding: '8px' }}>
              Ảnh sản phẩm
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('name')}
            >
              Tên sản phẩm{renderSortArrow('name')}
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('price')}
            >
              Giá{renderSortArrow('price')}
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_quantity')}
            >
              Tồn kho{renderSortArrow('stock_quantity')}
            </th>

            <th
              style={{ border: '1px solid var(--color-border)', padding: '8px', cursor: 'pointer' }}
              onClick={() => onSortChange('stock_status')}
            >
              Trạng thái{renderSortArrow('stock_status')}
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr
              key={p.id}
              style={{
                border: '1px solid var(--color-border)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Ảnh */}
              <td
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  textAlign: 'center',
                }}
                data-label="Ảnh sản phẩm"
              >
                {(() => {
                  const url = p.image_url ?? '';

                  // ✅ Blob URL từ cache (ưu tiên)
                  const cachedBlobUrl = url && imageCache?.[url] ? imageCache[url] : null;

                  // ✅ Nếu có blob → dùng; nếu không → link online gốc (hoặc fallback)
                  const imgSrc = cachedBlobUrl || url || '/fallback.png';

                  const sourceLabel = cachedBlobUrl ? 'Cached ✅' : 'Online 🌐';

                  return (
                    <Link href={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name}
                        style={{ width: 150, height: 150, objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <small style={{ fontSize: 10 }}>{sourceLabel}</small>
                    </Link>
                  );
                })()}
              </td>

              {/* Tên + highlight + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tên sản phẩm"
              >
                <Link href={`/product/${p.id}`} style={{ color: 'var(--color-link)' }}>
                  {searchText
                    ? String(p.name)
                        .split(new RegExp(`(${escapeReg(searchText)})`, 'gi'))
                        .map((part, i) =>
                          part.toLowerCase() === searchText.toLowerCase() ? (
                            <mark key={i}>{part}</mark>
                          ) : (
                            part
                          )
                        )
                    : p.name}
                </Link>
                {renderSortSpan('name')}
              </td>

              {/* Giá + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Giá"
              >
                {formatPrice((p as any).price)} {renderSortSpan('price')}
              </td>

              {/* Tồn kho + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Tồn kho"
              >
                {(p as any).stock_quantity ?? '-'} {renderSortSpan('stock_quantity')}
              </td>

              {/* Trạng thái + màu + icon sort */}
              <td
                style={{ border: '1px solid var(--color-border)', padding: '8px' }}
                data-label="Trạng thái"
              >
                {(() => {
                  const { text, color } = formatStockStatus((p as any).stock_status);
                  return <span style={{ color }}>{text}</span>;
                })()}
                {renderSortSpan('stock_status')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* style slot giữ chỗ nếu bạn cần */}
      <style jsx>{`
        td::before {
          /* bạn có thể thêm responsive label ở mobile tại đây nếu muốn */
        }
      `}</style>
    </>
  );
}
