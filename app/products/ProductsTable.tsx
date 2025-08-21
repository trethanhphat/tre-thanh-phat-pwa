// File: app/products/ProductsTable.tsx
'use client';
import React from 'react';
import { Product } from '@/lib/products'; // Kiểu dữ liệu sản phẩm (id, name, price,...)

/**
 * Props mà ProductsTable nhận từ component cha (page.tsx):
 * - products: danh sách sản phẩm đã lọc, sắp xếp, phân trang
 * - imageCache: map { productId -> url ảnh } (có thể online hoặc offline blob)
 * - sortField / sortOrder: trạng thái đang sắp xếp theo cột nào, chiều nào
 * - onSortChange: callback khi user click vào tiêu đề cột để đổi sort
 */
type ProductsTableProps = {
  products: Product[];
  imageCache: Record<number, string>;
  sortField: 'stock_status' | 'price' | 'stock_quantity' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'stock_status' | 'price' | 'stock_quantity' | 'name') => void;
};

/**
 * Component hiển thị bảng sản phẩm.
 * Dữ liệu gốc (fetch từ API + sync IndexedDB) được xử lý ở page.tsx,
 * sau đó truyền vào ProductsTable qua props.
 */
export default function ProductsTable({
  products,
  imageCache,
  sortField,
  sortOrder,
  onSortChange,
}: ProductsTableProps) {
  /**
   * Hàm hiển thị mũi tên sort ▲ ▼ ở tiêu đề cột.
   * Nếu cột chưa được chọn sort thì trả về ↕️ (icon trung tính).
   */
  const renderSortSpan = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => (
    <span
      onClick={() => onSortChange(field)} // Khi click => gọi hàm cha đổi sortField/sortOrder
      style={{ cursor: 'pointer', marginLeft: 4 }}
    >
      {sortField === field ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : '↕️'}
    </span>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Bảng hiển thị sản phẩm */}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {/* Ảnh sản phẩm (không sort) */}
            <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Ảnh</th>

            {/* Tên sản phẩm (có sort) */}
            <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
              Tên {renderSortSpan('name')}
            </th>

            {/* Giá sản phẩm (có sort) */}
            <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
              Giá {renderSortSpan('price')}
            </th>

            {/* Tồn kho (có sort) */}
            <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
              Tồn kho {renderSortSpan('stock_quantity')}
            </th>

            {/* Trạng thái tồn (có sort) */}
            <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
              Trạng thái {renderSortSpan('stock_status')}
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              {/* Ảnh: lấy từ imageCache (truyền từ page.tsx) */}
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {imageCache[p.id] ? (
                  <img
                    src={imageCache[p.id]}
                    alt={p.name}
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#999' }}>No image</span>
                )}
              </td>

              {/* Tên sản phẩm */}
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {p.name || '(Không có tên)'}
              </td>

              {/* Giá */}
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {p.price ? `${p.price} ₫` : '-'}
              </td>

              {/* Số lượng tồn */}
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {p.stock_quantity ?? '-'}
              </td>

              {/* Trạng thái tồn (in đậm nếu còn hàng) */}
              <td
                style={{
                  borderBottom: '1px solid #eee',
                  padding: 8,
                  fontWeight: p.stock_status === 'instock' ? 'bold' : 'normal',
                  color: p.stock_status === 'instock' ? 'green' : 'red',
                }}
              >
                {p.stock_status || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
