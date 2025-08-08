// ✅ File: app/product/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ProductData {
  id: number;
  price: string;
  stock_quantity: number | null;
  stock_status: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string; // Ép kiểu để TS chấp nhận

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/product?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải sản phẩm');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Đang tải...</p>;
  if (error) return <p className="p-4 text-red-500">Lỗi: {error}</p>;
  if (!product) return <p className="p-4">Không tìm thấy sản phẩm</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Sản phẩm #{product.id}</h1>
      <p>💰 Giá: {product.price}₫</p>
      <p>📦 Số lượng tồn: {product.stock_quantity ?? 'Không xác định'}</p>
      <p>🔖 Trạng thái: {product.stock_status === 'instock' ? 'Còn hàng' : 'Hết hàng'}</p>
    </div>
  );
}
