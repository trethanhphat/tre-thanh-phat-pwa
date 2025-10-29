// File: src/models/Product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  // ✅ Thêm trường image_key để không lỗi TS
  image_key?: string; // ✅ có thể undefined nếu chưa sync ảnh
}
