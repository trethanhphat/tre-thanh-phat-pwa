// File: app/api/product-status/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { serverEnv } from '@/lib/server-env';

const API_PRODUCTS_URL = 'https://rungkhoai.com/wp-json/wc/v3/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Thiếu tham số id sản phẩm' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${API_PRODUCTS_URL}/${id}`, {
      auth: {
        username: serverEnv.WC_CONSUMER_KEY, // ✅ server-only env
        password: serverEnv.WC_CONSUMER_SECRET,
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
    console.error('Lỗi WooCommerce:', error?.response?.data || error.message);

    return NextResponse.json({ error: 'Không thể lấy thông tin sản phẩm' }, { status: 500 });
  }
}
