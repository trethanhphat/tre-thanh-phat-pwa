// File: app/api/product-status/route.ts
import axios from 'axios';

const API_PRODUCTS_URL = 'https://rungkhoai.com/wp-json/wc/v3/products';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error(
    'Thiếu NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY hoặc NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET trong env'
  );
}

// ✅ App Router API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Thiếu tham số id sản phẩm' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${API_PRODUCTS_URL}/${id}`, {
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET,
      },
    });

    const { id: productId, price, stock_quantity, stock_status } = response.data;

    return Response.json({
      id: productId,
      price,
      stock_quantity,
      stock_status,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu từ WooCommerce:', error?.response?.data || error.message);

    return Response.json({ error: 'Không thể lấy thông tin sản phẩm' }, { status: 500 });
  }
}
