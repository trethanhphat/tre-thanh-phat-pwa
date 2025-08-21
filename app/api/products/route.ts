// ✅ File: app/api/products/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL as string;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY as string;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET as string;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error('Thiếu API key WooCommerce');
}

export async function GET() {
  try {
    /*
    const response = await axios.get(API_PRODUCTS_URL, {
      auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET },
      params: { per_page: 100, page: 1 },
    });

    // Map về format gọn gàng
    const products = response.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock_quantity: p.stock_quantity,
      stock_status: p.stock_status,
      image_url: p.images?.[0]?.src || null,
    }));

    return NextResponse.json({ products });
    */

    let allProducts: any[] = [];
    let page = 1;

    while (true) {
      const response = await axios.get(API_PRODUCTS_URL, {
        auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET },
        params: { per_page: 100, page },
      });

      const products = response.data;
      if (!Array.isArray(products)) {
        throw new Error('⚠️ API không trả về mảng sản phẩm hợp lệ');
      }

      if (products.length === 0) break;

      allProducts = allProducts.concat(products);

      if (products.length < 100) break; // đã lấy hết
      page++;
    }

    // Map về format gọn gàng
    const mapped = allProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock_quantity: p.stock_quantity,
      stock_status: p.stock_status,
      image_url: p.images?.[0]?.src || null,
    }));

    return NextResponse.json({ products: mapped, total: mapped.length });
  } catch (error: any) {
    console.error('Lỗi lấy sản phẩm:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Không thể lấy sản phẩm' }, { status: 500 });
  }
}
