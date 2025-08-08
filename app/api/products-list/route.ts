// ✅ File: app/api/products-list/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_PRODUCTS_URL = 'https://rungkhoai.com/wp-json/wc/v3/products';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error('Thiếu API key WooCommerce');
}

export async function GET() {
  try {
    const response = await axios.get(API_PRODUCTS_URL, {
      auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET },
      params: { per_page: 100, page: 1 },
    });

    const products = response.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock_quantity: p.stock_quantity,
      stock_status: p.stock_status,
      image_url: p.images?.[0]?.src || null,
    }));

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Lỗi lấy sản phẩm:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Không thể lấy sản phẩm' }, { status: 500 });
  }
}
