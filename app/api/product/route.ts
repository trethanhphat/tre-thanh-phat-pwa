// ✅ File: app/api/product/route.ts
import { NextResponse } from 'next/server';

const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET!;

const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 ngày

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sản phẩm' }, { status: 400 });
  }

  // 1️⃣ Check cache server
  const cached = productCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(`https://rungkhoai.com/wp-json/wc/v3/products/${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
          'base64'
        )}`,
      },
    });

    if (!res.ok) {
      throw new Error(`WooCommerce trả về lỗi: ${res.status}`);
    }

    const data = await res.json();

    // 2️⃣ Chuẩn hoá dữ liệu
    const product = {
      id: data.id,
      name: data.name,
      price: data.price,
      stock_quantity: data.stock_quantity,
      stock_status: data.stock_status,
      image_url: data.images?.[0]?.src || '',
      description: data.description || '',
    };

    // 3️⃣ Cache server
    productCache.set(id, { data: product, timestamp: Date.now() });

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
