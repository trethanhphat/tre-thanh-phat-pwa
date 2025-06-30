// File: src/pages/api/product-status.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_PRODUCTS_URL = 'https://rungkhoai.com/wp-json/wc/v3/products';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  throw new Error(
    'Thiếu NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY hoặc NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET trong .env.local'
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Thiếu tham số id sản phẩm' });
  }

  try {
    const response = await axios.get(`${API_PRODUCTS_URL}/${id}`, {
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET,
      },
    });

    const { id: productId, price, stock_quantity, stock_status } = response.data;

    res.status(200).json({
      id: productId,
      price,
      stock_quantity,
      stock_status,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu từ WooCommerce:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Không thể lấy thông tin sản phẩm' });
  }
}
