// File: src/models/Product.ts
export interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  stock_status: string;
  image_url?: string;
  image_key?: string; // ✅ để load offline hoàn chỉnh
}
