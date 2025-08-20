// File: src/utils/format.ts

export function formatPrice(price: string | number) {
  const value = typeof price === 'string' ? parseInt(price, 10) : price;
  if (isNaN(value)) return '-';
  return value.toLocaleString('vi-VN') + ' đ';
}

export function formatStockStatus(status: string | null): { text: string; color: string } {
  if (!status) return { text: 'Đang cập nhật', color: 'gray' };

  switch (status) {
    case 'instock':
      return { text: 'Còn hàng', color: 'green' };
    case 'outofstock':
      return { text: 'Hết hàng', color: 'red' };
    case 'onbackorder':
      return { text: 'Hàng đặt', color: 'orange' };
    default:
      return { text: 'Đang cập nhật', color: 'gray' };
  }
}
