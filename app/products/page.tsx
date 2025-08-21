// 📄 File: app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductsTable from './ProductsTable';
import { Product } from '@/lib/products'; // 🔹 Định nghĩa type sản phẩm
import PaginationControls from './PaginationControls'; // 🔹 Component phân trang tách riêng

// 👉 Đây là trang chính hiển thị danh sách sản phẩm
export default function ProductsPage() {
  // ------------------------------
  // 1. State quản lý dữ liệu
  // ------------------------------
  const [products, setProducts] = useState<Product[]>([]); // danh sách sản phẩm
  const [imageCache, setImageCache] = useState<{ [id: number]: string }>({}); // cache ảnh
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock_quantity' | 'stock_status'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchText, setSearchText] = useState(''); // 🔍 ô tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ------------------------------
  // 2. Giả lập fetch dữ liệu sản phẩm
  //    (Thực tế bạn gọi API hoặc DB)
  // ------------------------------
  useEffect(() => {
    async function fetchData() {
      // 🔹 Ở đây bạn có thể gọi API thật
      // const res = await fetch('/api/products');
      // const data = await res.json();

      // ⚡ Demo dữ liệu giả
      const data: Product[] = Array.from({ length: 42 }, (_, i) => ({
        id: i + 1,
        name: `Sản phẩm ${i + 1}`,
        price: 100000 + i * 5000,
        stock_quantity: Math.floor(Math.random() * 50),
        stock_status: Math.random() > 0.5 ? 'in_stock' : 'out_of_stock',
      }));

      setProducts(data);

      // ⚡ Demo cache ảnh
      const images: { [id: number]: string } = {};
      data.forEach(p => {
        images[p.id] = `https://picsum.photos/seed/${p.id}/150`;
      });
      setImageCache(images);
    }
    fetchData();
  }, []);

  // ------------------------------
  // 3. Lọc theo từ khóa tìm kiếm
  // ------------------------------
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ------------------------------
  // 4. Sắp xếp sản phẩm
  // ------------------------------
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // ------------------------------
  // 5. Phân trang
  // ------------------------------
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ------------------------------
  // 6. Hàm thay đổi sắp xếp
  // ------------------------------
  const handleSortChange = (field: 'name' | 'price' | 'stock_quantity' | 'stock_status') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📦 Danh sách sản phẩm</h1>

      {/* 🔍 Ô tìm kiếm */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            setCurrentPage(1); // reset về trang 1
          }}
          style={{ padding: '6px 10px', width: '250px' }}
        />
      </div>

      {/* 🔹 Phân trang (Trên bảng) */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* Bảng sản phẩm */}
      <ProductsTable
        products={paginatedProducts}
        imageCache={imageCache}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        searchText={searchText}
      />

      {/* 🔹 Phân trang (Dưới bảng) */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
