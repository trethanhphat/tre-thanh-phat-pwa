// ✅ File: app/product/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Product {
  id: number;
  price: string;
  stock_quantity: number | null;
  stock_status: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/product?id=${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi lấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="p-4">Đang tải...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!product) return <p className="p-4">Không tìm thấy sản phẩm</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Thông tin sản phẩm</h1>
      <p>
        <strong>ID:</strong> {product.id}
      </p>
      <p>
        <strong>Giá:</strong> {product.price || 'Chưa có giá'}
      </p>
      <p>
        <strong>Tồn kho:</strong> {product.stock_quantity ?? 'Không xác định'}
      </p>
      <p>
        <strong>Trạng thái:</strong> {product.stock_status}
      </p>
    </div>
  );
}
