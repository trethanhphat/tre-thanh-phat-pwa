// File: app/api/product/route.ts
import { NextResponse } from 'next/server';

const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Thiếu id sản phẩm' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://rungkhoai.com/wp-json/wc/v3/products/${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
          'base64'
        )}`,
      },
      // Nếu muốn bỏ cache của Next.js:
      // next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error(`WooCommerce trả về lỗi: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
