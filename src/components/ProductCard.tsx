// src/components/ProductCard.tsx

'use client';

import useSWR from 'swr';
import Image from 'next/image';
import type { Product } from '@/types/product';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductCard({ product }: { product: Product }) {
  const { data } = useSWR(`/api/product-status?id=${product.id}`, fetcher, {
    fallbackData: { price: product.price },
    refreshInterval: 60000,
  });

  const price = data?.price ?? product.price;

  return (
    <div className="border rounded-lg p-2 shadow">
      <Image
        src={product.images?.[0]?.src}
        alt={product.name}
        width={400}
        height={400}
        className="w-full h-40 object-cover rounded"
      />
      <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
      <p className="text-green-700 font-medium">{price}₫</p>
    </div>
  );
}
