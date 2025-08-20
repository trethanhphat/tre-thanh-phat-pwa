// File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Product, loadProductsFromDB, syncProducts } from '@/lib/products';
import { getImageURL } from '@/lib/images';
import ProductsTable from './ProductsTable';

type SortField = 'name' | 'price' | 'stock_quantity';
type SortOrder = 'asc' | 'desc';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [imageCache, setImageCache] = useState<{ [id: number]: string }>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ... loadOfflineFirst, fetchOnlineAndUpdate, useEffect giữ nguyên

  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'price') {
        valA = Number(a.price) || 0;
        valB = Number(b.price) || 0;
      } else if (sortField === 'stock_quantity') {
        valA = a.stock_quantity ?? 0;
        valB = b.stock_quantity ?? 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      // Click lại cùng cột → đảo chiều
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderContent = () => {
    if (products.length > 0) {
      return (
        <ProductsTable
          products={getSortedProducts()}
          imageCache={imageCache}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      );
    }
    if (loading) return <p>Đang tải dữ liệu...</p>;
    return <p>Không có sản phẩm</p>;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Danh sách sản phẩm</h1>

      {offline && products.length > 0 && (
        <p style={{ color: 'orange' }}>
          ⚠️ Đang hiển thị dữ liệu offline trong khi cập nhật dữ liệu
        </p>
      )}

      {renderContent()}
    </div>
  );
}
