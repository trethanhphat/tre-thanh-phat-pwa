// app/api/product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_PRODUCTS_URL = 'https://rungkhoai.com/wp-json/wc/v3/products';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error(
    'Thiếu NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY hoặc NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET trong .env.local'
  );
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Thiếu tham số id sản phẩm' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${API_PRODUCTS_URL}/${id}`, {
      auth: {
        username: CONSUMER_KEY as string,
        password: CONSUMER_SECRET as string,
      },
    });

    const { id: productId, price, stock_quantity, stock_status } = response.data;

    return NextResponse.json({
      id: productId,
      price,
      stock_quantity,
      stock_status,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu từ WooCommerce:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Không thể lấy thông tin sản phẩm' }, { status: 500 });
  }
}
